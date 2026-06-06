import { Router } from 'express';
import { verifyToken, checkRole } from '../../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../../middlewares/validate.middleware';
import { CreateQuotationSchema, UpdateQuotationSchema, ListQuotationsQuerySchema } from './schema';
import * as controller from './controller';

const router = Router();
router.use(verifyToken);

router.get('/', validateQuery(ListQuotationsQuerySchema), controller.listQuotations);
router.post('/', checkRole('VENDOR'), validateBody(CreateQuotationSchema), controller.createQuotation);
router.get('/:id', controller.getQuotation);
router.put('/:id', checkRole('VENDOR'), validateBody(UpdateQuotationSchema), controller.updateQuotation);
router.patch('/:id/submit', checkRole('VENDOR'), controller.submitQuotation);
router.patch('/:id/shortlist', checkRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'), controller.shortlistQuotation);
router.patch('/:id/reject', checkRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'), controller.rejectQuotation);

export default router;
