import Button from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="font-semibold" style={{ marginBottom: 12 }}>Profile</div>
      <div className="col" style={{ gap: 6 }}>
        <div><span className="muted">Name:</span> {user?.name || '—'}</div>
        <div><span className="muted">Email:</span> {user?.email || '—'}</div>
      </div>
      <div style={{ marginTop: 16 }}>
        <Button onClick={logout}>Logout</Button>
      </div>
    </div>
  )
}
