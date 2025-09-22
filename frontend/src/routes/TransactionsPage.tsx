import { useEffect, useMemo, useRef, useState } from 'react'
import api from '../lib/api'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'

interface Tx { _id: string; amount: number; description?: string; createdAt: string; currency?: string; category?: string }

const fmt = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })

const CATEGORIES = ['Uncategorized','Salary','Food','Transport','Bills','Shopping','Entertainment','Health','Other']

export default function TransactionsPage() {
  const token = localStorage.getItem('token')
  const { show } = useToast()

  const [items, setItems] = useState<Tx[]>([])
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [q, setQ] = useState('')
  const [category, setCategory] = useState<string>('')
  const [sort, setSort] = useState<string>('-createdAt')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')

  const hasMore = useMemo(() => items.length < total, [items.length, total])

  useEffect(() => {
    // initial load and whenever filters change
    if (!token) return
    setPage(1)
    fetchPage(1, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, q, category, sort, from, to])

  async function fetchPage(nextPage: number, replace = false) {
    if (!token) return
    setLoading(true)
    try {
      const res = await api.get('/api/transactions', { params: { q: q || undefined, category: category || undefined, sort, page: nextPage, limit, from: from || undefined, to: to || undefined } })
      const data = res.data?.items && typeof res.data.total === 'number' ? res.data : { items: res.data || [], total: (res.data || []).length }
      setItems(replace ? data.items : [...items, ...data.items])
      setTotal(data.total)
      setPage(nextPage)
    } finally {
      setLoading(false)
    }
  }

  // Import CSV
  const fileRef = useRef<HTMLInputElement | null>(null)
  function triggerImport() {
    fileRef.current?.click()
  }
  async function onImportSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post('/api/transactions/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const n = res.data?.inserted ?? 0
      show(`Imported ${n} transactions`)
      // refresh list
      setPage(1)
      await fetchPage(1, true)
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Import failed'
      show(msg)
    } finally {
      // reset input to allow re-upload same file if needed
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function exportCSV() {
    function buildExportUrl() {
      const p = new URLSearchParams()
      if (q) p.set('q', q)
      if (category) p.set('category', category)
      if (sort) p.set('sort', sort)
      if (from) p.set('from', from)
      if (to) p.set('to', to)
      const base = (api.defaults.baseURL || '').replace(/\/$/, '')
      return `${base}/api/transactions/export/csv?${p.toString()}`
    }

    try {
      // Try blob download first
      const res = await api.get('/api/transactions/export/csv', {
        params: { q: q || undefined, category: category || undefined, sort, from: from || undefined, to: to || undefined },
        responseType: 'blob',
      })
      const blob = new Blob([res.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'transactions.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      // Fallback for sandboxed iframes that block downloads
      const url = buildExportUrl()
      // If we are in an iframe, try to open a new tab (popups may be allowed)
      const inIframe = window.top !== window.self
      if (inIframe) {
        window.open(url, '_blank')
      } else {
        // Navigate current tab
        window.location.href = url
      }
    }
  }

  // Edit modal state
  const [openEdit, setOpenEdit] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState<string>('')
  const [editDescription, setEditDescription] = useState<string>('')
  const [editCategory, setEditCategory] = useState<string>('')

  function startEdit(tx: Tx) {
    setEditId(tx._id)
    setEditAmount(String(tx.amount))
    setEditDescription(tx.description || '')
    setEditCategory(tx.category || '')
    setOpenEdit(true)
  }

  async function saveEdit() {
    if (!editId) return
    const payload: any = {
      amount: Number(editAmount),
      description: editDescription || undefined,
      category: editCategory || undefined,
    }
    const res = await api.put(`/api/transactions/${editId}`, payload)
    const updated = res.data as Tx
    setItems((prev) => prev.map((t) => (t._id === updated._id ? { ...t, ...updated } : t)))
    setOpenEdit(false)
  }

  async function deleteTx(id: string) {
    const ok = window.confirm('Delete this transaction?')
    if (!ok) return
    await api.delete(`/api/transactions/${id}`)
    setItems((prev) => prev.filter((t) => t._id !== id))
    setTotal((t) => Math.max(0, t - 1))
  }

  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="card" style={{ padding: 12 }}>
        <div className="row-wrap" style={{ gap: 8, alignItems: 'flex-end' }}>
          <div className="col field-lg">
            <span className="muted" style={{ fontSize: 12 }}>Search</span>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search description or category" />
          </div>
          <div className="col field">
            <span className="muted" style={{ fontSize: 12 }}>Category</span>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="col field">
            <span className="muted" style={{ fontSize: 12 }}>Sort</span>
            <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="-createdAt">Newest</option>
              <option value="createdAt">Oldest</option>
              <option value="-amount">Amount (high→low)</option>
              <option value="amount">Amount (low→high)</option>
            </select>
          </div>
          <div className="col field">
            <span className="muted" style={{ fontSize: 12 }}>From</span>
            <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="col field">
            <span className="muted" style={{ fontSize: 12 }}>To</span>
            <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="row" style={{ gap: 8 }}>
            <Button onClick={triggerImport} disabled={loading}>Import CSV</Button>
            <Button onClick={exportCSV} disabled={loading}>Export CSV</Button>
          </div>
        </div>
      </div>

      <div className="list">
        {items.map((t) => (
          <div key={t._id} className="list-item">
            <div className="left">
              <div className="font-medium">{t.description || (t.amount >= 0 ? 'Received' : 'Sent')}</div>
              <div className="muted" style={{ fontSize: 12 }}>{new Date(t.createdAt).toLocaleString()}</div>
              {t.category && <div className="muted" style={{ fontSize: 12 }}>Category: {t.category}</div>}
            </div>
            <div className="amount-col">
              <div className="amount" style={{ color: t.amount >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {t.amount >= 0 ? '+' : '-'}{fmt.format(Math.abs(t.amount))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6, justifyContent: 'flex-end' }}>
                <button onClick={() => startEdit(t)} className="btn" style={{ padding: '6px 10px' }}>Edit</button>
                <button onClick={() => deleteTx(t._id)} className="btn" style={{ padding: '6px 10px' }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && !loading && <div className="muted">No transactions found.</div>}
      </div>

      {hasMore && (
        <Button onClick={() => fetchPage(page + 1)} disabled={loading}>
          {loading ? 'Loading…' : 'Load more'}
        </Button>
      )}
      <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={onImportSelected} />

      <Modal open={openEdit} onClose={() => setOpenEdit(false)} title="Edit transaction" actions={(
        <>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={saveEdit} variant="primary">Save</Button>
        </>
      )}>
        <div className="col">
          <span className="muted" style={{ fontSize: 12 }}>Amount</span>
          <Input type="number" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
          <span className="muted" style={{ fontSize: 12 }}>Description</span>
          <Input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
          <span className="muted" style={{ fontSize: 12 }}>Category</span>
          <select className="input" value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
            <option value="">Uncategorized</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  )
}
