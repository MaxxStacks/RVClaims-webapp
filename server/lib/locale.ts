// server/lib/locale.ts
// Server-side locale/currency utilities for US/Canada awareness

const CANADIAN_PROVINCES = new Set([
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT',
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Nova Scotia', 'Northwest Territories',
  'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon',
]);

const US_STATES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
]);

export interface LocaleAwareDealership {
  country?: string | null;
  province?: string | null;
  stateProvince?: string | null;
}

export function getDealerCountry(dealership?: LocaleAwareDealership | null): 'CA' | 'US' {
  if (!dealership) return 'CA';

  const country = dealership.country?.trim().toUpperCase();
  if (country === 'US' || country === 'USA' || country === 'UNITED STATES') return 'US';
  if (country === 'CA' || country === 'CAN' || country === 'CANADA') return 'CA';

  const region = (dealership.stateProvince || dealership.province || '').trim();
  if (!region) return 'CA';

  const regionUpper = region.toUpperCase();
  if (US_STATES.has(regionUpper)) return 'US';
  if (CANADIAN_PROVINCES.has(region) || CANADIAN_PROVINCES.has(regionUpper)) return 'CA';

  return 'CA';
}

export function getDealerCurrency(dealership?: LocaleAwareDealership | null): 'CAD' | 'USD' {
  return getDealerCountry(dealership) === 'US' ? 'USD' : 'CAD';
}

export function formatCurrency(amount: number | string | null | undefined, currency: 'CAD' | 'USD'): string {
  if (amount === null || amount === undefined) return '—';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '—';
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}
