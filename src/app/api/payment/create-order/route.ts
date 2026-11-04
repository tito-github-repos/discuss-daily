import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createRazorpayOrder, MEMBERSHIP_AMOUNT_PAISE } from '@/lib/razorpay';

export const runtime = 'nodejs';

const DAY_MS = 24 * 60 * 60 * 1000;
const ORDER_VALID_MS = DAY_MS; // reuse an unpaid order for 24 hours

export async function POST() {
  // Only logged-in users can pay: the user comes from the session, never from the browser
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Please login to continue.' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { membership: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Still active (valid through the end of the expiry day): no payment needed.
    // Once the expiry day is over the membership counts as expired and can be paid for.
    const m = user.membership;
    if (m?.status === 'ACTIVE' && m.expiryDate && m.expiryDate.getTime() > Date.now()) {
      return NextResponse.json({ error: 'Your membership is already active.' }, { status: 409 });
    }

    const response = (orderId: string) => ({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId,
      amount: MEMBERSHIP_AMOUNT_PAISE,
      currency: 'INR',
      name: user.name,
      email: user.email,
      mobile: user.mobile,
    });

    // Reuse a recent unpaid order instead of creating a new one
    const recent = await prisma.payment.findFirst({
      where: {
        userId: user.id,
        status: 'CREATED',
        createdAt: { gt: new Date(Date.now() - ORDER_VALID_MS) },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (recent) {
      return NextResponse.json(response(recent.razorpayOrderId));
    }

    // First payment, or a renewal (the membership is expired)
    const type = m?.status === 'ACTIVE' || m?.status === 'EXPIRED' ? 'RENEWAL' : 'NEW';

    const order = await createRazorpayOrder({
      amount: MEMBERSHIP_AMOUNT_PAISE, // fixed on the server, never from the client
      receipt: `dd_${user.id}_${Date.now()}`,
      // Shown in the Razorpay dashboard (max 15 keys, each value a string up to 256 chars)
      notes: {
        userId: String(user.id),
        name: user.name.slice(0, 256),
        email: user.email.slice(0, 256),
        mobile: user.mobile,
        plan: 'Annual Membership',
        type,
      },
    });

    await prisma.payment.create({
      data: { userId: user.id, razorpayOrderId: order.id, amount: MEMBERSHIP_AMOUNT_PAISE },
    });

    return NextResponse.json(response(order.id));
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Could not start the payment. Please try again.' },
      { status: 500 }
    );
  }
}