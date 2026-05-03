import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_ROOT = process.env.UPLOAD_DIR ?? '/uploads';
const PHOTO_DIR = path.join(UPLOAD_ROOT, 'photos');
const THUMB_DIR = path.join(UPLOAD_ROOT, 'thumbs');

const MAX_PHOTO_WIDTH = 1200;
const THUMB_SIZE = 300;

async function ensureDirs() {
  if (!existsSync(PHOTO_DIR)) await mkdir(PHOTO_DIR, { recursive: true });
  if (!existsSync(THUMB_DIR)) await mkdir(THUMB_DIR, { recursive: true });
}

export async function processUpload(file: File): Promise<{ photoPath: string; thumbPath: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  if (!allowed.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i)) {
    throw new Error('Unsupported image format');
  }

  await ensureDirs();

  const id = randomUUID();
  const photoFile = `${id}.webp`;
  const thumbFile = `${id}_thumb.webp`;

  await sharp(buffer)
    .rotate()
    .resize({ width: MAX_PHOTO_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(PHOTO_DIR, photoFile));

  await sharp(buffer)
    .rotate()
    .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover', position: 'attention' })
    .webp({ quality: 75 })
    .toFile(path.join(THUMB_DIR, thumbFile));

  return {
    photoPath: `photos/${photoFile}`,
    thumbPath: `thumbs/${thumbFile}`,
  };
}

export async function deleteImages(photoPath?: string | null, thumbPath?: string | null) {
  const { unlink } = await import('fs/promises');
  const paths = [photoPath, thumbPath].filter(Boolean) as string[];
  for (const p of paths) {
    try {
      await unlink(path.join(UPLOAD_ROOT, p));
    } catch {
      // File may not exist, ignore
    }
  }
}
