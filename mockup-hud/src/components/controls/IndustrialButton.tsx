import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  onClick?: () => void
  icon?: ReactNode
}

export default function IndustrialButton({ children, variant = 'primary', size = 'md', onClick, icon }: Props) {
  const base = 'font-mono uppercase tracking-wider font-medium transition-all duration-200 flex items-center gap-2 rounded-md'
  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-[10px]' : 'px-4 py-2 text-xs'
  const variants = {
    primary: 'bg-brand-600/20 text-brand-400 border border-brand-600/40 hover:bg-brand-600/30 hover:border-brand-600/60 hover:shadow-glow-sm',
    secondary: 'bg-white/[0.03] text-gray-400 border border-hud-border hover:text-gray-200 hover:border-gray-600',
    danger: 'bg-crit/10 text-crit border border-crit/30 hover:bg-crit/20 hover:shadow-glow-crit',
    ghost: 'text-dim hover:text-gray-300 hover:bg-white/[0.03]',
  }

  return (
    <button onClick={onClick} className={`${base} ${sizeClass} ${variants[variant]}`}>
      {icon}{children}
    </button>
  )
}