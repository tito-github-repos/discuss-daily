import { getCountries, getCountryCallingCode } from 'libphonenumber-js/mobile';

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export const countries = getCountries()
  .map((code) => ({
    code,
    name: regionNames.of(code) ?? code,
    dial: getCountryCallingCode(code),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const DEFAULT_COUNTRY = 'IN';