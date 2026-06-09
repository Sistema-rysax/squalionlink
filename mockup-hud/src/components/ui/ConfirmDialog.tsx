import { AlertTriangle } from 'lucide-react'
interface Props { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel?: string }

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirmar' }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-hud-panel border border-crit/30 rounded-xl shadow-glow-crit p-6 max-w-sm w-full mx-4 animate-data-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-crit/10"><AlertTriangle className="w-5 h-5 text-crit" /></div>
          <h3 className="font-display text-sm tracking-wider text-gray-200 uppercase">{title}</h3>
        </div>
        <p className="text-sm text-gray-400 mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-dim border border-hud-border rounded-md hover:text-gray-300 hover:border-gray-600 transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-crit bg-crit/10 border border-crit/30 rounded-md hover:bg-crit/20 transition-colors">{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}