import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginEmailSchema } from "@/lib/validation";
import { createSession, hashOtp, safeEqual } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_ATTEMPTS = 5;

type FailCode =
  "INVALID" | "REQUEST_NEW" | "EXPIRED" | "TOO_MANY_ATTEMPTS" | "WRONG_CODE";

const fail = (
  error: string,
  code: FailCode,
  status = 400,
  extra: Record<string, unknown> = {},
) => NextResponse.json({ error, code, ...extra }, { status });

const invalid = () => fail("Invalid or expired code.", "INVALID");
const requestNew = () => fail("Please request a new code.", "REQUEST_NEW");
const expired = () =>
  fail("This code has expired. Please request a new code.", "EXPIRED");
const tooMany = () =>
  fail(
    "Too many wrong attempts. Please request a new code.",
    "TOO_MANY_ATTEMPTS",
    429,
  );

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  let email: string;
  try {
    ({ email } = (await loginEmailSchema.validate({ email: body.email })) as {
      email: string;
    });
  } catch {
    return invalid();
  }

  const code = String(body.code ?? "");
  if (!/^\d{6}$/.test(code)) return invalid();

  try {
    // Unknown email gets the same answer as "no active code", so this step reveals nothing
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return requestNew();

    // Newest code that has not been used, even if it has expired, so we can say why it failed
    const otp = await prisma.otp.findFirst({
      where: { userId: user.id, usedAt: null },
      orderBy: { createdAt: "desc" },
    });
    if (!otp) return requestNew();
    if (otp.expiresAt <= new Date()) return expired();
    if (otp.attempts >= MAX_ATTEMPTS) return tooMany();

    // Count the attempt first (atomic), so parallel guesses can't beat the limit
    const counted = await prisma.otp.updateMany({
      where: {
        id: otp.id,
        usedAt: null,
        attempts: { lt: MAX_ATTEMPTS },
        expiresAt: { gt: new Date() },
      },
      data: { attempts: { increment: 1 } },
    });
    if (counted.count === 0) return requestNew();

    if (!safeEqual(hashOtp(user.id, code), otp.codeHash)) {
      // Read the real count again: parallel requests may have used more attempts
      const fresh = await prisma.otp.findUnique({
        where: { id: otp.id },
        select: { attempts: true },
      });
      const left = Math.max(
        0,
        MAX_ATTEMPTS - (fresh?.attempts ?? MAX_ATTEMPTS),
      );
      if (left === 0) return tooMany();
      return fail(
        `Incorrect code. ${left} ${left === 1 ? "attempt" : "attempts"} left.`,
        "WRONG_CODE",
        400,
        { attemptsLeft: left },
      );
    }

    // One-time use
    const used = await prisma.otp.updateMany({
      where: { id: otp.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    if (used.count === 0) return requestNew();

    await createSession(user.id);
    return NextResponse.json({ ok: true, name: user.name });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong. Please try later." },
      { status: 500 },
    );
  }
}
