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
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div className="gradient-login rounded shadow" style={{ 
        padding: 32, 
        width: '100%', 
        maxWidth: 400,
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--fg)', marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>SimpleBank</div>
          <div className="muted" style={{ fontSize: 16 }}>SimpleBank. For a clearer financial view.</div>
        </div>

        <form onSubmit={onSubmit} className="col" style={{ gap: 16 }}>
          {error && <div style={{ color: 'var(--danger)', textAlign: 'center', fontSize: 14 }}>{error}</div>}
          <Input type="email" placeholder="Email Address or Phone Number" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" variant="primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Signing in…' : 'Login'}
          </Button>
        </form>

        <div className="center" style={{ marginTop: 32 }}>
          <div className="muted" style={{ fontSize: 14, marginBottom: 8 }}>Don't have an account? Let's get started!</div>
          <Link to="/register" className="underline" style={{ color: 'var(--fg)', fontSize: 16, fontWeight: 500 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}
