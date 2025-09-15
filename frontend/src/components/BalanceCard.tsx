import Card from './ui/Card'

export default function BalanceCard({ name, balance }: { name: string; balance: number }) {
  const masked = '8729 9128 7643 0274'.replace(/\d(?=\d{4})/g, '•')
  const fmt = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })
  return (
    <Card className="gradient-card" >
      <div style={{ padding: '18px', borderRadius: '14px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ opacity: .9 }}>SimpleBank Balance</div>
          <div className="badge">VISA</div>
        </div>
        <div style={{ fontSize: '28px', fontWeight: 700, marginTop: 6 }}>{fmt.format(balance)}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, opacity: .9 }}>
          <div>
            <div style={{ fontSize: 12, opacity: .8 }}>{name}</div>
            <div style={{ fontSize: 12 }}>{masked}</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,.15)', display: 'grid', placeItems: 'center' }}>⤴︎</div>
        </div>
      </div>
    </Card>
  )
}
