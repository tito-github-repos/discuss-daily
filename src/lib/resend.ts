import { Resend } from "resend";

// null when no key is set, so local development works without one
export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;