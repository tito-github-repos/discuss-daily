const DAY_MS = 24 * 60 * 60 * 1000;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // India has no daylight saving

export type MembershipState = {
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED';
  daysLeft: number | null;
  canPay: boolean;
  payLabel: string;
};

// Whole calendar days since 1 Jan 1970, as seen in India time
const istDay = (d: Date) => Math.floor((d.getTime() + IST_OFFSET_MS) / DAY_MS);

export function getMembershipState(
  m: { status: string; expiryDate: Date | null } | null,
  now = new Date()
): MembershipState {
  if (!m || m.status === 'PENDING' || !m.expiryDate) {
    return { status: 'PENDING', daysLeft: null, canPay: true, payLabel: 'Pay ₹365 to activate' };
  }

  // Active until the end of the expiry day (expiry is saved as 23:59:59 IST).
  // An active member never gets a pay or renew button.
  if (m.status === 'ACTIVE' && m.expiryDate > now) {
    const daysLeft = Math.max(0, istDay(m.expiryDate) - istDay(now));
    return { status: 'ACTIVE', daysLeft, canPay: false, payLabel: '' };
  }

  // EXPIRED, or ACTIVE with a past expiry date: can renew
  return { status: 'EXPIRED', daysLeft: 0, canPay: true, payLabel: 'Renew ₹365' };
}