import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';
import * as controller from './controller';

const router = Router();
router.use(verifyToken);

// GET /api/dashboard/stats — rich payload: { stats, recentRFQs, recentInvoices }
router.get('/stats', controller.getDashboard);

export default router;
