import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, cookieOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 });
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'New password is required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const reset = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This reset link is invalid or expired' }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({ where: { id: reset.userId }, data: { password: hash } }),
      prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
      prisma.passwordReset.deleteMany({
        where: { userId: reset.userId, id: { not: reset.id } },
      }),
    ]);

    const authToken = await signToken({ userId: reset.user.id, email: reset.user.email });
    const response = NextResponse.json({
      user: { id: reset.user.id, email: reset.user.email, name: reset.user.name },
    });
    response.cookies.set({ ...cookieOptions(), value: authToken });
    return response;
  } catch {
    return NextResponse.json({ error: 'Could not reset password' }, { status: 500 });
  }
}
