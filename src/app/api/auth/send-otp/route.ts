import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginEmailSchema } from "@/lib/validation";
import { verifyTurnstile, getClientIp } from "@/lib/turnstile";
import { generateOtp, hashOtp } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";

export const runtime = "nodejs";

const OTP_VALID_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_GAP_MS = 60 * 1000; // 1 code per minute
const HOUR_MS = 60 * 60 * 1000;
const MAX_PER_HOUR = 5;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// 429 with the exact wait, in the message, the JSON and the standard Retry-After header
function tooManyRequests(
  error: string,
  code: "WAIT" | "HOURLY_LIMIT",
  retryAfterSeconds: number,
) {
  return NextResponse.json(
    { error, code, retryAfterSeconds },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

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
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 422 },
    );
  }

  const token =
    typeof body.turnstileToken === "string" ? body.turnstileToken : "";
  if (!token) {
    return NextResponse.json(
      { error: "Please complete the security check." },
      { status: 400 },
    );
  }

  try {
    if (!(await verifyTurnstile(token, getClientIp(request)))) {
      return NextResponse.json(
        { error: "Security check failed. Please try again." },
        { status: 403 },
      );
    }

    // Only registered users can get a code
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        {
          error: "This email is not registered. Please register first.",
          code: "NOT_REGISTERED",
        },
        { status: 404 },
      );
    }

    const now = Date.now();
    const recent = await prisma.otp.findMany({
      where: { userId: user.id, createdAt: { gt: new Date(now - HOUR_MS) } },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    // 5 codes in the last hour: blocked until the 5th newest code is more than an hour old
    if (recent.length >= MAX_PER_HOUR) {
      const unblockAt = recent[MAX_PER_HOUR - 1].createdAt.getTime() + HOUR_MS;
      const seconds = Math.max(1, Math.ceil((unblockAt - now) / 1000));
      const when =
        seconds < 60
          ? "less than a minute"
          : plural(Math.ceil(seconds / 60), "minute");
      return tooManyRequests(
        `You’ve reached the limit of ${MAX_PER_HOUR} codes per hour. Please try again in ${when}.`,
        "HOURLY_LIMIT",
        seconds,
      );
    }

    // 1 code per minute
    if (recent[0]) {
      const waitMs = RESEND_GAP_MS - (now - recent[0].createdAt.getTime());
      if (waitMs > 0) {
        const seconds = Math.ceil(waitMs / 1000);
        return tooManyRequests(
          `Please wait ${plural(seconds, "second")} before asking for another code.`,
          "WAIT",
          seconds,
        );
      }
    }

    // Only the newest code works
    await prisma.otp.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const code = generateOtp();

    // Dev only: print the code in the terminal (never runs in production)
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] OTP for ${user.email}: ${code}`);
    }

    await prisma.otp.create({
      data: {
        userId: user.id,
        codeHash: hashOtp(user.id, code),
        expiresAt: new Date(now + OTP_VALID_MS),
      },
    });

    // The code always goes to the email saved on the account
    try {
      await sendOtpEmail({ name: user.name, email: user.email, code });
    } catch (err) {
      console.error(err);
      return NextResponse.json(
        { error: "Could not send the email. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong. Please try later." },
      { status: 500 },
    );
  }
}
