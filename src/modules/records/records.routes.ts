import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { validate, validateQuery } from '../../middleware/validate';
import { createRecordSchema, updateRecordSchema, recordQuerySchema } from './records.schema';
import * as RecordsController from './records.controller';

const router = Router();

// All authenticated users can list and view records
router.get(
  '/',
  authenticate,
  requireRole('VIEWER', 'ANALYST', 'ADMIN'),
  validateQuery(recordQuerySchema),
  RecordsController.getAll,
);

router.get(
  '/:id',
  authenticate,
  requireRole('VIEWER', 'ANALYST', 'ADMIN'),
  RecordsController.getById,
);

// Only ANALYST and ADMIN can create/update
router.post(
  '/',
  authenticate,
  requireRole('ANALYST', 'ADMIN'),
  validate(createRecordSchema),
  RecordsController.create,
);

router.patch(
  '/:id',
  authenticate,
  requireRole('ANALYST', 'ADMIN'),
  validate(updateRecordSchema),
  RecordsController.update,
);

// Only ADMIN can delete
router.delete('/:id', authenticate, requireRole('ADMIN'), RecordsController.remove);

export default router;
