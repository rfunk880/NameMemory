import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { processUpload, deleteImages } from '@/lib/image';

type Params = { params: Promise<{ id: string }> };

async function getPersonForUser(personId: number, userId: number) {
  return prisma.person.findFirst({
    where: { id: personId, group: { ownerId: userId } },
    include: { group: true },
  });
}

export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const person = await getPersonForUser(Number(id), auth.userId);
  if (!person) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(person);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const person = await getPersonForUser(Number(id), auth.userId);
  if (!person) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const formData = await request.formData();
  const firstName = (formData.get('firstName') as string)?.trim();
  const lastName = (formData.get('lastName') as string)?.trim() || null;
  const nickname = (formData.get('nickname') as string)?.trim() || null;
  const company = (formData.get('company') as string)?.trim() || null;
  const notes = (formData.get('notes') as string)?.trim() || null;
  const photo = formData.get('photo') as File | null;
  const removePhoto = formData.get('removePhoto') === 'true';

  if (!firstName) {
    return NextResponse.json({ error: 'First name is required' }, { status: 400 });
  }

  let photoPath = person.photoPath;
  let thumbPath = person.thumbPath;

  if (removePhoto) {
    await deleteImages(person.photoPath, person.thumbPath);
    photoPath = null;
    thumbPath = null;
  } else if (photo && photo.size > 0) {
    await deleteImages(person.photoPath, person.thumbPath);
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

  const updated = await prisma.person.update({
    where: { id: Number(id) },
    data: { firstName, lastName, nickname, company, notes, photoPath, thumbPath },
  });

  return NextResponse.json(updated);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const person = await getPersonForUser(Number(id), auth.userId);
  if (!person) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const data: { active?: boolean } = {};
  if (typeof body.active === 'boolean') data.active = body.active;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No supported fields to update' }, { status: 400 });
  }

  const updated = await prisma.person.update({
    where: { id: Number(id) },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const person = await getPersonForUser(Number(id), auth.userId);
  if (!person) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await deleteImages(person.photoPath, person.thumbPath);
  await prisma.person.delete({ where: { id: Number(id) } });

  return NextResponse.json({ ok: true });
}
