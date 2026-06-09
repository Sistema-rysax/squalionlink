import { useState } from 'react'
import { X, Thermometer, Fuel, Gauge, CircleDot, Camera, Wifi, AlertTriangle, CheckCircle2, Radio } from 'lucide-react'

interface TwinProps {
  equip: any
  snap: any
  onClose: () => void
}

interface Hotspot {
  id: string
  label: string
  x: number // % from left
  y: number // % from top
  icon: any
  getValue: (snap: any, equip: any) => { value: string; status: 'ok' | 'warn' | 'crit' }
  details: (snap: any, equip: any) => { label: string; value: string }[]
}

const hotspots: Hotspot[] = [
  {
    id: 'motor', label: 'Motor', x: 50, y: 18, icon: Thermometer,
    getValue: (s) => ({ value: s.motor_temp + 'C', status: s.motor_temp > 95 ? 'crit' : s.motor_temp > 85 ? 'warn' : 'ok' }),
    details: (s) => [
      { label: 'Temperatura', value: s.motor_temp + ' C' },
      { label: 'RPM', value: s.rpm.toLocaleString() },
      { label: 'P. Oleo', value: s.pressao_oleo + ' psi' },
      { label: 'Marcha', value: s.marcha },
    ]
  },
  {
    id: 'tanque', label: 'Combustivel', x: 50, y: 55, icon: Fuel,
    getValue: (_, e) => ({ value: e.tanque + '%', status: e.tanque < 20 ? 'crit' : e.tanque < 40 ? 'warn' : 'ok' }),
    details: (s, e) => [
      { label: 'Nivel', value: e.tanque + '%' },
      { label: 'Consumo Med.', value: s.consumo_medio + ' L/h' },
      { label: 'Consumo Inst.', value: s.consumo_inst + ' L/h' },
      { label: 'Autonomia', value: s.autonomia_hrs + ' hrs' },
      { label: 'Ult. Abastec.', value: s.ult_abastecimento },
    ]
  },
  {
    id: 'bascula', label: 'Bascula', x: 50, y: 38, icon: Gauge,
    getValue: () => ({ value: '12 graus', status: 'ok' }),
    details: () => [
      { label: 'Angulo', value: '12 graus' },
      { label: 'Status', value: 'Abaixada' },
      { label: 'Carga', value: '~85 ton' },
      { label: 'Fator Ench.', value: '92%' },
    ]
  },
  {
    id: 'pneu_de', label: 'Pneu DE', x: 22, y: 25, icon: CircleDot,
    getValue: () => ({ value: '45 psi', status: 'ok' }),
    details: () => [
      { label: 'Pressao', value: '45 psi' },
      { label: 'Temperatura', value: '68 C' },
      { label: 'Desgaste', value: '22%' },
      { label: 'Vida util', value: '~3200 hrs' },
    ]
  },
  {
    id: 'pneu_dd', label: 'Pneu DD', x: 78, y: 25, icon: CircleDot,
    getValue: () => ({ value: '44 psi', status: 'ok' }),
    details: () => [
      { label: 'Pressao', value: '44 psi' },
      { label: 'Temperatura', value: '65 C' },
      { label: 'Desgaste', value: '20%' },
      { label: 'Vida util', value: '~3400 hrs' },
    ]
  },
  {
    id: 'pneu_te', label: 'Pneu TE', x: 22, y: 70, icon: CircleDot,
    getValue: () => ({ value: '43 psi', status: 'ok' }),
    details: () => [
      { label: 'Pressao', value: '43 psi' },
      { label: 'Temperatura', value: '70 C' },
      { label: 'Desgaste', value: '28%' },
      { label: 'Vida util', value: '~2800 hrs' },
    ]
  },
  {
    id: 'pneu_td', label: 'Pneu TD', x: 78, y: 70, icon: CircleDot,
    getValue: () => ({ value: '42 psi', status: 'warn' }),
    details: () => [
      { label: 'Pressao', value: '42 psi' },
      { label: 'Temperatura', value: '72 C' },
      { label: 'Desgaste', value: '35%' },
      { label: 'Vida util', value: '~2200 hrs' },
    ]
  },
  {
    id: 'gps', label: 'GPS/Antena', x: 50, y: 8, icon: Radio,
    getValue: (s) => ({ value: s.ignicao ? 'Online' : 'Offline', status: s.ignicao ? 'ok' : 'crit' }),
    details: (s) => [
      { label: 'Status', value: s.ignicao ? 'Online' : 'Offline' },
      { label: 'Ult. Fix', value: s.ult_gps },
      { label: 'HDOP', value: '0.8' },
      { label: 'Satelites', value: '12' },
    ]
  },
  {
    id: 'camera', label: 'Camera', x: 50, y: 88, icon: Camera,
    getValue: () => ({ value: 'Online', status: 'ok' }),
    details: () => [
      { label: 'Status', value: 'Gravando' },
      { label: 'Resolucao', value: '1080p' },
      { label: 'Storage', value: '62% livre' },
      { label: 'Ult. Evento', value: '09/06 09:42' },
    ]
  },
]

