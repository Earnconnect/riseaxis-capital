import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Copy, Check, ExternalLink, Save, RotateCcw, Trash2, Link2, Sparkles,
  Monitor, Smartphone, BookmarkPlus, Eye,
} from 'lucide-react'
import PreApprovalEditor from '@/components/preapproval/PreApprovalEditor'
import {
  type PreApprovalConfig, type SavedPreApproval,
  PREAPPROVAL_DEFAULTS, PREAPPROVAL_PATH,
  buildPreApprovalUrl, configToSearch, formatMoney,
  loadSavedDefaults, saveDefaults, clearSavedDefaults,
  loadSavedLinks, saveLink, deleteLink,
} from '@/lib/preapproval'

const T = {
  white: '#FFFFFF', border: '#EDE9E3',
  heading: '#0F172A', sub: '#64748B', muted: '#94A3B8',
  green: '#059669', greenLt: '#ECFDF5', greenBd: '#A7F3D0',
  black: '#0B0F19',
}

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value)
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t) }, [value, ms])
  return v
}

export default function PreApprovalBuilderPage() {
  const [cfg, setCfg] = useState<PreApprovalConfig>(() => loadSavedDefaults())
  const [links, setLinks] = useState<SavedPreApproval[]>(() => loadSavedLinks())
  const [copied, setCopied] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')

  const url = useMemo(() => buildPreApprovalUrl(cfg), [cfg])
  const previewSrc = useDebounced(`${PREAPPROVAL_PATH}${configToSearch(cfg)}`, 450)

  async function copy(text: string, id = 'main') {
    try { await navigator.clipboard.writeText(text) } catch { /* ignore */ }
    setCopied(id); setTimeout(() => setCopied(null), 1600)
  }

  function handleSaveDefaults() {
    saveDefaults(cfg)
    setSavedFlash(true); setTimeout(() => setSavedFlash(false), 1600)
  }

  function handleReset() {
    clearSavedDefaults()
    setCfg(PREAPPROVAL_DEFAULTS)
  }

  function handleSaveLink() {
    setLinks(saveLink(cfg))
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-5 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: T.green }}>Showcase</div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: T.heading }}>Pre-approval Page Builder</h1>
          <p className="text-sm mt-0.5" style={{ color: T.sub }}>
            Set the amount and company, then copy the link. The page is unlisted — only people with the link can see it.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={url} target="_blank" rel="noreferrer"
            className="h-10 px-4 rounded-xl text-[13px] font-semibold flex items-center gap-2"
            style={{ border: `1px solid ${T.border}`, color: T.heading, background: T.white }}>
            <ExternalLink size={14} /> Open page
          </a>
          <button onClick={() => copy(url)}
            className="h-10 px-4 rounded-xl text-[13px] font-semibold text-white flex items-center gap-2 transition-all hover:brightness-110"
            style={{ background: T.black }}>
            {copied === 'main' ? <Check size={14} /> : <Copy size={14} />} {copied === 'main' ? 'Copied' : 'Copy link'}
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-[400px_1fr] gap-6 items-start">
        {/* Left: editor */}
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5" style={{ background: T.white, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.greenLt, color: T.green }}>
                <Sparkles size={14} />
              </div>
              <div className="text-[14px] font-bold" style={{ color: T.heading }}>Page details</div>
            </div>

            <PreApprovalEditor value={cfg} onChange={setCfg} />

            <div className="mt-5 pt-4 space-y-2" style={{ borderTop: `1px solid ${T.border}` }}>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: T.sub }}>Share link</div>
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-[11.5px] font-mono break-all"
                style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.sub }}>
                <Link2 size={13} className="shrink-0 mt-0.5" style={{ color: T.green }} /> {url}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button onClick={handleSaveLink}
                  className="h-10 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-1.5"
                  style={{ background: T.greenLt, color: T.green, border: `1px solid ${T.greenBd}` }}>
                  <BookmarkPlus size={14} /> Save to list
                </button>
                <button onClick={handleSaveDefaults}
                  className="h-10 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-1.5"
                  style={{ border: `1px solid ${T.border}`, color: T.heading, background: T.white }}>
                  {savedFlash ? <Check size={14} /> : <Save size={14} />} {savedFlash ? 'Saved' : 'Set as default'}
                </button>
              </div>
              <button onClick={handleReset}
                className="w-full h-9 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5"
                style={{ color: T.muted }}>
                <RotateCcw size={12} /> Reset to built-in defaults
              </button>
              <p className="text-[11px] leading-relaxed" style={{ color: T.muted }}>
                "Set as default" makes these values the fallback for the bare <span className="font-mono">/preapproval</span> link
                in this browser. Shared links always carry their own values, so they work on any device.
              </p>
            </div>
          </motion.div>

          {/* Saved links */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="rounded-2xl p-5" style={{ background: T.white, border: `1px solid ${T.border}` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[14px] font-bold" style={{ color: T.heading }}>Saved links</div>
              <span className="text-[11px] font-semibold" style={{ color: T.muted }}>{links.length}</span>
            </div>
            {links.length === 0 ? (
              <p className="text-[12.5px]" style={{ color: T.muted }}>
                Nothing saved yet. Build a page and click "Save to list" to keep it here for quick access.
              </p>
            ) : (
              <ul className="space-y-2">
                {links.map(l => {
                  const lUrl = buildPreApprovalUrl(l.config)
                  return (
                    <li key={l.id} className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                      style={{ background: '#F8FAFC', border: `1px solid ${T.border}` }}>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-bold truncate" style={{ color: T.heading }}>
                          {formatMoney(l.config.amount)} <span className="font-medium" style={{ color: T.sub }}>· {l.config.company || 'No company'}</span>
                        </div>
                        <div className="text-[11px]" style={{ color: T.muted }}>
                          {l.config.name ? `${l.config.name} · ` : ''}{new Date(l.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <button title="Load into editor" onClick={() => setCfg(l.config)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white" style={{ color: T.sub }}>
                        <Eye size={14} />
                      </button>
                      <button title="Copy link" onClick={() => copy(lUrl, l.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white" style={{ color: copied === l.id ? T.green : T.sub }}>
                        {copied === l.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      <a title="Open" href={lUrl} target="_blank" rel="noreferrer"
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white" style={{ color: T.sub }}>
                        <ExternalLink size={14} />
                      </a>
                      <button title="Delete" onClick={() => setLinks(deleteLink(l.id))}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50" style={{ color: '#DC2626' }}>
                        <Trash2 size={14} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </motion.div>
        </div>

        {/* Right: live preview */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl overflow-hidden lg:sticky lg:top-24" style={{ background: T.white, border: `1px solid ${T.border}` }}>
          <div className="flex items-center justify-between px-4 h-12" style={{ borderBottom: `1px solid ${T.border}`, background: '#FAFAF9' }}>
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                {['#FCA5A5', '#FCD34D', '#86EFAC'].map(c => <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
              </div>
              <span className="ml-2 text-[12px] font-semibold" style={{ color: T.sub }}>Live preview</span>
            </div>
            <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: '#F1F5F9' }}>
              {([['desktop', Monitor], ['mobile', Smartphone]] as const).map(([d, Icon]) => (
                <button key={d} onClick={() => setDevice(d)} aria-label={d}
                  className="w-8 h-7 rounded-md flex items-center justify-center transition-all"
                  style={{ background: device === d ? T.white : 'transparent', color: device === d ? T.heading : T.muted, boxShadow: device === d ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' }}>
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-center" style={{ background: '#E7E5E4', padding: device === 'mobile' ? 20 : 0 }}>
            <iframe
              key={device}
              title="Pre-approval page preview"
              src={previewSrc}
              className="bg-white"
              style={{
                width: device === 'mobile' ? 390 : '100%',
                height: device === 'mobile' ? 760 : 'calc(100vh - 180px)',
                minHeight: 560,
                border: 0,
                borderRadius: device === 'mobile' ? 28 : 0,
                boxShadow: device === 'mobile' ? '0 20px 50px -20px rgba(0,0,0,0.4)' : 'none',
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
