import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Header from '@/components/Header';
import ProfileView from '@/components/ProfileView';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Profile | Discuss Daily' };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      payments: { where: { status: 'PAID' }, orderBy: { paidAt: 'desc' } },
    },
  });
  if (!user) redirect('/');

  return (
    <>
      <Header />
      <ProfileView
        name={user.name}
        email={user.email}
        mobile={user.mobile}
        registeredOn={user.createdAt.toISOString()}
        payments={user.payments.map((p) => ({
          id: p.id,
          amount: p.amount,
          paidAt: p.paidAt?.toISOString() ?? null,
          paymentId: p.razorpayPaymentId,
          orderId: p.razorpayOrderId,
        }))}
      />
    </>
  );
}