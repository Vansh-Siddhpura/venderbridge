import { Request, Response } from 'express';
import { AUTH } from '../../config/constants';
import { successResponse } from '../../utils';
import * as service from './service';
import type {
  RegisterInput,
  VendorRegisterInput,
  LoginInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './schema';

const getIp = (req: Request): string => req.ip ?? 'unknown';

export const register = async (req: Request, res: Response): Promise<void> => {
  const data = await service.register(req.body as RegisterInput, getIp(req));
  res.status(201).json(successResponse(data, 'User registered successfully'));
};

export const vendorRegister = async (req: Request, res: Response): Promise<void> => {
  const data = await service.vendorRegister(req.body as VendorRegisterInput, getIp(req));
  res.status(201).json(successResponse(data));
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const result = await service.login(req.body as LoginInput, getIp(req));

  // Set refresh token as httpOnly cookie
  res.cookie(AUTH.COOKIE_NAME, result.refreshToken, AUTH.COOKIE_OPTIONS);

  res.status(200).json(
    successResponse(
      { user: result.user, accessToken: result.accessToken },
      'Login successful'
    )
  );
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  // Accept token from cookie (primary) or request body (fallback for non-browser clients)
  const refreshToken: string =
    (req.cookies as Record<string, string>)[AUTH.COOKIE_NAME] ??
    (req.body as RefreshTokenInput).refreshToken;

  const result = await service.refreshTokens({ refreshToken });

  res.cookie(AUTH.COOKIE_NAME, result.refreshToken, AUTH.COOKIE_OPTIONS);

  res.status(200).json(
    successResponse({ accessToken: result.accessToken }, 'Token refreshed')
  );
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const refreshToken: string =
    (req.cookies as Record<string, string>)[AUTH.COOKIE_NAME] ??
    (req.body as RefreshTokenInput).refreshToken ??
    '';

  await service.logout(refreshToken, req.user!.userId, getIp(req));

  res.clearCookie(AUTH.COOKIE_NAME, { path: '/' });
  res.status(200).json(successResponse(null, 'Logged out successfully'));
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const data = await service.forgotPassword(req.body as ForgotPasswordInput, getIp(req));
  res.status(200).json(successResponse(data));
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const data = await service.resetPassword(req.body as ResetPasswordInput, getIp(req));
  res.status(200).json(successResponse(data));
};
