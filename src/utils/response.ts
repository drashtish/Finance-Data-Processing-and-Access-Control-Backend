export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function success<T>(data: T, meta?: PaginationMeta | Record<string, unknown>) {
  return { success: true, data, ...(meta ? { meta } : {}) };
}

export function failure(message: string, code: string, details?: { field: string; message: string }[]) {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
}
