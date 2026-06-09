import { useState, useEffect, useRef } from 'react'

interface Props {
  value: number
  label: string
  unit?: string
  decimals?: number
  trend?: number
  size?: 'sm' | 'md' | 'lg'
}

export default function LiveCounter({ value, label, unit, decimals = 0, trend, size = 'md' }: Props) {
  const [display, setDisplay] = useState(value)
  const [flash, setFlash] = useState(false)
  const prev = useRef(value)

  useEffect(() => {
    if (value !== prev.current) {
      setFlash(true)
      const start = prev.current
      const diff = value - start
      const duration = 600
      const startTime = Date.now()
      const tick = () => {
        const elapsed = Date.now() - startTime
        if (elapsed >= duration) { setDisplay(value); prev.current = value; return }
        setDisplay(start + diff * (elapsed / duration))
        requestAnimationFrame(tick)
      }
      tick()
      setTimeout(() => setFlash(false), 500)
    }
  }, [value])

  const sizeClasses = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' }

  return (
    <div className={`flex flex-col items-center gap-1 ${flash ? 'data-flash' : ''}`}>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono font-bold text-gray-200 tabular-nums ${sizeClasses[size]}`}>
          {display.toLocaleString('pt-BR', { maximumFractionDigits: decimals })}
        </span>
        {unit && <span className="text-xs font-mono text-dim">{unit}</span>}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-dim">{label}</span>
        {trend !== undefined && (
          <span className={`text-[10px] font-mono ${trend >= 0 ? 'text-ok' : 'text-crit'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  )
}