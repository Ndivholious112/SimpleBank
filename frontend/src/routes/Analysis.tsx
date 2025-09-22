import { useEffect, useMemo, useRef, useState } from 'react'
import api from '../lib/api'

type Tx = { amount: number; description?: string; createdAt: string }
type CatSummary = { category: string; income: number; expense: number; net: number; count: number }

export default function Analysis() {
  const [data, setData] = useState<Tx[]>([])
  const [summary, setSummary] = useState<CatSummary[]>([])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  useEffect(() => {
    api.get('/api/transactions', { params: { page: 1, limit: 200, from: from || undefined, to: to || undefined } }).then((res) => {
      const arr = res.data?.items ? res.data.items : res.data
      setData(Array.isArray(arr) ? arr : [])
    })
  }, [from, to])

  useEffect(() => {
    api.get('/api/transactions/summary', { params: { from: from || undefined, to: to || undefined } }).then((res) => {
      setSummary(Array.isArray(res.data) ? res.data : [])
    })
  }, [from, to])

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
      <div className="card" style={{ padding: 12 }}>
        <div className="row-wrap" style={{ gap: 8, alignItems: 'flex-end' }}>
          <div className="col">
            <span className="muted" style={{ fontSize: 12 }}>From</span>
            <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="col">
            <span className="muted" style={{ fontSize: 12 }}>To</span>
            <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div className="font-semibold" style={{ marginBottom: 8 }}>Top Categories</div>
        {summary.length === 0 ? (
          <div className="muted">No data.</div>
        ) : (
          <div className="col" style={{ gap: 8 }}>
            {summary.map((s) => (
              <div key={s.category} className="list-item" style={{ background: 'transparent' }}>
                <div>
                  <div className="font-medium">{s.category}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{s.count} transactions</div>
                </div>
                <div className="text-right">
                  <div style={{ fontWeight: 700, color: s.net >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(s.net)}
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    +{new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(s.income)} · -{new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(s.expense)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
        {byDay.length === 0 ? (
          <div className="muted">No data yet.</div>
        ) : (
          <div>
            <svg
              ref={svgRef}
              viewBox={`0 0 320 160`}
              width="100%"
              height="160"
              style={{ display: 'block' }}
              onMouseLeave={() => setHoverIdx(null)}
              onTouchEnd={() => setHoverIdx(null)}
            >
              <defs>
                <linearGradient id="barPositive" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id="barNegative" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.5" />
                </linearGradient>
                <clipPath id="chartClip"><rect x="32" y="8" width="280" height="120" rx="8" /></clipPath>
              </defs>

              {/* Grid */}
              {[0, 1, 2, 3, 4].map(i => (
                <line key={i} x1={32} x2={312} y1={28 + i * 24} y2={28 + i * 24} stroke="#1f2c46" strokeWidth={1} />
              ))}
              <line x1={32} x2={312} y1={88} y2={88} stroke="#334155" strokeWidth={1.5} />

              {/* Axis labels */}
              <text x={8} y={34} fontSize={10} fill="#94a3b8">+High</text>
              <text x={8} y={92} fontSize={10} fill="#94a3b8">0</text>
              <text x={8} y={146} fontSize={10} fill="#94a3b8">-High</text>

              {(() => {
                const values = byDay.map(([, v]) => v)
                const maxAbs = Math.max(1, ...values.map(v => Math.abs(v)))
                const n = byDay.length
                const chartW = 280
                const gap = Math.min(8, Math.max(2, chartW / n / 4))
                const barW = Math.max(2, Math.min(20, chartW / n - gap))
                const xFor = (i: number) => 32 + i * (barW + gap)
                const scaleY = (v: number) => 88 - (v / maxAbs) * 60

                return (
                  <g clipPath="url(#chartClip)">
                    {byDay.map(([day, v], i) => {
                      const x = xFor(i)
                      const y0 = scaleY(0)
                      const y1 = scaleY(v)
                      const y = Math.min(y0, y1)
                      const h = Math.max(2, Math.abs(y1 - y0))
                      const active = hoverIdx === i
                      const fill = v >= 0 ? 'url(#barPositive)' : 'url(#barNegative)'
                      return (
                        <g key={day}>
                          <rect x={x} y={y} width={barW} height={h} rx={4} fill={fill} opacity={active ? 1 : 0.9}
                            onMouseEnter={() => setHoverIdx(i)} onTouchStart={() => setHoverIdx(i)} />
                        </g>
                      )
                    })}
                  </g>
                )
              })()}
            </svg>

            {/* Tooltip */}
            {hoverIdx != null && (
              <div className="card" style={{
                marginTop: 8,
                padding: 12,
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <div className="muted" style={{ fontSize: 12 }}>{byDay[hoverIdx][0]}</div>
                <div style={{ fontWeight: 700, color: byDay[hoverIdx][1] >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {fmt.format(byDay[hoverIdx][1])}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
