import { useEffect, useMemo, useState } from 'react'
import api from '../lib/api'

export default function Analysis() {
  const [data, setData] = useState<{ amount: number; description?: string; createdAt: string }[]>([])

  useEffect(() => {
    api.get('/api/transactions').then((res) => setData(res.data))
  }, [])

  const totals = useMemo(() => {
    const income = data.filter(d => d.amount > 0).reduce((s, d) => s + d.amount, 0)
    const expense = data.filter(d => d.amount < 0).reduce((s, d) => s + Math.abs(d.amount), 0)
    return { income, expense }
  }, [data])

  const byDay = useMemo(() => {
    const map = new Map<string, number>()
    for (const d of data) {
      const key = new Date(d.createdAt).toISOString().slice(0, 10)
      map.set(key, (map.get(key) || 0) + d.amount)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [data])

  const fmt = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })

  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="card" style={{ padding: 16 }}>
        <div className="font-semibold">This Month</div>
        <div className="row">
          <div className="col" style={{ flex: 1 }}>
            <span className="muted">Income</span>
            <div style={{ fontWeight: 700, color: 'var(--success)' }}>{fmt.format(totals.income)}</div>
          </div>
          <div className="col" style={{ flex: 1 }}>
            <span className="muted">Expenses</span>
            <div style={{ fontWeight: 700, color: 'var(--danger)' }}>{fmt.format(totals.expense)}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div className="font-semibold" style={{ marginBottom: 8 }}>Daily Net Flow</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
          {byDay.map(([day, value]) => {
            const positive = value >= 0
            const height = Math.min(100, Math.abs(value))
            return (
              <div key={day} title={`${day}: ${fmt.format(value)}`} style={{ width: 12, height: height, background: positive ? 'var(--success)' : 'var(--danger)', borderRadius: 4, opacity: .8 }} />
            )
          })}
          {byDay.length === 0 && <div className="muted">No data yet.</div>}
        </div>
      </div>
    </div>
  )
}
