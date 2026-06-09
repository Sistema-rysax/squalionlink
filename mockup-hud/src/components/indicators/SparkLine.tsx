interface Props {
  data: number[]
  color?: string
  width?: number
  height?: number
}

export default function SparkLine({ data, color = '#2563eb', width = 80, height = 24 }: Props) {
  if (!data.length) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
      {/* Last point dot */}
      <circle cx={width} cy={height - ((data[data.length-1] - min) / range) * height} r={2} fill={color} style={{filter:`drop-shadow(0 0 3px ${color})`}} />
    </svg>
  )
}