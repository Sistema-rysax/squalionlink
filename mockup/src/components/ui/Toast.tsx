import { useEffect, useState } from 'react'
import { Check, X, AlertCircle } from 'lucide-react'

interface ToastItem { id: number; message: string; type: 'success' | 'error' | 'info' }

let toastId = 0
let listeners: ((t: ToastItem[]) => void)[] = []
let toasts: ToastItem[] = []

export function toast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  const t = { id: ++toastId, message, type }
  toasts = [...toasts, t]
  listeners.forEach(l => l(toasts))
  setTimeout(() => { toasts = toasts.filter(x => x.id !== t.id); listeners.forEach(l => l(toasts)) }, 3000)
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([])
  useEffect(() => { listeners.push(setItems); return () => { listeners = listeners.filter(l => l !== setItems) } }, [])

  if (!items.length) return null
  return (
    <div className="fixed bottom-6 right-6 z-[70] space-y-2">
      {items.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-fade-in ${t.type === 'success' ? 'bg-green-900/90 border-green-700 text-green-200' : t.type === 'error' ? 'bg-red-900/90 border-red-700 text-red-200' : 'bg-blue-900/90 border-blue-700 text-blue-200'}`}>
          {t.type === 'success' ? <Check className="w-4 h-4" /> : t.type === 'error' ? <X className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-sm">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
