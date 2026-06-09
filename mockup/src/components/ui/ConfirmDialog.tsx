import { AlertTriangle } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  variant?: 'danger' | 'warning'
}

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', variant = 'danger' }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-1 border border-surface-3 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-full ${variant === 'danger' ? 'bg-red-900/30' : 'bg-yellow-900/30'}`}>
            <AlertTriangle className={`w-5 h-5 ${variant === 'danger' ? 'text-red-400' : 'text-yellow-400'}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white">{title}</h3>
            <p className="text-sm text-gray-400 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300 hover:bg-surface-3 transition-colors">Cancelar</button>
          <button onClick={() => { onConfirm(); onClose() }} className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
