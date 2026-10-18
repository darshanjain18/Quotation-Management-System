/** Round half-up to 2 decimal places via integer paise. */
export function roundMoney(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  const sign = n < 0 ? -1 : 1
  const absolute = Math.abs(n)
  return (sign * Math.round(absolute * 100 + Number.EPSILON)) / 100
}

export function toNumber(value, fallback = 0) {
  if (value === '' || value === null || value === undefined) return fallback
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatINR(value) {
  return inrFormatter.format(roundMoney(value))
}

/**
 * PDF-safe INR text. jsPDF Helvetica cannot render the ₹ glyph reliably.
 */
export function formatINRForPdf(value) {
  const amount = roundMoney(value)
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `Rs. ${formatted}`
}
