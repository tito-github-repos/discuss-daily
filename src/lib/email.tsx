import OtpEmail from "@/templates/otpEmail";
import RegisteredConfirmation from "@/templates/registeredConfirmation";
import PaymentConfirmation from "@/templates/paymentConfirmation";
import AppointmentRequest from "@/templates/appointmentRequiest";
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

interface AppointmentRequestData {
  consultantName: string;
  consultantEmail: string | null;
  scenarioLabel: string;
  problem: string | null;
  memberName: string;
  memberEmail: string;
  memberMobile: string;
  sentAt: Date;
}

// Sends one email. Throws if it was not accepted (the Resend SDK returns the
// error instead of throwing, so it is checked here).
async function deliver({
  to,
  subject,
  react,
  replyTo,
}: {
  to: string;
  subject: string;
  react: ReactElement;
  replyTo?: string;
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
    replyTo: replyTo ?? (process.env.REPLY_TO_EMAIL || undefined),
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

// 4. Consultation request: one email to the consultant and one to the admin.
// Each is sent on its own, so one failing never stops the other.
export async function sendAppointmentRequestEmails(data: AppointmentRequestData) {
  const consultantEmail = data.consultantEmail?.trim() || null;
  const adminEmail = process.env.ADMIN_EMAIL?.trim() || null;

  const sentOn = data.sentAt.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  const common = {
    consultantName: data.consultantName,
    consultantHasEmail: consultantEmail !== null,
    scenarioLabel: data.scenarioLabel,
    problem: data.problem,
    memberName: data.memberName,
    memberEmail: data.memberEmail,
    memberMobile: data.memberMobile,
    sentOn,
  };

  const jobs: Promise<void>[] = [];

  if (consultantEmail) {
    jobs.push(
      deliver({
        to: consultantEmail,
        subject: `New consultation request from ${data.memberName}`,
        react: <AppointmentRequest audience="consultant" {...common} />,
        // The consultant can reply straight to the member
        replyTo: data.memberEmail,
      })
    );
  }

  if (adminEmail) {
    jobs.push(
      deliver({
        to: adminEmail,
        subject: `New consultation request: ${data.memberName} to ${data.consultantName}`,
        react: <AppointmentRequest audience="admin" {...common} />,
      })
    );
  } else {
    console.error("ADMIN_EMAIL is not set: the admin did not get this request");
  }

  const results = await Promise.allSettled(jobs);
  results.forEach((r) => {
    if (r.status === "rejected") console.error("Appointment email failed:", r.reason);
  });
}