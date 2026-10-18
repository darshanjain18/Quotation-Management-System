import { describe, expect, it } from 'vitest'
import { composePhone, parsePhone, searchCountries } from '../src/utils/countryCodes'

describe('country phone helpers', () => {
  it('composes dial code and national number', () => {
    expect(composePhone('+91', '9876543210')).toBe('+91 9876543210')
    expect(composePhone('+91', '')).toBe('')
  })

  it('parses stored phone values', () => {
    expect(parsePhone('+91 9876543210')).toEqual({
      phone_country: '+91',
      phone_number: '9876543210',
    })
    expect(parsePhone('9876543210')).toEqual({
      phone_country: '+91',
      phone_number: '9876543210',
    })
  })

  it('searches countries by name or code', () => {
    const india = searchCountries('india')
    expect(india.some((item) => item.code === '+91')).toBe(true)
    const plus44 = searchCountries('+44')
    expect(plus44.some((item) => item.name === 'United Kingdom')).toBe(true)
  })
})
