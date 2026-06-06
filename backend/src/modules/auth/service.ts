import crypto from 'crypto';
import { VendorStatus } from '@prisma/client';
import { AppError } from '../../middlewares/error.middleware';
import { ERROR_CODES, AUTH } from '../../config/constants';
import {
  comparePassword,
  generateAccessToken,
  generateRefreshTokenString,
  hashPassword,
} from '../../utils';
import { sendPasswordResetEmail } from '../../utils/email';
import type {
  RegisterInput,
  VendorRegisterInput,
  LoginInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './schema';
import * as repo from './repository';
import { ACTIVITY_ACTIONS, ENTITY_TYPES } from '../../config/constants';
import prisma from '../../config/database';

// ── Auth service ──────────────────────────────────────────────────────────────

/**
 * Registers a new internal user (ADMIN, PROCUREMENT_OFFICER, MANAGER).
 * Only called by admins — vendor self-registration uses vendorRegister().
 * @throws AUTH_EMAIL_EXISTS if email is already taken
 */
export const register = async (input: RegisterInput, ip: string) => {
  const existing = await repo.findUserByEmail(input.email);
  if (existing) {
    throw new AppError(ERROR_CODES.AUTH_EMAIL_EXISTS, 'Email already registered', 409);
  }

  const passwordHash = await hashPassword(input.password);
  const user = await repo.createUser(
    {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role as 'ADMIN' | 'PROCUREMENT_OFFICER' | 'MANAGER',
    },
    ip
  );

  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
};

/**
 * Vendor self-registration — atomically creates Vendor (PENDING) + User (VENDOR role).
 * Vendor cannot log in until admin approves the vendor status.
 * @throws AUTH_EMAIL_EXISTS if email is already taken
 */
export const vendorRegister = async (input: VendorRegisterInput, ip: string) => {
  const existing = await repo.findUserByEmail(input.email);
  if (existing) {
    throw new AppError(ERROR_CODES.AUTH_EMAIL_EXISTS, 'Email already registered', 409);
  }

  const passwordHash = await hashPassword(input.password);

  const { vendor } = await repo.createVendorWithUser(
    {
      companyName: input.companyName,
      email: input.email,
      phone: input.phone,
      gstin: input.gstin,
      pan: input.pan,
      contactPerson: input.contactPerson,
      categoryId: input.categoryId,
      address: input.address as Record<string, string> | undefined,
    },
    {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
    },
    ip
  );

  return {
    message: 'Your registration is under review. You will be notified once approved.',
    vendorId: vendor.id,
    status: vendor.status,
  };
};

/**
 * Authenticates a user, issues access + refresh tokens.
 * Vendors must have APPROVED status to log in.
 * @throws AUTH_INVALID_CREDENTIALS for wrong email/password
 * @throws AUTH_ACCOUNT_INACTIVE for deactivated accounts
 * @throws AUTH_VENDOR_PENDING for vendors awaiting approval
 */
export const login = async (input: LoginInput, ip: string) => {
  const user = await repo.findUserByEmail(input.email);

  if (!user || !(await comparePassword(input.password, user.passwordHash))) {
    throw new AppError(ERROR_CODES.AUTH_INVALID_CREDENTIALS, 'Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError(ERROR_CODES.AUTH_ACCOUNT_INACTIVE, 'Account is deactivated', 403);
  }

  // Vendor-specific check — must be APPROVED
  if (user.role === 'VENDOR' && user.vendor) {
    if (user.vendor.status !== VendorStatus.APPROVED) {
      const statusMsg: Record<string, string> = {
        PENDING: 'Your account is pending admin approval',
        REJECTED: 'Your vendor application was rejected',
        SUSPENDED: 'Your account has been suspended',
      };
      throw new AppError(
        ERROR_CODES.AUTH_VENDOR_PENDING,
        statusMsg[user.vendor.status] ?? 'Account not active',
        403
      );
    }
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
    vendorId: user.vendorId ?? undefined,
  });

  const refreshTokenString = generateRefreshTokenString();
  const expiresAt = new Date(Date.now() + AUTH.REFRESH_TOKEN_EXPIRY_MS);

  await repo.createRefreshToken(user.id, refreshTokenString, expiresAt);
  await repo.updateLastLogin(user.id);

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: ACTIVITY_ACTIONS.USER_LOGGED_IN,
      entityType: ENTITY_TYPES.USER,
      entityId: user.id,
      metadata: {},
      ipAddress: ip,
    },
  });

  const { passwordHash: _, passwordResetToken: __, passwordResetExpiry: ___, vendor: ____, ...safeUser } = user;

  return {
    user: safeUser,
    accessToken,
    refreshToken: refreshTokenString,
    expiresAt,
  };
};

