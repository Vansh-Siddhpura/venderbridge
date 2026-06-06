import { Router } from 'express';
import { verifyToken, checkRole } from '../../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../../middlewares/validate.middleware';
import { UpdateInvoiceStatusSchema, ListInvoicesQuerySchema } from './schema';
import * as controller from './controller';

const router = Router();
router.use(verifyToken);

router.get('/', validateQuery(ListInvoicesQuerySchema), controller.listInvoices);
router.get('/:id', controller.getInvoice);
router.post('/', checkRole('VENDOR'), controller.generateInvoice); // Needs { poId } in body
router.patch('/:id/status', checkRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'), validateBody(UpdateInvoiceStatusSchema), controller.updateInvoiceStatus);
router.get('/:id/download', controller.downloadInvoicePdf);

export default router;
