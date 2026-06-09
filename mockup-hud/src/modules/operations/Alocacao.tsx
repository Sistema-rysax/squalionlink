import { useState, useCallback, useMemo } from 'react'
import { DndContext, DragOverlay, useDraggable, useDroppable, closestCenter, DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Select, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'
import { ArrowRight, Plus, Trash2, Truck, Edit2, Pause, Play, GripVertical, Loader, ChevronRight, AlertTriangle, BarChart3, Workflow } from 'lucide-react'

/* ─── TYPES ─── */
interface Fluxo {
  id: number; nome: string
  origem_area: string; origem_subarea: string; material: string
  destino_area: string; destino_subarea: string
  status: 'ATIVO' | 'PAUSADO'
  carga: EquipAlocado[]  // máquinas de carga (centro)
}

interface EquipAlocado {
  id: string; cod: string; tipo: string; modelo: string
  status: 'EM_FILA' | 'CARREGANDO' | 'EM_ROTA' | 'DESCARREGANDO' | 'AGUARDANDO' | 'ALOCADO'
  viagens: number; tempoEtapa?: string
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
    carga: [{ id:'esc-01', cod:'ESC-01', tipo:'Escavadeira', modelo:'PC5500', status:'CARREGANDO', viagens:0 }]
  },
  { id:2, nome:'F-002', origem_area:'Frente Sul A1', origem_subarea:'Praca Carga B', material:'Esteril', destino_area:'Pilha Esteril', destino_subarea:'Setor 2', status:'ATIVO',
    carga: [{ id:'esc-02', cod:'ESC-02', tipo:'Escavadeira', modelo:'CAT 6060', status:'CARREGANDO', viagens:0 }]
  },
  { id:3, nome:'F-003', origem_area:'Frente Norte B3', origem_subarea:'Bancada N2', material:'Hematita', destino_area:'Pilha ROM', destino_subarea:'Setor A', status:'ATIVO',
    carga: [{ id:'car-01', cod:'CAR-01', tipo:'Carregadeira', modelo:'CAT 994K', status:'CARREGANDO', viagens:0 }]
  },
  { id:4, nome:'F-004', origem_area:'Frente Oeste C2', origem_subarea:'Bancada W1', material:'Canga', destino_area:'Barragem', destino_subarea:'Descarga Norte', status:'PAUSADO',
    carga: []
  },
]

// Caminhões alocados por fluxo
const initAlocacoes: Record<number, EquipAlocado[]> = {
  1: [
    { id:'cam-01', cod:'CAT-773F-01', tipo:'Caminhao', modelo:'773F', status:'EM_FILA', viagens:12, tempoEtapa:'3 min' },
    { id:'cam-02', cod:'CAT-773F-02', tipo:'Caminhao', modelo:'773F', status:'EM_ROTA', viagens:10, tempoEtapa:'8 min' },
    { id:'cam-07', cod:'CAT-773F-04', tipo:'Caminhao', modelo:'773F', status:'ALOCADO', viagens:11, tempoEtapa:'2 min' },
  ],
  2: [
    { id:'cam-03', cod:'CAT-773F-03', tipo:'Caminhao', modelo:'773F', status:'EM_ROTA', viagens:8, tempoEtapa:'6 min' },
    { id:'cam-04', cod:'CAT-777G-01', tipo:'Caminhao', modelo:'777G', status:'EM_FILA', viagens:6, tempoEtapa:'4 min' },
  ],
  3: [
    { id:'cam-05', cod:'CAT-777G-02', tipo:'Caminhao', modelo:'777G', status:'EM_ROTA', viagens:9, tempoEtapa:'7 min' },
    { id:'cam-06', cod:'VOLVO-A40G-01', tipo:'Caminhao', modelo:'A40G', status:'AGUARDANDO', viagens:7, tempoEtapa:'1 min' },
  ],
  4: [],
}

