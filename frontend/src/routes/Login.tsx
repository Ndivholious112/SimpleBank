import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email || !password) { setError('Please fill in all fields'); return }
    try {
      setLoading(true)
      const res = await api.post('/api/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gradient-login rounded shadow" style={{ padding: 24 }}>
      <div style={{ textAlign: 'center', color: 'var(--fg)', marginTop: 40, marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>SimpleBank</div>
        <div className="muted" style={{ marginTop: 6 }}>SimpleBank. For a clearer financial view.</div>
      </div>

      <form onSubmit={onSubmit} className="col" style={{ maxWidth: 360, margin: '0 auto' }}>
        {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}
        <Input type="email" placeholder="Email Address or Phone Number" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Signing in…' : 'Login'}</Button>
      </form>

      <div className="center" style={{ marginTop: 24 }}>
        <div className="muted" style={{ fontSize: 12 }}>Don’t have an account? Let’s get started!</div>
      </div>
      <div className="center" style={{ marginTop: 8 }}>
        <Link to="/register" className="underline" style={{ color: 'var(--fg)' }}>Create Account</Link>
      </div>
    </div>
  )
}
