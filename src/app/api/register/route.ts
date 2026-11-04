import { NextResponse } from 'next/server';
import { after } from 'next/server';
import { ValidationError } from 'yup';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { createSession, getSession } from '@/lib/auth';
import { registerSchema } from '@/lib/validation';
import { verifyTurnstile, getClientIp } from '@/lib/turnstile';
import { sendRegisteredConfirmation } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // 1. Honeypot: real users never fill this. Pretend success so bots learn nothing.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true, case: 'NEW' });
  }

  // 2. Server-side validation with the same Yup schema
  let data;
  try {
    data = await registerSchema.validate(
      { name: body.name, email: body.email, phone: body.phone, website: '' },
      { abortEarly: false }
    );
  } catch (err) {
    if (err instanceof ValidationError) {
      const errors: Record<string, string> = {};
      err.inner.forEach((e) => {
        if (e.path && !errors[e.path]) errors[e.path] = e.message;
      });
      return NextResponse.json({ error: 'Validation failed.', errors }, { status: 422 });
    }
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // 3. Cloudflare Turnstile
  const token = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';
  if (!token) {
    return NextResponse.json({ error: 'Please complete the security check.' }, { status: 400 });
  }

  try {
    const human = await verifyTurnstile(token, getClientIp(request));
    if (!human) {
      return NextResponse.json(
        { error: 'Security check failed. Please try again.' },
        { status: 403 }
      );
    }

    // 4. Who is logged in right now? (null if logged out, or the account no longer exists)
    const session = await getSession();
    const currentUser = session
      ? await prisma.user.findUnique({
          where: { id: session.userId },
          select: { id: true, name: true },
        })
      : null;

    // 5. Existing user?
    const matches = await prisma.user.findMany({
      where: { OR: [{ email: data.email }, { mobile: data.phone }] },
      include: { membership: true },
    });

    if (matches.length > 0) {
      // Same person: both email and mobile belong to one user
      const same = matches.find((u) => u.email === data.email && u.mobile === data.phone);

      if (same) {
        // Logged in, but these details belong to someone else: reveal nothing about that account
        if (currentUser && currentUser.id !== same.id) {
          return NextResponse.json({
            ok: true,
            case: 'OTHER_ACCOUNT',
            isCurrentUser: false,
            loggedInName: currentUser.name,
          });
        }

        const isCurrentUser = currentUser?.id === same.id;
        const m = same.membership;
        const stillActive =
          m?.status === 'ACTIVE' && m.expiryDate !== null && m.expiryDate > new Date();

        if (stillActive) {
          return NextResponse.json({
            ok: true,
            case: 'EXISTS_ACTIVE',
            isCurrentUser,
            // The expiry date is shown only to the account owner
            ...(isCurrentUser ? { expiryDate: m!.expiryDate!.toISOString() } : {}),
          });
        }
        if (m && (m.status === 'EXPIRED' || m.status === 'ACTIVE')) {
          // ACTIVE with a past expiry date counts as expired
          return NextResponse.json({ ok: true, case: 'EXISTS_EXPIRED', isCurrentUser });
        }
        return NextResponse.json({ ok: true, case: 'EXISTS_PENDING', isCurrentUser });
      }

      // Email and mobile belong to different users (or only one matches): show field errors
      const errors: Record<string, string> = {};
      if (matches.some((u) => u.email === data.email)) {
        errors.email = 'This email is already registered.';
      }
      if (matches.some((u) => u.mobile === data.phone)) {
        errors.phone = 'This mobile number is already registered.';
      }
      return NextResponse.json({ error: 'Already registered.', errors }, { status: 409 });
    }

    // 6. Logged in with new details: do not create a second account or replace their session
    if (currentUser) {
      return NextResponse.json({
        ok: true,
        case: 'LOGGED_IN_NEW',
        isCurrentUser: false,
        loggedInName: currentUser.name,
      });
    }

    // 7. New user with a pending membership
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        mobile: data.phone,
        membership: { create: {} }, // status defaults to PENDING
      },
      select: { id: true, name: true, email: true },
    });

    // Account was just created by this person, so log them in
    await createSession(user.id);

    // "Registered, not paid" email, sent after the response; a failure never blocks registration
    after(async () => {
      try {
        await sendRegisteredConfirmation({ name: user.name, email: user.email });
      } catch (err) {
        console.error('Registration email failed:', err);
      }
    });

    return NextResponse.json({ ok: true, case: 'NEW', name: user.name });
  } catch (err) {
    // Two requests at the same moment can slip past the check
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json(
        { error: 'This email or mobile number is already registered.' },
        { status: 409 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: 'Something went wrong. Please try later.' }, { status: 500 });
  }
}