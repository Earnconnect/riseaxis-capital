import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

// Hard 8-second timeout on every Supabase request — prevents infinite hangs
// on free-tier projects that are paused or slow to wake up
function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  const signal = init?.signal
    ? anySignal([init.signal, controller.signal])
    : controller.signal
  return fetch(input, { ...init, signal }).finally(() => clearTimeout(timer))
}

// Combine multiple AbortSignals (polyfill for AbortSignal.any)
function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController()
  for (const signal of signals) {
    if (signal.aborted) { controller.abort(signal.reason); break }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true })
  }
  return controller.signal
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: { fetch: fetchWithTimeout },
})
