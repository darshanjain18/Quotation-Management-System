import { describe, expect, it } from 'vitest'
import { getQuotationPdfFilename } from '../src/features/quotations/services/exportQuotationPdf'

describe('quotation PDF filename', () => {
  it('uses the quotation number with a .pdf extension', () => {
    expect(getQuotationPdfFilename({ quotation_number: 'Q-2026-0001' })).toBe('Q-2026-0001.pdf')
  })

  it('sanitizes unsafe characters', () => {
    expect(getQuotationPdfFilename({ quotation_number: 'Q 2026/0001' })).toBe('Q_2026_0001.pdf')
  })
})
