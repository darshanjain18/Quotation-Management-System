import { z } from 'zod'

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
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  unit_price: z.coerce.number().min(0, 'Price cannot be negative'),
  discount: z.coerce.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
})

export const quotationSchema = z
  .object({
    customer_name: z.string().trim().min(1, 'Customer name is required'),
    company_name: z.string().trim().optional().or(z.literal('')),
    email: optionalEmail,
    phone: z.string().trim().optional().or(z.literal('')),
    quotation_number: z.string().trim().min(1, 'Quotation number is required'),
    quotation_date: z.string().min(1, 'Quotation date is required'),
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
    phone: '',
    quotation_number: '',
    quotation_date: today,
    valid_until: '',
    gst_rate: 18,
    items: [createEmptyItem()],
  }
}
