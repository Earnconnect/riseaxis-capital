import { useState } from 'react'
import { Plus, Trash2, ChevronDown, Building2 } from 'lucide-react'
import {
  type FundingReceiptConfig, type ReceiptEntity, type ReceiptOffer, type OfferKind,
  OFFER_KINDS, newEntity, newOffer, parseMoney, formatMoney, entityTotal, generateReceiptRef,
} from '@/lib/fundingReceipt'

const T = { heading: '#0F172A', sub: '#64748B', muted: '#94A3B8', border: '#E2E8F0', green: '#059669' }
const fieldClass = 'w-full h-10 px-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500/30'
const fieldStyle = { background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.sub }}>{label}</label>
      {children}
      {hint && <div className="text-[11px] mt-1" style={{ color: T.muted }}>{hint}</div>}
    </div>
  )
}

function MoneyInput({ value, onCommit, className = '' }: { value: number; onCommit: (n: number) => void; className?: string }) {
  const [text, setText] = useState(String(value))
  const [focused, setFocused] = useState(false)
  return (
    <input className={`${fieldClass} font-semibold ${className}`} style={fieldStyle} inputMode="decimal"
      value={focused ? text : formatMoney(value)}
      onFocus={() => { setText(String(value)); setFocused(true) }}
      onChange={e => { setText(e.target.value); const n = parseMoney(e.target.value); if (n != null) onCommit(n) }}
      onBlur={() => setFocused(false)} />
  )
}

