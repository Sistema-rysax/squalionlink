import { useState, useCallback, useMemo } from 'react'
import { DndContext, DragOverlay, useDraggable, useDroppable, closestCenter, DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Select, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'
import { ArrowRight, Plus, Trash2, Truck, Edit2, Pause, Play, GripVertical, Loader, ChevronRight, AlertTriangle, BarChart3, Workflow, Clock, Route, Weight, Box } from 'lucide-react'

/* ─── TYPES ─── */
interface Fluxo {
  id: number; nome: string
  origem_area: string; origem_subarea: string; material: string
  destino_area: string; destino_subarea: string
  status: 'ATIVO' | 'PAUSADO'
  carga: EquipAlocado[]
  dist_cheia_km: number
  dist_vazia_km: number
  tempo_ciclo_medio_min: number
  meta_viagens_turno: number
  toneladas_turno: number
  volume_m3_turno: number
}

interface EquipAlocado {
  id: string; cod: string; tipo: string; modelo: string
  status: 'EM_FILA' | 'CARREGANDO' | 'EM_ROTA' | 'DESCARREGANDO' | 'AGUARDANDO' | 'ALOCADO'
  viagens: number
  eta_min: number // minutes until next stage
}

interface EquipDisponivel {
  cod: string; tipo: string; modelo: string; grupo: 'CARGA' | 'TRANSPORTE'
}

/* ─── MOCK DATA ─── */
const AREAS = ['Frente Norte B3','Frente Sul A1','Frente Oeste C2','Britador Primario','Pilha ROM','Pilha Esteril','Patio Manobra','Barragem']
const MATERIAIS = ['ROM','Hematita','Itabirito','Esteril','Canga','Solo Organico']
const MATERIAL_COLORS: Record<string,string> = { ROM:'#f97316', Hematita:'#ef4444', Itabirito:'#a855f7', Esteril:'#6b7280', Canga:'#92400e', 'Solo Organico':'#65a30d' }

const initFluxos: Fluxo[] = [
  { id:1, nome:'F-001', origem_area:'Frente Norte B3', origem_subarea:'Praca Carga A', material:'ROM', destino_area:'Britador Primario', destino_subarea:'Patio Descarga', status:'ATIVO',
    carga: [{ id:'esc-01', cod:'ESC-01', tipo:'Escavadeira', modelo:'PC5500', status:'CARREGANDO', viagens:0, eta_min:0 }],
    dist_cheia_km: 4.2, dist_vazia_km: 4.0, tempo_ciclo_medio_min: 28, meta_viagens_turno: 16, toneladas_turno: 1260, volume_m3_turno: 840
  },
  { id:2, nome:'F-002', origem_area:'Frente Sul A1', origem_subarea:'Praca Carga B', material:'Esteril', destino_area:'Pilha Esteril', destino_subarea:'Setor 2', status:'ATIVO',
    carga: [{ id:'esc-02', cod:'ESC-02', tipo:'Escavadeira', modelo:'CAT 6060', status:'CARREGANDO', viagens:0, eta_min:0 }],
    dist_cheia_km: 3.8, dist_vazia_km: 3.6, tempo_ciclo_medio_min: 24, meta_viagens_turno: 18, toneladas_turno: 980, volume_m3_turno: 720
  },
  { id:3, nome:'F-003', origem_area:'Frente Norte B3', origem_subarea:'Bancada N2', material:'Hematita', destino_area:'Pilha ROM', destino_subarea:'Setor A', status:'ATIVO',
    carga: [{ id:'car-01', cod:'CAR-01', tipo:'Carregadeira', modelo:'CAT 994K', status:'CARREGANDO', viagens:0, eta_min:0 }],
    dist_cheia_km: 5.1, dist_vazia_km: 4.8, tempo_ciclo_medio_min: 32, meta_viagens_turno: 14, toneladas_turno: 840, volume_m3_turno: 560
  },
  { id:4, nome:'F-004', origem_area:'Frente Oeste C2', origem_subarea:'Bancada W1', material:'Canga', destino_area:'Barragem', destino_subarea:'Descarga Norte', status:'PAUSADO',
    carga: [],
    dist_cheia_km: 6.3, dist_vazia_km: 6.0, tempo_ciclo_medio_min: 38, meta_viagens_turno: 12, toneladas_turno: 0, volume_m3_turno: 0
  },
]

const initAlocacoes: Record<number, EquipAlocado[]> = {
  1: [
    { id:'cam-01', cod:'CAT-773F-01', tipo:'Caminhao', modelo:'773F', status:'EM_FILA', viagens:12, eta_min:2 },
    { id:'cam-08', cod:'CAT-773F-05', tipo:'Caminhao', modelo:'773F', status:'EM_FILA', viagens:8, eta_min:5 },
    { id:'cam-09', cod:'CAT-777G-01', tipo:'Caminhao', modelo:'777G', status:'EM_FILA', viagens:6, eta_min:9 },
    { id:'cam-02', cod:'CAT-773F-02', tipo:'Caminhao', modelo:'773F', status:'EM_ROTA', viagens:10, eta_min:3 },
    { id:'cam-07', cod:'CAT-773F-04', tipo:'Caminhao', modelo:'773F', status:'ALOCADO', viagens:11, eta_min:8 },
    { id:'cam-10', cod:'KOMATSU-HD785-01', tipo:'Caminhao', modelo:'HD785', status:'EM_ROTA', viagens:9, eta_min:12 },
  ],
  2: [
    { id:'cam-03', cod:'CAT-773F-03', tipo:'Caminhao', modelo:'773F', status:'EM_FILA', viagens:8, eta_min:4 },
    { id:'cam-04', cod:'CAT-777G-02', tipo:'Caminhao', modelo:'777G', status:'EM_ROTA', viagens:6, eta_min:6 },
  ],
  3: [
    { id:'cam-05', cod:'CAT-777G-03', tipo:'Caminhao', modelo:'777G', status:'AGUARDANDO', viagens:9, eta_min:1 },
    { id:'cam-06', cod:'VOLVO-A40G-01', tipo:'Caminhao', modelo:'A40G', status:'EM_ROTA', viagens:7, eta_min:7 },
  ],
  4: [],
}

const initPool: EquipDisponivel[] = [
  { cod:'VOLVO-A40G-02', tipo:'Articulado', modelo:'A40G', grupo:'TRANSPORTE' },
  { cod:'ESC-03', tipo:'Escavadeira', modelo:'PC4000', grupo:'CARGA' },
  { cod:'CAR-02', tipo:'Carregadeira', modelo:'WA600', grupo:'CARGA' },
]

/* ─── DRAGGABLE EQUIP CARD ─── */
function DraggableEquip({ equip, zone, position }: { equip: EquipAlocado | EquipDisponivel; zone: string; position?: number }) {
  const id = 'cod' in equip && !('status' in equip) ? equip.cod + '-pool' : (equip as EquipAlocado).id || (equip as any).cod
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, data: { equip, zone } })
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)`, opacity: isDragging ? 0.4 : 1 } : undefined

  const isPool = !('status' in equip)
  const eq = equip as EquipAlocado

  const statusBadge: Record<string, string> = {
    'EM_FILA': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'EM_ROTA': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    'CARREGANDO': 'bg-green-500/15 text-green-400 border-green-500/30',
    'AGUARDANDO': 'bg-gray-500/15 text-gray-400 border-gray-500/30',
    'ALOCADO': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    'DESCARREGANDO': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    'CARGA': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    'LIVRE': 'bg-brand-600/10 text-brand-400 border-brand-600/30',
  }

  const statusLabel = isPool ? ((equip as EquipDisponivel).grupo === 'CARGA' ? 'CARGA' : 'LIVRE') : eq.status
  const badgeClass = statusBadge[statusLabel] || statusBadge['LIVRE']

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-hud-border/40 bg-hud-bg/60 cursor-grab active:cursor-grabbing transition-all hover:border-brand-600/30 hover:shadow-md">
      {position !== undefined && (
        <span className="w-5 h-5 rounded-full bg-brand-600/20 text-brand-400 text-[9px] font-mono font-bold flex items-center justify-center flex-shrink-0">{position}</span>
      )}
      {position === undefined && <GripVertical className="w-3 h-3 text-dim/40 flex-shrink-0" />}
      <Truck className="w-3.5 h-3.5 text-dim flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-mono font-bold text-gray-200 truncate">{isPool ? equip.cod : eq.cod}</div>
        <div className="text-[8px] text-dim">{isPool ? (equip as EquipDisponivel).modelo : eq.modelo}</div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${badgeClass}`}>{statusLabel}</span>
        {!isPool && eq.eta_min > 0 && (
          <span className="text-[8px] font-mono text-dim flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />~{eq.eta_min}m</span>
        )}
        {!isPool && eq.viagens > 0 && <span className="text-[8px] font-mono text-dim">{eq.viagens}v</span>}
      </div>
    </div>
  )
}

