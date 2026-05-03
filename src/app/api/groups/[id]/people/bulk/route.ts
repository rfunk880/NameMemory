import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { processUpload } from '@/lib/image';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const group = await prisma.group.findFirst({ where: { id: Number(id), ownerId: auth.userId } });
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const formData = await request.formData();

  const entries: Array<{
    firstName: string;
    lastName: string | null;
    nickname: string | null;
    company: string | null;
    notes: string | null;
    photo: File | null;
  }> = [];

  let i = 0;
  while (formData.has(`firstName_${i}`) || formData.has(`photo_${i}`)) {
    const firstName = (formData.get(`firstName_${i}`) as string)?.trim();
    const lastName = (formData.get(`lastName_${i}`) as string)?.trim() || null;
    const nickname = (formData.get(`nickname_${i}`) as string)?.trim() || null;
    const company = (formData.get(`company_${i}`) as string)?.trim() || null;
    const notes = (formData.get(`notes_${i}`) as string)?.trim() || null;
    const photo = formData.get(`photo_${i}`) as File | null;

    if (firstName) {
      entries.push({ firstName, lastName, nickname, company, notes, photo });
    }
    i++;
  }

  if (entries.length === 0) {
    return NextResponse.json({ error: 'No valid entries provided' }, { status: 400 });
  }

  const results = await Promise.allSettled(
    entries.map(async (entry) => {
      let photoPath: string | null = null;
      let thumbPath: string | null = null;

      if (entry.photo && entry.photo.size > 0) {
        const result = await processUpload(entry.photo);
        photoPath = result.photoPath;
        thumbPath = result.thumbPath;
      }

      return prisma.person.create({
        data: {
          groupId: Number(id),
          firstName: entry.firstName,
          lastName: entry.lastName,
          nickname: entry.nickname,
          company: entry.company,
          notes: entry.notes,
          photoPath,
          thumbPath,
        },
      });
    }),
  );

  const created = results
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof prisma.person.create>>> => r.status === 'fulfilled')
    .map((r) => r.value);
  const failed = results.filter((r) => r.status === 'rejected').length;

  await prisma.group.update({ where: { id: Number(id) }, data: { updatedAt: new Date() } });

  return NextResponse.json({ created, failed }, { status: 201 });
}
