import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

const TOKEN_TTL_MINUTES = 30;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      return NextResponse.json({ ok: true, resetUrl: null });
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

    await prisma.passwordReset.create({
      data: { token, userId: user.id, expiresAt },
    });

    const origin = request.nextUrl.origin;
    const resetUrl = `${origin}/reset-password?token=${token}`;

    return NextResponse.json({ ok: true, resetUrl, expiresInMinutes: TOKEN_TTL_MINUTES });
  } catch (err) {
    console.error('forgot-password failed:', err);
    return NextResponse.json({ error: 'Could not generate reset link' }, { status: 500 });
  }
}
