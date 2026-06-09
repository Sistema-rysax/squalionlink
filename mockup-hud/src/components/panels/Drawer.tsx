import { ReactNode, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

interface Props { open: boolean; onClose: () => void; title: string; subtitle?: string; children: ReactNode; footer?: ReactNode; width?: string }

export default function Drawer({ open, onClose, title, subtitle, children, footer, width = 'max-w-[460px]' }: Props) {
  if (!open) return null

  // Always render as portal to body so it works in dockview panels too
  return createPortal(
    <div className="fixed inset-0" style={{ zIndex: 99990 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`absolute top-0 right-0 h-full w-full ${width} bg-hud-panel border-l border-hud-border shadow-2xl flex flex-col animate-slide-in`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-hud-border flex-shrink-0">
          <div className="min-w-0">
            <h2 className="font-display text-sm tracking-wider text-gray-200 uppercase truncate">{title}</h2>
            {subtitle && <span className="text-[10px] font-mono text-dim mt-0.5 block truncate">{subtitle}</span>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/5 text-dim hover:text-gray-300 transition-colors flex-shrink-0"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && <div className="px-4 py-3 border-t border-hud-border flex items-center justify-end gap-2 flex-shrink-0">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
