import { roundMoney, toNumber } from '../../utils/money'

/** Gross = qty × unit price; discount is a percentage of gross. */
export function calculateLineItem(item) {
  const quantity = toNumber(item.quantity)
  const unitPrice = toNumber(item.unit_price ?? item.unitPrice)
  const discount = toNumber(item.discount)

  const grossAmount = roundMoney(quantity * unitPrice)
  const discountAmount = roundMoney(grossAmount * discount / 100)
  const amount = roundMoney(grossAmount - discountAmount)

  return {
    quantity,
    unitPrice,
    discount,
    grossAmount,
    discountAmount,
    amount,
  }
}

export function calculateQuotationTotals(items = [], gstRate = 18) {
  const lines = (items || []).map(calculateLineItem)
  const subtotal = roundMoney(lines.reduce((sum, line) => sum + line.amount, 0))
  const rate = toNumber(gstRate, 18)
  const gst = roundMoney(subtotal * rate / 100)
  const total = roundMoney(subtotal + gst)

  return {
    lines,
    subtotal,
    gstRate: rate,
    gst,
    total,
  }
}

export function deriveQuotationStatus(quotationDate, validUntil, today = new Date()) {
  if (!validUntil) return 'active'
  const end = new Date(`${validUntil}T23:59:59`)
  if (Number.isNaN(end.getTime())) return 'active'
  const now = new Date(today)
  now.setHours(0, 0, 0, 0)
  return end < now ? 'expired' : 'active'
}
