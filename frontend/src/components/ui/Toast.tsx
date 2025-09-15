import { createContext, PropsWithChildren, useContext, useState } from 'react'

type ToastContextType = { show: (msg: string) => void }
const ToastCtx = createContext<ToastContextType>({ show: () => {} })

export function ToastProvider({ children }: PropsWithChildren) {
  const [msg, setMsg] = useState<string | null>(null)

  function show(message: string) {
    setMsg(message)
    setTimeout(() => setMsg(null), 2500)
  }

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      {msg && <div className="toast">{msg}</div>}
    </ToastCtx.Provider>
  )
}

export function useToast() {
  return useContext(ToastCtx)
}
