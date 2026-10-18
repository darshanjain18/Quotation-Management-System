import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '../components/ui/PageHeader'
import { QuotationForm } from '../features/quotations/components/QuotationForm'
import {
  createDefaultQuotationValues,
} from '../features/quotations/schemas/quotationSchema'
import {
  listQuotations,
  suggestQuotationNumber,
  upsertQuotation,
} from '../features/quotations/services/quotationsService'
import { composePhone } from '../utils/countryCodes'

export function CreateQuotationPage() {
  const navigate = useNavigate()
  const [defaults, setDefaults] = useState(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const existing = await listQuotations()
        if (!active) return
        setDefaults({
          ...createDefaultQuotationValues(),
          quotation_number: suggestQuotationNumber(existing),
        })
      } catch {
        if (!active) return
        setDefaults({
          ...createDefaultQuotationValues(),
          quotation_number: suggestQuotationNumber([]),
        })
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(values) {
    const id = await upsertQuotation({
      customer_name: values.customer_name,
      company_name: values.company_name || '',
      email: values.email || '',
      phone: composePhone(values.phone_country, values.phone_number),
      quotation_number: values.quotation_number,
      quotation_date: values.quotation_date,
      valid_until: values.valid_until || null,
      gst_rate: values.gst_rate,
      items: values.items,
    })
    toast.success('Quotation saved')
    navigate(`/quotations/${id}`)
  }

  if (!defaults) {
    return <p className="text-sm text-muted">Preparing quotation form…</p>
  }

  return (
    <div>
      <PageHeader
        title="Create Quotation"
        description="Capture customer details, line items, and tax"
      />
      <QuotationForm
        defaultValues={defaults}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/quotations')}
      />
    </div>
  )
}
