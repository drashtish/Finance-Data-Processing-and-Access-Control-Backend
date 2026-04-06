import type { Request, Response, NextFunction } from 'express';
import * as DashboardService from './dashboard.service';
import { success } from '../../utils/response';
import type { DashboardQuery, TrendsQuery } from './dashboard.schema';

export async function getSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const query = (res.locals['validatedQuery'] ?? req.query) as DashboardQuery;
    const data = await DashboardService.getSummary(query);
    res.status(200).json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function getByCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const query = (res.locals['validatedQuery'] ?? req.query) as DashboardQuery;
    const data = await DashboardService.getByCategory(query);
    res.status(200).json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function getTrends(req: Request, res: Response, next: NextFunction) {
  try {
    const query = (res.locals['validatedQuery'] ?? req.query) as TrendsQuery;
    const data = await DashboardService.getTrends(query);
    res.status(200).json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function getRecentActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : 10;
    const data = await DashboardService.getRecentActivity(limit);
    res.status(200).json(success(data));
  } catch (err) {
    next(err);
  }
}
