import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, statSync } from 'fs';
import path from 'path';
import { Readable } from 'stream';

const UPLOAD_ROOT = process.env.UPLOAD_DIR ?? '/uploads';

type Params = { params: Promise<{ path: string[] }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { path: segments } = await params;

  // Prevent path traversal
  const relative = segments.join('/').replace(/\.\./g, '');
  const filePath = path.join(UPLOAD_ROOT, relative);

  // Verify the resolved path is still inside UPLOAD_ROOT
  if (!filePath.startsWith(path.resolve(UPLOAD_ROOT))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const stat = statSync(filePath);
    if (!stat.isFile()) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const ext = path.extname(filePath).toLowerCase();
    const contentType = ext === '.webp' ? 'image/webp' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';

    const stream = createReadStream(filePath);
    const readable = Readable.toWeb(stream) as ReadableStream;

    return new NextResponse(readable, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
