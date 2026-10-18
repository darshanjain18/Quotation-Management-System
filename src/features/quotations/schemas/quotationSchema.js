import { z } from 'zod'
import { DEFAULT_COUNTRY_CODE } from '../../../utils/countryCodes'

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((value) => !value || z.string().email().safeParse(value).success, {
    message: 'Enter a valid email address',
  })

const itemSchema = z.object({
  product_name: z.string().trim().min(1, 'Product name is required'),
  quantity: z.coerce
    .number({ invalid_type_error: 'Quantity must be greater than 0' })
    .int('Quantity cannot be a decimal')
    .positive('Quantity must be greater than 0'),
  unit_price: z.coerce
    .number({ invalid_type_error: 'Price cannot be negative' })
    .min(0, 'Price cannot be negative'),
  discount: z.coerce.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
})

export const quotationSchema = z
  .object({
    customer_name: z.string().trim().min(1, 'Customer name is required'),
    company_name: z.string().trim().optional().or(z.literal('')),
    email: optionalEmail,
    phone_country: z.string().trim().min(1).default(DEFAULT_COUNTRY_CODE),
    phone_number: z.string().trim().optional().or(z.literal('')),
    quotation_number: z.string().trim().min(1, 'Quotation number is required'),
    quotation_date: z
      .string({ required_error: 'Quotation date is required' })
      .trim()
      .min(1, 'Quotation date is required'),
    valid_until: z.string().optional().or(z.literal('')),
    gst_rate: z.coerce.number().min(0, 'GST cannot be negative').max(100, 'GST cannot exceed 100%'),
    items: z.array(itemSchema).min(1, 'At least one product is required'),
  })
  .superRefine((data, ctx) => {
    if (data.valid_until && data.quotation_date && data.valid_until < data.quotation_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Valid until cannot be before quotation date',
        path: ['valid_until'],
      })
    }

    const digits = String(data.phone_number || '').replace(/\D/g, '')
    if (digits.length > 0 && digits.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please fill phone number properly (10 digits required)',
        path: ['phone_number'],
      })
    }
    if (digits.length > 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Phone number cannot exceed 10 digits',
        path: ['phone_number'],
      })
    }
  })

export function createEmptyItem() {
  return {
    product_name: '',
    quantity: 1,
    unit_price: 0,
    discount: 0,
  }
}

export function createDefaultQuotationValues() {
  const today = new Date().toISOString().slice(0, 10)
  return {
    customer_name: '',
    company_name: '',
    email: '',
    phone_country: DEFAULT_COUNTRY_CODE,
    phone_number: '',
    quotation_number: '',
    quotation_date: today,
    valid_until: '',
    gst_rate: 18,
    items: [createEmptyItem()],
  }
}
