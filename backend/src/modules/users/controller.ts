import { Request, Response } from 'express';
import { successResponse, paginatedResponse } from '../../utils';
import * as service from './service';
import type { UpdateUserInput, UpdateProfileInput, ListUsersQuery } from './schema';

export const listUsers = async (req: Request, res: Response): Promise<void> => {
  const { users, total, page, limit } = await service.listUsers(req.query as ListUsersQuery);
  res.json(paginatedResponse(users, total, page, limit));
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = await service.getUser(req.user!.userId);
  res.json(successResponse(user));
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const user = await service.getUser((req.params.id as string));
  res.json(successResponse(user));
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const user = await service.updateUser(
    (req.params.id as string),
    req.body as UpdateUserInput,
    req.user!.userId,
    req.user!.role
  );
  res.json(successResponse(user, 'User updated'));
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await service.updateProfile(req.user!.userId, req.body as UpdateProfileInput);
  res.json(successResponse(user, 'Profile updated'));
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  await service.deleteUser((req.params.id as string));
  res.json(successResponse(null, 'User deleted'));
};
