let listeners: ((msg: string, type: string) => void)[] = []
export function toast(msg: string, type: 'success' | 'error' | 'info' = 'success') { listeners.forEach(fn => fn(msg, type)) }
export function onToast(fn: (msg: string, type: string) => void) { listeners.push(fn); return () => { listeners = listeners.filter(l => l !== fn) } }

import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

export function ToastContainer() {
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([])
  useEffect(() => onToast((msg, type) => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000)
  }), [])
  const Icon = { success: CheckCircle2, error: AlertCircle, info: Info }
  const colors = { success: 'border-ok/40 text-ok', error: 'border-crit/40 text-crit', info: 'border-brand-400/40 text-brand-400' }
  return (
    <div className="fixed top-16 right-4 z-[200] space-y-2">
      {toasts.map(t => {
        const I = Icon[t.type as keyof typeof Icon] || Info
        return (
          <div key={t.id} className={`flex items-center gap-2 px-4 py-2.5 bg-hud-panel/95 backdrop-blur-md border rounded-lg shadow-panel animate-data-in ${colors[t.type as keyof typeof colors] || ''}`}>
            <I className="w-4 h-4 shrink-0" />
            <span className="text-xs text-gray-300">{t.msg}</span>
          </div>
        )
      })}
    </div>
  )
}