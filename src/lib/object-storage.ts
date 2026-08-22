import { createHash, createHmac, randomUUID } from 'crypto';

type StoredObject = {
  body: Buffer;
  contentType: string | null;
};

const DEFAULT_REGION = 'us-east-1';

function getStorageConfig() {
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

export function isObjectStorageConfigured() {
  return getStorageConfig() !== null;
}

function hashHex(value: Buffer | string) {
  return createHash('sha256').update(value).digest('hex');
}

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}

function hmac(key: Buffer | string, value: string) {
  return createHmac('sha256', key).update(value).digest();
}

function hmacHex(key: Buffer | string, value: string) {
  return createHmac('sha256', key).update(value).digest('hex');
}

function formatAmzDate(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, '');
}

function encodePathPart(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function buildObjectUrl(endpoint: string, bucket: string, key: string) {
  return `${endpoint}/${encodePathPart(bucket)}/${key.split('/').map(encodePathPart).join('/')}`;
}

function signRequest(options: {
  method: string;
  key: string;
  payload: Buffer;
  contentType?: string;
}) {
  const config = getStorageConfig();
  if (!config) {
    throw new Error('Photo object storage is not configured');
  }

  const now = new Date();
  const amzDate = formatAmzDate(now);
  const dateStamp = amzDate.slice(0, 8);
  const url = new URL(buildObjectUrl(config.endpoint, config.bucket, options.key));
  const payloadHash = hashHex(options.payload);
  const headers: Record<string, string> = {
    host: url.host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  };

  if (options.contentType) {
    headers['content-type'] = options.contentType;
  }

  const signedHeaderNames = Object.keys(headers).sort();
  const canonicalHeaders = signedHeaderNames.map((name) => `${name}:${headers[name]}\n`).join('');
  const signedHeaders = signedHeaderNames.join(';');
  const canonicalRequest = [
    options.method,
    url.pathname,
    url.searchParams.toString(),
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');
  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    hashHex(canonicalRequest),
  ].join('\n');
  const dateKey = hmac(`AWS4${config.secretAccessKey}`, dateStamp);
  const dateRegionKey = hmac(dateKey, config.region);
  const dateRegionServiceKey = hmac(dateRegionKey, 's3');
  const signingKey = hmac(dateRegionServiceKey, 'aws4_request');
  const signature = hmacHex(signingKey, stringToSign);

  const authorization = [
    'AWS4-HMAC-SHA256',
    `Credential=${config.accessKeyId}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`,
  ].join(', ');

  const requestHeaders: Record<string, string> = {
    Authorization: authorization,
    'X-Amz-Content-Sha256': payloadHash,
    'X-Amz-Date': amzDate,
  };

  if (options.contentType) {
    requestHeaders['Content-Type'] = options.contentType;
  }

  return { url, headers: requestHeaders };
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

export async function putPhotoObject(key: string, body: Buffer, contentType: string) {
  const { url, headers } = signRequest({
    method: 'PUT',
    key,
    payload: body,
    contentType,
  });

  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: toArrayBuffer(body),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`Photo object upload failed (${response.status})${details ? `: ${details.slice(0, 240)}` : ''}`);
  }
}

export async function getPhotoObject(storageUrl: string): Promise<StoredObject> {
  const parsed = parseStorageUrl(storageUrl);
  if (!parsed) {
    throw new Error('Invalid object storage URL');
  }

  const { url, headers } = signRequest({
    method: 'GET',
    key: parsed.key,
    payload: Buffer.alloc(0),
  });

  const response = await fetch(url, { method: 'GET', headers });
  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`Photo object download failed (${response.status})${details ? `: ${details.slice(0, 240)}` : ''}`);
  }

  const body = Buffer.from(await response.arrayBuffer());
  return {
    body,
    contentType: response.headers.get('content-type'),
  };
}

export async function deletePhotoObject(storageUrl: string) {
  const parsed = parseStorageUrl(storageUrl);
  if (!parsed) return;

  const { url, headers } = signRequest({
    method: 'DELETE',
    key: parsed.key,
    payload: Buffer.alloc(0),
  });

  const response = await fetch(url, { method: 'DELETE', headers });
  if (!response.ok && response.status !== 404) {
    const details = await response.text().catch(() => '');
    throw new Error(`Photo object delete failed (${response.status})${details ? `: ${details.slice(0, 240)}` : ''}`);
  }
}
