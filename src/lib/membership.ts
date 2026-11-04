import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyPaymentSuccess } from "@/lib/payment-notifications";

const DAY_MS = 24 * 60 * 60 * 1000;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // India has no daylight saving

/**
 * Moves a date to the last moment of its day in India time (23:59:59.999 IST),
 * so a membership stays valid through the whole expiry day.
 */
function endOfDayIST(date: Date) {
  const shifted = date.getTime() + IST_OFFSET_MS; // look at the date as IST
  const dayStart = Math.floor(shifted / DAY_MS) * DAY_MS;
  return new Date(dayStart + DAY_MS - 1 - IST_OFFSET_MS);
}

/**
 * Marks the payment as PAID and activates or extends the membership.
 * Safe to call more than once for the same payment (verify route + webhook).
 * The confirmation email is sent only by the call that activates it.
 */
export async function activateByPayment(
  orderId: string,
  paymentId: string,
  amountPaise?: number,
  signature?: string
) {
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { razorpayOrderId: orderId } });
    if (!payment) return null;
    if (amountPaise !== undefined && amountPaise !== payment.amount) return null;

    const currentMembership = () =>
      tx.membership.findUnique({ where: { userId: payment.userId } });

    // Already processed
    if (payment.status === "PAID") {
      const m = await currentMembership();
      return { userId: payment.userId, expiryDate: m?.expiryDate ?? null, activated: false };
    }

    // Claim the payment: only one caller can flip it to PAID
    const claimed = await tx.payment.updateMany({
      where: { id: payment.id, status: { not: "PAID" } },
      data: {
        status: "PAID",
        razorpayPaymentId: paymentId,
        razorpaySignature: signature ?? null,
        paidAt: new Date(),
      },
    });
    if (claimed.count === 0) {
      const m = await currentMembership();
      return { userId: payment.userId, expiryDate: m?.expiryDate ?? null, activated: false };
    }

    const now = new Date();
    const m = await currentMembership();
    const stillActive = m?.status === "ACTIVE" && m.expiryDate !== null && m.expiryDate > now;

    const base = stillActive ? m!.expiryDate! : now; // extend from expiry if still active
    // 365 days later, valid through the end of that day (IST)
    const expiryDate = endOfDayIST(new Date(base.getTime() + 365 * DAY_MS));
    const startDate = stillActive ? (m!.startDate ?? now) : now;

    await tx.membership.upsert({
      where: { userId: payment.userId },
      update: { status: "ACTIVE", startDate, expiryDate },
      create: { userId: payment.userId, status: "ACTIVE", startDate, expiryDate },
    });

    return { userId: payment.userId, expiryDate, activated: true };
  });

  if (!result) return null;

  // After the response, so the payment is never delayed by the email
  if (result.activated) {
    after(() => notifyPaymentSuccess(orderId));
  }

  return { userId: result.userId, expiryDate: result.expiryDate };
}