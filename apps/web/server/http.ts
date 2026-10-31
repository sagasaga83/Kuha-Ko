import type { z } from 'zod';

export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  if (!headers.has('cache-control')) headers.set('cache-control', 'no-store');
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function fail(status: number, message: string, extra: Record<string, unknown> = {}): Response {
  return json({ error: message, ...extra }, { status });
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly extra: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

/** Reads a JSON body and validates it. Only JSON is accepted, which also blocks cross-site form posts. */
export async function readJson<S extends z.ZodType>(request: Request, schema: S): Promise<z.infer<S>> {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    throw new HttpError(415, 'Send JSON');
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new HttpError(400, 'The request body is not valid JSON');
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
    throw new HttpError(400, issues[0] ? `${issues[0].path || 'body'}: ${issues[0].message}` : 'Invalid request', { issues });
  }
  return parsed.data;
}

/** Wraps a handler so thrown HttpErrors become JSON responses and anything else a logged 500. */
export function handle(fn: (request: Request) => Promise<Response>) {
  return async (request: Request): Promise<Response> => {
    try {
      return await fn(request);
    } catch (err) {
      if (err instanceof HttpError) return fail(err.status, err.message, err.extra);
      console.error(err);
      return fail(500, 'Something went wrong on our side. Please try again.');
    }
  };
}
