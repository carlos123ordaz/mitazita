import { Storage } from '@google-cloud/storage';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const credentials = process.env.GCS_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.GCS_SERVICE_ACCOUNT_JSON)
  : undefined;

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);

export async function uploadFile(
  buffer: Buffer,
  originalname: string,
  mimetype: string
): Promise<string> {
  const ext = path.extname(originalname) || '.jpg';
  const filename = `orders/${uuidv4()}${ext}`;

  const file = bucket.file(filename);
  await file.save(buffer, {
    metadata: { contentType: mimetype },
    public: true,
  });

  return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filename}`;
}

export async function deleteFile(fileUrl: string): Promise<void> {
  const prefix = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/`;
  if (!fileUrl.startsWith(prefix)) return;
  const filename = fileUrl.slice(prefix.length);
  await bucket.file(filename).delete({ ignoreNotFound: true });
}
