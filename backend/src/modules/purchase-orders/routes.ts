import { Router } from 'express';
import { verifyToken, checkRole } from '../../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../../middlewares/validate.middleware';
import { UpdatePOStatusSchema, ListPOsQuerySchema } from './schema';
import * as controller from './controller';

const router = Router();
router.use(verifyToken);

router.get('/', validateQuery(ListPOsQuerySchema), controller.listPOs);
router.get('/:id', controller.getPO);
router.post('/', checkRole('ADMIN', 'MANAGER'), controller.generatePO);
router.patch('/:id/status', validateBody(UpdatePOStatusSchema), controller.updatePOStatus);

export default router;