/**
 * Rotates the refresh token — invalidates old one, issues new pair.
 * @throws AUTH_INVALID_TOKEN if token not found or revoked/expired
 */
export const refreshTokens = async (input: RefreshTokenInput) => {
  const stored = await repo.findRefreshToken(input.refreshToken);

  if (
    !stored ||
    stored.isRevoked ||
    stored.expiresAt < new Date() ||
    !stored.user.isActive ||
    stored.user.deletedAt
  ) {
    throw new AppError(ERROR_CODES.AUTH_TOKEN_REVOKED, 'Invalid or expired refresh token', 401);
  }

  // Rotate — revoke old, issue new
  await repo.revokeRefreshToken(stored.id);

  const accessToken = generateAccessToken({
    userId: stored.user.id,
    role: stored.user.role,
    vendorId: stored.user.vendorId ?? undefined,
  });

  const newRefreshTokenString = generateRefreshTokenString();
  const expiresAt = new Date(Date.now() + AUTH.REFRESH_TOKEN_EXPIRY_MS);
  await repo.createRefreshToken(stored.user.id, newRefreshTokenString, expiresAt);

  return { accessToken, refreshToken: newRefreshTokenString, expiresAt };
};

/**
 * Logs out the user — revokes the specific refresh token.
 * @throws AUTH_INVALID_TOKEN if token not found
 */
export const logout = async (refreshTokenString: string, userId: string, ip: string) => {
  const stored = await repo.findRefreshToken(refreshTokenString);

  if (stored && stored.userId === userId) {
    await repo.revokeRefreshToken(stored.id);
  }

  await repo.logUserLogout(userId, ip);
};

/**
 * Initiates password reset — generates a token and emails it.
 * Always returns success (prevents email enumeration).
 */
export const forgotPassword = async (input: ForgotPasswordInput, ip: string) => {
  const user = await repo.findUserByEmail(input.email);

  if (user) {
    // Generate a raw token; store its SHA-256 hash
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await repo.storePasswordResetToken(user.id, tokenHash, expiry);

    const frontendUrl = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
    await sendPasswordResetEmail(user.email, rawToken, frontendUrl).catch(() => {
      // Non-fatal — don't expose email errors to client
    });
  }

  return { message: 'If that email is registered, a reset link has been sent.' };
};

/**
 * Resets the user's password using a valid reset token.
 * @throws AUTH_INVALID_TOKEN if token is invalid or expired
 */
export const resetPassword = async (input: ResetPasswordInput, ip: string) => {
  const tokenHash = crypto.createHash('sha256').update(input.token).digest('hex');
  const user = await repo.findUserByResetToken(tokenHash);

  if (!user) {
    throw new AppError(ERROR_CODES.AUTH_INVALID_TOKEN, 'Invalid or expired reset token', 400);
  }

  await repo.resetUserPassword(user.id, input.password, ip);
  // Revoke all refresh tokens after password change
  await repo.revokeAllUserTokens(user.id);

  return { message: 'Password reset successfully. Please log in with your new password.' };
};
