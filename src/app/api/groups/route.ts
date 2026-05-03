import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const groups = await prisma.group.findMany({
    where: { ownerId: auth.userId },
    include: { _count: { select: { people: true } } },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(groups);
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
  }

  const group = await prisma.group.create({
    data: { name: name.trim(), ownerId: auth.userId },
    include: { _count: { select: { people: true } } },
  });

  return NextResponse.json(group, { status: 201 });
}
