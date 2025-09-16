import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

export default function Root() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const token = localStorage.getItem('token')

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  function Tab({ to, label }: { to: string; label: string }) {
    const active = pathname === to || (to === '/' && pathname === '/')
    return (
      <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ display: 'grid', placeItems: 'center', padding: '10px 8px', color: active ? 'black' : 'var(--fg-muted)', fontWeight: active ? 700 as any : 500 }}>
          <div style={{ fontSize: 12 }}>{label}</div>
        </div>
      </Link>
    )
  }

  return (
    <div className="app min-h-screen">
      <div className="container">
        {token && (
          <nav style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end', 
            marginBottom: 16,
            padding: '8px 0'
          }}>
            <button onClick={logout} className="btn" style={{ fontSize: '0.9rem' }}>
              Logout
            </button>
          </nav>
        )}
        <Outlet />
        {token && (
          <div className="card tabbar" style={{ 
            position: 'sticky', 
            bottom: 0, 
            marginTop: 16, 
            padding: '8px', 
            background: 'white', 
            color: '#111', 
            border: '1px solid #eee',
            zIndex: 100
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <Tab to="/" label="Home" />
              <Tab to="/analysis" label="Analysis" />
              <Tab to="/transaction" label="Transaction" />
              <Tab to="/profile" label="Profile" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
