import { Badge } from '../../../components/ui/Badge'
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
    <article className="print-area rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Quotation</div>
          <h1 className="mt-2 text-2xl font-semibold text-ink">{quotation.quotation_number}</h1>
          <p className="mt-1 text-sm text-muted">Issued {formatDate(quotation.quotation_date)}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-ink">QMS</div>
          <div className="mt-2">
            <Badge tone={status === 'expired' ? 'expired' : 'active'}>
              {status === 'expired' ? 'Expired' : 'Active'}
            </Badge>
          </div>
        </div>
      </header>

      <section className="grid gap-6 py-6 sm:grid-cols-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Bill To</h2>
          <p className="mt-2 text-base font-semibold text-ink">{quotation.customer_name}</p>
          {quotation.company_name ? <p className="text-sm text-ink">{quotation.company_name}</p> : null}
          {quotation.email ? <p className="text-sm text-muted">{quotation.email}</p> : null}
          {quotation.phone ? <p className="text-sm text-muted">{quotation.phone}</p> : null}
        </div>
        <div className="sm:text-right">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Details</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between gap-6 sm:justify-end">
              <dt className="text-muted">Quotation Date</dt>
              <dd className="font-medium">{formatDate(quotation.quotation_date)}</dd>
            </div>
            <div className="flex justify-between gap-6 sm:justify-end">
              <dt className="text-muted">Valid Until</dt>
              <dd className="font-medium">{formatDate(quotation.valid_until)}</dd>
            </div>
            <div className="flex justify-between gap-6 sm:justify-end">
              <dt className="text-muted">GST Rate</dt>
              <dd className="font-medium">{Number(quotation.gst_rate)}%</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-y border-border bg-slate-50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-3 font-medium">Product / Service</th>
              <th className="px-3 py-3 font-medium text-right">Qty</th>
              <th className="px-3 py-3 font-medium text-right">Unit Price</th>
              <th className="px-3 py-3 font-medium text-right">Discount</th>
              <th className="px-3 py-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border/70">
                <td className="px-3 py-3 font-medium text-ink">{item.product_name}</td>
                <td className="px-3 py-3 text-right tabular-nums">{Number(item.quantity)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{formatINR(item.unit_price)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{Number(item.discount)}%</td>
                <td className="px-3 py-3 text-right tabular-nums font-medium">{formatINR(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-6 grid gap-2 sm:ml-auto sm:max-w-sm">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="font-medium tabular-nums">{formatINR(quotation.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">GST ({Number(quotation.gst_rate)}%)</span>
          <span className="font-medium tabular-nums">{formatINR(quotation.gst)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-lg font-semibold">
          <span>Grand Total</span>
          <span className="tabular-nums text-brand-700">{formatINR(quotation.total)}</span>
        </div>
      </section>
    </article>
  )
}
