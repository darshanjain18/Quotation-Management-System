import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import { QuotationForm } from '../features/quotations/components/QuotationForm'
import { getQuotation, upsertQuotation } from '../features/quotations/services/quotationsService'
import { composePhone, parsePhone } from '../utils/countryCodes'

export function EditQuotationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [defaults, setDefaults] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await getQuotation(id)
        if (!active) return
        const phoneParts = parsePhone(data.phone)
        setDefaults({
          customer_name: data.customer_name || '',
          company_name: data.company_name || '',
          email: data.email || '',
          phone_country: phoneParts.phone_country,
          phone_number: phoneParts.phone_number,
          quotation_number: data.quotation_number || '',
          quotation_date: data.quotation_date || '',
          valid_until: data.valid_until || '',
          gst_rate: Number(data.gst_rate) || 18,
          items: (data.quotation_items || []).map((item) => ({
            product_name: item.product_name,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            discount: Number(item.discount),
          })),
        })
      } catch (err) {
        if (!active) return
        setError(err.message || 'Failed to load quotation')
      }
    }
    load()
    return () => {
      active = false
    }
  }, [id])

  async function handleSubmit(values) {
    await upsertQuotation({
      id,
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
    toast.success('Quotation updated')
    navigate(`/quotations/${id}`)
  }

  if (error) {
    return <p className="text-sm text-danger">{error}</p>
  }

  if (!defaults) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Edit Quotation" description={`Updating ${defaults.quotation_number}`} />
      <QuotationForm
        defaultValues={defaults}
        submitLabel="Update Quotation"
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/quotations/${id}`)}
      />
    </div>
  )
}
