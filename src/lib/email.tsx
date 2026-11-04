import OtpEmail from "@/templates/otpEmail";
import RegisteredConfirmation from "@/templates/registeredConfirmation";
import PaymentConfirmation from "@/templates/paymentConfirmation";
import type { ReactElement } from "react";
import { resend } from "./resend";

interface OtpData {
  name: string;
  email: string;
  code: string;
}

interface RegisteredData {
  name: string;
  email: string;
}

interface PaymentData {
  name: string;
  email: string;
  amountText: string;
  paymentId: string;
  paidOn: string;
  validTill: string;
}

// Sends one email. Throws if it was not accepted (the Resend SDK returns the
// error instead of throwing, so it is checked here).
async function deliver({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: ReactElement;
}) {
  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not set");
    }
    console.log(`[DEV] RESEND_API_KEY is empty, no email sent. To: ${to}, Subject: ${subject}`);
    return;
  }

  const from = process.env.FROM_EMAIL;
  if (!from) throw new Error("FROM_EMAIL is not set");

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    react,
    replyTo: process.env.REPLY_TO_EMAIL || undefined,
  });

  if (error) {
    throw new Error(`Resend failed (from: ${from}, to: ${to}): ${error.name} - ${error.message}`);
  }

  console.log(`[email] "${subject}" accepted by Resend for ${to}`);
}

// 1. Login code
export async function sendOtpEmail(data: OtpData) {
  await deliver({
    to: data.email,
    subject: `${data.code} is your Discuss Daily login code`,
    react: <OtpEmail name={data.name} code={data.code} />,
  });
}

// 2. Registered, not paid yet
export async function sendRegisteredConfirmation(data: RegisteredData) {
  await deliver({
    to: data.email,
    subject: "Discuss Daily Registration Confirmation",
    react: <RegisteredConfirmation name={data.name} />,
  });
}

// 3. Payment received
export async function sendPaymentConfirmation(data: PaymentData) {
  const { email, ...rest } = data;
  await deliver({
    to: email,
    subject: "Discuss Daily Payment Confirmation",
    react: <PaymentConfirmation {...rest} />,
  });
}