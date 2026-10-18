/** Dial codes used by the phone input (searchable by name or code). */
export const COUNTRY_CODES = [
  { code: '+91', name: 'India', flag: 'IN' },
  { code: '+1', name: 'United States', flag: 'US' },
  { code: '+1', name: 'Canada', flag: 'CA' },
  { code: '+44', name: 'United Kingdom', flag: 'GB' },
  { code: '+971', name: 'United Arab Emirates', flag: 'AE' },
  { code: '+966', name: 'Saudi Arabia', flag: 'SA' },
  { code: '+65', name: 'Singapore', flag: 'SG' },
  { code: '+61', name: 'Australia', flag: 'AU' },
  { code: '+49', name: 'Germany', flag: 'DE' },
  { code: '+33', name: 'France', flag: 'FR' },
  { code: '+81', name: 'Japan', flag: 'JP' },
  { code: '+86', name: 'China', flag: 'CN' },
  { code: '+92', name: 'Pakistan', flag: 'PK' },
  { code: '+880', name: 'Bangladesh', flag: 'BD' },
  { code: '+94', name: 'Sri Lanka', flag: 'LK' },
  { code: '+977', name: 'Nepal', flag: 'NP' },
  { code: '+60', name: 'Malaysia', flag: 'MY' },
  { code: '+62', name: 'Indonesia', flag: 'ID' },
  { code: '+63', name: 'Philippines', flag: 'PH' },
  { code: '+66', name: 'Thailand', flag: 'TH' },
  { code: '+84', name: 'Vietnam', flag: 'VN' },
  { code: '+82', name: 'South Korea', flag: 'KR' },
  { code: '+39', name: 'Italy', flag: 'IT' },
  { code: '+34', name: 'Spain', flag: 'ES' },
  { code: '+31', name: 'Netherlands', flag: 'NL' },
  { code: '+41', name: 'Switzerland', flag: 'CH' },
  { code: '+46', name: 'Sweden', flag: 'SE' },
  { code: '+47', name: 'Norway', flag: 'NO' },
  { code: '+45', name: 'Denmark', flag: 'DK' },
  { code: '+353', name: 'Ireland', flag: 'IE' },
  { code: '+351', name: 'Portugal', flag: 'PT' },
  { code: '+7', name: 'Russia', flag: 'RU' },
  { code: '+90', name: 'Turkey', flag: 'TR' },
  { code: '+27', name: 'South Africa', flag: 'ZA' },
  { code: '+234', name: 'Nigeria', flag: 'NG' },
  { code: '+254', name: 'Kenya', flag: 'KE' },
  { code: '+20', name: 'Egypt', flag: 'EG' },
  { code: '+55', name: 'Brazil', flag: 'BR' },
  { code: '+52', name: 'Mexico', flag: 'MX' },
  { code: '+54', name: 'Argentina', flag: 'AR' },
  { code: '+56', name: 'Chile', flag: 'CL' },
  { code: '+57', name: 'Colombia', flag: 'CO' },
  { code: '+64', name: 'New Zealand', flag: 'NZ' },
  { code: '+852', name: 'Hong Kong', flag: 'HK' },
  { code: '+886', name: 'Taiwan', flag: 'TW' },
  { code: '+974', name: 'Qatar', flag: 'QA' },
  { code: '+965', name: 'Kuwait', flag: 'KW' },
  { code: '+968', name: 'Oman', flag: 'OM' },
  { code: '+973', name: 'Bahrain', flag: 'BH' },
  { code: '+961', name: 'Lebanon', flag: 'LB' },
  { code: '+962', name: 'Jordan', flag: 'JO' },
  { code: '+98', name: 'Iran', flag: 'IR' },
  { code: '+972', name: 'Israel', flag: 'IL' },
  { code: '+380', name: 'Ukraine', flag: 'UA' },
  { code: '+48', name: 'Poland', flag: 'PL' },
  { code: '+36', name: 'Hungary', flag: 'HU' },
  { code: '+420', name: 'Czechia', flag: 'CZ' },
  { code: '+43', name: 'Austria', flag: 'AT' },
  { code: '+32', name: 'Belgium', flag: 'BE' },
  { code: '+358', name: 'Finland', flag: 'FI' },
  { code: '+30', name: 'Greece', flag: 'GR' },
  { code: '+40', name: 'Romania', flag: 'RO' },
  { code: '+212', name: 'Morocco', flag: 'MA' },
  { code: '+216', name: 'Tunisia', flag: 'TN' },
  { code: '+213', name: 'Algeria', flag: 'DZ' },
  { code: '+233', name: 'Ghana', flag: 'GH' },
  { code: '+255', name: 'Tanzania', flag: 'TZ' },
  { code: '+256', name: 'Uganda', flag: 'UG' },
  { code: '+95', name: 'Myanmar', flag: 'MM' },
  { code: '+855', name: 'Cambodia', flag: 'KH' },
  { code: '+51', name: 'Peru', flag: 'PE' },
  { code: '+593', name: 'Ecuador', flag: 'EC' },
  { code: '+58', name: 'Venezuela', flag: 'VE' },
  { code: '+598', name: 'Uruguay', flag: 'UY' },
  { code: '+506', name: 'Costa Rica', flag: 'CR' },
  { code: '+507', name: 'Panama', flag: 'PA' },
  { code: '+1876', name: 'Jamaica', flag: 'JM' },
]

export const DEFAULT_COUNTRY_CODE = '+91'

export function formatDialLabel(country) {
  return `${country.code} ${country.name}`
}

export function searchCountries(query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return COUNTRY_CODES
  return COUNTRY_CODES.filter(
    (item) =>
      item.name.toLowerCase().includes(q)
      || item.code.includes(q)
      || item.flag.toLowerCase().includes(q),
  )
}

/** Store as `"<dial> <national>"` for display and later parsing. */
export function composePhone(countryCode, phoneNumber) {
  const digits = String(phoneNumber || '').replace(/\D/g, '')
  if (!digits) return ''
  return `${countryCode || DEFAULT_COUNTRY_CODE} ${digits}`
}

/** Split a stored phone string into dial code + 10-digit national number. */
export function parsePhone(value) {
  const raw = String(value || '').trim()
  if (!raw) {
    return { phone_country: DEFAULT_COUNTRY_CODE, phone_number: '' }
  }

  const digitsOnly = raw.replace(/\D/g, '')

  // Bare 10-digit numbers default to India (+91).
  if (!raw.startsWith('+') && digitsOnly.length === 10) {
    return {
      phone_country: DEFAULT_COUNTRY_CODE,
      phone_number: digitsOnly,
    }
  }

  const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length)

  for (const country of sorted) {
    const dialDigits = country.code.replace(/\D/g, '')
    if (!digitsOnly.startsWith(dialDigits)) continue
    const national = digitsOnly.slice(dialDigits.length)
    if (national.length === 10) {
      return {
        phone_country: country.code,
        phone_number: national,
      }
    }
  }

  for (const country of sorted) {
    const dialDigits = country.code.replace(/\D/g, '')
    if (digitsOnly.startsWith(dialDigits) && digitsOnly.length > dialDigits.length) {
      return {
        phone_country: country.code,
        phone_number: digitsOnly.slice(dialDigits.length).slice(0, 10),
      }
    }
  }

  return {
    phone_country: DEFAULT_COUNTRY_CODE,
    phone_number: digitsOnly.slice(0, 10),
  }
}
