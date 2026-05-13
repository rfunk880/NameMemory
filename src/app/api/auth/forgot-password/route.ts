import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

const TOKEN_TTL_MINUTES = 30;

async function ensurePasswordResetTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PasswordReset" (
      "id" SERIAL PRIMARY KEY,
      "token" TEXT NOT NULL,
      "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "usedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "PasswordReset_token_key" ON "PasswordReset"("token")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "PasswordReset_userId_idx" ON "PasswordReset"("userId")
  `);
}

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

    await ensurePasswordResetTable();

    await prisma.$executeRaw`
      INSERT INTO "PasswordReset" ("token", "userId", "expiresAt")
      VALUES (${token}, ${user.id}, ${expiresAt})
    `;

    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const origin = host ? `${proto}://${host}` : request.nextUrl.origin;
    const resetUrl = `${origin}/reset-password?token=${token}`;

    return NextResponse.json({ ok: true, resetUrl, expiresInMinutes: TOKEN_TTL_MINUTES });
  } catch (err) {
    console.error('forgot-password failed:', err);
    return NextResponse.json({ error: 'Could not generate reset link' }, { status: 500 });
  }
}
