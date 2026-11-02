/**
 * Persistence for admin-curated funding receipts (table: funding_receipts).
 * RLS: applicants read their own row; admins manage all rows.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { FundingReceiptConfig } from '@/lib/fundingReceipt'

// The generated Database type predates this table; use an untyped handle here.
const db = supabase as unknown as SupabaseClient

export async function loadSavedReceipt(userId: string): Promise<FundingReceiptConfig | null> {
  const { data, error } = await db.from('funding_receipts').select('config').eq('user_id', userId).maybeSingle()
  if (error || !data?.config) return null
  return data.config as FundingReceiptConfig
}

export async function saveReceiptForUser(userId: string, config: FundingReceiptConfig): Promise<{ error: string | null }> {
  const { data: { user } } = await db.auth.getUser()
  const { error } = await db.from('funding_receipts').upsert(
    { user_id: userId, config, updated_by: user?.id ?? null, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  )
  if (!error) return { error: null }
  const missing = /funding_receipts/.test(error.message) && /(relation|schema cache|does not exist)/i.test(error.message)
  return { error: missing ? 'The funding_receipts table is missing. Run the v8 block at the end of supabase/schema.sql in the Supabase SQL editor.' : error.message }
}

export async function deleteReceiptForUser(userId: string): Promise<{ error: string | null }> {
  const { error } = await db.from('funding_receipts').delete().eq('user_id', userId)
  return { error: error?.message ?? null }
}
