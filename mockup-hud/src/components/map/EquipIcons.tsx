// Top-view SVG silhouettes for mining equipment
// Color is passed as prop based on status

export function TruckIcon({ color = '#22c55e', size = 32, heading = 0 }: { color?: string; size?: number; heading?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ transform: `rotate(${heading}deg)` }}>
      {/* Truck body top-view */}
      <rect x="8" y="4" width="16" height="24" rx="2" fill={color} opacity="0.85" />
      {/* Cab */}
      <rect x="10" y="4" width="12" height="8" rx="1.5" fill={color} opacity="1" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
      {/* Bed/tray */}
      <rect x="9" y="13" width="14" height="14" rx="1" fill={color} opacity="0.65" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
      {/* Wheels */}
      <rect x="6" y="6" width="3" height="5" rx="1" fill="rgba(0,0,0,0.5)" />
      <rect x="23" y="6" width="3" height="5" rx="1" fill="rgba(0,0,0,0.5)" />
      <rect x="6" y="20" width="3" height="5" rx="1" fill="rgba(0,0,0,0.5)" />
      <rect x="23" y="20" width="3" height="5" rx="1" fill="rgba(0,0,0,0.5)" />
      {/* Direction arrow */}
      <polygon points="16,1 14,4 18,4" fill="white" opacity="0.8" />
    </svg>
  )
}

export function ExcavatorIcon({ color = '#22c55e', size = 32, heading = 0 }: { color?: string; size?: number; heading?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ transform: `rotate(${heading}deg)` }}>
      {/* Track base */}
      <rect x="4" y="10" width="6" height="18" rx="3" fill="rgba(0,0,0,0.4)" />
      <rect x="22" y="10" width="6" height="18" rx="3" fill="rgba(0,0,0,0.4)" />
      {/* Upper body (rotatable) */}
      <ellipse cx="16" cy="18" rx="8" ry="9" fill={color} opacity="0.85" />
      {/* Cab */}
      <rect x="12" y="13" width="8" height="7" rx="2" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
      {/* Boom arm */}
      <line x1="16" y1="12" x2="16" y2="2" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16" cy="2" r="2" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
    </svg>
  )
}

export function LoaderIcon({ color = '#22c55e', size = 32, heading = 0 }: { color?: string; size?: number; heading?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ transform: `rotate(${heading}deg)` }}>
      {/* Body */}
      <rect x="9" y="10" width="14" height="16" rx="2" fill={color} opacity="0.85" />
      {/* Cab */}
      <rect x="11" y="14" width="10" height="8" rx="1.5" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
      {/* Bucket arm */}
      <rect x="12" y="3" width="8" height="8" rx="1" fill={color} opacity="0.7" />
      <rect x="11" y="2" width="10" height="3" rx="1" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
      {/* Wheels */}
      <circle cx="10" cy="12" r="3" fill="rgba(0,0,0,0.4)" />
      <circle cx="22" cy="12" r="3" fill="rgba(0,0,0,0.4)" />
      <circle cx="10" cy="24" r="3" fill="rgba(0,0,0,0.4)" />
      <circle cx="22" cy="24" r="3" fill="rgba(0,0,0,0.4)" />
    </svg>
  )
}

export function GraderIcon({ color = '#22c55e', size = 32, heading = 0 }: { color?: string; size?: number; heading?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ transform: `rotate(${heading}deg)` }}>
      {/* Long body */}
      <rect x="12" y="3" width="8" height="26" rx="2" fill={color} opacity="0.85" />
      {/* Blade */}
      <rect x="6" y="16" width="20" height="3" rx="1" fill={color} opacity="0.7" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
      {/* Cab */}
      <rect x="13" y="20" width="6" height="6" rx="1" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
      {/* Wheels - 6 */}
      <circle cx="11" cy="6" r="2" fill="rgba(0,0,0,0.4)" />
      <circle cx="21" cy="6" r="2" fill="rgba(0,0,0,0.4)" />
      <circle cx="11" cy="26" r="2.5" fill="rgba(0,0,0,0.4)" />
      <circle cx="21" cy="26" r="2.5" fill="rgba(0,0,0,0.4)" />
      <circle cx="11" cy="12" r="2" fill="rgba(0,0,0,0.4)" />
      <circle cx="21" cy="12" r="2" fill="rgba(0,0,0,0.4)" />
    </svg>
  )
}

export function DrillIcon({ color = '#22c55e', size = 32, heading = 0 }: { color?: string; size?: number; heading?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ transform: `rotate(${heading}deg)` }}>
      {/* Track base */}
      <rect x="5" y="12" width="5" height="16" rx="2.5" fill="rgba(0,0,0,0.4)" />
      <rect x="22" y="12" width="5" height="16" rx="2.5" fill="rgba(0,0,0,0.4)" />
      {/* Body */}
      <rect x="9" y="10" width="14" height="18" rx="2" fill={color} opacity="0.85" />
      {/* Mast/drill column */}
      <rect x="14" y="1" width="4" height="12" rx="1" fill={color} opacity="0.9" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
      <circle cx="16" cy="2" r="1.5" fill="white" opacity="0.6" />
    </svg>
  )
}

export function DozerIcon({ color = '#22c55e', size = 32, heading = 0 }: { color?: string; size?: number; heading?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ transform: `rotate(${heading}deg)` }}>
      {/* Tracks */}
      <rect x="4" y="8" width="6" height="20" rx="3" fill="rgba(0,0,0,0.4)" />
      <rect x="22" y="8" width="6" height="20" rx="3" fill="rgba(0,0,0,0.4)" />
      {/* Body */}
      <rect x="9" y="10" width="14" height="16" rx="2" fill={color} opacity="0.85" />
      {/* Cab */}
      <rect x="11" y="14" width="10" height="7" rx="1.5" fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
      {/* Blade front */}
      <rect x="3" y="5" width="26" height="4" rx="1" fill={color} opacity="0.7" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
      {/* Ripper back */}
      <rect x="13" y="27" width="6" height="3" rx="0.5" fill={color} opacity="0.6" />
    </svg>
  )
}

// Map equipment group to icon component
export function getEquipIcon(grupo: string) {
  const g = grupo.toLowerCase()
  if (g.includes('caminh') || g.includes('truck')) return TruckIcon
  if (g.includes('escav')) return ExcavatorIcon
  if (g.includes('carreg') || g.includes('loader')) return LoaderIcon
  if (g.includes('moto') || g.includes('grader')) return GraderIcon
  if (g.includes('perf') || g.includes('drill')) return DrillIcon
  if (g.includes('trat') || g.includes('dozer')) return DozerIcon
  return TruckIcon
}
