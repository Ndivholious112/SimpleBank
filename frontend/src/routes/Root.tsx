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
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Link to="/" className="font-semibold" style={{ color: 'var(--fg)' }}>SimpleBank</Link>
          <div className="space-x-4">
            {!token ? (
              <>
                <Link to="/login" style={{ color: 'var(--fg)' }}>Login</Link>
                <Link to="/register" style={{ color: 'var(--fg)' }}>Register</Link>
              </>
            ) : (
              <button onClick={logout} className="btn">Logout</button>
            )}
          </div>
        </nav>
        <Outlet />
        <div className="card" style={{ position: 'sticky', bottom: 0, marginTop: 16, padding: 8, background: 'white', color: '#111', border: '1px solid #eee' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <Tab to="/" label="Home" />
            <Tab to="/analysis" label="Analysis" />
            <Tab to="/transaction" label="Transaction" />
            <Tab to="/profile" label="Profile" />
          </div>
        </div>
      </div>
    </div>
  )
}
