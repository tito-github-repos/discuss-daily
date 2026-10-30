import { NextResponse } from 'next/server';
import { validateRegistration } from '@/lib/validation';

async function verifyTurnstile(token: string, ip?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new Error('TURNSTILE_SECRET_KEY is not set');

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}

async function saveRegistration(data: {
  name: string;
  email: string;
  phone: string; // E.164, e.g. +919360353287
  country: string;
}) {
  // TODO: replace with your real storage (database, Google Sheet, email, CRM...)
  console.log('New registration:', data);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // 1. Honeypot: real users never fill this. Pretend success so bots learn nothing.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  // 2. Server-side validation (never trust the client)
  const { valid, errors, data } = validateRegistration({
    name: String(body.name ?? ''),
    email: String(body.email ?? ''),
    phone: String(body.phone ?? ''),
    country: String(body.country ?? ''),
  });
  if (!valid) {
    return NextResponse.json({ error: 'Validation failed.', errors }, { status: 422 });
  }

  // 3. Cloudflare Turnstile
  const token = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';
  if (!token) {
    return NextResponse.json({ error: 'Please complete the security check.' }, { status: 400 });
  }
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    undefined;

  try {
    const human = await verifyTurnstile(token, ip);
    if (!human) {
      return NextResponse.json(
        { error: 'Security check failed. Please try again.' },
        { status: 403 }
      );
    }
    await saveRegistration(data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Something went wrong. Please try later.' }, { status: 500 });
  }
}