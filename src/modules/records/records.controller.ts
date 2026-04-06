import type { Request, Response, NextFunction } from 'express';
import * as RecordsService from './records.service';
import { success } from '../../utils/response';
import type { RecordQuery } from './records.schema';

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const query = (res.locals['validatedQuery'] ?? req.query) as RecordQuery;
    const { records, meta } = await RecordsService.getAll(query);
    res.status(200).json(success(records, meta));
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await RecordsService.getById(req.params['id'] as string);
    res.status(200).json(success(record));
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await RecordsService.create(req.body, req.user!.id);
    res.status(201).json(success(record));
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await RecordsService.update(
      req.params['id'] as string,
      req.body,
      req.user!.id,
    );
    res.status(200).json(success(record));
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await RecordsService.remove(req.params['id'] as string, req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
