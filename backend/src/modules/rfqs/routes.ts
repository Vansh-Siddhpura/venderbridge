import { Router } from 'express';
import { verifyToken, checkRole } from '../../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../../middlewares/validate.middleware';
import {
  CreateRFQSchema, UpdateRFQSchema, AssignVendorsSchema,
  ListRFQsQuerySchema, CreateRFQItemSchema, UpdateRFQItemSchema, BulkCreateRFQItemsSchema,
} from './schema';
import * as controller from './controller';

const router = Router();
router.use(verifyToken);

const officerOrAbove = checkRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER');
const canWriteRFQ = checkRole('ADMIN', 'PROCUREMENT_OFFICER');

// ── RFQ CRUD ──────────────────────────────────────────────────────────────────
router.get('/', officerOrAbove, validateQuery(ListRFQsQuerySchema), controller.listRFQs);
router.post('/', canWriteRFQ, validateBody(CreateRFQSchema), controller.createRFQ);
router.get('/:id', officerOrAbove, controller.getRFQ);
router.put('/:id', canWriteRFQ, validateBody(UpdateRFQSchema), controller.updateRFQ);

// ── State transitions ─────────────────────────────────────────────────────────
router.patch('/:id/publish', canWriteRFQ, controller.publishRFQ);
router.patch('/:id/close', canWriteRFQ, controller.closeRFQ);
router.patch('/:id/cancel', canWriteRFQ, controller.cancelRFQ);

// ── Vendor assignment ─────────────────────────────────────────────────────────
router.post('/:id/vendors', canWriteRFQ, validateBody(AssignVendorsSchema), controller.assignVendors);

// ── RFQ Items ─────────────────────────────────────────────────────────────────
router.post('/:rfqId/items', canWriteRFQ, validateBody(CreateRFQItemSchema), controller.addRFQItem);
router.post('/:rfqId/items/bulk', canWriteRFQ, validateBody(BulkCreateRFQItemsSchema), controller.addRFQItems);
router.put('/:rfqId/items/:itemId', canWriteRFQ, validateBody(UpdateRFQItemSchema), controller.updateRFQItem);
router.delete('/:rfqId/items/:itemId', canWriteRFQ, controller.deleteRFQItem);

export default router;
