import { loadRazorpay } from '@/lib/razorpay-client';

type Options = {
  userId?: number; // omit when logged in: the server uses the session
  onSuccess: (expiryDate: string | null) => void;
  onFailed: (message: string) => void;
  onDone: () => void; // always called when the flow ends (success, failed or closed)
};

export async function startPayment({ userId, onSuccess, onFailed, onDone }: Options) {
  try {
    const loaded = await loadRazorpay();
    if (!loaded) throw new Error('Could not load the payment window. Check your internet and try again.');

    const res = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userId ? { userId } : {}),
    });
    const order = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(order.error || 'Could not start the payment.');

    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: 'Discuss Daily',
      description: '1 year membership',
      prefill: { name: order.name, email: order.email, contact: order.mobile },
      theme: { color: '#16a34a' },
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        try {
          const v = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const data = await v.json().catch(() => ({}));
          if (!v.ok) throw new Error(data.error || 'Payment could not be verified.');
          onSuccess(data.expiryDate ?? null);
        } catch (e) {
          onFailed(
            `${e instanceof Error ? e.message : 'Verification failed.'} If money was deducted, your membership will be activated automatically shortly.`
          );
        } finally {
          onDone();
        }
      },
      modal: { ondismiss: () => onDone() }, // user closed the payment window
    });

    rzp.on('payment.failed', (r) => {
      onFailed(r.error?.description || 'The payment failed. Please try again.');
      onDone();
    });

    rzp.open();
  } catch (e) {
    onFailed(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    onDone();
  }
}