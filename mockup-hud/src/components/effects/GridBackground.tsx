export default function GridBackground() {
  return (
    <div className="fixed inset-0 hud-grid-bg pointer-events-none">
      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-hud-bg/80" />
      {/* Subtle radial glow at center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-brand-600/[0.02] rounded-full blur-3xl" />
    </div>
  )
}