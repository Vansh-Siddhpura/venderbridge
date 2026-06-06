import prisma from '../../config/database';
import { UserRole, VendorStatus, Prisma } from '@prisma/client';
import { hashPassword } from '../../utils';
import { ACTIVITY_ACTIONS, ENTITY_TYPES } from '../../config/constants';

// ── Read ──────────────────────────────────────────────────────────────────────

export const findUserByEmail = async (email: string) => {
  return prisma.user.findFirst({
    where: { email, deletedAt: null },
    include: { vendor: { select: { id: true, status: true, companyName: true } } },
  });
};

export const findUserById = async (id: string) => {
  return prisma.user.findFirst({
    where: { id, deletedAt: null },
    include: { vendor: { select: { id: true, status: true, companyName: true } } },
  });
};

export const findUserByResetToken = async (tokenHash: string) => {
  return prisma.user.findFirst({
    where: {
      passwordResetToken: tokenHash,
      passwordResetExpiry: { gt: new Date() },
      deletedAt: null,
    },
  });
};

export const findRefreshToken = async (token: string) => {
  return prisma.refreshToken.findUnique({
    where: { token },
    include: { user: { select: { id: true, role: true, vendorId: true, isActive: true, deletedAt: true } } },
  });
};

// ── Create ────────────────────────────────────────────────────────────────────

export const createUser = async (
  data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  },
  ip: string
) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data });

    await tx.activityLog.create({
      data: {
        userId: user.id,
        action: ACTIVITY_ACTIONS.USER_REGISTERED,
        entityType: ENTITY_TYPES.USER,
        entityId: user.id,
        metadata: { after: { email: user.email, role: user.role } },
        ipAddress: ip,
      },
    });

    return user;
  });
};

export const createVendorWithUser = async (
  vendorData: {
    companyName: string;
    email: string;
    phone?: string;
    gstin?: string;
    pan?: string;
    contactPerson?: string;
    categoryId?: string;
    address?: Prisma.InputJsonValue;
  },
  userData: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  },
  ip: string
) => {
  return prisma.$transaction(async (tx) => {
    const vendor = await tx.vendor.create({
      data: {
        ...vendorData,
        status: VendorStatus.PENDING,
      },
    });

    const user = await tx.user.create({
      data: {
        ...userData,
        role: UserRole.VENDOR,
        vendorId: vendor.id,
      },
    });

    await tx.activityLog.create({
      data: {
        userId: user.id,
        action: ACTIVITY_ACTIONS.VENDOR_REGISTERED,
        entityType: ENTITY_TYPES.VENDOR,
        entityId: vendor.id,
        metadata: { after: { companyName: vendor.companyName, email: vendor.email } },
        ipAddress: ip,
      },
    });

    return { vendor, user };
  });
};

export const createRefreshToken = async (userId: string, token: string, expiresAt: Date) => {
  return prisma.refreshToken.create({
    data: { userId, token, expiresAt },
  });
};

// ── Update ────────────────────────────────────────────────────────────────────

export const revokeRefreshToken = async (tokenId: string) => {
  return prisma.refreshToken.update({
    where: { id: tokenId },
    data: { isRevoked: true },
  });
};

export const revokeAllUserTokens = async (userId: string) => {
  return prisma.refreshToken.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true },
  });
};

export const updateLastLogin = async (userId: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
};

export const storePasswordResetToken = async (
  userId: string,
  tokenHash: string,
  expiry: Date
) => {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordResetToken: tokenHash, passwordResetExpiry: expiry },
  });
};

export const resetUserPassword = async (userId: string, newPassword: string, ip: string) => {
  const passwordHash = await hashPassword(newPassword);
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    await tx.activityLog.create({
      data: {
        userId,
        action: ACTIVITY_ACTIONS.USER_PASSWORD_RESET,
        entityType: ENTITY_TYPES.USER,
        entityId: userId,
        metadata: {},
        ipAddress: ip,
      },
    });

    return user;
  });
};

export const logUserLogout = async (userId: string, ip: string) => {
  return prisma.activityLog.create({
    data: {
      userId,
      action: ACTIVITY_ACTIONS.USER_LOGGED_OUT,
      entityType: ENTITY_TYPES.USER,
      entityId: userId,
      metadata: {},
      ipAddress: ip,
    },
  });
};
