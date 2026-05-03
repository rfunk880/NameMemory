import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { processUpload } from '@/lib/image';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const group = await prisma.group.findFirst({ where: { id: Number(id), ownerId: auth.userId } });
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const people = await prisma.person.findMany({
      where: { groupId: Number(id) },
      orderBy: { firstName: 'asc' },
    });
    return NextResponse.json(people);
  } catch (err) {
    console.error('[GET /api/groups/:id/people]', err);
    return NextResponse.json({ error: 'Failed to load people' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const group = await prisma.group.findFirst({ where: { id: Number(id), ownerId: auth.userId } });
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const formData = await request.formData();
  const firstName = (formData.get('firstName') as string)?.trim();
  const lastName = (formData.get('lastName') as string)?.trim() || null;
  const nickname = (formData.get('nickname') as string)?.trim() || null;
  const notes = (formData.get('notes') as string)?.trim() || null;
  const photo = formData.get('photo') as File | null;

  if (!firstName) {
    return NextResponse.json({ error: 'First name is required' }, { status: 400 });
  }

  let photoPath: string | null = null;
  let thumbPath: string | null = null;

  if (photo && photo.size > 0) {
    try {
      const result = await processUpload(photo);
      photoPath = result.photoPath;
      thumbPath = result.thumbPath;
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Image upload failed' },
        { status: 400 },
      );
    }
  }

  const person = await prisma.person.create({
    data: { groupId: Number(id), firstName, lastName, nickname, notes, photoPath, thumbPath },
  });

  await prisma.group.update({ where: { id: Number(id) }, data: { updatedAt: new Date() } });

  return NextResponse.json(person, { status: 201 });
}
