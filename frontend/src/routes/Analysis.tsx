import { useEffect, useMemo, useRef, useState } from 'react'
import api from '../lib/api'

export default function Analysis() {
  const [data, setData] = useState<{ amount: number; description?: string; createdAt: string }[]>([])
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

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
                <linearGradient id="areaPositive" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="areaNegative" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
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
                const scaleX = (i: number) => 32 + (i / Math.max(1, byDay.length - 1)) * 280
                const scaleY = (v: number) => 88 - (v / maxAbs) * 60 // 60 up, 60 down

                // Build paths for positive and negative areas separately for smooth fills
                const positivePoints = byDay.map(([_, v], i) => ({ x: scaleX(i), y: scaleY(Math.max(0, v)), v }))
                const negativePoints = byDay.map(([_, v], i) => ({ x: scaleX(i), y: scaleY(Math.min(0, v)), v }))

                const buildAreaPath = (pts: { x: number; y: number; v: number }[], isPositive: boolean) => {
                  const filtered = pts.map((p, i) => ({ ...p, yReal: scaleY(byDay[i][1]) }))
                  const top = filtered.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yReal}`)
                  const base = filtered.slice().reverse().map((p) => `L ${p.x} ${scaleY(0)}`)
                  return `${top.join(' ')} ${base.join(' ')} Z`
                }

                const buildLinePath = () => byDay
                  .map(([_, v], i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(v)}`)
                  .join(' ')

                return (
                  <g clipPath="url(#chartClip)">
                    {/* Areas */}
                    <path d={buildAreaPath(positivePoints, true)} fill="url(#areaPositive)" />
                    <path d={buildAreaPath(negativePoints, false)} fill="url(#areaNegative)" />

                    {/* Line */}
                    <path d={buildLinePath()} fill="none" stroke="#60a5fa" strokeWidth={2} />

                    {/* Points and interaction zones */}
                    {byDay.map(([day, v], i) => {
                      const cx = scaleX(i)
                      const cy = scaleY(v)
                      const active = hoverIdx === i
                      return (
                        <g key={day}>
                          <circle cx={cx} cy={cy} r={active ? 4 : 2.5} fill="#60a5fa" />
                          {/* Invisible touch target */}
                          <rect
                            x={cx - 12}
                            y={8}
                            width={24}
                            height={120}
                            fill="transparent"
                            onMouseEnter={() => setHoverIdx(i)}
                            onTouchStart={() => setHoverIdx(i)}
                          />
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
