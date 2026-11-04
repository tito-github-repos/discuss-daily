import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { membership: true },
  });
  if (!user) return NextResponse.json({ user: null });

  const m = user.membership;
  const active = m?.status === 'ACTIVE' && m.expiryDate !== null && m.expiryDate > new Date();

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile },
    membership: {
      status: active ? 'ACTIVE' : m?.status === 'PENDING' ? 'PENDING' : 'EXPIRED',
      startDate: m?.startDate ?? null,
      expiryDate: m?.expiryDate ?? null,
    },
  });
}