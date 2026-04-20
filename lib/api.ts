import type { ApiError, ApiSuccess } from '@/lib/types';

export function ok<T>(data: T): Response {
  return Response.json({ ok: true, data } satisfies ApiSuccess<T>);
}

export function fail(error: string, details?: string, status = 400): Response {
  return Response.json({ ok: false, error, details } satisfies ApiError, { status });
}
