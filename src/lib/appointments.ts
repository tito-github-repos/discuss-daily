import { prisma } from  "@/lib/prisma";

export const MAX_REQUESTS_PER_YEAR = 12;

/**
 * Requests the member has sent in the current membership year,
 * counted from the membership start date (a renewal starts a new count).
 */
export function countThisYear(userId: number, membershipStart: Date | null) {
  return prisma.appointment.count({
    where: {
      userId,
      ...(membershipStart ? { createdAt: { gte: membershipStart } } : {}),
    },
  });
}