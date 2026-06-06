import { Router } from 'express';
import { verifyToken, checkRole } from '../../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../../middlewares/validate.middleware';
import {
  CreateVendorSchema,
  UpdateVendorSchema,
  UpdateVendorStatusSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  ListVendorsQuerySchema,
} from './schema';
import * as controller from './controller';

const router = Router();
router.use(verifyToken);

// ── Categories (before :id to avoid conflict) ─────────────────────────────────
router.get('/categories', controller.listCategories);
router.post('/categories', checkRole('ADMIN'), validateBody(CreateCategorySchema), controller.createCategory);
router.put('/categories/:id', checkRole('ADMIN'), validateBody(UpdateCategorySchema), controller.updateCategory);
router.delete('/categories/:id', checkRole('ADMIN'), controller.deleteCategory);

// ── Vendors ───────────────────────────────────────────────────────────────────
router.get('/', checkRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'), validateQuery(ListVendorsQuerySchema), controller.listVendors);
router.post('/', checkRole('ADMIN'), validateBody(CreateVendorSchema), controller.createVendor);
router.get('/:id', checkRole('ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER', 'VENDOR'), controller.getVendor);
router.put('/:id', checkRole('ADMIN', 'VENDOR'), validateBody(UpdateVendorSchema), controller.updateVendor);
router.patch('/:id/status', checkRole('ADMIN'), validateBody(UpdateVendorStatusSchema), controller.updateVendorStatus);

export default router;
