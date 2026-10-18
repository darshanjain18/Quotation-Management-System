import { formatINR } from '../../../utils/money'
import { deriveQuotationStatus } from '../calculations'

function formatDate(value) {
  if (!value) return '—'
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function QuotationDocument({ quotation }) {
  const status = deriveQuotationStatus(quotation.quotation_date, quotation.valid_until)
  const items = quotation.quotation_items || []

  return (
    <article className="quotation-doc print-area">
      <header className="quotation-doc__header">
        <div>
          <p className="quotation-doc__eyebrow">Software Quotation</p>
          <h1 className="quotation-doc__title">{quotation.quotation_number}</h1>
          <p className="quotation-doc__meta">Issued {formatDate(quotation.quotation_date)}</p>
        </div>
        <div className="quotation-doc__brand">
          <div className="quotation-doc__logo">QMS</div>
          <p className={`quotation-doc__status quotation-doc__status--${status}`}>
            {status === 'expired' ? 'Expired' : 'Active'}
          </p>
        </div>
      </header>

      <section className="quotation-doc__meta-grid">
        <div>
          <h2 className="quotation-doc__section-label">Customer Details</h2>
          <p className="quotation-doc__customer-name">{quotation.customer_name}</p>
          {quotation.company_name ? <p>{quotation.company_name}</p> : null}
          {quotation.email ? <p>{quotation.email}</p> : null}
          {quotation.phone ? <p>{quotation.phone}</p> : null}
        </div>
        <div className="quotation-doc__details">
          <h2 className="quotation-doc__section-label">Quotation Details</h2>
          <table className="quotation-doc__kv">
            <tbody>
              <tr>
                <th>Quotation Number</th>
                <td>{quotation.quotation_number}</td>
              </tr>
              <tr>
                <th>Quotation Date</th>
                <td>{formatDate(quotation.quotation_date)}</td>
              </tr>
              <tr>
                <th>Valid Until</th>
                <td>{formatDate(quotation.valid_until)}</td>
              </tr>
              <tr>
                <th>GST Rate</th>
                <td>{Number(quotation.gst_rate)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="quotation-doc__section-label">Products / Services</h2>
        <table className="quotation-doc__items">
          <thead>
            <tr>
              <th className="text-left">Product / Service</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Unit Price</th>
              <th className="text-right">Discount</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="text-left">{item.product_name}</td>
                <td className="text-right">{Number(item.quantity)}</td>
                <td className="text-right">{formatINR(item.unit_price)}</td>
                <td className="text-right">{Number(item.discount)}%</td>
                <td className="text-right">{formatINR(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="quotation-doc__totals">
        <table className="quotation-doc__totals-table">
          <tbody>
            <tr>
              <th>Subtotal</th>
              <td>{formatINR(quotation.subtotal)}</td>
            </tr>
            <tr>
              <th>GST ({Number(quotation.gst_rate)}%)</th>
              <td>{formatINR(quotation.gst)}</td>
            </tr>
            <tr className="quotation-doc__grand">
              <th>Grand Total</th>
              <td>{formatINR(quotation.total)}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </article>
  )
}
