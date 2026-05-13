import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const group = await prisma.group.findFirst({ where: { id: Number(id), ownerId: auth.userId } });
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const names: string[] = body.names;

  if (!Array.isArray(names) || names.length === 0) {
    return NextResponse.json({ error: 'No names provided' }, { status: 400 });
  }

  const parsed = names
    .map((raw) => {
      const parts = raw.trim().split(/\s+/);
      const firstName = parts[0];
      const lastName = parts.length > 1 ? parts.slice(1).join(' ') : null;
      return { firstName, lastName };
    })
    .filter((p) => p.firstName.length > 0);

  if (parsed.length === 0) {
    return NextResponse.json({ error: 'No valid names provided' }, { status: 400 });
  }

  const created = await prisma.person.createMany({
    data: parsed.map((p) => ({
      groupId: Number(id),
      firstName: p.firstName,
      lastName: p.lastName,
    })),
  });

  await prisma.group.update({ where: { id: Number(id) }, data: { updatedAt: new Date() } });

  return NextResponse.json({ count: created.count }, { status: 201 });
}
