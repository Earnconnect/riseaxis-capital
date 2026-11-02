/**
 * Funding receipt — a shareable summary of what a business was funded.
 *
 * Like the pre-approval page, the whole receipt is encoded in the URL
 * (`/receipt?r=<base64url json>`), so a link works anywhere with no database.
 * Funded applicants additionally get a receipt generated from their real
 * applications and disbursements, which admins can override per-user via the
 * `funding_receipts` table.
 */
import type { GrantApplication, ProofOfPayment } from '@/types'

export type OfferKind = 'loc' | 'card' | 'term' | 'grant' | 'advance' | 'equipment' | 'other'
export type OfferStatus = 'funded' | 'approved' | 'pending'
export type EntityStatus = 'active' | 'approved' | 'pending'

export interface ReceiptOffer {
  id: string
  kind: OfferKind
  label: string
  amount: number
  note: string
  status: OfferStatus
}

export interface ReceiptEntity {
  id: string
  business: string
  tag: string
  status: EntityStatus
  offers: ReceiptOffer[]
}

export interface FundingReceiptConfig {
  brand: string
  /** Person the receipt is addressed to (optional) */
  recipient: string
  /** Receipt / reference number */
  ref: string
  /** ISO date (yyyy-mm-dd) */
  date: string
  entities: ReceiptEntity[]
  footnote: string
}

export const OFFER_KINDS: { value: OfferKind; label: string }[] = [
  { value: 'loc',       label: 'Business Line of Credit' },
  { value: 'card',      label: 'Business Credit Card' },
  { value: 'term',      label: 'Term Loan' },
  { value: 'grant',     label: 'Grant' },
  { value: 'advance',   label: 'Cash Advance' },
  { value: 'equipment', label: 'Equipment Financing' },
  { value: 'other',     label: 'Other' },
]

export const OFFER_STATUS_LABEL: Record<OfferStatus, string> = {
  funded: 'Funded', approved: 'Approved', pending: 'Pending',
}
export const ENTITY_STATUS_LABEL: Record<EntityStatus, string> = {
  active: 'Active', approved: 'Approved', pending: 'Pending',
}

export const RECEIPT_PATH = '/receipt'

