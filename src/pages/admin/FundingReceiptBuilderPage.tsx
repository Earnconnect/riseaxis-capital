import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Copy, Check, ExternalLink, Trash2, Link2, Receipt, Monitor, Smartphone,
  BookmarkPlus, Eye, UserCheck, Loader2, Save, RotateCcw, Search,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import FundingReceiptEditor from '@/components/receipt/FundingReceiptEditor'
import FundingReceipt from '@/components/receipt/FundingReceipt'
import {
  type FundingReceiptConfig, type SavedReceipt,
  RECEIPT_DEFAULTS, buildReceiptUrl, receiptFromRecords, receiptTotal, formatMoney,
  loadSavedReceipts, saveReceiptLink, deleteReceiptLink,
} from '@/lib/fundingReceipt'
import { loadSavedReceipt, saveReceiptForUser, deleteReceiptForUser } from '@/lib/fundingReceiptStore'
import type { GrantApplication, ProofOfPayment } from '@/types'

const T = {
  white: '#FFFFFF', border: '#EDE9E3', heading: '#0F172A', sub: '#64748B', muted: '#94A3B8',
  green: '#059669', greenLt: '#ECFDF5', greenBd: '#A7F3D0', black: '#0B0F19',
}

interface Applicant { user_id: string; full_name: string; email: string; apps: GrantApplication[] }

