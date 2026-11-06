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

  // Only the names for the request form, and only for active members
  const consultants =
    state.status === 'ACTIVE'
      ? await prisma.consultant.findMany({
          where: { active: true, scenario: { not: null } },
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
          select: { id: true, name: true, field: true, scenario: true },
        })
      : [];

  // The member's own request history (visible even after the membership expires)
  const appointments = await prisma.appointment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      consultant: { select: { name: true, field: true, phone: true, email: true } },
    },
  });

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
        consultants={consultants}
        appointments={appointments.map((a) => ({
          id: a.id,
          scenario: a.scenario,
          problem: a.problem,
          createdAt: a.createdAt.toISOString(),
          consultant: {
            name: a.consultant.name,
            field: a.consultant.field,
            phone: a.consultant.phone,
            email: a.consultant.email,
          },
        }))}
      />
    </>
  );
}