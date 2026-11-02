import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  type PreApprovalConfig, PREAPPROVAL_DEFAULTS, parseMoney, formatMoney,
} from '@/lib/preapproval'

const T = {
  heading: '#0F172A', sub: '#64748B', muted: '#94A3B8', border: '#E2E8F0',
  green: '#059669',
}

const fieldClass = 'w-full h-10 px-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500/30'
const fieldStyle = { background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }

interface Props {
  value: PreApprovalConfig
  onChange: (next: PreApprovalConfig) => void
  /** Compact spacing for the on-page drawer */
  compact?: boolean
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: T.sub }}>
        {label}
      </label>
      {children}
      {hint && <div className="text-[11px] mt-1" style={{ color: T.muted }}>{hint}</div>}
    </div>
  )
}

/** Text input that lets the admin type "$75,000" or "75k" and stores whole dollars. */
function MoneyInput({ value, onCommit }: { value: number; onCommit: (n: number) => void }) {
  const [text, setText] = useState(formatMoney(value))
  const [focused, setFocused] = useState(false)
  const shown = focused ? text : formatMoney(value)
  return (
    <input
      className={`${fieldClass} font-semibold`}
      style={fieldStyle}
      inputMode="decimal"
      value={shown}
      onFocus={() => { setText(String(value)); setFocused(true) }}
      onChange={e => {
        setText(e.target.value)
        const n = parseMoney(e.target.value)
        if (n != null) onCommit(n)
      }}
      onBlur={() => setFocused(false)}
    />
  )
}

export default function PreApprovalEditor({ value, onChange, compact }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const set = <K extends keyof PreApprovalConfig>(key: K, v: PreApprovalConfig[K]) =>
    onChange({ ...value, [key]: v })

  const gap = compact ? 'space-y-3.5' : 'space-y-4'

  return (
    <div className={gap}>
      <Field label="Pre-approval amount" hint='Type a number, "$75,000", or "75k".'>
        <MoneyInput value={value.amount} onCommit={n => set('amount', n)} />
      </Field>

      <Field label="Company / LLC name">
        <input className={fieldClass} style={fieldStyle} value={value.company}
          placeholder={PREAPPROVAL_DEFAULTS.company}
          onChange={e => set('company', e.target.value)} />
      </Field>

      <Field label="Applicant first name" hint='Optional. Shows as "Congratulations, Marcus".'>
        <input className={fieldClass} style={fieldStyle} value={value.name}
          placeholder="e.g. Marcus"
          onChange={e => set('name', e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Button label">
          <input className={fieldClass} style={fieldStyle} value={value.cta}
            onChange={e => set('cta', e.target.value)} />
        </Field>
        <Field label="Button link">
          <input className={fieldClass} style={fieldStyle} value={value.ctaUrl}
            placeholder="/register or https://…"
            onChange={e => set('ctaUrl', e.target.value)} />
        </Field>
      </div>

      <button type="button" onClick={() => setShowAdvanced(s => !s)}
        className="flex items-center gap-1.5 text-[12px] font-semibold"
        style={{ color: T.green }}>
        <ChevronDown size={14} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
        {showAdvanced ? 'Hide' : 'Show'} page copy &amp; branding
      </button>

      {showAdvanced && (
        <div className={`${gap} pt-1`}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Brand name">
              <input className={fieldClass} style={fieldStyle} value={value.brand}
                onChange={e => set('brand', e.target.value)} />
            </Field>
            <Field label="Phone (header)">
              <input className={fieldClass} style={fieldStyle} value={value.phone}
                placeholder="(800) 555-0199"
                onChange={e => set('phone', e.target.value)} />
            </Field>
          </div>

          <Field label="Headline">
            <input className={fieldClass} style={fieldStyle} value={value.headline}
              onChange={e => set('headline', e.target.value)} />
          </Field>

          <Field label="Supporting text" hint='Use {max} to insert the maximum funding figure.'>
            <textarea className={`${fieldClass} h-auto py-2.5 resize-y`} style={fieldStyle} rows={3}
              value={value.sub} onChange={e => set('sub', e.target.value)} />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Max funding">
              <MoneyInput value={value.max} onCommit={n => set('max', n)} />
            </Field>
            <Field label="Funding speed">
              <input className={fieldClass} style={fieldStyle} value={value.hours}
                onChange={e => set('hours', e.target.value)} />
            </Field>
            <Field label="Trusted by">
              <input className={fieldClass} style={fieldStyle} value={value.trusted}
                onChange={e => set('trusted', e.target.value)} />
            </Field>
          </div>
        </div>
      )}
    </div>
  )
}
