import { Router } from 'express';
import { verifyToken, checkRole } from '../../middlewares/auth.middleware';
import * as controller from './controller';

const router = Router();
router.use(verifyToken);

router.get('/dashboard', controller.getDashboardStats);
router.get('/spend-by-category', checkRole('ADMIN', 'MANAGER'), controller.getSpendByCategory);

export default router;
