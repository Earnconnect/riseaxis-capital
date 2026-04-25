import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FolderOpen, Download, FileText, FileImage, File,
  Search, Filter, Calendar, HardDrive, ExternalLink, Loader2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { AppDocument } from '@/types'

const T = {
  bg: '#FAF8F5', white: '#FFFFFF', navy: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#EDE9E3',
  green: '#16A34A', greenLt: '#F0FDF4',
}

interface DocWithApp extends AppDocument {
  app_number?: string
  grant_program?: string
}

const DOC_TYPE_LABELS: Record<string, string> = {
  government_id:       'Government ID',
  proof_of_income:     'Proof of Income',
  bank_statement:      'Bank Statement',
  utility_bill:        'Utility Bill',
  medical_bill:        'Medical Bill',
  tax_return:          'Tax Return',
  business_license:    'Business License',
  lease_agreement:     'Lease Agreement',
  letter_of_support:   'Letter of Support',
  other:               'Other',
}

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return <FileText size={16} style={{ color: '#DC2626' }} />
  if (['jpg','jpeg','png','webp','gif'].includes(ext ?? '')) return <FileImage size={16} style={{ color: '#2563EB' }} />
  return <File size={16} style={{ color: '#64748B' }} />
}

function formatBytes(bytes?: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentCenterPage() {
  const { user } = useAuth()
  const [docs, setDocs] = useState<DocWithApp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    async function load() {
      setLoading(true)
      setError('')

      // Fetch documents
      const { data: docsData, error: docsErr } = await supabase
        .from('app_documents')
        .select('*')
        .eq('user_id', user!.id)
        .order('uploaded_at', { ascending: false })

      if (docsErr) {
        setError('Failed to load documents. Please try refreshing.')
        setLoading(false)
        return
      }

      const rawDocs = (docsData ?? []) as AppDocument[]

      // Fetch app numbers separately to avoid relying on FK relationship
      const appIds = [...new Set(rawDocs.map(d => d.application_id).filter(Boolean))]
      let appMap: Record<string, { app_number: string; grant_program: string }> = {}

      if (appIds.length > 0) {
        const { data: appsData } = await supabase
          .from('grant_applications')
          .select('id, app_number, grant_program')
          .in('id', appIds)
        if (appsData) {
          appsData.forEach((a: any) => { appMap[a.id] = { app_number: a.app_number, grant_program: a.grant_program } })
        }
      }

      setDocs(rawDocs.map(d => ({
        ...d,
        app_number:    appMap[d.application_id]?.app_number,
        grant_program: appMap[d.application_id]?.grant_program,
      })))
      setLoading(false)
    }
    load()
  }, [user])

  async function handleDownload(doc: DocWithApp) {
    setDownloading(doc.id)
    try {
      const a = document.createElement('a')
      a.href = doc.file_url
      a.download = doc.file_name
      a.target = '_blank'
      a.rel = 'noreferrer'
      a.click()
    } catch {
      window.open(doc.file_url, '_blank')
    }
    setDownloading(null)
  }

  const docTypes = ['all', ...Array.from(new Set(docs.map(d => d.doc_type)))]

  const filtered = docs.filter(d => {
    const matchSearch = !search ||
      d.file_name.toLowerCase().includes(search.toLowerCase()) ||
      (DOC_TYPE_LABELS[d.doc_type] ?? d.doc_type).toLowerCase().includes(search.toLowerCase()) ||
      (d.app_number ?? '').toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || d.doc_type === typeFilter
    return matchSearch && matchType
  })

  const totalSize = docs.reduce((acc, d) => acc + (d.file_size ?? 0), 0)

  return (
    <div className="px-5 lg:px-8 py-8 max-w-[1440px]" style={{ background: T.bg, minHeight: '100vh' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: T.navy }}>Document Center</h1>
        <p className="text-sm" style={{ color: T.muted }}>All files you've uploaded across your grant applications</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Files',     value: docs.length,            icon: FolderOpen,  color: '#2563EB' },
          { label: 'Storage Used',    value: formatBytes(totalSize),  icon: HardDrive,   color: '#7C3AED' },
          { label: 'Document Types',  value: docTypes.length - 1,    icon: Filter,      color: T.green },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-4 flex items-center gap-3" style={{ background: T.white, border: `1px solid ${T.border}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${s.color}12`, border: `1px solid ${s.color}20` }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-lg font-bold" style={{ color: T.navy }}>{s.value}</div>
              <div className="text-xs" style={{ color: T.muted }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3"
        style={{ background: T.white, border: `1px solid ${T.border}` }}>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by filename, type, or application…"
            className="w-full h-9 pl-9 pr-3 rounded-xl text-sm outline-none"
            style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.navy }}
          />
        </div>
        <select
          value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="h-9 px-3 rounded-xl text-sm outline-none"
          style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.navy, minWidth: 160 }}>
          <option value="all">All Types</option>
          {docTypes.filter(t => t !== 'all').map(t => (
            <option key={t} value={t}>{DOC_TYPE_LABELS[t] ?? t}</option>
          ))}
        </select>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-2xl overflow-hidden" style={{ background: T.white, border: `1px solid ${T.border}` }}>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="animate-spin" style={{ color: T.green }} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm font-medium" style={{ color: '#DC2626' }}>{error}</p>
            <button onClick={() => window.location.reload()}
              className="text-sm font-semibold" style={{ color: T.green }}>
              Refresh page
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <FolderOpen size={40} style={{ color: T.border }} />
            <p className="text-sm font-medium" style={{ color: T.muted }}>
              {docs.length === 0 ? 'No documents uploaded yet' : 'No documents match your search'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    {['File', 'Type', 'Application', 'Uploaded', 'Size', ''].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: T.muted }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: T.border }}>
                  {filtered.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          {fileIcon(doc.file_name)}
                          <span className="text-sm font-medium truncate max-w-[200px]" style={{ color: T.navy }}>{doc.file_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: '#F1F5F9', color: T.body }}>
                          {DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {doc.app_number ? (
                          <span className="text-xs font-mono" style={{ color: T.body }}>#{doc.app_number}</span>
                        ) : <span style={{ color: T.muted }}>—</span>}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: T.muted }}>
                          <Calendar size={11} />
                          {new Date(doc.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: T.muted }}>
                        {formatBytes(doc.file_size)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDownload(doc)}
                            disabled={downloading === doc.id}
                            className="p-1.5 rounded-lg transition-all hover:bg-slate-100"
                            title="Download" style={{ color: T.body }}>
                            {downloading === doc.id ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                          </button>
                          <a href={doc.file_url} target="_blank" rel="noreferrer"
                            className="p-1.5 rounded-lg transition-all hover:bg-slate-100"
                            title="Open in new tab" style={{ color: T.body }}>
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y" style={{ borderColor: T.border }}>
              {filtered.map(doc => (
                <div key={doc.id} className="p-4 flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">{fileIcon(doc.file_name)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: T.navy }}>{doc.file_name}</div>
                    <div className="text-xs mt-0.5" style={{ color: T.muted }}>
                      {DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}
                      {doc.app_number && <> · #{doc.app_number}</>}
                      {' · '}{new Date(doc.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleDownload(doc)} disabled={downloading === doc.id}
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: T.body }}>
                      {downloading === doc.id ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                    </button>
                    <a href={doc.file_url} target="_blank" rel="noreferrer"
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: T.body }}>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: `1px solid ${T.border}` }}>
            <span className="text-xs" style={{ color: T.muted }}>{filtered.length} of {docs.length} documents</span>
            {typeFilter !== 'all' || search ? (
              <button onClick={() => { setSearch(''); setTypeFilter('all') }}
                className="text-xs font-medium hover:underline" style={{ color: T.green }}>
                Clear filters
              </button>
            ) : null}
          </div>
        )}
      </motion.div>
    </div>
  )
}
