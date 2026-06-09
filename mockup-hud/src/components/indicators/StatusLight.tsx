interface Props {
  status: 'ok' | 'warn' | 'crit' | 'off'
  label?: string
  size?: 'sm' | 'md'
}

export default function StatusLight({ status, label, size = 'md' }: Props) {
  const sizeClass = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'
  return (
    <div className="flex items-center gap-2">
      <div className={`led led-${status} ${sizeClass}`} />
      {label && <span className="text-[10px] font-mono text-dim uppercase">{label}</span>}
    </div>
  )
}