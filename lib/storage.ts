import { randomUUID } from 'node:crypto';

export interface StorageResult {
  url: string;
  key: string;
}

function storageConfig() {
  const bucket = process.env.S3_BUCKET?.trim();
  const endpoint = process.env.S3_ENDPOINT?.trim();
  if (!bucket || !endpoint) return null;

  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  if (!accessKeyId || !secretAccessKey) {
    throw new Error('S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY are required when S3 storage is configured.');
  }

  return {
    bucket,
    endpoint,
    region: process.env.S3_REGION?.trim() || 'auto',
    publicBase: process.env.S3_PUBLIC_URL?.trim()?.replace(/\/+$/, '') || null,
    credentials: { accessKeyId, secretAccessKey },
  };
}

async function s3Client() {
  const config = storageConfig();
  if (!config) return null;

  const { S3Client } = await import('@aws-sdk/client-s3');
  return {
    config,
    client: new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: config.credentials,
    }),
  };
}

export async function uploadToStorage(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
): Promise<StorageResult> {
  const extension = originalName.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'bin';
  const key = `vault/${randomUUID()}.${extension}`;
  const storage = await s3Client();

  if (storage) {
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    await storage.client.send(new PutObjectCommand({
      Bucket: storage.config.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }));

    const url = storage.config.publicBase
      ? `${storage.config.publicBase}/${key}`
      : `${storage.config.endpoint.replace(/\/+$/, '')}/${storage.config.bucket}/${key}`;

    return { url, key };
  }

  // Local/development fallback only. Configure S3-compatible storage in deployed environments.
  return {
    url: `data:${mimeType};base64,${buffer.toString('base64')}`,
    key,
  };
}

export async function deleteFromStorage(key: string) {
  if (!key) return;
  const storage = await s3Client();
  if (!storage) return;

  const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
  await storage.client.send(new DeleteObjectCommand({
    Bucket: storage.config.bucket,
    Key: key,
  }));
}
