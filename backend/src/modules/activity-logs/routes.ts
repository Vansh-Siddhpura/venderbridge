import { Router } from 'express';
import { verifyToken, checkRole } from '../../middlewares/auth.middleware';
import { validateQuery } from '../../middlewares/validate.middleware';
import { ListActivityLogsQuerySchema } from './schema';
import * as controller from './controller';

const router = Router();

// Only ADMIN and MANAGER can view activity logs
router.use(verifyToken, checkRole('ADMIN', 'MANAGER'));

router.get('/', validateQuery(ListActivityLogsQuerySchema), controller.listActivityLogs);

export default router;
