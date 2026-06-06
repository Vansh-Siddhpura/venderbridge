import { UserRole } from '@prisma/client';
import { AppError } from '../../middlewares/error.middleware';
import { ERROR_CODES } from '../../config/constants';
import { getPaginationParams } from '../../utils';
import * as repo from './repository';
import type { UpdateUserInput, UpdateProfileInput, ListUsersQuery } from './schema';

/**
 * Lists all non-deleted users with pagination, search, and role filter.
 * Admin only.
 */
export const listUsers = async (query: ListUsersQuery) => {
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(query);
  const { users, total } = await repo.findUsers({
    skip,
    take: limit,
    search: query.search,
    role: query.role as UserRole | undefined,
    sortBy,
    sortOrder,
  });
  return { users, total, page, limit };
};

/**
 * Gets a single user by ID. Admin can access any user; others only themselves.
 * @throws NOT_FOUND if user doesn't exist
 */
export const getUser = async (id: string) => {
  const user = await repo.findUserById(id);
  if (!user) throw new AppError(ERROR_CODES.NOT_FOUND, 'User not found', 404);
  return user;
};

/**
 * Updates a user. Admin can change any field including role.
 * Non-admin users can only update firstName/lastName on their own profile.
 * @throws FORBIDDEN if non-admin tries to change role or another user
 */
export const updateUser = async (
  targetId: string,
  input: UpdateUserInput,
  requesterId: string,
  requesterRole: UserRole
) => {
  const target = await repo.findUserById(targetId);
  if (!target) throw new AppError(ERROR_CODES.NOT_FOUND, 'User not found', 404);

  if (requesterRole !== UserRole.ADMIN) {
    if (targetId !== requesterId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 'Cannot update another user', 403);
    }
    if (input.role || input.isActive !== undefined) {
      throw new AppError(ERROR_CODES.FORBIDDEN, 'Cannot change role or active status', 403);
    }
  }

  return repo.updateUser(targetId, input);
};

/**
 * Updates own profile (firstName, lastName only).
 */
export const updateProfile = async (userId: string, input: UpdateProfileInput) => {
  const user = await repo.findUserById(userId);
  if (!user) throw new AppError(ERROR_CODES.NOT_FOUND, 'User not found', 404);
  return repo.updateUser(userId, input);
};

/**
 * Soft-deletes a user. Admin only.
 * @throws NOT_FOUND if user doesn't exist
 */
export const deleteUser = async (id: string) => {
  const user = await repo.findUserById(id);
  if (!user) throw new AppError(ERROR_CODES.NOT_FOUND, 'User not found', 404);
  return repo.softDeleteUser(id);
};
