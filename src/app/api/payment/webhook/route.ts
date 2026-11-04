import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { activateByPayment } from '@/lib/membership';
import { hmacSha256, safeEqual } from '@/lib/razorpay';

export const runtime = 'nodejs';

type RazorpayEvent = {
  event?: string;
  payload?: { payment?: { entity?: { id?: string; order_id?: string; amount?: number } } };
};

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }

  // The signature is calculated on the raw body, so read it as text
  const raw = await request.text();
  const signature = request.headers.get('x-razorpay-signature') ?? '';
  if (!safeEqual(hmacSha256(secret, raw), signature)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  let event: RazorpayEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const entity = event.payload?.payment?.entity;
  if (!entity?.order_id || !entity.id) return NextResponse.json({ ok: true });

  try {
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      await activateByPayment(entity.order_id, entity.id, entity.amount);
    } else if (event.event === 'payment.failed') {
      await prisma.payment.updateMany({
        where: { razorpayOrderId: entity.order_id, status: 'CREATED' },
        data: { status: 'FAILED' },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    // A 500 makes Razorpay retry later
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}