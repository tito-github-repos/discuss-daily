import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getMembershipState } from '@/lib/membership-status';
import Header from '@/components/Header';
import MembershipView from '@/components/MembershipView';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'My Membership | Discuss Daily' };

export default async function MembershipPage() {
  const session = await getSession();
  if (!session) redirect('/');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { membership: true },
  });
  if (!user) redirect('/');

  const state = getMembershipState(user.membership);

  // Consultant details are loaded only for active members
  const consultants =
    state.status === 'ACTIVE'
      ? await prisma.consultant.findMany({
          where: { active: true },
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        })
      : [];

  return (
    <>
      <Header />
      <MembershipView
        name={user.name}
        status={state.status}
        startDate={user.membership?.startDate?.toISOString() ?? null}
        expiryDate={user.membership?.expiryDate?.toISOString() ?? null}
        daysLeft={state.daysLeft}
        canPay={state.canPay}
        payLabel={state.payLabel}
        consultants={consultants.map((c) => ({
          id: c.id,
          name: c.name,
          field: c.field,
          phone: c.phone,
          email: c.email,
          feeNote: c.feeNote,
        }))}
      />
    </>
  );
}