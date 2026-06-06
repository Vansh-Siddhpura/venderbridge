import { Router } from 'express';
import { validateBody } from '../../middlewares/validate.middleware';
import { verifyToken, checkRole } from '../../middlewares/auth.middleware';
import {
  RegisterSchema,
  VendorRegisterSchema,
  LoginSchema,
  RefreshTokenSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from './schema';
import * as controller from './controller';

const router = Router();

// POST /api/auth/register — Admin only (create officer/manager accounts)
router.post(
  '/register',
  verifyToken,
  checkRole('ADMIN'),
  validateBody(RegisterSchema),
  controller.register
);

// POST /api/auth/vendor/register — Public (vendor self-registration)
router.post(
  '/vendor/register',
  validateBody(VendorRegisterSchema),
  controller.vendorRegister
);

// POST /api/auth/login — Public
router.post('/login', validateBody(LoginSchema), controller.login);

// POST /api/auth/refresh — Public (uses httpOnly cookie or body)
router.post('/refresh', controller.refresh);

// POST /api/auth/logout — Authenticated
router.post('/logout', verifyToken, controller.logout);

// POST /api/auth/forgot-password — Public
router.post('/forgot-password', validateBody(ForgotPasswordSchema), controller.forgotPassword);

// POST /api/auth/reset-password — Public
router.post('/reset-password', validateBody(ResetPasswordSchema), controller.resetPassword);

export default router;