const initPool: EquipDisponivel[] = [
  { cod:'CAT-773F-05', tipo:'Caminhao', modelo:'773F', grupo:'TRANSPORTE' },
  { cod:'CAT-777G-03', tipo:'Caminhao', modelo:'777G', grupo:'TRANSPORTE' },
  { cod:'VOLVO-A40G-02', tipo:'Articulado', modelo:'A40G', grupo:'TRANSPORTE' },
  { cod:'KOMATSU-HD785-01', tipo:'Caminhao', modelo:'HD785', grupo:'TRANSPORTE' },
  { cod:'ESC-03', tipo:'Escavadeira', modelo:'PC4000', grupo:'CARGA' },
  { cod:'CAR-02', tipo:'Carregadeira', modelo:'WA600', grupo:'CARGA' },
]

/* ─── DRAGGABLE EQUIP CARD ─── */
function DraggableEquip({ equip, zone }: { equip: EquipAlocado | EquipDisponivel; zone: string }) {
  const id = 'cod' in equip ? equip.cod + '-' + zone : (equip as EquipAlocado).id
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, data: { equip, zone } })
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)`, opacity: isDragging ? 0.4 : 1 } : undefined

  const isPool = !('status' in equip)
  const statusColor = isPool ? 'border-brand-600/30 bg-brand-600/5' :
    (equip as EquipAlocado).status === 'EM_FILA' ? 'border-amber-500/30 bg-amber-500/5' :
    (equip as EquipAlocado).status === 'EM_ROTA' ? 'border-blue-500/30 bg-blue-500/5' :
    (equip as EquipAlocado).status === 'CARREGANDO' ? 'border-green-500/30 bg-green-500/5' :
    (equip as EquipAlocado).status === 'AGUARDANDO' ? 'border-gray-500/30 bg-gray-500/5' :
    'border-hud-border bg-hud-bg'

  const statusLabel = isPool ? ('grupo' in equip ? (equip as EquipDisponivel).grupo === 'CARGA' ? 'CARGA' : 'LIVRE' : 'LIVRE') :
    (equip as EquipAlocado).status

  const statusBadgeColor = statusLabel === 'EM_FILA' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
    statusLabel === 'EM_ROTA' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
    statusLabel === 'CARREGANDO' ? 'bg-green-500/15 text-green-400 border-green-500/30' :
    statusLabel === 'AGUARDANDO' ? 'bg-gray-500/15 text-gray-400 border-gray-500/30' :
    statusLabel === 'CARGA' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' :
    'bg-brand-600/10 text-brand-400 border-brand-600/30'

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${statusColor}`}>
      <GripVertical className="w-3 h-3 text-dim/50 flex-shrink-0" />
      <Truck className="w-3.5 h-3.5 text-dim flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-mono font-bold text-gray-200 truncate">{isPool ? equip.cod : (equip as EquipAlocado).cod}</div>
        <div className="text-[8px] text-dim">{isPool ? (equip as EquipDisponivel).modelo : (equip as EquipAlocado).modelo}</div>
      </div>
      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border flex-shrink-0 ${statusBadgeColor}`}>{statusLabel}</span>
      {!isPool && (equip as EquipAlocado).viagens > 0 && <span className="text-[8px] font-mono text-dim flex-shrink-0">{(equip as EquipAlocado).viagens}v</span>}
    </div>
  )
}

/* ─── DROPPABLE ZONE ─── */
function DropZone({ id, children, label, className = '' }: { id: string; children: React.ReactNode; label?: string; className?: string }) {
  const { isOver, setNodeRef } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className={`rounded-lg border-2 border-dashed transition-all min-h-[80px] p-2 ${isOver ? 'border-brand-400/60 bg-brand-600/5 scale-[1.01]' : 'border-hud-border/30 bg-hud-bg/30'} ${className}`}>
      {label && <div className="text-[8px] font-display uppercase tracking-widest text-dim mb-1.5 text-center">{label}</div>}
      <div className="space-y-1.5">{children}</div>
      {!children || (Array.isArray(children) && children.filter(Boolean).length === 0) && (
        <div className="text-[9px] text-dim/50 text-center py-3 font-mono">Arraste aqui</div>
      )}
    </div>
  )
}

/* ─── PIPELINE FLOW CARD ─── */
function PipelineCard({ fluxo, alocados, onEdit, onToggle, onDelete }: { fluxo: Fluxo; alocados: EquipAlocado[]; onEdit: () => void; onToggle: () => void; onDelete: () => void }) {
  const preCarga = alocados.filter(a => ['EM_FILA', 'AGUARDANDO'].includes(a.status))
  const posCarga = alocados.filter(a => ['EM_ROTA', 'ALOCADO', 'DESCARREGANDO', 'CARREGANDO'].includes(a.status))
  const matColor = MATERIAL_COLORS[fluxo.material] || '#6b7280'
  const isActive = fluxo.status === 'ATIVO'

  return (
    <div className={`rounded-xl border transition-all ${isActive ? 'border-hud-border/60 bg-hud-panel/60' : 'border-hud-border/30 bg-hud-panel/30 opacity-60'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-hud-border/30">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.5)]' : 'bg-gray-500'}`}></div>
          <span className="font-mono text-sm font-bold text-brand-400">{fluxo.nome}</span>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-dim">ORIGEM</span>
            <span className="text-gray-300 font-medium">{fluxo.origem_area}</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono border" style={{ color: matColor, borderColor: matColor + '40', background: matColor + '10' }}>{fluxo.material}</span>
            <ArrowRight className="w-3 h-3 text-dim" />
            <span className="text-dim">DESTINO</span>
            <span className="text-gray-300 font-medium">{fluxo.destino_area}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-dim">{alocados.length + fluxo.carga.length} equip.</span>
          <button onClick={onToggle} className={`flex items-center gap-1 px-2 py-1 text-[9px] font-mono rounded border transition-all ${isActive ? 'text-amber-400 border-amber-400/30 hover:bg-amber-400/10' : 'text-green-400 border-green-400/30 hover:bg-green-400/10'}`}>
            {isActive ? <><Pause className="w-2.5 h-2.5"/>Pausar</> : <><Play className="w-2.5 h-2.5"/>Ativar</>}
          </button>
          <button onClick={onEdit} className="p-1 text-dim hover:text-brand-400 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1 text-dim hover:text-crit transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Pipeline: [PRE-CARGA] [CARGA CENTER] [POS-CARGA] */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 p-4">
        {/* LEFT: Pre-carga (fila, aguardando) */}
        <DropZone id={`pre-${fluxo.id}`} label="Fila / Aguardando">
          {preCarga.map(eq => <DraggableEquip key={eq.id} equip={eq} zone={`pre-${fluxo.id}`} />)}
        </DropZone>

        {/* CENTER: Máquinas de carga */}
        <div className="flex flex-col items-center justify-center">
          <DropZone id={`carga-${fluxo.id}`} label="Carregamento" className="min-w-[160px]">
            {fluxo.carga.length > 0 ? fluxo.carga.map(eq => (
              <div key={eq.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-green-500/40 bg-green-500/10">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <div className="flex-1">
                  <div className="text-[10px] font-mono font-bold text-green-400">{eq.cod}</div>
                  <div className="text-[8px] text-dim">{eq.modelo}</div>
                </div>
                <Loader className="w-3 h-3 text-green-400 animate-spin" />
              </div>
            )) : (
              <div className="flex items-center gap-2 py-3 px-2 text-center">
                <AlertTriangle className="w-3.5 h-3.5 text-crit" />
                <span className="text-[9px] text-crit font-mono">Sem maquina de carga!</span>
              </div>
            )}
          </DropZone>
          {/* Arrows */}
          <div className="flex items-center gap-1 mt-2">
            <ChevronRight className="w-3 h-3 text-dim rotate-180" />
            <span className="text-[8px] text-dim font-mono">FLUXO</span>
            <ChevronRight className="w-3 h-3 text-dim" />
          </div>
        </div>

        {/* RIGHT: Pos-carga (em rota, descarregando) */}
        <DropZone id={`pos-${fluxo.id}`} label="Em Rota / Destino">
          {posCarga.map(eq => <DraggableEquip key={eq.id} equip={eq} zone={`pos-${fluxo.id}`} />)}
        </DropZone>
      </div>

      {/* Validation warning */}
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
    const map: Record<string, { area: string; fluxos: { id: number; destino: string; material: string; equips: number }[] }> = {}
    activeFluxos.forEach(f => {
      if (!map[f.origem_area]) map[f.origem_area] = { area: f.origem_area, fluxos: [] }
      map[f.origem_area].fluxos.push({ id: f.id, destino: f.destino_area, material: f.material, equips: (alocacoes[f.id]?.length || 0) + f.carga.length })
    })
    return Object.values(map)
  }, [activeFluxos, alocacoes])

  const destinations = useMemo(() => {
    const set = new Set<string>()
    activeFluxos.forEach(f => set.add(f.destino_area))
    return Array.from(set)
  }, [activeFluxos])

  const svgWidth = 900
  const svgHeight = Math.max(origins.length, destinations.length) * 85 + 40
  const boxW = 185
  const boxH = 52
  const leftX = 20
  const rightX = svgWidth - boxW - 20

  const originYs = origins.map((_, i) => 30 + i * 85)
  const destYs = destinations.map((_, i) => 30 + i * 85)

  const connections = useMemo(() => {
    const conns: { fromIdx: number; toIdx: number; material: string; equips: number; fluxoNome: string }[] = []
    activeFluxos.forEach(f => {
      const fromIdx = origins.findIndex(o => o.area === f.origem_area)
      const toIdx = destinations.indexOf(f.destino_area)
      if (fromIdx >= 0 && toIdx >= 0) {
        conns.push({ fromIdx, toIdx, material: f.material, equips: (alocacoes[f.id]?.length || 0) + f.carga.length, fluxoNome: f.nome })
      }
    })
    return conns
  }, [activeFluxos, origins, destinations, alocacoes])

  const totalEquips = Object.values(alocacoes).flat().length

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-sm uppercase tracking-wider text-gray-200">Visao de Fluxo — Origens & Destinos</h2>
          <p className="text-[10px] font-mono text-dim mt-0.5">Linhas conectam areas de origem aos destinos (cor = material)</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center"><div className="text-lg font-mono font-bold text-brand-400">{activeFluxos.length}</div><div className="text-[8px] text-dim uppercase">Fluxos Ativos</div></div>
          <div className="text-center"><div className="text-lg font-mono font-bold text-gray-200">{totalEquips}</div><div className="text-[8px] text-dim uppercase">Equip. Alocados</div></div>
        </div>
      </div>

      {/* SVG Flow Diagram */}
      <div className="bg-hud-panel/60 border border-hud-border/50 rounded-xl p-6 overflow-x-auto">
        <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="xMidYMid meet">
          {/* Thin curved connection lines */}
          {connections.map((c, i) => {
            const y1 = originYs[c.fromIdx] + boxH / 2
            const y2 = destYs[c.toIdx] + boxH / 2
            const x1 = leftX + boxW + 4
            const x2 = rightX - 4
            const midX = (x1 + x2) / 2
            const color = MATERIAL_COLORS[c.material] || '#6366f1'
            return (
              <g key={i} className="group">
                <path d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                  fill="none" stroke={color} strokeWidth="2" opacity="0.6"
                  className="transition-all duration-200 group-hover:opacity-100 group-hover:[stroke-width:3]" />
                {/* Label on hover */}
                <text x={midX} y={(y1 + y2) / 2 - 8} textAnchor="middle"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: color }}>
                  {c.fluxoNome} • {c.equips} equip.
                </text>
                <circle cx={x1} cy={y1} r="3" fill={color} opacity="0.7" />
                <circle cx={x2} cy={y2} r="3" fill={color} opacity="0.7" />
              </g>
            )
          })}

          {/* Origin boxes (left side) */}
          {origins.map((o, i) => {
            const y = originYs[i]
            const totalEq = o.fluxos.reduce((s, f) => s + f.equips, 0)
            return (
              <g key={'o-' + i}>
                <rect x={leftX} y={y} width={boxW} height={boxH} rx="6"
                  fill="var(--hud-panel)" stroke="var(--hud-border)" strokeWidth="1.5" />
                <text x={leftX + 12} y={y + 21} style={{ fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 700, fill: 'var(--text-primary, #e2e8f0)' }}>{o.area}</text>
                <text x={leftX + 12} y={y + 38} style={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: 'var(--text-dim, #64748b)' }}>
                  {o.fluxos.length} fluxo{o.fluxos.length > 1 ? 's' : ''} • {totalEq} equip.
                </text>
                {/* Material dots */}
                {o.fluxos.map((f, fi) => (
                  <circle key={fi} cx={leftX + boxW - 14 - fi * 14} cy={y + boxH / 2} r="4.5" fill={MATERIAL_COLORS[f.material] || '#6366f1'} opacity="0.85" />
                ))}
              </g>
            )
          })}

          {/* Destination boxes (right side) */}
          {destinations.map((d, i) => {
            const y = destYs[i]
            const incoming = activeFluxos.filter(f => f.destino_area === d)
            const totalEq = incoming.reduce((s, f) => s + (alocacoes[f.id]?.length || 0) + f.carga.length, 0)
            return (
              <g key={'d-' + i}>
                <rect x={rightX} y={y} width={boxW} height={boxH} rx="6"
                  fill="var(--hud-panel)" stroke="rgba(37,99,235,0.3)" strokeWidth="1.5" />
                <text x={rightX + 12} y={y + 21} style={{ fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 700, fill: 'var(--text-primary, #e2e8f0)' }}>{d}</text>
                <text x={rightX + 12} y={y + 38} style={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: 'var(--text-dim, #64748b)' }}>
                  {incoming.length} recebendo • {totalEq} equip.
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Material legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(MATERIAL_COLORS).map(([mat, color]) => (
          <div key={mat} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: color }}></div>
            <span className="text-[9px] font-mono text-dim">{mat}</span>
          </div>
        ))}
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-2 gap-3">
        {activeFluxos.map(f => {
          const equips = alocacoes[f.id] || []
          return (
            <div key={f.id} className="bg-hud-bg/50 border border-hud-border/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-[10px] font-mono font-bold text-brand-400">{f.nome}</span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono" style={{ color: MATERIAL_COLORS[f.material], background: MATERIAL_COLORS[f.material] + '15' }}>{f.material}</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-dim">
                <span>{f.origem_area}</span><ArrowRight className="w-2.5 h-2.5" /><span>{f.destino_area}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-[9px] font-mono">
                <span className="text-gray-300">{f.carga.length} carga</span>
                <span className="text-gray-300">{equips.length} transporte</span>
                <span className="text-dim">{equips.reduce((s,e) => s + e.viagens, 0)} viagens</span>
              </div>
            </div>
          )
        })}
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
  const [activeId, setActiveId] = useState<string | null>(null)
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
      const newF: Fluxo = { id: Date.now(), ...form, status: 'PAUSADO', carga: [] }
      setFluxos(prev => [...prev, newF])
      setAlocacoes(prev => ({ ...prev, [newF.id]: [] }))
      toast('Fluxo criado — adicione uma maquina de carga para ativar', 'info')
    }
    setDrawerOpen(false)
  }, [form, editFluxo])

  const toggleFluxo = useCallback((f: Fluxo) => {
    if (f.status === 'PAUSADO' && f.carga.length === 0) {
      toast('Fluxo precisa de pelo menos 1 maquina de carga!', 'crit')
      return
    }
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

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => { setActiveId(event.active.id as string) }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const sourceZone = (active.data.current as any)?.zone as string
    const targetZone = over.id as string
    const equip = (active.data.current as any)?.equip

    if (sourceZone === targetZone) return

    // Pool → Flow zone
    if (sourceZone === 'pool' && targetZone.startsWith('carga-')) {
      const fluxoId = parseInt(targetZone.split('-')[1])
      const poolEquip = equip as EquipDisponivel
      if (poolEquip.grupo !== 'CARGA') { toast('Somente equipamentos de CARGA nesta zona', 'warn'); return }
      // Move from pool to flow carga
      setPool(prev => prev.filter(p => p.cod !== poolEquip.cod))
      setFluxos(prev => prev.map(f => f.id === fluxoId ? { ...f, carga: [...f.carga, { id: poolEquip.cod, cod: poolEquip.cod, tipo: poolEquip.tipo, modelo: poolEquip.modelo, status: 'CARREGANDO', viagens: 0 }] } : f))
      toast(poolEquip.cod + ' alocado como carga', 'ok')
    } else if (sourceZone === 'pool' && (targetZone.startsWith('pre-') || targetZone.startsWith('pos-'))) {
      const fluxoId = parseInt(targetZone.split('-')[1])
      const poolEquip = equip as EquipDisponivel
      if (poolEquip.grupo === 'CARGA') { toast('Maquinas de carga devem ir na zona de Carregamento (centro)', 'warn'); return }
      // Move from pool to flow transport
      setPool(prev => prev.filter(p => p.cod !== poolEquip.cod))
      const newAloc: EquipAlocado = { id: poolEquip.cod, cod: poolEquip.cod, tipo: poolEquip.tipo, modelo: poolEquip.modelo, status: targetZone.startsWith('pre-') ? 'EM_FILA' : 'EM_ROTA', viagens: 0 }
      setAlocacoes(prev => ({ ...prev, [fluxoId]: [...(prev[fluxoId] || []), newAloc] }))
      toast(poolEquip.cod + ' alocado ao fluxo', 'ok')
    }
    // Flow zone → Pool (remove from flow)
    else if (targetZone === 'pool' && !sourceZone.startsWith('pool')) {
      const alocEquip = equip as EquipAlocado
      if (alocEquip.status === 'EM_ROTA') { toast('Equipamento em rota! Confirme antes de remover.', 'warn'); return }
      const fluxoId = parseInt(sourceZone.split('-')[1])
      if (sourceZone.startsWith('carga-')) {
        setFluxos(prev => prev.map(f => f.id === fluxoId ? { ...f, carga: f.carga.filter(c => c.id !== alocEquip.id) } : f))
      } else {
        setAlocacoes(prev => ({ ...prev, [fluxoId]: (prev[fluxoId] || []).filter(a => a.id !== alocEquip.id) }))
      }
      setPool(prev => [...prev, { cod: alocEquip.cod, tipo: alocEquip.tipo, modelo: alocEquip.modelo, grupo: sourceZone.startsWith('carga-') ? 'CARGA' : 'TRANSPORTE' }])
      toast(alocEquip.cod + ' devolvido ao pool', 'ok')
    }
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <div className="h-full flex overflow-hidden">
        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab switcher */}
          <div className="flex items-center gap-1 px-4 pt-3 pb-0 flex-shrink-0">
            <button onClick={() => setTab('fluxos')} className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase rounded-t-lg border border-b-0 transition-all ${tab === 'fluxos' ? 'text-brand-400 bg-hud-panel border-hud-border' : 'text-dim border-transparent hover:text-gray-300'}`}>
              <Workflow className="w-3 h-3" />Fluxos & Alocacoes
            </button>
            <button onClick={() => setTab('sankey')} className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase rounded-t-lg border border-b-0 transition-all ${tab === 'sankey' ? 'text-brand-400 bg-hud-panel border-hud-border' : 'text-dim border-transparent hover:text-gray-300'}`}>
              <BarChart3 className="w-3 h-3" />Visao Sankey
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden border-t border-hud-border">
            {tab === 'fluxos' ? (
              <div className="h-full overflow-y-auto p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-sm uppercase tracking-wider text-gray-200">Alocacao de Frota</h2>
                    <p className="text-[10px] font-mono text-dim mt-0.5">Pipeline: Fila → Carregamento → Destino (drag & drop)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-dim"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>TEMPO REAL</div>
                    <button onClick={() => openFluxoDrawer()} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase text-brand-400 bg-brand-600/10 border border-brand-600/30 rounded-md hover:shadow-glow-sm transition-all"><Plus className="w-3 h-3"/>Novo Fluxo</button>
                  </div>
                </div>

                {/* Pipeline cards */}
                <div className="space-y-4">
                  {fluxos.map(f => (
                    <PipelineCard key={f.id} fluxo={f} alocados={alocacoes[f.id] || []}
                      onEdit={() => openFluxoDrawer(f)}
                      onToggle={() => toggleFluxo(f)}
                      onDelete={() => setConfirmDel(f)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <SankeyView fluxos={fluxos} alocacoes={alocacoes} />
            )}
          </div>
        </div>

        {/* RIGHT: Pool Disponivel */}
        <div className="w-[240px] flex-shrink-0 border-l border-hud-border/50 flex flex-col bg-hud-panel/40 overflow-hidden">
          <div className="px-3 py-3 border-b border-hud-border/30">
            <h3 className="text-[9px] font-display uppercase tracking-widest text-brand-400">Pool Disponivel</h3>
            <p className="text-[8px] text-dim mt-0.5">Arraste para um fluxo</p>
          </div>
          <DropZone id="pool" className="flex-1 overflow-y-auto m-2 !border-0 !bg-transparent !min-h-0">
            {/* Carga */}
            {pool.filter(p => p.grupo === 'CARGA').length > 0 && (
              <div className="mb-3">
                <div className="text-[8px] font-display uppercase tracking-widest text-purple-400 mb-1 px-1">Maquinas de Carga</div>
                {pool.filter(p => p.grupo === 'CARGA').map(p => <DraggableEquip key={p.cod} equip={p} zone="pool" />)}
              </div>
            )}
            {/* Transporte */}
            <div>
              <div className="text-[8px] font-display uppercase tracking-widest text-dim mb-1 px-1">Transporte</div>
              {pool.filter(p => p.grupo === 'TRANSPORTE').map(p => <DraggableEquip key={p.cod} equip={p} zone="pool" />)}
            </div>
          </DropZone>

          {/* Stats */}
          <div className="px-3 py-3 border-t border-hud-border/30">
            <h3 className="text-[9px] font-display uppercase tracking-widest text-dim mb-2">Estatisticas</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-hud-bg rounded-lg p-2 text-center border border-hud-border/30">
                <div className="text-lg font-mono font-bold text-brand-400">{fluxos.filter(f=>f.status==='ATIVO').length}</div>
                <div className="text-[7px] text-dim uppercase">Fluxos Ativos</div>
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

      {/* Drawer for Fluxo CRUD */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editFluxo ? 'Editar Fluxo' : 'Novo Fluxo'} subtitle="Definir origem, destino e material">
        <FormSection title="Identificacao">
          <FormGrid cols={1}>
            <div className="space-y-1">
              <label className="text-[9px] font-display uppercase tracking-widest text-dim">Nome do Fluxo</label>
              <input value={form.nome} onChange={e => setForm(p => ({...p, nome: e.target.value}))} placeholder="Ex: F-005" className="w-full px-3 py-2 bg-hud-bg border border-hud-border rounded-lg text-xs font-mono text-gray-200 placeholder:text-dim focus:outline-none focus:border-brand-600" />
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
            {editFluxo ? 'Salvar Alteracoes' : 'Criar Fluxo'}
          </button>
        </div>
      </Drawer>

      {/* Confirm delete */}
      <ConfirmDialog open={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={deleteFluxo} title="Excluir Fluxo" message={`Deseja excluir o fluxo ${confirmDel?.nome}? Equipamentos alocados serao devolvidos ao pool.`} />
    </DndContext>
  )
}
