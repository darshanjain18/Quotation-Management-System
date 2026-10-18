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
      ...values,
      company_name: values.company_name || '',
      email: values.email || '',
      phone: values.phone || '',
      valid_until: values.valid_until || null,
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
