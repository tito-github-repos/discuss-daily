import { NextResponse } from 'next/server';
import { after } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { SCENARIO_LABELS, isScenarioKey } from '@/lib/scenarios';
import { sendAppointmentRequestEmails } from '@/lib/email';

export const runtime = 'nodejs';

const MAX_PROBLEM_LENGTH = 2000;
const DUPLICATE_GUARD_MS = 30 * 1000; // stops a double click from sending twice

type Row = {
  id: number;
  scenario: string;
  problem: string | null;
  createdAt: Date;
  consultant: { name: string; field: string; phone: string; email: string | null };
};

const toRow = (a: Row) => ({
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
});

const consultantSelect = { name: true, field: true, phone: true, email: true } as const;

// ---------- My history ----------
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Please login to continue.' }, { status: 401 });
  }

  try {
    const appointments = await prisma.appointment.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { consultant: { select: consultantSelect } },
    });

    return NextResponse.json({ appointments: appointments.map(toRow) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Could not load your requests.' }, { status: 500 });
  }
}

// ---------- Send a request ----------
export async function POST(request: Request) {
  // The member comes from the session, never from the browser
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Please login to continue.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // 1. Validate the input
  const scenario = body.scenario;
  if (!isScenarioKey(scenario)) {
    return NextResponse.json({ error: 'Please choose a scenario.' }, { status: 422 });
  }

  const consultantId = Number(body.consultantId);
  if (!Number.isInteger(consultantId) || consultantId <= 0) {
    return NextResponse.json({ error: 'Please choose a consultant.' }, { status: 422 });
  }

  // The problem statement is optional: empty means none
  let problem: string | null = null;
  if (body.problem !== undefined && body.problem !== null) {
    if (typeof body.problem !== 'string') {
      return NextResponse.json({ error: 'Invalid problem statement.' }, { status: 422 });
    }
    const text = body.problem.replace(/\r\n/g, '\n').trim();
    if (text.length > MAX_PROBLEM_LENGTH) {
      return NextResponse.json(
        { error: `Problem statement must be at most ${MAX_PROBLEM_LENGTH} characters.` },
        { status: 422 }
      );
    }
    problem = text || null;
  }

  const scenarioLabel = SCENARIO_LABELS[scenario];

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { membership: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // 2. Only active members can send a request
    const m = user.membership;
    const active = m?.status === 'ACTIVE' && m.expiryDate !== null && m.expiryDate > new Date();
    if (!active) {
      return NextResponse.json(
        { error: 'Your membership is not active. Please activate it to send a request.' },
        { status: 403 }
      );
    }

    // 3. The consultant must be active and belong to the chosen scenario
    const consultant = await prisma.consultant.findFirst({
      where: { id: consultantId, active: true, scenario },
      select: { id: true },
    });
    if (!consultant) {
      return NextResponse.json(
        { error: 'Please choose a consultant from the list.' },
        { status: 400 }
      );
    }

    // 4. Double-click guard: the same member and consultant within 30 seconds
    const justSent = await prisma.appointment.findFirst({
      where: {
        userId: user.id,
        consultantId: consultant.id,
        createdAt: { gt: new Date(Date.now() - DUPLICATE_GUARD_MS) },
      },
      select: { id: true },
    });
    if (justSent) {
      return NextResponse.json(
        { error: 'Your request was just sent. Please wait a moment before sending another.' },
        { status: 429 }
      );
    }

    // 5. Save the request
    const appointment = await prisma.appointment.create({
      data: { userId: user.id, consultantId: consultant.id, scenario, problem },
      include: { consultant: { select: consultantSelect } },
    });

    // 6. Emails to the consultant and the admin, sent after the response;
    // a failed email never undoes or delays the request
    after(async () => {
      try {
        await sendAppointmentRequestEmails({
          consultantName: appointment.consultant.name,
          consultantEmail: appointment.consultant.email,
          scenarioLabel,
          problem,
          memberName: user.name,
          memberEmail: user.email,
          memberMobile: `${user.countryCode} ${user.mobile}`,
          sentAt: appointment.createdAt,
        });
      } catch (err) {
        console.error('Appointment emails failed:', err);
      }
    });

    return NextResponse.json({ ok: true, appointment: toRow(appointment) });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Could not send your request. Please try again.' },
      { status: 500 }
    );
  }
}