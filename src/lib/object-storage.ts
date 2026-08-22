import { randomUUID } from 'crypto';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

type StoredObject = {
  body: Buffer;
  contentType: string | null;
};

type StorageConfig = {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
};

const DEFAULT_REGION = 'us-east-1';

let cachedClient: S3Client | null = null;
let cachedClientKey = '';

function getStorageConfig(): StorageConfig | null {
  const endpoint = process.env.PHOTO_STORAGE_ENDPOINT;
  const bucket = process.env.PHOTO_STORAGE_BUCKET;
  const accessKeyId = process.env.PHOTO_STORAGE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.PHOTO_STORAGE_SECRET_ACCESS_KEY;
  const region = process.env.PHOTO_STORAGE_REGION || DEFAULT_REGION;

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return {
    endpoint: endpoint.replace(/\/+$/, ''),
    bucket,
    accessKeyId,
    secretAccessKey,
    region,
  };
}

function getStorageClient(config: StorageConfig) {
  const clientKey = `${config.endpoint}|${config.region}|${config.accessKeyId}`;
  if (cachedClient && cachedClientKey === clientKey) {
    return cachedClient;
  }

  cachedClient = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
  });
  cachedClientKey = clientKey;

  return cachedClient;
}

export function isObjectStorageConfigured() {
  return getStorageConfig() !== null;
}

function safeFilename(filename: string) {
  const cleaned = filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return cleaned || 'photo';
}

export function createPhotoObjectKey(filename: string) {
  return `photos/${randomUUID()}-${safeFilename(filename)}`;
}

export function createStorageUrl(key: string) {
  const config = getStorageConfig();
  if (!config) {
    throw new Error('Photo object storage is not configured');
  }

  return `s3://${config.bucket}/${key}`;
}

export function parseStorageUrl(storageUrl: string) {
  const config = getStorageConfig();
  if (!storageUrl.startsWith('s3://')) return null;

  const withoutScheme = storageUrl.slice('s3://'.length);
  const slashIndex = withoutScheme.indexOf('/');
  if (slashIndex === -1) return null;

  const bucket = withoutScheme.slice(0, slashIndex);
  const key = withoutScheme.slice(slashIndex + 1);

  if (config && bucket !== config.bucket) {
    throw new Error('Photo object belongs to an unexpected bucket');
  }

  return { bucket, key };
}

async function streamToBuffer(body: unknown) {
  if (!body) {
    throw new Error('Photo object response body is empty');
  }

  const transformableBody = body as { transformToByteArray?: () => Promise<Uint8Array> };
  if (typeof transformableBody.transformToByteArray === 'function') {
    return Buffer.from(await transformableBody.transformToByteArray());
  }

  const chunks: Buffer[] = [];
  for await (const chunk of body as AsyncIterable<Buffer | Uint8Array | string>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function putPhotoObject(key: string, body: Buffer, contentType: string) {
  const config = getStorageConfig();
  if (!config) {
    throw new Error('Photo object storage is not configured');
  }

  const client = getStorageClient(config);
  await client.send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
}

export async function getPhotoObject(storageUrl: string): Promise<StoredObject> {
  const parsed = parseStorageUrl(storageUrl);
  if (!parsed) {
    throw new Error('Invalid object storage URL');
  }

  const config = getStorageConfig();
  if (!config) {
    throw new Error('Photo object storage is not configured');
  }

  const client = getStorageClient(config);
  const response = await client.send(new GetObjectCommand({
    Bucket: parsed.bucket,
    Key: parsed.key,
  }));

  return {
    body: await streamToBuffer(response.Body),
    contentType: response.ContentType || null,
  };
}

export async function deletePhotoObject(storageUrl: string) {
  const parsed = parseStorageUrl(storageUrl);
  if (!parsed) return;

  const config = getStorageConfig();
  if (!config) {
    throw new Error('Photo object storage is not configured');
  }

  const client = getStorageClient(config);
  await client.send(new DeleteObjectCommand({
    Bucket: parsed.bucket,
    Key: parsed.key,
  }));
}
