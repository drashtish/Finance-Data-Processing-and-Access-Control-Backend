import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { validateQuery } from '../../middleware/validate';
import { dashboardQuerySchema, trendsQuerySchema } from './dashboard.schema';
import * as DashboardController from './dashboard.controller';

const router = Router();

// All dashboard endpoints require at least VIEWER role
router.get(
  '/summary',
  authenticate,
  requireRole('VIEWER', 'ANALYST', 'ADMIN'),
  validateQuery(dashboardQuerySchema),
  DashboardController.getSummary,
);

router.get(
  '/by-category',
  authenticate,
  requireRole('VIEWER', 'ANALYST', 'ADMIN'),
  validateQuery(dashboardQuerySchema),
  DashboardController.getByCategory,
);

router.get(
  '/trends',
  authenticate,
  requireRole('VIEWER', 'ANALYST', 'ADMIN'),
  validateQuery(trendsQuerySchema),
  DashboardController.getTrends,
);

// Recent activity is ANALYST/ADMIN only (contains audit data)
router.get(
  '/recent-activity',
  authenticate,
  requireRole('ANALYST', 'ADMIN'),
  DashboardController.getRecentActivity,
);

export default router;
