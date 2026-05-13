import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

interface PersonInput {
  firstName: string;
  lastName: string;
  nickname: string;
  company: string;
}

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const group = await prisma.group.findFirst({ where: { id: Number(id), ownerId: auth.userId } });
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const people: PersonInput[] = body.people;

  if (!Array.isArray(people) || people.length === 0) {
    return NextResponse.json({ error: 'No people provided' }, { status: 400 });
  }

  const valid = people.filter((p) => p.firstName?.trim().length > 0);

  if (valid.length === 0) {
    return NextResponse.json({ error: 'No valid entries provided' }, { status: 400 });
  }

  const created = await prisma.person.createMany({
    data: valid.map((p) => ({
      groupId: Number(id),
      firstName: p.firstName.trim(),
      lastName: p.lastName?.trim() || null,
      nickname: p.nickname?.trim() || null,
      company: p.company?.trim() || null,
    })),
  });

  await prisma.group.update({ where: { id: Number(id) }, data: { updatedAt: new Date() } });

  return NextResponse.json({ count: created.count }, { status: 201 });
}
