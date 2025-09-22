import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title?: string
  onClose: () => void
  children: ReactNode
  actions?: ReactNode
}

export default function Modal({ open, title, onClose, children, actions }: ModalProps) {
  if (!open) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(2,8,23,.55)',
      display: 'grid', placeItems: 'center', zIndex: 1000
    }} onClick={onClose}>
      <div className="card" style={{ padding: 16, width: '90%', maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        {title && <div className="font-semibold" style={{ marginBottom: 8 }}>{title}</div>}
        <div style={{ marginBottom: 12 }}>{children}</div>
        {actions && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
