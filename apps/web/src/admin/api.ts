import type { Product, ProductInput, Settings } from '../../shared/catalog';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers: { accept: 'application/json', ...(init.body ? { 'content-type': 'application/json' } : {}) },
  });
  const data = res.headers.get('content-type')?.includes('json') ? await res.json() : null;
  if (!res.ok) throw new ApiError(res.status, data?.error ?? `The server answered ${res.status}.`);
  return data as T;
}

const send = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const adminApi = {
  session: () => call<{ admin: boolean }>('/api/admin/session'),
  login: (password: string) => call<{ admin: boolean }>('/api/admin/login', send('POST', { password })),
  logout: () => call<{ admin: boolean }>('/api/admin/logout', send('POST')),
  products: () => call<{ products: Product[] }>('/api/admin/products'),
  createProduct: (p: ProductInput) => call<{ product: Product }>('/api/admin/products', send('POST', p)),
  updateProduct: (id: string, p: ProductInput) =>
    call<{ product: Product }>(`/api/admin/products?id=${encodeURIComponent(id)}`, send('PUT', p)),
  deleteProduct: (id: string) => call<{ ok: true }>(`/api/admin/products?id=${encodeURIComponent(id)}`, send('DELETE')),
  settings: () => call<{ settings: Settings }>('/api/admin/settings'),
  saveSettings: (s: Settings) => call<{ settings: Settings }>('/api/admin/settings', send('PUT', s)),
};

/** Uploads a photo straight to Vercel Blob and returns its public URL. */
export async function uploadPhoto(file: File): Promise<string> {
  const { upload } = await import('@vercel/blob/client');
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
  const blob = await upload(`products/${safe}`, file, { access: 'public', handleUploadUrl: '/api/admin/upload' });
  return blob.url;
}

/** Runs an admin call; a 401 means the session ran out, so go back to sign-in. */
export async function guarded<T>(fn: () => Promise<T>, onSignedOut: () => void): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) onSignedOut();
    throw err;
  }
}
