import { Router } from 'express';
import { verifyToken, checkRole } from '../../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../../middlewares/validate.middleware';
import { UpdateUserSchema, UpdateProfileSchema, ListUsersQuerySchema } from './schema';
import * as controller from './controller';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/users/me — any authenticated user
router.get('/me', controller.getMe);

// PATCH /api/users/me — any authenticated user
router.patch('/me', validateBody(UpdateProfileSchema), controller.updateProfile);

// Admin-only routes below
// GET /api/users
router.get('/', checkRole('ADMIN'), validateQuery(ListUsersQuerySchema), controller.listUsers);

// GET /api/users/:id
router.get('/:id', checkRole('ADMIN'), controller.getUser);

// PUT /api/users/:id
router.put('/:id', validateBody(UpdateUserSchema), controller.updateUser);

// DELETE /api/users/:id
router.delete('/:id', checkRole('ADMIN'), controller.deleteUser);

export default router;
