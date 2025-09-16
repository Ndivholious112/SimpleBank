import Card from './ui/Card'

export default function BalanceCard({ name, balance }: { name: string; balance: number }) {
  const masked = '8729 9128 7643 0274'.replace(/\d(?=\d{4})/g, '•')
  const fmt = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })
  return (
    <Card className="gradient-card" >
      <div style={{ padding: '20px', borderRadius: '16px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ opacity: .9, fontWeight: 600 }}>Available Balance</div>
          <div className="badge" style={{ background: 'rgba(255,255,255,.18)' }}>VISA</div>
        </div>
        <div style={{ fontSize: '30px', fontWeight: 800, marginTop: 8, letterSpacing: .3 }}>{fmt.format(balance)}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, opacity: .95 }}>
          <div>
            <div style={{ fontSize: 12, opacity: .85 }}>{name}</div>
            <div style={{ fontSize: 12, letterSpacing: 1 }}>{masked}</div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(255,255,255,.16)', display: 'grid', placeItems: 'center' }}>⤴︎</div>
        </div>
      </div>
    </Card>
  )
}
