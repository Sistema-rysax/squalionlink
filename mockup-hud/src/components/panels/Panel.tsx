import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  title?: string
  subtitle?: string
  status?: 'ok' | 'warn' | 'crit' | 'info' | 'neutral'
  className?: string
  noPad?: boolean
}

const borderClass = {
  ok: 'panel-glow',
  warn: 'panel-glow-warn',
  crit: 'panel-glow-crit',
  info: 'panel-glow',
  neutral: 'panel-glow',
}

export default function Panel({ children, title, subtitle, status = 'neutral', className = '', noPad }: Props) {
  return (
    <div className={`bg-hud-panel/80 backdrop-blur-sm rounded-lg ${borderClass[status]} corner-marks relative overflow-hidden ${className}`}>
      {/* Panel header */}
      {title && (
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-hud-border/50">
          <div className="flex items-center gap-2">
            {status !== 'neutral' && <div className={`led led-${status}`} />}
            <h3 className="text-xs font-display uppercase tracking-wider text-gray-400">{title}</h3>
            {subtitle && <span className="text-[10px] font-mono text-dim ml-2">{subtitle}</span>}
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-600/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-brand-600/20" />
          </div>
        </div>
      )}
      {/* Panel body */}
      <div className={noPad ? '' : 'p-4'}>
        {children}
      </div>
    </div>
  )
}