function OfferEditor({ offer, onChange, onDelete }: { offer: ReceiptOffer; onChange: (o: ReceiptOffer) => void; onDelete: () => void }) {
  const set = <K extends keyof ReceiptOffer>(k: K, v: ReceiptOffer[K]) => onChange({ ...offer, [k]: v })
  return (
    <div className="rounded-xl p-3 space-y-2.5" style={{ background: '#fff', border: `1px solid ${T.border}` }}>
      <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
        <Field label="Type">
          <select className={fieldClass} style={fieldStyle} value={offer.kind}
            onChange={e => {
              const kind = e.target.value as OfferKind
              const def = OFFER_KINDS.find(k => k.value === kind)
              const wasDefault = OFFER_KINDS.some(k => k.label === offer.label)
              onChange({ ...offer, kind, label: wasDefault && def ? def.label : offer.label })
            }}>
            {OFFER_KINDS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
        </Field>
        <button type="button" onClick={onDelete} title="Remove" className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-red-50" style={{ color: '#DC2626' }}>
          <Trash2 size={15} />
        </button>
      </div>
      <Field label="Label"><input className={fieldClass} style={fieldStyle} value={offer.label} onChange={e => set('label', e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Amount"><MoneyInput value={offer.amount} onCommit={n => set('amount', n)} /></Field>
        <Field label="Status">
          <select className={fieldClass} style={fieldStyle} value={offer.status} onChange={e => set('status', e.target.value as ReceiptOffer['status'])}>
            <option value="funded">Funded</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </Field>
      </div>
      <Field label="Note"><input className={fieldClass} style={fieldStyle} value={offer.note} placeholder="Approved · Funds in 1–3 days" onChange={e => set('note', e.target.value)} /></Field>
    </div>
  )
}

function EntityEditor({ entity, index, canDelete, onChange, onDelete }: {
  entity: ReceiptEntity; index: number; canDelete: boolean
  onChange: (e: ReceiptEntity) => void; onDelete: () => void
}) {
  const [open, setOpen] = useState(true)
  const set = <K extends keyof ReceiptEntity>(k: K, v: ReceiptEntity[K]) => onChange({ ...entity, [k]: v })
  const setOffer = (i: number, o: ReceiptOffer) => set('offers', entity.offers.map((x, j) => j === i ? o : x))
  return (
    <div className="rounded-2xl" style={{ background: '#F8FAFC', border: `1px solid ${T.border}` }}>
      <button type="button" onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#fff', border: `1px solid ${T.border}`, color: T.heading }}>
          <Building2 size={14} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold truncate" style={{ color: T.heading }}>{entity.business || `Business #${index + 1}`}</div>
          <div className="text-[11px]" style={{ color: T.muted }}>{entity.offers.length} offer{entity.offers.length === 1 ? '' : 's'} · {formatMoney(entityTotal(entity))}</div>
        </div>
        <ChevronDown size={15} style={{ color: T.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <Field label="Business / LLC name">
            <input className={fieldClass} style={{ ...fieldStyle, background: '#fff' }} value={entity.business} onChange={e => set('business', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Tag"><input className={fieldClass} style={{ ...fieldStyle, background: '#fff' }} value={entity.tag} placeholder="Brand New LLC" onChange={e => set('tag', e.target.value)} /></Field>
            <Field label="Status">
              <select className={fieldClass} style={{ ...fieldStyle, background: '#fff' }} value={entity.status} onChange={e => set('status', e.target.value as ReceiptEntity['status'])}>
                <option value="active">Active</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </Field>
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider pt-1" style={{ color: T.sub }}>Funding options</div>
          <div className="space-y-2">
            {entity.offers.map((o, i) => (
              <OfferEditor key={o.id} offer={o} onChange={x => setOffer(i, x)} onDelete={() => set('offers', entity.offers.filter((_, j) => j !== i))} />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => set('offers', [...entity.offers, newOffer({ kind: 'term', label: 'Term Loan', amount: 15000, note: 'Approved · Funds in 3–5 days' })])}
              className="flex-1 h-9 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-1.5"
              style={{ background: '#ECFDF5', color: T.green, border: '1px solid #A7F3D0' }}>
              <Plus size={14} /> Add funding option
            </button>
            {canDelete && (
              <button type="button" onClick={onDelete} className="h-9 px-3 rounded-xl text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-red-50" style={{ color: '#DC2626', border: `1px solid ${T.border}`, background: '#fff' }}>
                <Trash2 size={13} /> Remove
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface Props { value: FundingReceiptConfig; onChange: (c: FundingReceiptConfig) => void }

export default function FundingReceiptEditor({ value, onChange }: Props) {
  const [showMeta, setShowMeta] = useState(false)
  const set = <K extends keyof FundingReceiptConfig>(k: K, v: FundingReceiptConfig[K]) => onChange({ ...value, [k]: v })
  const setEntity = (i: number, e: ReceiptEntity) => set('entities', value.entities.map((x, j) => j === i ? e : x))

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {value.entities.map((e, i) => (
          <EntityEditor key={e.id} entity={e} index={i} canDelete={value.entities.length > 1}
            onChange={x => setEntity(i, x)} onDelete={() => set('entities', value.entities.filter((_, j) => j !== i))} />
        ))}
      </div>
      <button type="button"
        onClick={() => set('entities', [...value.entities, newEntity({ business: `${value.entities[0]?.business?.split(' ')[0] || 'New'} Global LLC`, offers: [newOffer({ kind: 'grant', label: 'Business Funding Grant', amount: 100000, note: 'Approved · Disbursed' })] })])}
        className="w-full h-10 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-1.5"
        style={{ border: `1px dashed ${T.border}`, color: T.heading, background: '#fff' }}>
        <Plus size={14} /> Add another business
      </button>
      <p className="text-[11px]" style={{ color: T.muted }}>
        One business shows the detailed offers layout. Two or more switch to the "Total funding across N LLCs" summary layout.
      </p>

      <button type="button" onClick={() => setShowMeta(s => !s)} className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: T.green }}>
        <ChevronDown size={14} style={{ transform: showMeta ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
        {showMeta ? 'Hide' : 'Show'} receipt details &amp; branding
      </button>

      {showMeta && (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Prepared for"><input className={fieldClass} style={fieldStyle} value={value.recipient} placeholder="Recipient name" onChange={e => set('recipient', e.target.value)} /></Field>
            <Field label="Brand"><input className={fieldClass} style={fieldStyle} value={value.brand} onChange={e => set('brand', e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Receipt #">
              <div className="flex gap-1.5">
                <input className={`${fieldClass} font-mono`} style={fieldStyle} value={value.ref} onChange={e => set('ref', e.target.value)} />
                <button type="button" title="Generate" onClick={() => set('ref', generateReceiptRef())} className="h-10 px-2.5 rounded-xl text-[11px] font-bold shrink-0" style={{ border: `1px solid ${T.border}`, color: T.sub, background: '#fff' }}>New</button>
              </div>
            </Field>
            <Field label="Date"><input type="date" className={fieldClass} style={fieldStyle} value={value.date} onChange={e => set('date', e.target.value)} /></Field>
          </div>
          <Field label="Footnote">
            <textarea className={`${fieldClass} h-auto py-2.5 resize-y`} style={fieldStyle} rows={2} value={value.footnote} onChange={e => set('footnote', e.target.value)} />
          </Field>
        </div>
      )}
    </div>
  )
}
