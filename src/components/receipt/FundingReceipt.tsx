import { motion } from 'framer-motion'
import {
  Building2, Landmark, CreditCard, Coins, Gift, Banknote, Truck, CircleDollarSign,
  CheckCircle2, Info, ShieldCheck,
} from 'lucide-react'
import {
  type FundingReceiptConfig, type ReceiptEntity, type ReceiptOffer, type OfferKind,
  entityTotal, receiptTotal, formatMoney, OFFER_STATUS_LABEL, ENTITY_STATUS_LABEL,
} from '@/lib/fundingReceipt'

const C = {
  heading: '#0B1220', body: '#475569', muted: '#94A3B8', border: '#E8ECF1',
  green: '#16A34A', greenLt: '#ECFDF5', greenBd: '#BBF7D0', greenDk: '#15803D',
  dark: '#0B0F19',
}

const KIND_META: Record<OfferKind, { icon: typeof Landmark; color: string; bg: string }> = {
  loc:       { icon: Landmark,         color: '#2563EB', bg: '#EFF6FF' },
  card:      { icon: CreditCard,       color: '#7C3AED', bg: '#F5F3FF' },
  term:      { icon: Coins,            color: '#16A34A', bg: '#ECFDF5' },
  grant:     { icon: Gift,             color: '#DB2777', bg: '#FDF2F8' },
  advance:   { icon: Banknote,         color: '#0891B2', bg: '#ECFEFF' },
  equipment: { icon: Truck,            color: '#D97706', bg: '#FFFBEB' },
  other:     { icon: CircleDollarSign, color: '#475569', bg: '#F1F5F9' },
}

const EASE = [0.22, 1, 0.36, 1] as const

function Pill({ children, tone = 'green' }: { children: React.ReactNode; tone?: 'green' | 'amber' | 'slate' }) {
  const t = tone === 'green'
    ? { bg: C.greenLt, color: C.greenDk, bd: C.greenBd }
    : tone === 'amber' ? { bg: '#FFFBEB', color: '#B45309', bd: '#FDE68A' }
    : { bg: '#F1F5F9', color: '#475569', bd: '#E2E8F0' }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[12px] font-bold whitespace-nowrap"
      style={{ background: t.bg, color: t.color, border: `1px solid ${t.bd}` }}>
      {children}
    </span>
  )
}

function StatusPill({ status }: { status: 'funded' | 'approved' | 'pending' | 'active' }) {
  const tone = status === 'pending' ? 'amber' : 'green'
  const label = status === 'active' ? ENTITY_STATUS_LABEL.active : OFFER_STATUS_LABEL[status as keyof typeof OFFER_STATUS_LABEL] ?? status
  return (
    <Pill tone={tone}>
      {status === 'active'
        ? <span className="w-2 h-2 rounded-full" style={{ background: C.green }} />
        : <CheckCircle2 size={13} />}
      {label}
    </Pill>
  )
}

function OfferRow({ offer, i }: { offer: ReceiptOffer; i: number }) {
  const meta = KIND_META[offer.kind] ?? KIND_META.other
  const Icon = meta.icon
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE, delay: 0.25 + i * 0.06 }}
      className="flex items-center gap-3 rounded-2xl px-3.5 sm:px-4 py-3.5"
      style={{ background: '#fff', border: `1px solid ${C.border}`, boxShadow: '0 1px 2px rgba(2,6,23,0.03)' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: meta.bg, color: meta.color }}>
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-bold leading-tight" style={{ color: C.heading }}>{offer.label}</div>
        {offer.note && <div className="text-[12.5px] mt-1 leading-snug" style={{ color: C.body }}>{offer.note}</div>}
      </div>
      <div className="text-right shrink-0">
        <div className="text-[16px] font-extrabold tracking-tight" style={{ color: C.heading }}>{formatMoney(offer.amount)}</div>
        <div className="mt-1"><StatusPill status={offer.status} /></div>
      </div>
    </motion.div>
  )
}

function EntityHeader({ entity, index, showIndex }: { entity: ReceiptEntity; index: number; showIndex: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ background: '#F1F5F9', color: C.heading }}>
          <Building2 size={28} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <div className="text-[12.5px] font-semibold" style={{ color: C.muted }}>{showIndex ? `LLC #${index + 1}` : 'Business'}</div>
          <div className="text-[19px] font-extrabold tracking-tight leading-tight truncate" style={{ color: C.heading }}>{entity.business || 'Business name'}</div>
          {entity.tag && (
            <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold" style={{ background: '#F1F5F9', color: C.body }}>
              {entity.tag}
            </span>
          )}
        </div>
      </div>
      {!showIndex && <StatusPill status={entity.status === 'active' ? 'active' : entity.status} />}
    </div>
  )
}

