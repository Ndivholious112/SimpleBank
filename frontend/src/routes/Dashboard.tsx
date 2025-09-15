import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useNavigate } from 'react-router-dom'
import BalanceCard from '../components/BalanceCard'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

interface Transaction {
  _id: string
  amount: number
  currency: string
  description?: string
  status: string
  createdAt: string
}

const formatZAR = (n: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n)

export default function Dashboard() {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [amount, setAmount] = useState<number>(0)
  const [description, setDescription] = useState('')
  const [mode, setMode] = useState<'receive' | 'send'>('receive')
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    api.get('/api/transactions').then((res) => setTransactions(res.data))
  }, [token, navigate])

  async function createTransaction(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    const sign = mode === 'send' ? -1 : 1
    const res = await api.post('/api/transactions', { amount: Number(amount) * sign, description, currency: 'ZAR' })
    setTransactions((prev) => [res.data, ...prev])
    setAmount(0)
    setDescription('')
  }

  const balance = transactions.reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="col" style={{ gap: 16 }}>
      <BalanceCard name={user?.name || 'User'} balance={balance} />

      <div className="segment" role="tablist" aria-label="Transaction mode">
        <button className={mode === 'receive' ? 'active' : ''} onClick={() => setMode('receive')}>Receive</button>
        <button className={mode === 'send' ? 'active' : ''} onClick={() => setMode('send')}>Send</button>
      </div>

      <form onSubmit={createTransaction} className="row" style={{ alignItems: 'flex-end' }}>
        <div className="col" style={{ flex: 1 }}>
          <span className="muted" style={{ fontSize: 12 }}>Amount</span>
          <Input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} />
        </div>
        <div className="col" style={{ flex: 2 }}>
          <span className="muted" style={{ fontSize: 12 }}>Description</span>
          <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <Button type="submit" variant="primary">{mode === 'send' ? 'Send' : 'Receive'}</Button>
      </form>

      <div className="list">
        {transactions.map((t) => (
          <div key={t._id} className="list-item">
            <div>
              <div className="font-medium">{t.description || (t.amount >= 0 ? 'Received' : 'Sent')}</div>
              <div className="muted" style={{ fontSize: 12 }}>{new Date(t.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="amount" style={{ color: t.amount >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {t.amount >= 0 ? '+' : '-'}{formatZAR(Math.abs(t.amount))}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>{t.status}</div>
            </div>
          </div>
        ))}
        {transactions.length === 0 && <div className="muted">No transactions yet.</div>}
      </div>
    </div>
  )
}
