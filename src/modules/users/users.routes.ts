import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { validate, validateQuery } from '../../middleware/validate';
import { createUserSchema, updateUserSchema, listUsersQuerySchema } from './users.schema';
import * as UsersController from './users.controller';

const router = Router();

router.get('/', authenticate, requireRole('ADMIN'), validateQuery(listUsersQuerySchema), UsersController.getAll);
router.post('/', authenticate, requireRole('ADMIN'), validate(createUserSchema), UsersController.create);
router.get('/:id', authenticate, requireRole('ADMIN'), UsersController.getById);
router.patch('/:id', authenticate, requireRole('ADMIN'), validate(updateUserSchema), UsersController.update);

export default router;
