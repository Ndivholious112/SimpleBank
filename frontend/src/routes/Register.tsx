import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name || !email || !password) { setError('Please fill in all fields'); return }
    try {
      setLoading(true)
      await api.post('/api/auth/register', { name, email, password })
      navigate('/login')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gradient-login rounded shadow" style={{ padding: 24 }}>
      <div style={{ textAlign: 'center', color: 'var(--fg)', marginTop: 40, marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Create account</div>
        <div className="muted" style={{ marginTop: 6 }}>Join SimpleBank. For a clearer financial view.</div>
      </div>

      <form onSubmit={onSubmit} className="col" style={{ maxWidth: 360, margin: '0 auto' }}>
        {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}
        <Input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</Button>
      </form>

      <div className="center" style={{ marginTop: 16 }}>
        <span className="muted" style={{ fontSize: 12 }}>Have an account?</span>&nbsp;
        <Link to="/login" className="underline" style={{ color: 'var(--fg)' }}>Login</Link>
      </div>
    </div>
  )
}
