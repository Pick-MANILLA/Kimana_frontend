export function formatShortDate(isoDateTime) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(isoDateTime),
  );
}

export function formatLongDate(isoDateTime) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoDateTime));
}

const COUNTRY_NAME = {
  NG: 'Nigeria',
  NL: 'Netherlands',
  IN: 'India',
  DE: 'Germany',
  GB: 'United Kingdom',
  US: 'United States',
};

export function countryName(isoCode) {
  return COUNTRY_NAME[isoCode] ?? isoCode;
}
