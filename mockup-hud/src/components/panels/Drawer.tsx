import { ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props { open: boolean; onClose: () => void; title: string; subtitle?: string; children: ReactNode; footer?: ReactNode; width?: string }

export default function Drawer({ open, onClose, title, subtitle, children, footer, width = 'w-[460px]' }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`absolute top-0 right-0 h-full ${width} bg-hud-panel border-l border-hud-border shadow-2xl flex flex-col animate-slide-in`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-hud-border">
          <div>
            <h2 className="font-display text-sm tracking-wider text-gray-200 uppercase">{title}</h2>
            {subtitle && <span className="text-[10px] font-mono text-dim mt-0.5">{subtitle}</span>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/5 text-dim hover:text-gray-300 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-hud-border flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}