export default function FundingReceiptBuilderPage() {
  const [cfg, setCfg] = useState<FundingReceiptConfig>(RECEIPT_DEFAULTS)
  const [links, setLinks] = useState<SavedReceipt[]>(() => loadSavedReceipts())
  const [copied, setCopied] = useState<string | null>(null)
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile')

  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loadingApplicants, setLoadingApplicants] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<Applicant | null>(null)
  const [loadingUser, setLoadingUser] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const url = useMemo(() => buildReceiptUrl(cfg), [cfg])

  // Funded applicants (approved or disbursed), grouped by user.
  useEffect(() => {
    supabase.from('grant_applications').select('*').in('status', ['approved', 'disbursed']).order('created_at', { ascending: false })
      .then(({ data }) => {
        const map = new Map<string, Applicant>()
        for (const a of (data ?? []) as GrantApplication[]) {
          const cur = map.get(a.user_id) ?? { user_id: a.user_id, full_name: a.full_name, email: a.email, apps: [] }
          cur.apps.push(a); map.set(a.user_id, cur)
        }
        setApplicants([...map.values()])
        setLoadingApplicants(false)
      })
  }, [])

  async function loadApplicant(a: Applicant) {
    setSelectedUser(a); setLoadingUser(true); setSaveMsg(null)
    const [saved, { data: pays }] = await Promise.all([
      loadSavedReceipt(a.user_id),
      supabase.from('proof_of_payments').select('*').eq('user_id', a.user_id),
    ])
    if (saved) {
      setCfg(saved); setHasSaved(true)
    } else {
      setCfg(receiptFromRecords(a.apps, (pays ?? []) as ProofOfPayment[], { recipient: a.full_name })); setHasSaved(false)
    }
    setLoadingUser(false)
  }

  async function saveToApplicant() {
    if (!selectedUser) return
    setSaving(true); setSaveMsg(null)
    const { error } = await saveReceiptForUser(selectedUser.user_id, cfg)
    setSaving(false)
    if (error) setSaveMsg({ ok: false, text: error })
    else { setSaveMsg({ ok: true, text: `Saved. ${selectedUser.full_name} now sees this receipt in their portal.` }); setHasSaved(true) }
  }

  async function removeOverride() {
    if (!selectedUser) return
    setSaving(true)
    const { error } = await deleteReceiptForUser(selectedUser.user_id)
    setSaving(false)
    if (!error) { setHasSaved(false); setSaveMsg({ ok: true, text: 'Override removed. Their receipt is generated from records again.' }); loadApplicant(selectedUser) }
  }

  async function copy(text: string, id = 'main') {
    try { await navigator.clipboard.writeText(text) } catch { /* ignore */ }
    setCopied(id); setTimeout(() => setCopied(null), 1600)
  }

  const filtered = applicants.filter(a => !search || `${a.full_name} ${a.email}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-5 lg:px-8 py-6 sm:py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: T.green }}>Showcase</div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: T.heading }}>Funding Receipt Builder</h1>
          <p className="text-sm mt-0.5" style={{ color: T.sub }}>Build a funding summary, share it by link, or save it to a funded applicant's portal.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={url} target="_blank" rel="noreferrer" className="h-10 px-4 rounded-xl text-[13px] font-semibold flex items-center gap-2" style={{ border: `1px solid ${T.border}`, color: T.heading, background: T.white }}>
            <ExternalLink size={14} /> Open page
          </a>
          <button onClick={() => copy(url)} className="h-10 px-4 rounded-xl text-[13px] font-semibold text-white flex items-center gap-2 hover:brightness-110" style={{ background: T.black }}>
            {copied === 'main' ? <Check size={14} /> : <Copy size={14} />} {copied === 'main' ? 'Copied' : 'Copy link'}
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-[420px_1fr] gap-6 items-start">
        <div className="space-y-5">
          {/* Load from applicant */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5" style={{ background: T.white, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.greenLt, color: T.green }}><UserCheck size={14} /></div>
              <div>
                <div className="text-[14px] font-bold" style={{ color: T.heading }}>Funded applicant</div>
                <div className="text-[11px]" style={{ color: T.muted }}>Prefill from their real applications and disbursements</div>
              </div>
            </div>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email"
                className="w-full h-10 pl-9 pr-3 rounded-xl text-sm outline-none" style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }} />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {loadingApplicants ? (
                <div className="flex items-center gap-2 text-[12px] py-3" style={{ color: T.muted }}><Loader2 size={13} className="animate-spin" /> Loading applicants…</div>
              ) : filtered.length === 0 ? (
                <div className="text-[12px] py-3" style={{ color: T.muted }}>No funded applicants{search ? ' match' : ' yet'}.</div>
              ) : filtered.map(a => (
                <button key={a.user_id} onClick={() => loadApplicant(a)}
                  className="w-full text-left px-3 py-2 rounded-xl transition-colors hover:bg-slate-50"
                  style={{ background: selectedUser?.user_id === a.user_id ? T.greenLt : 'transparent', border: `1px solid ${selectedUser?.user_id === a.user_id ? T.greenBd : 'transparent'}` }}>
                  <div className="text-[13px] font-bold truncate" style={{ color: T.heading }}>{a.full_name}</div>
                  <div className="text-[11px] truncate" style={{ color: T.muted }}>{a.email} · {a.apps.length} funded app{a.apps.length === 1 ? '' : 's'}</div>
                </button>
              ))}
            </div>

            {selectedUser && (
              <div className="mt-3 pt-3 space-y-2" style={{ borderTop: `1px solid ${T.border}` }}>
                {loadingUser ? (
                  <div className="flex items-center gap-2 text-[12px]" style={{ color: T.muted }}><Loader2 size={13} className="animate-spin" /> Loading records…</div>
                ) : (
                  <>
                    <div className="text-[11.5px]" style={{ color: T.sub }}>
                      {hasSaved ? 'Showing the saved override for this applicant.' : 'Generated from records. Edit below, then save to publish it to their portal.'}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveToApplicant} disabled={saving}
                        className="flex-1 h-10 rounded-xl text-[12.5px] font-semibold text-white flex items-center justify-center gap-1.5 disabled:opacity-50" style={{ background: T.green }}>
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save to applicant's portal
                      </button>
                      {hasSaved && (
                        <button onClick={removeOverride} disabled={saving} title="Remove override" className="h-10 px-3 rounded-xl flex items-center gap-1.5 text-[12px] font-semibold" style={{ border: `1px solid ${T.border}`, color: T.sub, background: T.white }}>
                          <RotateCcw size={13} />
                        </button>
                      )}
                    </div>
                    {saveMsg && <div className="text-[12px] font-medium" style={{ color: saveMsg.ok ? T.green : '#DC2626' }}>{saveMsg.text}</div>}
                  </>
                )}
              </div>
            )}
          </motion.div>

          {/* Editor */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl p-5" style={{ background: T.white, border: `1px solid ${T.border}` }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.greenLt, color: T.green }}><Receipt size={14} /></div>
                <div className="text-[14px] font-bold" style={{ color: T.heading }}>Receipt details</div>
              </div>
              <div className="text-[13px] font-extrabold" style={{ color: T.green }}>{formatMoney(receiptTotal(cfg))}</div>
            </div>
            <FundingReceiptEditor value={cfg} onChange={setCfg} />

            <div className="mt-5 pt-4 space-y-2" style={{ borderTop: `1px solid ${T.border}` }}>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: T.sub }}>Share link</div>
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-[11px] font-mono break-all max-h-20 overflow-hidden" style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.sub }}>
                <Link2 size={13} className="shrink-0 mt-0.5" style={{ color: T.green }} /> {url}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button onClick={() => setLinks(saveReceiptLink(cfg))} className="h-10 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-1.5" style={{ background: T.greenLt, color: T.green, border: `1px solid ${T.greenBd}` }}>
                  <BookmarkPlus size={14} /> Save to list
                </button>
                <button onClick={() => { setCfg(RECEIPT_DEFAULTS); setSelectedUser(null); setSaveMsg(null) }} className="h-10 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-1.5" style={{ border: `1px solid ${T.border}`, color: T.heading, background: T.white }}>
                  <RotateCcw size={14} /> Reset
                </button>
              </div>
            </div>
          </motion.div>

          {/* Saved links */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-5" style={{ background: T.white, border: `1px solid ${T.border}` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[14px] font-bold" style={{ color: T.heading }}>Saved links</div>
              <span className="text-[11px] font-semibold" style={{ color: T.muted }}>{links.length}</span>
            </div>
            {links.length === 0 ? (
              <p className="text-[12.5px]" style={{ color: T.muted }}>Nothing saved yet. Click "Save to list" to keep a receipt here for quick access.</p>
            ) : (
              <ul className="space-y-2">
                {links.map(l => {
                  const lUrl = buildReceiptUrl(l.config)
                  const first = l.config.entities[0]
                  return (
                    <li key={l.id} className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: '#F8FAFC', border: `1px solid ${T.border}` }}>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-bold truncate" style={{ color: T.heading }}>
                          {formatMoney(receiptTotal(l.config))} <span className="font-medium" style={{ color: T.sub }}>· {l.config.entities.length > 1 ? `${l.config.entities.length} businesses` : first?.business || 'No business'}</span>
                        </div>
                        <div className="text-[11px]" style={{ color: T.muted }}>{new Date(l.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      </div>
                      <button title="Load" onClick={() => setCfg(l.config)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white" style={{ color: T.sub }}><Eye size={14} /></button>
                      <button title="Copy link" onClick={() => copy(lUrl, l.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white" style={{ color: copied === l.id ? T.green : T.sub }}>{copied === l.id ? <Check size={14} /> : <Copy size={14} />}</button>
                      <a title="Open" href={lUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white" style={{ color: T.sub }}><ExternalLink size={14} /></a>
                      <button title="Delete" onClick={() => setLinks(deleteReceiptLink(l.id))} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50" style={{ color: '#DC2626' }}><Trash2 size={14} /></button>
                    </li>
                  )
                })}
              </ul>
            )}
          </motion.div>
        </div>

        {/* Live preview (rendered inline, no iframe reloads) */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl overflow-hidden lg:sticky lg:top-24" style={{ background: T.white, border: `1px solid ${T.border}` }}>
          <div className="flex items-center justify-between px-4 h-12" style={{ borderBottom: `1px solid ${T.border}`, background: '#FAFAF9' }}>
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">{['#FCA5A5', '#FCD34D', '#86EFAC'].map(c => <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}</div>
              <span className="ml-2 text-[12px] font-semibold" style={{ color: T.sub }}>Live preview</span>
            </div>
            <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: '#F1F5F9' }}>
              {([['mobile', Smartphone], ['desktop', Monitor]] as const).map(([d, Icon]) => (
                <button key={d} onClick={() => setDevice(d)} aria-label={d} className="w-8 h-7 rounded-md flex items-center justify-center"
                  style={{ background: device === d ? T.white : 'transparent', color: device === d ? T.heading : T.muted, boxShadow: device === d ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' }}>
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-center overflow-y-auto" style={{ background: '#E7E5E4', padding: device === 'mobile' ? 20 : 32, maxHeight: 'calc(100vh - 180px)' }}>
            <div className="bg-[#F7F9FB]" style={{
              width: device === 'mobile' ? 390 : '100%', maxWidth: 900,
              padding: device === 'mobile' ? '28px 18px' : '40px 32px',
              borderRadius: device === 'mobile' ? 28 : 16,
              boxShadow: '0 20px 50px -20px rgba(0,0,0,0.35)',
            }}>
              <FundingReceipt cfg={cfg} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
