import { supabase, supabaseConfigError } from '../../../lib/supabase'

/** Supabase data access for quotations (list/get/upsert/delete + dashboard stats). */

function requireClient() {
  if (!supabase) throw new Error(supabaseConfigError || 'Supabase is not configured')
  return supabase
}

function mapError(error) {
  if (!error) return 'Something went wrong'
  const message = error.message || 'Database request failed'
  if (
    error.code === '23505'
    || /duplicate key|unique constraint|already exists/i.test(message)
  ) {
    return 'A quotation with this number already exists'
  }
  return message
}

export async function listQuotations() {
  const client = requireClient()
  const { data, error } = await client
    .from('quotations')
    .select('id, quotation_number, customer_name, company_name, email, quotation_date, valid_until, subtotal, gst_rate, gst, total, created_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(mapError(error))
  return data ?? []
}

export async function getQuotation(id) {
  const client = requireClient()
  const { data, error } = await client
    .from('quotations')
    .select(`
      id,
      quotation_number,
      customer_name,
      company_name,
      email,
      phone,
      quotation_date,
      valid_until,
      subtotal,
      gst_rate,
      gst,
      total,
      created_at,
      updated_at,
      quotation_items (
        id,
        product_name,
        quantity,
        unit_price,
        discount,
        gross_amount,
        discount_amount,
        amount
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw new Error(mapError(error))
  return data
}

export async function upsertQuotation(payload) {
  const client = requireClient()
  const { data, error } = await client.rpc('upsert_quotation', { payload })
  if (error) throw new Error(mapError(error))
  return data
}

export async function deleteQuotation(id) {
  const client = requireClient()
  const { error } = await client.from('quotations').delete().eq('id', id)
  if (error) throw new Error(mapError(error))
}

export async function getDashboardStats() {
  const quotations = await listQuotations()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let expiredCount = 0
  let totalQuotedValue = 0

  for (const q of quotations) {
    totalQuotedValue += Number(q.total) || 0
    if (q.valid_until) {
      const end = new Date(`${q.valid_until}T23:59:59`)
      if (end < today) expiredCount += 1
    }
  }

  return {
    totalQuotations: quotations.length,
    totalQuotedValue,
    expiredCount,
    activeCount: quotations.length - expiredCount,
    recent: quotations.slice(0, 5),
  }
}

export function suggestQuotationNumber(existing = []) {
  const year = new Date().getFullYear()
  const prefix = `Q-${year}-`
  let max = 0
  for (const item of existing) {
    const number = item.quotation_number || ''
    if (!number.startsWith(prefix)) continue
    const seq = Number(number.slice(prefix.length))
    if (Number.isFinite(seq) && seq > max) max = seq
  }
  return `${prefix}${String(max + 1).padStart(4, '0')}`
}
