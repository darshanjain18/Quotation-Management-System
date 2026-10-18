import { useEffect, useMemo } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { PhoneInput } from '../../../components/ui/PhoneInput'
import { Card, CardHeader } from '../../../components/ui/Card'
import { formatINR } from '../../../utils/money'
import { calculateQuotationTotals } from '../calculations'
import {
  createDefaultQuotationValues,
  createEmptyItem,
  quotationSchema,
} from '../schemas/quotationSchema'

export function QuotationForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save Quotation',
}) {
  const form = useForm({
    resolver: zodResolver(quotationSchema),
    defaultValues: defaultValues || createDefaultQuotationValues(),
    mode: 'onBlur',
  })

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = form

  const phoneCountry = useWatch({ control, name: 'phone_country' })
  const phoneNumber = useWatch({ control, name: 'phone_number' })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const watchedItems = useWatch({ control, name: 'items' })
  const watchedGst = useWatch({ control, name: 'gst_rate' })

  const totals = useMemo(
    () => calculateQuotationTotals(watchedItems || [], watchedGst),
    [watchedItems, watchedGst],
  )

  useEffect(() => {
    if (defaultValues) reset(defaultValues)
  }, [defaultValues, reset])

  useEffect(() => {
    const handler = (event) => {
      if (!isDirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  async function handleFormSubmit(values) {
    try {
      await onSubmit(values)
    } catch (error) {
      toast.error(error.message || 'Failed to save quotation')
      throw error
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Card>
        <CardHeader title="Customer Information" description="Who this quotation is for" />
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Input label="Customer Name *" error={errors.customer_name?.message} {...register('customer_name')} />
          <Input label="Company Name" error={errors.company_name?.message} {...register('company_name')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <input type="hidden" {...register('phone_country')} />
          <Controller
            name="phone_number"
            control={control}
            render={() => (
              <PhoneInput
                countryCode={phoneCountry || '+91'}
                phoneNumber={phoneNumber || ''}
                error={errors.phone_number?.message}
                onCountryChange={(code) => setValue('phone_country', code, { shouldDirty: true, shouldValidate: true })}
                onPhoneChange={(value) => setValue('phone_number', value, { shouldDirty: true, shouldValidate: true })}
              />
            )}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Quotation Details" description="Numbering, dates, and tax rate" />
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Quotation Number *"
            error={errors.quotation_number?.message}
            {...register('quotation_number')}
          />
          <Input
            label="Quotation Date *"
            type="date"
            error={errors.quotation_date?.message}
            {...register('quotation_date')}
          />
          <Input
            label="Valid Until"
            type="date"
            error={errors.valid_until?.message}
            {...register('valid_until')}
          />
          <Input
            label="GST Rate (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            error={errors.gst_rate?.message}
            {...register('gst_rate')}
          />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Products and Services"
          description="Add one or more line items"
          action={
            <Button type="button" variant="secondary" size="sm" onClick={() => append(createEmptyItem())}>
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          }
        />
        <div className="overflow-x-auto p-5">
          {errors.items?.message || errors.items?.root?.message ? (
            <p className="mb-3 text-sm text-danger">{errors.items?.message || errors.items?.root?.message}</p>
          ) : null}

          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="py-2 pr-3 font-medium">Product / Service</th>
                <th className="py-2 px-3 font-medium">Qty</th>
                <th className="py-2 px-3 font-medium">Unit Price</th>
                <th className="py-2 px-3 font-medium">Discount %</th>
                <th className="py-2 px-3 font-medium text-right">Line Total</th>
                <th className="py-2 pl-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const line = totals.lines[index]
                return (
                  <tr key={field.id} className="border-b border-border/70 align-top">
                    <td className="py-3 pr-3 min-w-52">
                      <input
                        className="h-11 w-full rounded-xl border border-border px-3 shadow-soft transition hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                        {...register(`items.${index}.product_name`)}
                      />
                      {errors.items?.[index]?.product_name ? (
                        <p className="mt-1 text-xs text-danger">{errors.items[index].product_name.message}</p>
                      ) : null}
                    </td>
                    <td className="py-3 px-3 min-w-24">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        className="h-11 w-full rounded-xl border border-border px-3 shadow-soft transition hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                        {...register(`items.${index}.quantity`)}
                      />
                      {errors.items?.[index]?.quantity ? (
                        <p className="mt-1 text-xs text-danger">{errors.items[index].quantity.message}</p>
                      ) : null}
                    </td>
                    <td className="py-3 px-3 min-w-32">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="h-11 w-full rounded-xl border border-border px-3 shadow-soft transition hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                        {...register(`items.${index}.unit_price`)}
                      />
                      {errors.items?.[index]?.unit_price ? (
                        <p className="mt-1 text-xs text-danger">{errors.items[index].unit_price.message}</p>
                      ) : null}
                    </td>
                    <td className="py-3 px-3 min-w-28">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="h-11 w-full rounded-xl border border-border px-3 shadow-soft transition hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                        {...register(`items.${index}.discount`)}
                      />
                      {errors.items?.[index]?.discount ? (
                        <p className="mt-1 text-xs text-danger">{errors.items[index].discount.message}</p>
                      ) : null}
                    </td>
                    <td className="py-3 px-3 text-right font-medium tabular-nums">
                      {formatINR(line?.amount || 0)}
                    </td>
                    <td className="py-3 pl-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Remove item ${index + 1}`}
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="GST and Totals" description="Calculated from current line items" />
        <div className="grid gap-3 p-5 sm:max-w-md sm:ml-auto">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="font-medium tabular-nums">{formatINR(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">GST ({totals.gstRate}%)</span>
            <span className="font-medium tabular-nums">{formatINR(totals.gst)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
            <span>Grand Total</span>
            <span className="tabular-nums text-brand-700">{formatINR(totals.total)}</span>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
