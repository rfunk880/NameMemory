import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteImages } from '@/lib/image';

type Params = { params: Promise<{ id: string }> };

async function getGroup(id: number, userId: number) {
  return prisma.group.findFirst({ where: { id, ownerId: userId } });
}

export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const group = await prisma.group.findFirst({
    where: { id: Number(id), ownerId: auth.userId },
    include: { _count: { select: { people: true } } },
  });

  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(group);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const group = await getGroup(Number(id), auth.userId);
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { name } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const updated = await prisma.group.update({
    where: { id: Number(id) },
    data: { name: name.trim() },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const group = await getGroup(Number(id), auth.userId);
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Delete all photos for people in this group
  const people = await prisma.person.findMany({ where: { groupId: Number(id) } });
  for (const person of people) {
    await deleteImages(person.photoPath, person.thumbPath);
  }

  await prisma.group.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
