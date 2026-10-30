import { getCountries, parsePhoneNumberFromString } from 'libphonenumber-js/mobile';
import type { CountryCode } from 'libphonenumber-js/mobile';

export type RegisterField = 'name' | 'email' | 'phone';
export type RegisterErrors = Partial<Record<RegisterField, string>>;

export type RegisterInput = {
  name: string;
  email: string;
  phone: string; // national number, without country code
  country: string; // ISO code, e.g. "IN", "US", "GB"
};

// Letters (any language), spaces, and . ' - inside words. 2–60 characters in total.
const NAME_RE = /^\p{L}[\p{L}\p{M}'’.-]*(?: \p{L}[\p{L}\p{M}'’.-]*)*$/u;

// No consecutive dots, local part starts/ends with a letter or digit, real domain + TLD
const EMAIL_RE =
  /^(?!.*\.\.)[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;

const COUNTRY_CODES = new Set<string>(getCountries());

export function isValidCountry(code: string): code is CountryCode {
  return COUNTRY_CODES.has(code);
}

export function cleanPhone(raw: string): string {
  return raw.replace(/[\s\-().]/g, '');
}

export function validateField(field: RegisterField, value: string, country = 'IN'): string {
  const v = value.trim().replace(/\s+/g, ' ');

  switch (field) {
    case 'name':
      if (!v) return 'Please enter your name.';
      if (v.length < 2 || v.length > 60) return 'Name must be 2 to 60 characters.';
      if (!NAME_RE.test(v)) return 'Use letters only (spaces, . - and apostrophes are allowed).';
      return '';

    case 'email':
      if (!v) return 'Please enter your email.';
      if (v.length > 254 || !EMAIL_RE.test(v)) return 'Enter a valid email address.';
      return '';

    case 'phone': {
      if (!v) return 'Please enter your phone number.';
      const digits = cleanPhone(v);
      if (!/^\d+$/.test(digits)) return 'Phone number can contain digits only.';
      if (!isValidCountry(country)) return 'Please select a valid country.';
      const parsed = parsePhoneNumberFromString(digits, country);
      if (!parsed || !parsed.isValid())
        return 'Enter a valid mobile number for the selected country, without the country code.';
      return '';
    }
  }
}

export function validateRegistration(input: RegisterInput) {
  const country = input.country ?? '';
  const errors: RegisterErrors = {};

  (['name', 'email', 'phone'] as RegisterField[]).forEach((f) => {
    const msg = validateField(f, input[f] ?? '', country);
    if (msg) errors[f] = msg;
  });

  const valid = Object.keys(errors).length === 0;

  // Store phone in international E.164 format, e.g. +919360353287
  let phone = cleanPhone(input.phone ?? '');
  if (valid && isValidCountry(country)) {
    phone = parsePhoneNumberFromString(phone, country)?.number ?? phone;
  }

  return {
    valid,
    errors,
    data: {
      name: (input.name ?? '').trim().replace(/\s+/g, ' '),
      email: (input.email ?? '').trim().toLowerCase(),
      phone,
      country,
    } as RegisterInput,
  };
}