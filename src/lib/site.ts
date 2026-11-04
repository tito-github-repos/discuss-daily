// Used by all emails: change details here, in one place
export const SITE_URL = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
export const SITE_LABEL = SITE_URL.replace(/^https?:\/\//, '');

export const CONTACT_EMAIL = 'discussdailyusers@gmail.com';
export const CONTACT_PHONE = '+91 94999 53257';

export const MEMBERSHIP_BENEFITS = [
  'Contact details of qualified, practising consultants',
  'Talk to them directly by phone, WhatsApp or email',
  'Valid for 1 full year (365 days) from the date of payment',
  'Renew anytime in the last 30 days and keep your remaining days',
];