/**
 * Pre-approval showcase page configuration.
 *
 * Every detail of the /preapproval page is driven by this config. The config
 * lives entirely in the URL query string, so a link carries everything the
 * page needs — no database row required. Only values that differ from the
 * defaults are written into the URL, keeping links short.
 *
 *   /preapproval                              → defaults ($30,000, Summit Holdings LLC)
 *   /preapproval?amount=75000&company=Bright%20Path%20LLC
 */

export interface PreApprovalConfig {
  /** Applicant / contact first name, shown as "Congratulations, Marcus" when set */
  name: string
  /** Business / LLC name shown under the congratulations bar */
  company: string
  /** Pre-approved amount in whole dollars */
  amount: number
  /** Brand name shown in the header and footer */
  brand: string
  /** Optional phone number shown in the header */
  phone: string
  /** Maximum funding figure used in copy ("funding up to $5,000,000") */
  max: number
  /** Funding speed claim, e.g. "24–48 Hours" */
  hours: string
  /** Social-proof count, e.g. "12,000+" */
  trusted: string
  /** Button label inside the modal */
  cta: string
  /** Where the button sends the visitor */
  ctaUrl: string
  /** Hero headline */
  headline: string
  /** Hero supporting text. "{max}" is replaced with the formatted max figure. */
  sub: string
}

export const PREAPPROVAL_DEFAULTS: PreApprovalConfig = {
  name: '',
  company: 'Summit Holdings LLC',
  amount: 30000,
  brand: 'RiseAxis Capital',
  phone: '',
  max: 5000000,
  hours: '24–48 Hours',
  trusted: '12,000+',
  cta: 'Finish your Application',
  ctaUrl: '/register',
  headline: 'Flexible Funding Solutions',
  sub: 'Our streamlined merchant cash advance program. Quick approvals, flexible terms, and funding up to {max}.',
}

export const PREAPPROVAL_PATH = '/preapproval'
const STORAGE_KEY = 'riseaxis.preapproval.defaults'

const NUMERIC_KEYS: (keyof PreApprovalConfig)[] = ['amount', 'max']

export function formatMoney(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0)
}

/** Parse a user-typed amount like "$75,000" or "75k" into whole dollars. */
export function parseMoney(raw: string | number | null | undefined): number | null {
  if (raw == null) return null
  if (typeof raw === 'number') return Number.isFinite(raw) && raw >= 0 ? Math.round(raw) : null
  const s = raw.trim().toLowerCase().replace(/[$,\s]/g, '')
  if (!s) return null
  const m = s.match(/^(\d+(?:\.\d+)?)([km])?$/)
  if (!m) return null
  let n = parseFloat(m[1])
  if (m[2] === 'k') n *= 1_000
  if (m[2] === 'm') n *= 1_000_000
  return Math.round(n)
}

/** Build a config from a query string, falling back to saved then built-in defaults. */
export function configFromSearch(search: string, base: PreApprovalConfig = loadSavedDefaults()): PreApprovalConfig {
  const params = new URLSearchParams(search)
  const cfg: PreApprovalConfig = { ...base }
  for (const key of Object.keys(PREAPPROVAL_DEFAULTS) as (keyof PreApprovalConfig)[]) {
    const v = params.get(key)
    if (v == null) continue
    if (NUMERIC_KEYS.includes(key)) {
      const n = parseMoney(v)
      if (n != null) (cfg as any)[key] = n
    } else {
      ;(cfg as any)[key] = v
    }
  }
  return cfg
}

/** Query string containing only the values that differ from the built-in defaults. */
export function configToSearch(cfg: PreApprovalConfig): string {
  const params = new URLSearchParams()
  for (const key of Object.keys(PREAPPROVAL_DEFAULTS) as (keyof PreApprovalConfig)[]) {
    const v = cfg[key]
    if (v === PREAPPROVAL_DEFAULTS[key]) continue
    if (typeof v === 'string' && v.trim() === '' && PREAPPROVAL_DEFAULTS[key] === '') continue
    params.set(key, String(v))
  }
  const s = params.toString()
  return s ? `?${s}` : ''
}

/** Absolute shareable link for a config. */
export function buildPreApprovalUrl(cfg: PreApprovalConfig, origin = window.location.origin): string {
  return `${origin}${PREAPPROVAL_PATH}${configToSearch(cfg)}`
}

/** Admin-chosen defaults persisted in this browser (used when a link omits a value). */
export function loadSavedDefaults(): PreApprovalConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return PREAPPROVAL_DEFAULTS
    const parsed = JSON.parse(raw)
    return { ...PREAPPROVAL_DEFAULTS, ...parsed }
  } catch {
    return PREAPPROVAL_DEFAULTS
  }
}

export function saveDefaults(cfg: PreApprovalConfig) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)) } catch { /* ignore */ }
}

export function clearSavedDefaults() {
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
}

/* ── Saved links (admin convenience, local to this browser) ─────────────── */

export interface SavedPreApproval {
  id: string
  createdAt: string
  config: PreApprovalConfig
}

const LINKS_KEY = 'riseaxis.preapproval.links'

export function loadSavedLinks(): SavedPreApproval[] {
  try {
    const raw = localStorage.getItem(LINKS_KEY)
    return raw ? (JSON.parse(raw) as SavedPreApproval[]) : []
  } catch { return [] }
}

export function saveLink(cfg: PreApprovalConfig): SavedPreApproval[] {
  const list = loadSavedLinks()
  const entry: SavedPreApproval = {
    id: Math.random().toString(36).slice(2, 10),
    createdAt: new Date().toISOString(),
    config: cfg,
  }
  const next = [entry, ...list].slice(0, 50)
  try { localStorage.setItem(LINKS_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  return next
}

export function deleteLink(id: string): SavedPreApproval[] {
  const next = loadSavedLinks().filter(l => l.id !== id)
  try { localStorage.setItem(LINKS_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  return next
}