/* ── Single business layout (matches reference #2) ─────────────────────── */
function SingleEntity({ entity }: { entity: ReceiptEntity }) {
  const total = entityTotal(entity)
  const allFunded = entity.offers.length > 0 && entity.offers.every(o => o.status === 'funded')
  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
        <EntityHeader entity={entity} index={0} showIndex={false} />
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease: EASE, delay: 0.1 }}
        className="rounded-2xl px-5 py-5" style={{ background: C.greenLt, border: `1px solid ${C.greenBd}` }}>
        <div className="flex items-center gap-1.5 text-[14px] font-semibold mb-2" style={{ color: C.body }}>
          Total Funding Received <Info size={14} style={{ color: C.muted }} />
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="font-extrabold tracking-tight leading-none" style={{ color: C.green, fontSize: 'clamp(38px, 11vw, 52px)' }}>
            {formatMoney(total)}
          </div>
          <div className="pb-1"><StatusPill status={allFunded ? 'approved' : entity.status === 'pending' ? 'pending' : 'approved'} /></div>
        </div>
      </motion.div>

      <div>
        <div className="flex items-center justify-between mb-3 px-0.5">
          <div className="text-[17px] font-bold" style={{ color: C.heading }}>Funding Options</div>
          <div className="text-[13px] font-medium" style={{ color: C.body }}>{entity.offers.length} {entity.offers.length === 1 ? 'Offer' : 'Offers'}</div>
        </div>
        <div className="space-y-2.5">
          {entity.offers.map((o, i) => <OfferRow key={o.id} offer={o} i={i} />)}
          {entity.offers.length === 0 && (
            <div className="rounded-2xl px-4 py-6 text-center text-[13px]" style={{ border: `1px dashed ${C.border}`, color: C.muted }}>No funding options added yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Multi business layout (matches reference #1) ──────────────────────── */
function MultiEntity({ cfg }: { cfg: FundingReceiptConfig }) {
  const total = receiptTotal(cfg)
  const n = cfg.entities.length
  const allNew = cfg.entities.every(e => /new/i.test(e.tag))
  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease: EASE }}
        className="rounded-[22px] px-6 py-7 text-center relative overflow-hidden" style={{ background: C.dark, color: '#fff' }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden
          style={{ background: 'radial-gradient(420px 180px at 50% 120%, rgba(22,163,74,0.35), transparent 70%)' }} />
        <div className="relative">
          <div className="text-[13px] font-semibold tracking-[0.12em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Funding</div>
          <div className="font-extrabold tracking-tight leading-none mb-4" style={{ fontSize: 'clamp(44px, 13vw, 64px)' }}>{formatMoney(total)}</div>
          <span className="inline-flex items-center gap-2 px-4 h-10 rounded-xl text-[14px] font-bold"
            style={{ background: 'rgba(22,163,74,0.18)', color: '#86EFAC', border: '1px solid rgba(134,239,172,0.25)' }}>
            <CheckCircle2 size={16} /> Across {n} {allNew ? 'Brand New ' : ''}{n === 1 ? 'LLC' : 'LLCs'}
          </span>
        </div>
      </motion.div>

      {cfg.entities.map((e, i) => {
        const t = entityTotal(e)
        return (
          <motion.div key={e.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: 0.15 + i * 0.1 }}
            className="rounded-[22px] p-5" style={{ background: '#fff', border: `1px solid ${C.border}`, boxShadow: '0 10px 30px -18px rgba(2,6,23,0.18)' }}>
            <EntityHeader entity={e} index={i} showIndex />
            <div className="my-4" style={{ borderTop: `1px solid ${C.border}` }} />
            <div className="text-[12.5px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.muted }}>Funding Received</div>
            <div className="flex items-center justify-between gap-3">
              <div className="font-extrabold tracking-tight leading-none" style={{ color: C.green, fontSize: 'clamp(34px, 9vw, 44px)' }}>{formatMoney(t)}</div>
              <StatusPill status={e.status === 'pending' ? 'pending' : 'approved'} />
            </div>
            {e.offers.length > 1 && (
              <div className="mt-4 space-y-2">
                {e.offers.map(o => {
                  const meta = KIND_META[o.kind] ?? KIND_META.other
                  const Icon = meta.icon
                  return (
                    <div key={o.id} className="flex items-center gap-3 text-[13px]">
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: meta.bg, color: meta.color }}><Icon size={14} /></span>
                      <span className="flex-1 truncate font-semibold" style={{ color: C.heading }}>{o.label}</span>
                      <span className="font-bold" style={{ color: C.heading }}>{formatMoney(o.amount)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

interface Props {
  cfg: FundingReceiptConfig
  /** Hide the brand header + footer (e.g. when embedded in a portal page) */
  bare?: boolean
}

export default function FundingReceipt({ cfg, bare }: Props) {
  const dateLabel = cfg.date
    ? new Date(cfg.date + (cfg.date.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : ''
  return (
    <div className="w-full max-w-[520px] mx-auto">
      {!bare && (
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" className="w-9 h-9 rounded-xl object-cover" />
            <div>
              <div className="text-[14px] font-extrabold leading-tight" style={{ color: C.heading }}>{cfg.brand}</div>
              <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.muted }}>Funding Receipt</div>
            </div>
          </div>
          <div className="text-right">
            {cfg.ref && <div className="text-[12px] font-mono font-semibold" style={{ color: C.body }}>{cfg.ref}</div>}
            {dateLabel && <div className="text-[11.5px]" style={{ color: C.muted }}>{dateLabel}</div>}
          </div>
        </div>
      )}

      {cfg.recipient && !bare && (
        <div className="text-[13px] mb-4" style={{ color: C.body }}>
          Prepared for <span className="font-bold" style={{ color: C.heading }}>{cfg.recipient}</span>
        </div>
      )}

      {cfg.entities.length <= 1
        ? <SingleEntity entity={cfg.entities[0] ?? { id: 'none', business: '', tag: '', status: 'pending', offers: [] }} />
        : <MultiEntity cfg={cfg} />}

      {!bare && (
        <div className="mt-6 flex items-start gap-2 text-[11.5px] leading-relaxed" style={{ color: C.muted }}>
          <ShieldCheck size={14} className="shrink-0 mt-0.5" style={{ color: C.green }} />
          <span>{cfg.footnote}</span>
        </div>
      )}
    </div>
  )
}
