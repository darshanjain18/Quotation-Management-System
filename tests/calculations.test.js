import { describe, expect, it } from 'vitest'
import {
  calculateLineItem,
  calculateQuotationTotals,
  deriveQuotationStatus,
} from '../src/features/quotations/calculations'
import { quotationSchema } from '../src/features/quotations/schemas/quotationSchema'
import { formatINRForPdf, roundMoney } from '../src/utils/money'

describe('money rounding', () => {
  it('rounds to two decimals', () => {
    expect(roundMoney(1.234)).toBe(1.23)
    expect(roundMoney(1.235)).toBe(1.24)
    expect(roundMoney(10.1)).toBe(10.1)
  })

  it('formats PDF amounts without the rupee glyph', () => {
    expect(formatINRForPdf(164000)).toBe('Rs. 1,64,000.00')
    expect(formatINRForPdf(0)).toBe('Rs. 0.00')
  })
})

describe('line item calculations', () => {
  it('computes quantity × unit price', () => {
    const line = calculateLineItem({ quantity: 2, unit_price: 25000, discount: 0 })
    expect(line.grossAmount).toBe(50000)
    expect(line.amount).toBe(50000)
  })

  it('applies percentage discounts', () => {
    const line = calculateLineItem({ quantity: 2, unit_price: 25000, discount: 5 })
    expect(line.grossAmount).toBe(50000)
    expect(line.discountAmount).toBe(2500)
    expect(line.amount).toBe(47500)
  })

  it('rejects negative net via zero discount and price floors in schema tests', () => {
    const line = calculateLineItem({ quantity: 1, unit_price: 100, discount: 100 })
    expect(line.amount).toBe(0)
  })
})

describe('quotation totals', () => {
  it('matches the assignment example of ₹56,050', () => {
    const totals = calculateQuotationTotals(
      [{ product_name: 'Accounting Software', quantity: 2, unit_price: 25000, discount: 5 }],
      18,
    )
    expect(totals.subtotal).toBe(47500)
    expect(totals.gst).toBe(8550)
    expect(totals.total).toBe(56050)
  })

  it('handles empty items as zero totals', () => {
    const totals = calculateQuotationTotals([], 18)
    expect(totals.subtotal).toBe(0)
    expect(totals.gst).toBe(0)
    expect(totals.total).toBe(0)
  })

  it('supports custom GST rates', () => {
    const totals = calculateQuotationTotals(
      [{ quantity: 1, unit_price: 1000, discount: 0 }],
      12,
    )
    expect(totals.gst).toBe(120)
    expect(totals.total).toBe(1120)
  })

  it('sums multiple line items before GST', () => {
    const totals = calculateQuotationTotals(
      [
        { quantity: 1, unit_price: 1000, discount: 0 },
        { quantity: 2, unit_price: 500, discount: 10 },
      ],
      18,
    )
    // nets: 1000 + (1000 - 100) = 1900
    expect(totals.subtotal).toBe(1900)
    expect(totals.gst).toBe(342)
    expect(totals.total).toBe(2242)
  })

  it('handles zero GST and fractional quantities', () => {
    const line = calculateLineItem({ quantity: 1.5, unit_price: 100, discount: 0 })
    expect(line.grossAmount).toBe(150)
    const totals = calculateQuotationTotals(
      [{ quantity: 1.5, unit_price: 100, discount: 0 }],
      0,
    )
    expect(totals.gst).toBe(0)
    expect(totals.total).toBe(150)
  })

  it('clamps money math for high discounts at 100%', () => {
    const totals = calculateQuotationTotals(
      [{ quantity: 3, unit_price: 999.99, discount: 100 }],
      18,
    )
    expect(totals.subtotal).toBe(0)
    expect(totals.gst).toBe(0)
    expect(totals.total).toBe(0)
  })
})

describe('validation schema', () => {
  const base = {
    customer_name: 'Ada',
    company_name: '',
    email: 'ada@example.com',
    phone_country: '+91',
    phone_number: '',
    quotation_number: 'Q-2026-0001',
    quotation_date: '2026-03-18',
    valid_until: '2026-04-18',
    gst_rate: 18,
    items: [{ product_name: 'Software', quantity: 1, unit_price: 100, discount: 0 }],
  }

  it('requires customer name and at least one product', () => {
    expect(quotationSchema.safeParse({ ...base, customer_name: '' }).success).toBe(false)
    expect(quotationSchema.safeParse({ ...base, items: [] }).success).toBe(false)
  })

  it('validates email when provided', () => {
    expect(quotationSchema.safeParse({ ...base, email: 'bad' }).success).toBe(false)
    expect(quotationSchema.safeParse({ ...base, email: '' }).success).toBe(true)
  })

  it('rejects invalid quantity and negative price', () => {
    expect(
      quotationSchema.safeParse({
        ...base,
        items: [{ product_name: 'X', quantity: 0, unit_price: 10, discount: 0 }],
      }).success,
    ).toBe(false)
    expect(
      quotationSchema.safeParse({
        ...base,
        items: [{ product_name: 'X', quantity: 1.5, unit_price: 10, discount: 0 }],
      }).success,
    ).toBe(false)
    expect(
      quotationSchema.safeParse({
        ...base,
        items: [{ product_name: 'X', quantity: 1, unit_price: -1, discount: 0 }],
      }).success,
    ).toBe(false)
  })

  it('requires quotation date and at least one product', () => {
    expect(quotationSchema.safeParse({ ...base, quotation_date: '' }).success).toBe(false)
    expect(quotationSchema.safeParse({ ...base, items: [] }).success).toBe(false)
  })

  it('validates date order', () => {
    expect(
      quotationSchema.safeParse({
        ...base,
        quotation_date: '2026-05-01',
        valid_until: '2026-04-01',
      }).success,
    ).toBe(false)
  })

  it('rejects discount and GST outside 0–100', () => {
    expect(
      quotationSchema.safeParse({
        ...base,
        items: [{ product_name: 'X', quantity: 1, unit_price: 10, discount: 101 }],
      }).success,
    ).toBe(false)
    expect(quotationSchema.safeParse({ ...base, gst_rate: -1 }).success).toBe(false)
    expect(quotationSchema.safeParse({ ...base, gst_rate: 101 }).success).toBe(false)
  })

  it('requires a full 10-digit phone when phone is entered', () => {
    expect(quotationSchema.safeParse({ ...base, phone_number: '98765' }).success).toBe(false)
    expect(quotationSchema.safeParse({ ...base, phone_number: '9876543210' }).success).toBe(true)
    expect(quotationSchema.safeParse({ ...base, phone_number: '' }).success).toBe(true)
  })
})

describe('status derivation', () => {
  it('marks past valid_until as expired', () => {
    expect(deriveQuotationStatus('2026-01-01', '2026-01-10', new Date('2026-02-01'))).toBe('expired')
    expect(deriveQuotationStatus('2026-01-01', '2026-12-31', new Date('2026-02-01'))).toBe('active')
    expect(deriveQuotationStatus('2026-01-01', '', new Date('2026-02-01'))).toBe('active')
  })
})
