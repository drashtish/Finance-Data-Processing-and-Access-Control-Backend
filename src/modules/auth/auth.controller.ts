import type { Request, Response, NextFunction } from 'express';
import * as AuthService from './auth.service';
import { success } from '../../utils/response';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await AuthService.login(req.body);
    res.status(200).json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response) {
  res.status(200).json(success({ message: 'Logged out successfully' }));
}

export async function me(req: Request, res: Response) {
  res.status(200).json(success(req.user));
}
