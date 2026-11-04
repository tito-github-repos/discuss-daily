import * as yup from 'yup';

// Letters (any language), spaces, and . ' - inside words
const NAME_RE = /^\p{L}[\p{L}\p{M}'’.-]*(?: \p{L}[\p{L}\p{M}'’.-]*)*$/u;

const EMAIL_RE =
  /^(?!.*\.\.)[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;

export const registerSchema = yup.object({
  name: yup
    .string()
    .transform((v) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : v))
    .required('Please enter your name.')
    .min(2, 'Name must be at least 2 characters.')
    .max(60, 'Name must be at most 60 characters.')
    .matches(NAME_RE, 'Use letters only (spaces, . - and apostrophes are allowed).'),

  email: yup
    .string()
    .transform((v) => (typeof v === 'string' ? v.trim().toLowerCase() : v))
    .required('Please enter your email.')
    .max(254, 'Email is too long.')
    .matches(EMAIL_RE, 'Enter a valid email address.'),

  phone: yup
    .string()
    .required('Please enter your mobile number.')
    .matches(/^\d{10}$/, 'Mobile number must be exactly 10 digits.')
    .test(
      'not-same-digit',
      'Enter a valid mobile number.',
      (v) => !v || !/^(\d)\1{9}$/.test(v) // blocks 0000000000, 9999999999, etc.
    ),

  // Honeypot: must stay empty
  website: yup.string().default(''),
});

export type RegisterInput = yup.InferType<typeof registerSchema>;

export const loginEmailSchema = yup.object({
  email: registerSchema.fields.email,
});

export type LoginEmailInput = yup.InferType<typeof loginEmailSchema>;