import { useMobileDetection } from '../hooks/useMobileDetection'

interface MobileOnlyWrapperProps {
  children: React.ReactNode
}

export default function MobileOnlyWrapper({ children }: MobileOnlyWrapperProps) {
  const { isMobile, isLoading } = useMobileDetection()

  if (isLoading) {
    return (
      <div className="app min-h-screen center">
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Loading...</div>
        </div>
      </div>
    )
  }

  if (!isMobile) {
    return (
      <div className="app min-h-screen center">
        <div className="card" style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📱</div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--fg)' }}>
            Mobile Only
          </h1>
          <p style={{ color: 'var(--fg-muted)', marginBottom: '1.5rem' }}>
            This application is designed specifically for mobile devices. 
            Please access it from your smartphone or tablet.
          </p>
          <div style={{ 
            background: 'var(--card)', 
            padding: '1rem', 
            borderRadius: '12px',
            border: '1px solid var(--card-border)'
          }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--fg-muted)', margin: 0 }}>
              💡 Tip: Open this URL on your mobile device or use your browser's 
              developer tools to simulate a mobile viewport.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