/* ─── DROPPABLE ZONE ─── */
function DropZone({ id, children, label, className = '' }: { id: string; children: React.ReactNode; label?: string; className?: string }) {
  const { isOver, setNodeRef } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className={`rounded-lg border-2 border-dashed transition-all min-h-[80px] p-2 ${isOver ? 'border-brand-400/60 bg-brand-600/5 scale-[1.005]' : 'border-hud-border/30 bg-hud-bg/20'} ${className}`}>
      {label && <div className="text-[8px] font-display uppercase tracking-widest text-dim mb-1.5 text-center">{label}</div>}
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

/* ─── PIPELINE FLOW CARD ─── */
function PipelineCard({ fluxo, alocados, onEdit, onToggle, onDelete }: { fluxo: Fluxo; alocados: EquipAlocado[]; onEdit: () => void; onToggle: () => void; onDelete: () => void }) {
  // Split into pre/post carga and sort by ETA
  const preCarga = alocados.filter(a => ['EM_FILA', 'AGUARDANDO'].includes(a.status)).sort((a, b) => a.eta_min - b.eta_min)
  const posCarga = alocados.filter(a => ['EM_ROTA', 'ALOCADO', 'DESCARREGANDO'].includes(a.status)).sort((a, b) => a.eta_min - b.eta_min)
  const matColor = MATERIAL_COLORS[fluxo.material] || '#6b7280'
  const isActive = fluxo.status === 'ATIVO'

  return (
    <div className={`rounded-xl border transition-all ${isActive ? 'border-hud-border/60 bg-hud-panel/60' : 'border-hud-border/30 bg-hud-panel/30 opacity-60'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-hud-border/30">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.5)]' : 'bg-gray-500'}`}></div>
          <span className="font-mono text-sm font-bold text-brand-400">{fluxo.nome}</span>
          <span className="text-[9px] text-dim">ORIGEM</span>
          <span className="text-[10px] text-gray-300 font-medium">{fluxo.origem_area}</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono border" style={{ color: matColor, borderColor: matColor + '40', background: matColor + '10' }}>{fluxo.material}</span>
          <ArrowRight className="w-3 h-3 text-dim" />
          <span className="text-[9px] text-dim">DESTINO</span>
          <span className="text-[10px] text-gray-300 font-medium">{fluxo.destino_area}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-dim">{alocados.length + fluxo.carga.length} equip.</span>
          <button onClick={onToggle} className={`flex items-center gap-1 px-2 py-1 text-[9px] font-mono rounded border transition-all ${isActive ? 'text-amber-400 border-amber-400/30 hover:bg-amber-400/10' : 'text-green-400 border-green-400/30 hover:bg-green-400/10'}`}>
            {isActive ? <><Pause className="w-2.5 h-2.5"/>Pausar</> : <><Play className="w-2.5 h-2.5"/>Ativar</>}
          </button>
          <button onClick={onEdit} className="p-1 text-dim hover:text-brand-400"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1 text-dim hover:text-crit"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Pipeline: [PRE-CARGA] [CENTER: Carga + Metrics] [POS-CARGA] */}
      <div className="grid grid-cols-[1fr_220px_1fr] gap-3 p-4">
        {/* LEFT: Fila (sorted by ETA) */}
        <DropZone id={`pre-${fluxo.id}`} label={`Fila / Aguardando (${preCarga.length})`}>
          {preCarga.map((eq, i) => <DraggableEquip key={eq.id} equip={eq} zone={`pre-${fluxo.id}`} position={i + 1} />)}
          {preCarga.length === 0 && <div className="text-[9px] text-dim/40 text-center py-4 font-mono">Nenhum na fila</div>}
        </DropZone>

        {/* CENTER: Carga machines + Flow metrics */}
        <div className="flex flex-col gap-2">
          <DropZone id={`carga-${fluxo.id}`} label="Carregamento" className="!min-h-0">
            {fluxo.carga.length > 0 ? fluxo.carga.map(eq => (
              <div key={eq.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-green-500/40 bg-green-500/8">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <div className="flex-1">
                  <div className="text-[10px] font-mono font-bold text-green-400">{eq.cod}</div>
                  <div className="text-[8px] text-dim">{eq.modelo}</div>
                </div>
                <Loader className="w-3 h-3 text-green-400 animate-spin" />
              </div>
            )) : (
              <div className="flex items-center gap-2 py-2 px-2">
                <AlertTriangle className="w-3 h-3 text-crit" />
                <span className="text-[8px] text-crit font-mono">Sem carga!</span>
              </div>
            )}
          </DropZone>

          {/* Flow metrics */}
          <div className="bg-hud-bg/40 rounded-lg border border-hud-border/20 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-dim flex items-center gap-1"><Clock className="w-2.5 h-2.5"/>T.Ciclo</span>
              <span className="text-[9px] font-mono text-gray-200 font-bold">{fluxo.tempo_ciclo_medio_min} min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-dim flex items-center gap-1"><Route className="w-2.5 h-2.5"/>Dist. cheia</span>
              <span className="text-[9px] font-mono text-gray-300">{fluxo.dist_cheia_km} km</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-dim flex items-center gap-1"><Route className="w-2.5 h-2.5"/>Dist. vazia</span>
              <span className="text-[9px] font-mono text-gray-300">{fluxo.dist_vazia_km} km</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-dim">Meta viagens</span>
              <span className="text-[9px] font-mono text-gray-300">{fluxo.meta_viagens_turno}/turno</span>
            </div>
            <div className="border-t border-hud-border/20 pt-1.5 mt-1.5 flex items-center justify-between">
              <span className="text-[8px] text-dim flex items-center gap-1"><Weight className="w-2.5 h-2.5"/>Ton.</span>
              <span className="text-[9px] font-mono text-ok font-bold">{fluxo.toneladas_turno.toLocaleString()} t</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-dim flex items-center gap-1"><Box className="w-2.5 h-2.5"/>Vol.</span>
              <span className="text-[9px] font-mono text-gray-300">{fluxo.volume_m3_turno.toLocaleString()} m3</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Em rota (sorted by ETA to destination) */}
        <DropZone id={`pos-${fluxo.id}`} label={`Em Rota / Destino (${posCarga.length})`}>
          {posCarga.map((eq, i) => <DraggableEquip key={eq.id} equip={eq} zone={`pos-${fluxo.id}`} position={i + 1} />)}
          {posCarga.length === 0 && <div className="text-[9px] text-dim/40 text-center py-4 font-mono">Nenhum em rota</div>}
        </DropZone>
      </div>

      {/* Validation */}
      {fluxo.carga.length === 0 && fluxo.status === 'ATIVO' && (
        <div className="mx-4 mb-3 px-3 py-2 rounded-lg bg-crit/5 border border-crit/20 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-crit flex-shrink-0" />
          <span className="text-[9px] text-crit font-mono">Este fluxo precisa de pelo menos 1 equipamento de carga para operar</span>
        </div>
      )}
    </div>
  )
}

/* ─── SANKEY VIEW ─── */
function SankeyView({ fluxos, alocacoes }: { fluxos: Fluxo[]; alocacoes: Record<number, EquipAlocado[]> }) {
  const activeFluxos = fluxos.filter(f => f.status === 'ATIVO')

  const origins = useMemo(() => {
    const map: Record<string, { area: string; fluxos: Fluxo[]; totalTon: number }> = {}
    activeFluxos.forEach(f => {
      if (!map[f.origem_area]) map[f.origem_area] = { area: f.origem_area, fluxos: [], totalTon: 0 }
      map[f.origem_area].fluxos.push(f)
      map[f.origem_area].totalTon += f.toneladas_turno
    })
    return Object.values(map)
  }, [activeFluxos])

  const destinations = useMemo(() => {
    const map: Record<string, { area: string; fluxos: Fluxo[]; totalTon: number; totalVol: number }> = {}
    activeFluxos.forEach(f => {
      if (!map[f.destino_area]) map[f.destino_area] = { area: f.destino_area, fluxos: [], totalTon: 0, totalVol: 0 }
      map[f.destino_area].fluxos.push(f)
      map[f.destino_area].totalTon += f.toneladas_turno
      map[f.destino_area].totalVol += f.volume_m3_turno
    })
    return Object.values(map)
  }, [activeFluxos])

  const svgWidth = 960
  const svgHeight = Math.max(origins.length, destinations.length) * 100 + 40
  const boxW = 200
  const boxH = 64
  const leftX = 20
  const rightX = svgWidth - boxW - 20

  const originYs = origins.map((_, i) => 30 + i * 100)
  const destYs = destinations.map((_, i) => 30 + i * 100)

  const connections = useMemo(() => {
    return activeFluxos.map(f => {
      const fromIdx = origins.findIndex(o => o.area === f.origem_area)
      const toIdx = destinations.findIndex(d => d.area === f.destino_area)
      return { fluxo: f, fromIdx, toIdx, equips: (alocacoes[f.id]?.length || 0) + f.carga.length }
    }).filter(c => c.fromIdx >= 0 && c.toIdx >= 0)
  }, [activeFluxos, origins, destinations, alocacoes])

  const totalEquips = Object.values(alocacoes).flat().length
  const totalTons = activeFluxos.reduce((s, f) => s + f.toneladas_turno, 0)

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-sm uppercase tracking-wider text-gray-200">Visao de Fluxo — Origens & Destinos</h2>
          <p className="text-[10px] font-mono text-dim mt-0.5">Linhas conectam origens aos destinos com metricas de ciclo</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-center"><div className="text-lg font-mono font-bold text-brand-400">{activeFluxos.length}</div><div className="text-[8px] text-dim uppercase">Fluxos</div></div>
          <div className="text-center"><div className="text-lg font-mono font-bold text-gray-200">{totalEquips}</div><div className="text-[8px] text-dim uppercase">Equip.</div></div>
          <div className="text-center"><div className="text-lg font-mono font-bold text-ok">{totalTons.toLocaleString()}</div><div className="text-[8px] text-dim uppercase">Ton/turno</div></div>
        </div>
      </div>

      {/* SVG Flow Diagram */}
      <div className="bg-hud-panel/60 border border-hud-border/50 rounded-xl p-6 overflow-x-auto">
        <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="xMidYMid meet">
          {/* Connection lines with metrics */}
          {connections.map((c, i) => {
            const y1 = originYs[c.fromIdx] + boxH / 2
            const y2 = destYs[c.toIdx] + boxH / 2
            const x1 = leftX + boxW + 4
            const x2 = rightX - 4
            const midX = (x1 + x2) / 2
            const midY = (y1 + y2) / 2
            const color = MATERIAL_COLORS[c.fluxo.material] || '#6366f1'
            // Offset multiple lines from same origin slightly
            const offsetY = i * 2 - connections.length
            return (
              <g key={i} className="group">
                <path d={`M ${x1} ${y1} C ${midX} ${y1 + offsetY}, ${midX} ${y2 + offsetY}, ${x2} ${y2}`}
                  fill="none" stroke={color} strokeWidth="2" opacity="0.55"
                  className="transition-all duration-200 group-hover:opacity-100 group-hover:[stroke-width:3]" />
                {/* Metrics label (always visible) */}
                <text x={midX} y={midY - 10 + offsetY} textAnchor="middle" style={{ fontSize: 8.5, fontFamily: 'JetBrains Mono', fill: color, opacity: 0.85 }}>
                  {c.fluxo.nome} • {c.fluxo.dist_cheia_km}km • {c.fluxo.tempo_ciclo_medio_min}min
                </text>
                <text x={midX} y={midY + 2 + offsetY} textAnchor="middle" style={{ fontSize: 8, fontFamily: 'JetBrains Mono', fill: 'var(--text-dim, #64748b)' }}>
                  {c.fluxo.toneladas_turno.toLocaleString()}t • {c.fluxo.volume_m3_turno.toLocaleString()}m3
                </text>
                <circle cx={x1} cy={y1} r="3" fill={color} opacity="0.7" />
                <circle cx={x2} cy={y2} r="3" fill={color} opacity="0.7" />
              </g>
            )
          })}

          {/* Origin boxes */}
          {origins.map((o, i) => {
            const y = originYs[i]
            const totalEq = o.fluxos.reduce((s, f) => s + (alocacoes[f.id]?.length || 0) + f.carga.length, 0)
            return (
              <g key={'o-' + i}>
                <rect x={leftX} y={y} width={boxW} height={boxH} rx="8" fill="var(--hud-panel)" stroke="var(--hud-border)" strokeWidth="1.5" />
                <text x={leftX + 12} y={y + 18} style={{ fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 700, fill: 'var(--text-primary, #e2e8f0)' }}>{o.area}</text>
                <text x={leftX + 12} y={y + 34} style={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: 'var(--text-dim, #64748b)' }}>
                  {o.fluxos.length} fluxo{o.fluxos.length > 1 ? 's' : ''} • {totalEq} equip.
                </text>
                <text x={leftX + 12} y={y + 50} style={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#22c55e' }}>
                  {o.totalTon.toLocaleString()} t expedidas
                </text>
                {o.fluxos.map((f, fi) => (
                  <circle key={fi} cx={leftX + boxW - 14 - fi * 14} cy={y + 20} r="5" fill={MATERIAL_COLORS[f.material] || '#6366f1'} opacity="0.85" />
                ))}
              </g>
            )
          })}

          {/* Destination boxes */}
          {destinations.map((d, i) => {
            const y = destYs[i]
            const totalEq = d.fluxos.reduce((s, f) => s + (alocacoes[f.id]?.length || 0) + f.carga.length, 0)
            return (
              <g key={'d-' + i}>
                <rect x={rightX} y={y} width={boxW} height={boxH} rx="8" fill="var(--hud-panel)" stroke="rgba(37,99,235,0.3)" strokeWidth="1.5" />
                <text x={rightX + 12} y={y + 18} style={{ fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 700, fill: 'var(--text-primary, #e2e8f0)' }}>{d.area}</text>
                <text x={rightX + 12} y={y + 34} style={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: 'var(--text-dim, #64748b)' }}>
                  {d.fluxos.length} recebendo • {totalEq} equip.
                </text>
                <text x={rightX + 12} y={y + 50} style={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#3b82f6' }}>
                  {d.totalTon.toLocaleString()} t • {d.totalVol.toLocaleString()} m3
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(MATERIAL_COLORS).map(([mat, color]) => (
          <div key={mat} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: color }}></div>
            <span className="text-[9px] font-mono text-dim">{mat}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── MAIN COMPONENT ─── */
export default function Alocacao() {
  const [tab, setTab] = useState<'fluxos' | 'sankey'>('fluxos')
  const [fluxos, setFluxos] = useState(initFluxos)
  const [alocacoes, setAlocacoes] = useState(initAlocacoes)
  const [pool, setPool] = useState(initPool)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editFluxo, setEditFluxo] = useState<Fluxo | null>(null)
  const [confirmDel, setConfirmDel] = useState<Fluxo | null>(null)
  const [form, setForm] = useState({ nome:'', origem_area:'', origem_subarea:'', material:'', destino_area:'', destino_subarea:'' })

  const openFluxoDrawer = useCallback((f?: Fluxo) => {
    if (f) { setEditFluxo(f); setForm({ nome: f.nome, origem_area: f.origem_area, origem_subarea: f.origem_subarea, material: f.material, destino_area: f.destino_area, destino_subarea: f.destino_subarea }) }
    else { setEditFluxo(null); setForm({ nome:'', origem_area:'', origem_subarea:'', material:'', destino_area:'', destino_subarea:'' }) }
    setDrawerOpen(true)
  }, [])

  const saveFluxo = useCallback(() => {
    if (!form.nome || !form.origem_area || !form.destino_area || !form.material) { toast('Preencha todos campos obrigatorios', 'warn'); return }
    if (editFluxo) {
      setFluxos(prev => prev.map(f => f.id === editFluxo.id ? { ...f, ...form } : f))
      toast('Fluxo atualizado', 'ok')
    } else {
      const newF: Fluxo = { id: Date.now(), ...form, status: 'PAUSADO', carga: [], dist_cheia_km: 0, dist_vazia_km: 0, tempo_ciclo_medio_min: 0, meta_viagens_turno: 0, toneladas_turno: 0, volume_m3_turno: 0 }
      setFluxos(prev => [...prev, newF])
      setAlocacoes(prev => ({ ...prev, [newF.id]: [] }))
      toast('Fluxo criado', 'info')
    }
    setDrawerOpen(false)
  }, [form, editFluxo])

  const toggleFluxo = useCallback((f: Fluxo) => {
    if (f.status === 'PAUSADO' && f.carga.length === 0) { toast('Precisa de pelo menos 1 maquina de carga!', 'crit'); return }
    setFluxos(prev => prev.map(x => x.id === f.id ? { ...x, status: x.status === 'ATIVO' ? 'PAUSADO' : 'ATIVO' } : x))
    toast(f.status === 'ATIVO' ? 'Fluxo pausado' : 'Fluxo ativado', 'ok')
  }, [])

  const deleteFluxo = useCallback(() => {
    if (!confirmDel) return
    setFluxos(prev => prev.filter(f => f.id !== confirmDel.id))
    setAlocacoes(prev => { const next = { ...prev }; delete next[confirmDel.id]; return next })
    toast('Fluxo removido', 'ok')
    setConfirmDel(null)
  }, [confirmDel])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const sourceZone = (active.data.current as any)?.zone as string
    const targetZone = over.id as string
    const equip = (active.data.current as any)?.equip
    if (sourceZone === targetZone) return

    if (sourceZone === 'pool' && targetZone.startsWith('carga-')) {
      const fluxoId = parseInt(targetZone.replace('carga-', ''))
      const poolEquip = equip as EquipDisponivel
      if (poolEquip.grupo !== 'CARGA') { toast('Somente equipamentos de CARGA nesta zona', 'warn'); return }
      setPool(prev => prev.filter(p => p.cod !== poolEquip.cod))
      setFluxos(prev => prev.map(f => f.id === fluxoId ? { ...f, carga: [...f.carga, { id: poolEquip.cod, cod: poolEquip.cod, tipo: poolEquip.tipo, modelo: poolEquip.modelo, status: 'CARREGANDO' as const, viagens: 0, eta_min: 0 }] } : f))
      toast(poolEquip.cod + ' alocado como carga', 'ok')
    } else if (sourceZone === 'pool' && (targetZone.startsWith('pre-') || targetZone.startsWith('pos-'))) {
      const fluxoId = parseInt(targetZone.split('-')[1])
      const poolEquip = equip as EquipDisponivel
      if (poolEquip.grupo === 'CARGA') { toast('Maquinas de carga devem ir no Carregamento (centro)', 'warn'); return }
      setPool(prev => prev.filter(p => p.cod !== poolEquip.cod))
      const status = targetZone.startsWith('pre-') ? 'EM_FILA' as const : 'EM_ROTA' as const
      const newAloc: EquipAlocado = { id: poolEquip.cod, cod: poolEquip.cod, tipo: poolEquip.tipo, modelo: poolEquip.modelo, status, viagens: 0, eta_min: Math.floor(Math.random() * 12) + 1 }
      setAlocacoes(prev => ({ ...prev, [fluxoId]: [...(prev[fluxoId] || []), newAloc] }))
      toast(poolEquip.cod + ' alocado', 'ok')
    } else if (targetZone === 'pool') {
      const alocEquip = equip as EquipAlocado
      const fluxoId = parseInt(sourceZone.split('-')[1])
      if (sourceZone.startsWith('carga-')) {
        setFluxos(prev => prev.map(f => f.id === fluxoId ? { ...f, carga: f.carga.filter(c => c.id !== alocEquip.id) } : f))
      } else {
        setAlocacoes(prev => ({ ...prev, [fluxoId]: (prev[fluxoId] || []).filter(a => a.id !== alocEquip.id) }))
      }
      setPool(prev => [...prev, { cod: alocEquip.cod, tipo: alocEquip.tipo, modelo: alocEquip.modelo, grupo: sourceZone.startsWith('carga-') ? 'CARGA' as const : 'TRANSPORTE' as const }])
      toast(alocEquip.cod + ' devolvido ao pool', 'ok')
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <div className="h-full flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 pt-3 flex-shrink-0">
            <button onClick={() => setTab('fluxos')} className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase rounded-t-lg border border-b-0 transition-all ${tab === 'fluxos' ? 'text-brand-400 bg-hud-panel border-hud-border' : 'text-dim border-transparent hover:text-gray-300'}`}>
              <Workflow className="w-3 h-3" />Fluxos & Alocacoes
            </button>
            <button onClick={() => setTab('sankey')} className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase rounded-t-lg border border-b-0 transition-all ${tab === 'sankey' ? 'text-brand-400 bg-hud-panel border-hud-border' : 'text-dim border-transparent hover:text-gray-300'}`}>
              <BarChart3 className="w-3 h-3" />Visao Sankey
            </button>
          </div>

          <div className="flex-1 overflow-hidden border-t border-hud-border">
            {tab === 'fluxos' ? (
              <div className="h-full overflow-y-auto p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-sm uppercase tracking-wider text-gray-200">Alocacao de Frota</h2>
                    <p className="text-[10px] font-mono text-dim mt-0.5">Pipeline: Fila → Carregamento → Destino • Ordenado por ETA</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-dim"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>TEMPO REAL</div>
                    <button onClick={() => openFluxoDrawer()} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase text-brand-400 bg-brand-600/10 border border-brand-600/30 rounded-md hover:shadow-glow-sm transition-all"><Plus className="w-3 h-3"/>Novo Fluxo</button>
                  </div>
                </div>
                <div className="space-y-4">
                  {fluxos.map(f => (
                    <PipelineCard key={f.id} fluxo={f} alocados={alocacoes[f.id] || []}
                      onEdit={() => openFluxoDrawer(f)} onToggle={() => toggleFluxo(f)} onDelete={() => setConfirmDel(f)} />
                  ))}
                </div>
              </div>
            ) : (
              <SankeyView fluxos={fluxos} alocacoes={alocacoes} />
            )}
          </div>
        </div>

        {/* Pool sidebar */}
        <div className="w-[220px] flex-shrink-0 border-l border-hud-border/50 flex flex-col bg-hud-panel/40 overflow-hidden">
          <div className="px-3 py-3 border-b border-hud-border/30">
            <h3 className="text-[9px] font-display uppercase tracking-widest text-brand-400">Pool Disponivel</h3>
            <p className="text-[8px] text-dim mt-0.5">Arraste para um fluxo</p>
          </div>
          <DropZone id="pool" className="flex-1 overflow-y-auto m-2 !border-0 !bg-transparent !min-h-0">
            {pool.filter(p => p.grupo === 'CARGA').length > 0 && (
              <div className="mb-3">
                <div className="text-[8px] font-display uppercase tracking-widest text-purple-400 mb-1 px-1">Maquinas de Carga</div>
                {pool.filter(p => p.grupo === 'CARGA').map(p => <DraggableEquip key={p.cod} equip={p} zone="pool" />)}
              </div>
            )}
            <div>
              <div className="text-[8px] font-display uppercase tracking-widest text-dim mb-1 px-1">Transporte</div>
              {pool.filter(p => p.grupo === 'TRANSPORTE').map(p => <DraggableEquip key={p.cod} equip={p} zone="pool" />)}
            </div>
          </DropZone>
          <div className="px-3 py-3 border-t border-hud-border/30">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-hud-bg rounded-lg p-2 text-center border border-hud-border/30">
                <div className="text-lg font-mono font-bold text-brand-400">{fluxos.filter(f=>f.status==='ATIVO').length}</div>
                <div className="text-[7px] text-dim uppercase">Fluxos</div>
              </div>
              <div className="bg-hud-bg rounded-lg p-2 text-center border border-hud-border/30">
                <div className="text-lg font-mono font-bold text-gray-200">{Object.values(alocacoes).flat().length}</div>
                <div className="text-[7px] text-dim uppercase">Alocados</div>
              </div>
              <div className="bg-hud-bg rounded-lg p-2 text-center border border-hud-border/30">
                <div className="text-lg font-mono font-bold text-blue-400">{Object.values(alocacoes).flat().filter(a=>a.status==='EM_ROTA').length}</div>
                <div className="text-[7px] text-dim uppercase">Em Rota</div>
              </div>
              <div className="bg-hud-bg rounded-lg p-2 text-center border border-hud-border/30">
                <div className="text-lg font-mono font-bold text-green-400">{pool.length}</div>
                <div className="text-[7px] text-dim uppercase">Disponiveis</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editFluxo ? 'Editar Fluxo' : 'Novo Fluxo'} subtitle="Origem, destino e material">
        <FormSection title="Identificacao">
          <FormGrid cols={1}>
            <div className="space-y-1">
              <label className="text-[9px] font-display uppercase tracking-widest text-dim">Nome</label>
              <input value={form.nome} onChange={e => setForm(p => ({...p, nome: e.target.value}))} placeholder="F-005" className="w-full px-3 py-2 bg-hud-bg border border-hud-border rounded-lg text-xs font-mono text-gray-200 placeholder:text-dim focus:outline-none focus:border-brand-600" />
            </div>
          </FormGrid>
        </FormSection>
        <FormSection title="Origem">
          <FormGrid cols={1}>
            <Select label="Area de Origem" value={form.origem_area} onChange={v => setForm(p => ({...p, origem_area: v}))} options={AREAS.map(a => ({value:a,label:a}))} />
            <Select label="Material" value={form.material} onChange={v => setForm(p => ({...p, material: v}))} options={MATERIAIS.map(m => ({value:m,label:m}))} />
          </FormGrid>
        </FormSection>
        <FormSection title="Destino">
          <FormGrid cols={1}>
            <Select label="Area de Destino" value={form.destino_area} onChange={v => setForm(p => ({...p, destino_area: v}))} options={AREAS.map(a => ({value:a,label:a}))} />
          </FormGrid>
        </FormSection>
        <div className="pt-4">
          <button onClick={saveFluxo} className="w-full py-2.5 bg-brand-600 text-white text-xs font-mono uppercase rounded-lg hover:bg-brand-500 transition-colors">
            {editFluxo ? 'Salvar' : 'Criar Fluxo'}
          </button>
        </div>
      </Drawer>
      <ConfirmDialog open={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={deleteFluxo} title="Excluir Fluxo" message={`Excluir ${confirmDel?.nome}? Equipamentos voltam ao pool.`} />
    </DndContext>
  )
}