const statusColors = { ok: 'text-green-400 border-green-400/40 bg-green-400/10', warn: 'text-amber-400 border-amber-400/40 bg-amber-400/10', crit: 'text-red-400 border-red-400/40 bg-red-400/10' }

export default function DigitalTwin({ equip, snap, onClose }: TwinProps) {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)

  const activeData = activeHotspot ? hotspots.find(h => h.id === activeHotspot) : null

  return (
    <div className="fixed inset-0 z-[99998] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-hud-panel border border-hud-border rounded-2xl w-full max-w-[1100px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hud-border/50">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            <h2 className="text-base font-display font-bold text-brand-400">DIGITAL TWIN</h2>
            <span className="text-sm font-mono text-gray-200">{equip.codigo}</span>
            <span className="text-xs text-dim px-2 py-0.5 border border-hud-border rounded">{equip.modelo}</span>
            <span className="text-xs text-dim">{equip.grupo}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-dim hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Vehicle SVG with hotspots */}
          <div className="flex-1 relative p-8 flex items-center justify-center">
            {/* Vehicle silhouette - side view of mining truck */}
            <div className="relative w-[500px] h-[350px]">
              {/* SVG Truck Side View */}
              <svg viewBox="0 0 500 350" className="w-full h-full" fill="none">
                {/* Ground line */}
                <line x1="50" y1="290" x2="450" y2="290" stroke="var(--hud-border)" strokeWidth="1" strokeDasharray="4 4" />

                {/* Rear wheels (large) */}
                <circle cx="150" cy="270" r="45" fill="rgba(30,30,30,0.8)" stroke="var(--hud-border)" strokeWidth="2" />
                <circle cx="150" cy="270" r="30" fill="rgba(50,50,50,0.6)" stroke="var(--hud-border)" strokeWidth="1" />
                <circle cx="150" cy="270" r="8" fill="rgba(100,100,100,0.5)" />

                {/* Front wheels */}
                <circle cx="380" cy="270" r="35" fill="rgba(30,30,30,0.8)" stroke="var(--hud-border)" strokeWidth="2" />
                <circle cx="380" cy="270" r="22" fill="rgba(50,50,50,0.6)" stroke="var(--hud-border)" strokeWidth="1" />
                <circle cx="380" cy="270" r="6" fill="rgba(100,100,100,0.5)" />

                {/* Chassis */}
                <path d="M 90 225 L 420 225 L 420 240 L 90 240 Z" fill="rgba(37,99,235,0.2)" stroke="rgba(37,99,235,0.4)" strokeWidth="1.5" />

                {/* Bed/Tray */}
                <path d="M 80 100 L 80 220 L 280 220 L 310 100 Z" fill="rgba(37,99,235,0.15)" stroke="rgba(37,99,235,0.5)" strokeWidth="2" />
                <path d="M 85 105 L 85 215 L 275 215 L 305 105 Z" fill="none" stroke="rgba(37,99,235,0.25)" strokeWidth="1" strokeDasharray="8 4" />

                {/* Cab */}
                <path d="M 310 130 L 310 220 L 430 220 L 430 160 L 390 130 Z" fill="rgba(37,99,235,0.25)" stroke="rgba(37,99,235,0.6)" strokeWidth="2" />
                {/* Windshield */}
                <path d="M 330 140 L 390 140 L 420 165 L 420 195 L 330 195 Z" fill="rgba(100,180,255,0.1)" stroke="rgba(100,180,255,0.3)" strokeWidth="1" />

                {/* Engine hood */}
                <path d="M 310 160 L 310 220 L 280 220 L 280 180 Z" fill="rgba(37,99,235,0.2)" stroke="rgba(37,99,235,0.4)" strokeWidth="1" />

                {/* Exhaust */}
                <rect x="295" y="95" width="8" height="40" rx="4" fill="rgba(100,100,100,0.4)" stroke="var(--hud-border)" strokeWidth="1" />

                {/* GPS Antenna */}
                <line x1="370" y1="125" x2="370" y2="105" stroke="var(--hud-border)" strokeWidth="1.5" />
                <circle cx="370" cy="100" r="4" fill="rgba(34,197,94,0.5)" stroke="rgba(34,197,94,0.8)" strokeWidth="1" />

                {/* Labels */}
                <text x="170" y="170" textAnchor="middle" style={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: 'rgba(37,99,235,0.6)' }}>CACAMBA</text>
                <text x="370" y="185" textAnchor="middle" style={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: 'rgba(100,180,255,0.5)' }}>CABINE</text>
              </svg>

              {/* Hotspot overlays */}
              {hotspots.map(h => {
                const { value, status } = h.getValue(snap, equip)
                const Icon = h.icon
                const isActive = activeHotspot === h.id
                return (
                  <button key={h.id}
                    onClick={() => setActiveHotspot(isActive ? null : h.id)}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${isActive ? 'scale-125 z-20' : 'z-10 hover:scale-110'}`}
                    style={{ left: h.x + '%', top: h.y + '%' }}
                    title={h.label}
                  >
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border backdrop-blur-sm transition-all ${isActive ? statusColors[status] + ' shadow-lg' : 'border-hud-border/50 bg-hud-panel/80 text-dim hover:text-gray-300 hover:border-brand-600/40'}`}>
                      <Icon className="w-3 h-3" />
                      <span className="text-[9px] font-mono font-bold">{value}</span>
                    </div>
                    {/* Pulse ring for active */}
                    {status === 'crit' && (
                      <div className="absolute inset-0 rounded-lg border border-red-400/50 animate-ping"></div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* RIGHT: Detail panel */}
          <div className="w-[280px] border-l border-hud-border/50 overflow-y-auto bg-hud-bg/30">
            {activeData ? (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <activeData.icon className="w-4 h-4 text-brand-400" />
                  <h3 className="text-xs font-display uppercase tracking-widest text-brand-400">{activeData.label}</h3>
                </div>
                <div className="space-y-2">
                  {activeData.details(snap, equip).map((d, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-hud-border/20">
                      <span className="text-[10px] text-dim">{d.label}</span>
                      <span className="text-[10px] font-mono text-gray-200 font-medium">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4">
                <h3 className="text-[9px] font-display uppercase tracking-widest text-dim mb-3">Sensores Ativos</h3>
                <div className="space-y-2">
                  {[
                    { name: 'GPS', status: 'ok' }, { name: 'Telemetria', status: 'ok' },
                    { name: 'TPMS (Pneus)', status: 'ok' }, { name: 'Bascula', status: 'ok' },
                    { name: 'Camera', status: 'ok' }, { name: 'Balanca', status: 'warn' },
                    { name: 'Nivel Comb.', status: 'ok' }, { name: 'Motor ECU', status: 'ok' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {s.status === 'ok' ? <CheckCircle2 className="w-3 h-3 text-green-400" /> :
                       s.status === 'warn' ? <AlertTriangle className="w-3 h-3 text-amber-400" /> :
                       <X className="w-3 h-3 text-red-400" />}
                      <span className="text-[10px] font-mono text-gray-300">{s.name}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-hud-border/30">
                  <h3 className="text-[9px] font-display uppercase tracking-widest text-dim mb-2">Instrucoes</h3>
                  <p className="text-[9px] text-dim leading-relaxed">
                    Clique nos pontos de medicao no modelo para ver detalhes do sensor. 
                    Pontos em vermelho indicam alerta ativo.
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-hud-border/30 space-y-1.5">
                  <div className="flex justify-between text-[9px]"><span className="text-dim">Odometro</span><span className="font-mono text-gray-300">{snap.odometro?.toLocaleString()} km</span></div>
                  <div className="flex justify-between text-[9px]"><span className="text-dim">Horimetro</span><span className="font-mono text-gray-300">12.450 hrs</span></div>
                  <div className="flex justify-between text-[9px]"><span className="text-dim">Ult. Checklist</span><span className="font-mono text-gray-300">{snap.ult_checklist}</span></div>
                  <div className="flex justify-between text-[9px]"><span className="text-dim">Prox. Prev.</span><span className="font-mono text-gray-300">{snap.proxima_prev}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
