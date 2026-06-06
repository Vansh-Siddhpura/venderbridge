import { Router } from 'express';
import { verifyToken, checkRole } from '../../middlewares/auth.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import { CreateApprovalSchema } from './schema';
import * as controller from './controller';

const router = Router();
router.use(verifyToken);

// POST /api/approvals/quotations/:quotationId — Manager only
router.post('/quotations/:quotationId', checkRole('ADMIN', 'MANAGER'), validateBody(CreateApprovalSchema), controller.createApproval);

// GET /api/approvals/quotations/:quotationId/history — Officer/Manager
router.get('/quotations/:quotationId/history', checkRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'), controller.getApprovalHistory);

export default router;
