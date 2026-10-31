import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { requireAdmin } from '../../server/auth.js';
import { handle, json } from '../../server/http.js';

/**
 * POST /api/admin/upload: hands the admin page a short-lived token to upload a
 * product photo straight to Vercel Blob (phone photos can be bigger than a
 * function request allows). Images only, up to 15 MB.
 */
export const POST = handle(async (request) => {
  requireAdmin(request);
  const body = (await request.json()) as HandleUploadBody;
  const result = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname) => ({
      allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maximumSizeInBytes: 15 * 1024 * 1024,
      addRandomSuffix: true,
      tokenPayload: pathname,
    }),
  });
  return json(result);
});
