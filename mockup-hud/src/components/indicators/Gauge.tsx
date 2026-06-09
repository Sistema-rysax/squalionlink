import { useTheme } from '../../contexts/ThemeContext'

interface Props {
  value: number
  max?: number
  label: string
  unit?: string
  size?: number
  status?: 'ok' | 'warn' | 'crit'
}

export default function Gauge({ value, max = 100, label, unit = '%', size = 100, status = 'ok' }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const pct = Math.min(100, (value / max) * 100)
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ * 0.75
  const colors = { ok: isDark ? '#22c55e' : '#16a34a', warn: isDark ? '#f59e0b' : '#d97706', crit: isDark ? '#ef4444' : '#dc2626' }
  const color = colors[status]
  const trackColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-[135deg]">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor} strokeWidth={6} strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeLinecap="round" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6} strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeDashoffset={offset} strokeLinecap="round" className="gauge-ring" style={{filter:`drop-shadow(0 0 ${isDark?'4':'2'}px ${color}80)`}} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-lg font-bold text-gray-200 tabular-nums">{value.toFixed(1)}</span>
          <span className="text-[9px] font-mono text-dim">{unit}</span>
        </div>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-dim font-medium">{label}</span>
    </div>
  )
}