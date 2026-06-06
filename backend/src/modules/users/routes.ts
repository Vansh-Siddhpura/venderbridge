import { Router } from 'express';
import { verifyToken, checkRole } from '../../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../../middlewares/validate.middleware';
import { UpdateUserSchema, UpdateProfileSchema, ListUsersQuerySchema } from './schema';
import { RegisterSchema } from '../auth/schema';
import * as controller from './controller';
import * as authController from '../auth/controller';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/users/me — any authenticated user
router.get('/me', controller.getMe);

// PATCH /api/users/me — any authenticated user
router.patch('/me', validateBody(UpdateProfileSchema), controller.updateProfile);

// Admin-only routes below
router.get('/', checkRole('ADMIN'), validateQuery(ListUsersQuerySchema), controller.listUsers);

// Create a new internal user (admin only) — delegates to auth.register
router.post('/', checkRole('ADMIN'), validateBody(RegisterSchema), authController.register);

router.get('/:id', checkRole('ADMIN'), controller.getUser);
router.put('/:id', validateBody(UpdateUserSchema), controller.updateUser);
router.delete('/:id', checkRole('ADMIN'), controller.deleteUser);

export default router;
