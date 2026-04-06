import type { Request, Response, NextFunction } from 'express';
import * as UsersService from './users.service';
import { success } from '../../utils/response';
import type { ListUsersQuery } from './users.schema';

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const query = (res.locals['validatedQuery'] ?? req.query) as ListUsersQuery;
    const { users, meta } = await UsersService.getAll(query);
    res.status(200).json(success(users, meta));
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await UsersService.getById(req.params['id'] as string);
    res.status(200).json(success(user));
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await UsersService.create(req.body);
    res.status(201).json(success(user));
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await UsersService.update(req.params['id'] as string, req.body, req.user!.id);
    res.status(200).json(success(user));
  } catch (err) {
    next(err);
  }
}
