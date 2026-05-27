// client/src/lib/locale.ts
// Reusable locale/currency utilities for US/Canada awareness
// Used by Payment Plans and all future modules that need country-specific behavior

const CANADIAN_PROVINCES = new Set([
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT',
  // Full names too
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

/**
 * Determine if a dealership is in Canada or the US.
 * Falls back to 'CA' (Canada) when country cannot be determined.
 */
export function getDealerCountry(dealership?: LocaleAwareDealership | null): 'CA' | 'US' {
  if (!dealership) return 'CA';

  const country = dealership.country?.trim().toUpperCase();
  if (country === 'US' || country === 'USA' || country === 'UNITED STATES') return 'US';
  if (country === 'CA' || country === 'CAN' || country === 'CANADA') return 'CA';

  // Infer from province/state
  const region = (dealership.stateProvince || dealership.province || '').trim();
  if (!region) return 'CA'; // default to Canada (platform is primarily Canadian)

  const regionUpper = region.toUpperCase();
  if (US_STATES.has(regionUpper)) return 'US';
  if (CANADIAN_PROVINCES.has(region) || CANADIAN_PROVINCES.has(regionUpper)) return 'CA';

  return 'CA';
}

/**
 * Returns 'CAD' for Canadian dealerships, 'USD' for US dealerships.
 */
export function getDealerCurrency(dealership?: LocaleAwareDealership | null): 'CAD' | 'USD' {
  return getDealerCountry(dealership) === 'US' ? 'USD' : 'CAD';
}

/**
 * Format a numeric amount with currency symbol and code.
 * e.g. formatCurrency(1234.56, 'CAD') => '$1,234.56 CAD'
 *      formatCurrency(1234.56, 'USD') => '$1,234.56 USD'
 */
export function formatCurrency(amount: number | string | null | undefined, currency: 'CAD' | 'USD'): string {
  if (amount === null || amount === undefined || amount === '') return '—';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '—';

  const locale = currency === 'CAD' ? 'en-CA' : 'en-US';
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  // Intl already adds the $, but we want to append the currency code too
  // e.g. "CA$1,234.56" → "$1,234.56 CAD"
  const numericFormatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  return `$${numericFormatted} ${currency}`;
}

/**
 * Returns the consent text appropriate for the dealer's country.
 */
export function getFinancingConsentText(country: 'CA' | 'US', lang: 'en' | 'fr' = 'en'): string {
  if (country === 'CA') {
    return lang === 'fr'
      ? "J'autorise une vérification de crédit conformément aux lois canadiennes de protection des consommateurs"
      : 'I authorize a credit check in accordance with Canadian consumer protection laws';
  }
  return 'I authorize a credit check in accordance with applicable federal and state laws';
}
