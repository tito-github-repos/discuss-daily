import { prisma } from "@/lib/prisma";
import { sendPaymentConfirmation } from "@/lib/email";

const formatDate = (d: Date) =>
  d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

// Sends the payment confirmation email to the member.
// Never throws: email problems must not affect payment handling.
export async function notifyPaymentSuccess(orderId: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: orderId },
      include: { user: { include: { membership: true } } },
    });

    if (
      !payment ||
      payment.status !== "PAID" ||
      !payment.paidAt ||
      !payment.razorpayPaymentId
    ) {
      return;
    }

    const validTill = payment.user.membership?.expiryDate;
    if (!validTill) return;

    await sendPaymentConfirmation({
      name: payment.user.name,
      email: payment.user.email,
      amountText: `₹${(payment.amount / 100).toFixed(2)}`,
      paymentId: payment.razorpayPaymentId,
      paidOn: formatDate(payment.paidAt),
      validTill: formatDate(validTill),
    });
  } catch (error) {
    console.error("Payment notification error:", error);
  }
}