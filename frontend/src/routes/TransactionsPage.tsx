import { useEffect, useState } from 'react'
import api from '../lib/api'

interface Tx { _id: string; amount: number; description?: string; createdAt: string }

const fmt = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })

export default function TransactionsPage() {
  const [txs, setTxs] = useState<Tx[]>([])
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) return
    api.get('/api/transactions').then((res) => setTxs(res.data))
  }, [token])

  return (
    <div className="list">
      {txs.map((t) => (
        <div key={t._id} className="list-item">
          <div>
            <div className="font-medium">{t.description || (t.amount >= 0 ? 'Received' : 'Sent')}</div>
            <div className="muted" style={{ fontSize: 12 }}>{new Date(t.createdAt).toLocaleString()}</div>
          </div>
          <div style={{ fontWeight: 700, color: t.amount >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {t.amount >= 0 ? '+' : '-'}{fmt.format(Math.abs(t.amount))}
          </div>
        </div>
      ))}
      {txs.length === 0 && <div className="muted">No transactions yet.</div>}
    </div>
  )
}
