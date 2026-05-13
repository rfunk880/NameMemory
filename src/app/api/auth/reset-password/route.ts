import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, cookieOptions } from '@/lib/auth';

type ResetRow = {
  id: number;
  token: string;
  userId: number;
  expiresAt: Date;
  usedAt: Date | null;
};

type UserRow = {
  id: number;
  email: string;
  name: string;
};

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

    const rows = await prisma.$queryRaw<ResetRow[]>`
      SELECT id, token, "userId", "expiresAt", "usedAt"
      FROM "PasswordReset"
      WHERE token = ${token}
      LIMIT 1
    `;

    const reset = rows[0] ?? null;

    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This reset link is invalid or expired' }, { status: 400 });
    }

    const userRows = await prisma.$queryRaw<UserRow[]>`
      SELECT id, email, name FROM "User" WHERE id = ${reset.userId} LIMIT 1
    `;
    const user = userRows[0];

    if (!user) {
      return NextResponse.json({ error: 'This reset link is invalid or expired' }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 12);

    await prisma.user.update({ where: { id: reset.userId }, data: { password: hash } });
    await prisma.$executeRaw`
      UPDATE "PasswordReset" SET "usedAt" = NOW() WHERE id = ${reset.id}
    `;
    await prisma.$executeRaw`
      DELETE FROM "PasswordReset" WHERE "userId" = ${reset.userId} AND id != ${reset.id}
    `;

    const authToken = await signToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
    response.cookies.set({ ...cookieOptions(), value: authToken });
    return response;
  } catch (err) {
    console.error('reset-password failed:', err);
    return NextResponse.json({ error: 'Could not reset password' }, { status: 500 });
  }
}