export function uid(): string {
  return Math.random().toString(36).slice(2, 9)
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function generateReceiptRef(): string {
  const year = new Date().getFullYear()
  return `FR-${year}-${Math.floor(100000 + Math.random() * 900000)}`
}

export function newOffer(partial: Partial<ReceiptOffer> = {}): ReceiptOffer {
  return { id: uid(), kind: 'loc', label: 'Business Line of Credit', amount: 25000, note: 'Approved · Funds in 1–3 days', status: 'funded', ...partial }
}

export function newEntity(partial: Partial<ReceiptEntity> = {}): ReceiptEntity {
  return { id: uid(), business: 'New Business LLC', tag: 'Brand New LLC', status: 'active', offers: [newOffer()], ...partial }
}

export const RECEIPT_DEFAULTS: FundingReceiptConfig = {
  brand: 'RiseAxis Capital',
  recipient: '',
  ref: 'FR-2026-104382',
  date: todayISO(),
  footnote: 'Funding figures reflect approved and disbursed amounts on record with RiseAxis Capital as of the date shown.',
  entities: [
    {
      id: 'e1', business: 'Jamal Creative LLC', tag: 'Brand New LLC', status: 'active',
      offers: [
        { id: 'o1', kind: 'loc',  label: 'Business Line of Credit', amount: 25000, note: 'Approved · Funds in 1–3 days',     status: 'funded' },
        { id: 'o2', kind: 'card', label: 'Business Credit Card',    amount: 20000, note: 'Approved · Virtual card active',   status: 'funded' },
        { id: 'o3', kind: 'term', label: 'Term Loan',               amount: 15000, note: 'Approved · Funds in 3–5 days',     status: 'funded' },
      ],
    },
  ],
}

/* ── Totals ─────────────────────────────────────────────────────────────── */
export const entityTotal = (e: ReceiptEntity) => e.offers.reduce((s, o) => s + (Number(o.amount) || 0), 0)
export const receiptTotal = (c: FundingReceiptConfig) => c.entities.reduce((s, e) => s + entityTotal(e), 0)

export function formatMoney(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
    .format(Number.isFinite(n) ? n : 0)
}

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

/* ── URL encoding ───────────────────────────────────────────────────────── */
function b64urlEncode(s: string): string {
  return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function b64urlDecode(s: string): string {
  const b = s.replace(/-/g, '+').replace(/_/g, '/')
  return decodeURIComponent(escape(atob(b + '==='.slice((b.length + 3) % 4))))
}

/** Strip ids and empty strings to keep links short; restore on decode. */
export function encodeReceipt(cfg: FundingReceiptConfig): string {
  const slim = {
    b: cfg.brand, n: cfg.recipient, r: cfg.ref, d: cfg.date, f: cfg.footnote,
    e: cfg.entities.map(e => ({
      b: e.business, t: e.tag, s: e.status,
      o: e.offers.map(o => [o.kind, o.label, o.amount, o.note, o.status]),
    })),
  }
  return b64urlEncode(JSON.stringify(slim))
}

export function decodeReceipt(token: string): FundingReceiptConfig | null {
  try {
    const s = JSON.parse(b64urlDecode(token))
    if (!s || !Array.isArray(s.e)) return null
    return {
      brand: s.b ?? RECEIPT_DEFAULTS.brand,
      recipient: s.n ?? '',
      ref: s.r ?? '',
      date: s.d ?? todayISO(),
      footnote: s.f ?? RECEIPT_DEFAULTS.footnote,
      entities: s.e.map((e: any) => ({
        id: uid(), business: e.b ?? '', tag: e.t ?? '', status: e.s ?? 'active',
        offers: (e.o ?? []).map((o: any[]) => ({
          id: uid(), kind: o[0] ?? 'other', label: o[1] ?? '', amount: Number(o[2]) || 0, note: o[3] ?? '', status: o[4] ?? 'funded',
        })),
      })),
    }
  } catch { return null }
}

export function receiptFromSearch(search: string): FundingReceiptConfig {
  const t = new URLSearchParams(search).get('r')
  return (t && decodeReceipt(t)) || RECEIPT_DEFAULTS
}

export function receiptToSearch(cfg: FundingReceiptConfig): string {
  return `?r=${encodeReceipt(cfg)}`
}

export function buildReceiptUrl(cfg: FundingReceiptConfig, origin = window.location.origin): string {
  return `${origin}${RECEIPT_PATH}${receiptToSearch(cfg)}`
}

/* ── Build a receipt from real application + disbursement records ──────── */
const PROGRAM_LABEL: Record<string, string> = {
  emergency_assistance: 'Emergency Assistance Grant',
  education_support: 'Education Support Grant',
  medical_expenses: 'Medical Expenses Grant',
  community_development: 'Community Development Grant',
  business_funding: 'Business Funding Grant',
  other: 'Grant Award',
}

const METHOD_LABEL: Record<string, string> = {
  bank_transfer: 'Bank Transfer', ach: 'ACH Transfer', wire: 'Wire Transfer', check: 'Check', wallet: 'Wallet Credit',
}

function prettyMethod(m: string): string {
  if (!m) return 'Disbursement'
  const k = m.toLowerCase().replace(/[\s-]/g, '_')
  return METHOD_LABEL[k] ?? m.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function receiptFromRecords(
  apps: GrantApplication[],
  payments: ProofOfPayment[],
  opts: { brand?: string; recipient?: string } = {},
): FundingReceiptConfig {
  const funded = apps.filter(a => a.status === 'approved' || a.status === 'disbursed')
  const entities: ReceiptEntity[] = funded.map(app => {
    const pays = payments.filter(p => p.application_id === app.id)
    const business = app.business_name || app.organization_name || app.project_name || `${app.full_name}`
    const offers: ReceiptOffer[] = pays.length
      ? pays.map(p => ({
          id: uid(), kind: 'grant' as OfferKind,
          label: PROGRAM_LABEL[app.grant_program] ?? 'Grant Award',
          amount: Number(p.amount) || 0,
          note: `${prettyMethod(p.payment_method)} · ${new Date(p.issued_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
          status: 'funded' as OfferStatus,
        }))
      : [{
          id: uid(), kind: 'grant' as OfferKind,
          label: PROGRAM_LABEL[app.grant_program] ?? 'Grant Award',
          amount: Number(app.approved_amount ?? app.requested_amount) || 0,
          note: app.status === 'disbursed' ? 'Disbursed to wallet' : 'Approved · Disbursement scheduled',
          status: (app.status === 'disbursed' ? 'funded' : 'approved') as OfferStatus,
        }]
    return {
      id: uid(), business,
      tag: app.business_name ? (app.business_age ? `${app.business_age} in business` : 'Business') : 'Grant Recipient',
      status: app.status === 'disbursed' ? 'active' : 'approved',
      offers,
    }
  })

  return {
    brand: opts.brand ?? RECEIPT_DEFAULTS.brand,
    recipient: opts.recipient ?? (funded[0]?.full_name ?? ''),
    ref: funded[0]?.app_number ? `FR-${funded[0].app_number.replace(/^APP-/, '')}` : generateReceiptRef(),
    date: todayISO(),
    footnote: RECEIPT_DEFAULTS.footnote,
    entities,
  }
}

/* ── Saved links (admin browser-local convenience) ──────────────────────── */
export interface SavedReceipt { id: string; createdAt: string; config: FundingReceiptConfig }
const LINKS_KEY = 'riseaxis.receipt.links'

export function loadSavedReceipts(): SavedReceipt[] {
  try { const raw = localStorage.getItem(LINKS_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] }
}
export function saveReceiptLink(config: FundingReceiptConfig): SavedReceipt[] {
  const next = [{ id: uid(), createdAt: new Date().toISOString(), config }, ...loadSavedReceipts()].slice(0, 50)
  try { localStorage.setItem(LINKS_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  return next
}
export function deleteReceiptLink(id: string): SavedReceipt[] {
  const next = loadSavedReceipts().filter(l => l.id !== id)
  try { localStorage.setItem(LINKS_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  return next
}
