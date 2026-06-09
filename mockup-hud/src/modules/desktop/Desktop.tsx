import { useState, useMemo, useCallback } from 'react'
import { IDockviewPanelProps } from 'dockview-react'
import WindowManager, { WindowDef } from '../../components/hud/WindowManager'
import ReactECharts from 'echarts-for-react'
import { useChartTheme } from '../../hooks/useChartTheme'
import { useTheme } from '../../contexts/ThemeContext'

// ===== WINDOW DEFINITIONS =====
const windowDefs: WindowDef[] = [
  { id: 'dashboard', title: 'Dashboard', icon: '📊', component: 'dashboard', defaultWidth: 900, defaultHeight: 560, singleton: true },
  { id: 'mapa', title: 'Mapa', icon: '🗺️', component: 'mapa', defaultWidth: 850, defaultHeight: 580, singleton: true },
  { id: 'frota', title: 'Frota', icon: '🚛', component: 'frota', defaultWidth: 780, defaultHeight: 500, singleton: true },
  { id: 'operadores', title: 'Operadores', icon: '👷', component: 'operadores', defaultWidth: 700, defaultHeight: 460, singleton: true },
  { id: 'alertas', title: 'Central Alertas', icon: '🚨', component: 'alertas', defaultWidth: 680, defaultHeight: 480, singleton: true },
  { id: 'producao', title: 'Produção', icon: '⛏️', component: 'producao', defaultWidth: 800, defaultHeight: 500, singleton: true },
  { id: 'dispatch', title: 'Dispatch', icon: '🎯', component: 'dispatch', defaultWidth: 750, defaultHeight: 520, singleton: true },
  { id: 'abastecimento', title: 'Abastecimento', icon: '⛽', component: 'abastecimento', defaultWidth: 720, defaultHeight: 460, singleton: true },
  { id: 'manutencao', title: 'Manutenção', icon: '🔧', component: 'manutencao', defaultWidth: 750, defaultHeight: 500, singleton: true },
  { id: 'qualidade', title: 'Qualidade', icon: '🧪', component: 'qualidade', defaultWidth: 700, defaultHeight: 480, singleton: true },
  { id: 'mensageria', title: 'Mensagens', icon: '💬', component: 'mensageria', defaultWidth: 640, defaultHeight: 520, singleton: true },
  { id: 'ciclos', title: 'Ciclos', icon: '🔄', component: 'ciclos', defaultWidth: 720, defaultHeight: 460, singleton: true },
]

// ===== SHARED MOCK DATA =====
const equipamentos = [
  { id: 1, codigo: 'CAT-001', modelo: 'CAT 793F', tipo: 'TRANSPORTE', status: 'OPERANDO', operador: 'João Silva', vel: 42, fuel: 78, prod: 1240, lat: -20.12, lng: -43.95, atividade: 'Transporte Carregado' },
  { id: 2, codigo: 'CAT-002', modelo: 'CAT 793F', tipo: 'TRANSPORTE', status: 'OPERANDO', operador: 'Pedro Santos', vel: 38, fuel: 65, prod: 1180, lat: -20.13, lng: -43.94, atividade: 'Transporte Vazio' },
  { id: 3, codigo: 'KOM-003', modelo: 'Komatsu 930E', tipo: 'TRANSPORTE', status: 'MANUTENÇÃO', operador: '-', vel: 0, fuel: 45, prod: 0, lat: -20.11, lng: -43.96, atividade: 'Manutenção Corretiva' },
  { id: 4, codigo: 'CAT-004', modelo: 'CAT 785D', tipo: 'TRANSPORTE', status: 'OPERANDO', operador: 'Maria Oliveira', vel: 35, fuel: 82, prod: 980, lat: -20.14, lng: -43.93, atividade: 'Transporte Carregado' },
  { id: 5, codigo: 'VOL-005', modelo: 'Volvo A60H', tipo: 'TRANSPORTE', status: 'PARADO', operador: 'Carlos Lima', vel: 0, fuel: 91, prod: 0, lat: -20.10, lng: -43.92, atividade: 'Parada Operacional' },
  { id: 6, codigo: 'LIE-006', modelo: 'Liebherr T264', tipo: 'TRANSPORTE', status: 'OPERANDO', operador: 'Ana Costa', vel: 44, fuel: 72, prod: 1350, lat: -20.15, lng: -43.97, atividade: 'Transporte Carregado' },
  { id: 7, codigo: 'CAT-007', modelo: 'CAT 390F', tipo: 'CARGA', status: 'OPERANDO', operador: 'Ricardo Souza', vel: 0, fuel: 88, prod: 2100, lat: -20.12, lng: -43.98, atividade: 'Carregamento' },
  { id: 8, codigo: 'KOM-008', modelo: 'Komatsu PC5500', tipo: 'CARGA', status: 'OPERANDO', operador: 'Fernanda Dias', vel: 0, fuel: 67, prod: 2400, lat: -20.16, lng: -43.91, atividade: 'Carregamento' },
  { id: 9, codigo: 'CAT-009', modelo: 'CAT D11T', tipo: 'APOIO', status: 'FILA', operador: 'Bruno Alves', vel: 0, fuel: 55, prod: 890, lat: -20.13, lng: -43.99, atividade: 'Aguardando Fila' },
  { id: 10, codigo: 'HIT-010', modelo: 'Hitachi EX5600', tipo: 'CARGA', status: 'OPERANDO', operador: 'Lucas Melo', vel: 0, fuel: 73, prod: 2650, lat: -20.17, lng: -43.90, atividade: 'Carregamento' },
]

// ===== PANEL COMPONENTS WITH REAL INTERACTIONS =====

function DashboardPanel(_props: IDockviewPanelProps) {
  const chartTheme = useChartTheme()
  const { theme } = useTheme()
  const [selectedKpi, setSelectedKpi] = useState<number | null>(null)
  const [periodo, setPeriodo] = useState<'turno' | '24h' | 'semana'>('turno')

  const kpis = [
    { label: 'Produção', value: '14.820 t', meta: '15.000 t', pct: 98.8, delta: '+12%', trend: 'up' },
    { label: 'DF Mecânica', value: '91.2%', meta: '90%', pct: 101.3, delta: '+2.1%', trend: 'up' },
    { label: 'Ciclos/h', value: '8.4', meta: '9.0', pct: 93.3, delta: '-0.6', trend: 'down' },
    { label: 'Vel. Média', value: '38 km/h', meta: '35 km/h', pct: 108.6, delta: '+3', trend: 'up' },
  ]

  const prodHours = periodo === 'turno' ? ['06','07','08','09','10','11','12','13','14'] : periodo === '24h' ? ['00','04','08','12','16','20'] : ['Seg','Ter','Qua','Qui','Sex','Sab']
  const prodData = periodo === 'turno' ? [1200,1350,1280,1420,1380,1550,1480,1620,1580] : periodo === '24h' ? [2800,2600,3100,3400,3200,2900] : [14200,15100,13800,14900,15400,8200]
  const metaLine = periodo === 'turno' ? 1400 : periodo === '24h' ? 3000 : 14000

  const prodOption = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { top: 35, right: 15, bottom: 25, left: 50 },
    xAxis: { type: 'category' as const, data: prodHours, axisLine: { lineStyle: { color: chartTheme.axisColor }}, axisLabel: { color: chartTheme.textColor, fontSize: 9 }},
    yAxis: { type: 'value' as const, axisLine: { show: false }, axisLabel: { color: chartTheme.textColor, fontSize: 9 }, splitLine: { lineStyle: { color: chartTheme.splitColor, type: 'dashed' as const }}},
    series: [
      { data: prodData, type: 'bar' as const, itemStyle: { color: chartTheme.brandColor, borderRadius: [3,3,0,0] }, emphasis: { itemStyle: { color: '#3b82f6' }} },
      { data: prodHours.map(() => metaLine), type: 'line' as const, lineStyle: { color: '#f59e0b', type: 'dashed' as const, width: 1.5 }, symbol: 'none', name: 'Meta' }
    ],
    tooltip: { trigger: 'axis' as const, backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderColor: chartTheme.axisColor, textStyle: { color: chartTheme.textColor, fontSize: 10 }},
  }), [chartTheme, theme, periodo])

  return (
    <div className="win-content h-full overflow-y-auto p-4 space-y-4">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-display uppercase tracking-widest text-dim">Resumo Operacional</h3>
        <div className="flex gap-1">
          {(['turno','24h','semana'] as const).map(p => (
            <button key={p} onClick={() => setPeriodo(p)} className={`periodo-btn px-2.5 py-1 text-[9px] font-mono uppercase rounded-md transition-all duration-200 ${periodo === p ? 'active' : ''}`}>{p === 'turno' ? 'Turno' : p === '24h' ? '24h' : 'Semana'}</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <button
            key={i}
            onClick={() => setSelectedKpi(selectedKpi === i ? null : i)}
            className={`kpi-card p-3 rounded-xl text-left transition-all duration-200 ${selectedKpi === i ? 'selected' : ''}`}
          >
            <div className="text-[9px] font-mono uppercase tracking-wide text-dim">{kpi.label}</div>
            <div className="text-xl font-mono font-bold mt-1">{kpi.value}</div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[8px] text-dim">Meta: {kpi.meta}</span>
              <span className={`text-[9px] font-mono font-bold ${kpi.trend === 'up' ? 'kpi-up' : 'kpi-down'}`}>
                {kpi.trend === 'up' ? '↑' : '↓'} {kpi.delta}
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${kpi.pct >= 100 ? 'bg-green-400' : kpi.pct >= 90 ? 'bg-brand-400' : 'bg-amber-400'}`} style={{ width: `${Math.min(kpi.pct, 100)}%` }}></div>
            </div>
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="win-card rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-display uppercase tracking-widest text-dim">Produção ({periodo})</span>
          <span className="text-[9px] font-mono text-dim">Meta: {metaLine.toLocaleString()} t</span>
        </div>
        <ReactECharts option={prodOption} style={{ height: 180 }} key={`prod-${theme}-${periodo}`} />
      </div>

      {/* Fleet status mini */}
      <div className="win-card rounded-xl p-3">
        <div className="text-[9px] font-display uppercase tracking-widest text-dim mb-3">Status da Frota</div>
        <div className="grid grid-cols-5 gap-3">
          {[
            { l: 'Operando', v: equipamentos.filter(e=>e.status==='OPERANDO').length, c: 'led-ok' },
            { l: 'Fila', v: equipamentos.filter(e=>e.status==='FILA').length, c: 'led-warn' },
            { l: 'Manutenção', v: equipamentos.filter(e=>e.status==='MANUTENÇÃO').length, c: 'led-crit' },
            { l: 'Parado', v: equipamentos.filter(e=>e.status==='PARADO').length, c: 'led-off' },
            { l: 'Total', v: equipamentos.length, c: 'led-brand' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-1.5 ${s.c}`}></div>
              <div className="text-lg font-mono font-bold">{s.v}</div>
              <div className="text-[8px] text-dim mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MapaPanel(_props: IDockviewPanelProps) {
  const [selectedEquip, setSelectedEquip] = useState<typeof equipamentos[0] | null>(null)
  const [baseMap, setBaseMap] = useState<'dark' | 'satellite' | 'topo'>('dark')
  const [showLabels, setShowLabels] = useState(true)

  return (
    <div className="h-full flex overflow-hidden">
      {/* Equipment list sidebar */}
      <div className="w-48 border-r border-hud-border overflow-y-auto flex-shrink-0">
        <div className="p-2 border-b border-hud-border">
          <input className="form-input w-full px-2 py-1 text-[10px] rounded" placeholder="Buscar equip..." />
        </div>
        {equipamentos.map(eq => (
          <button
            key={eq.id}
            onClick={() => setSelectedEquip(selectedEquip?.id === eq.id ? null : eq)}
            className={`map-equip-item w-full text-left px-2 py-2 border-b border-hud-border/30 transition-all duration-150 ${selectedEquip?.id === eq.id ? 'active' : ''}`}
          >
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${eq.status==='OPERANDO'?'led-ok':eq.status==='MANUTENÇÃO'?'led-crit':eq.status==='FILA'?'led-warn':'led-off'}`}></span>
              <span className="text-[10px] font-mono font-bold text-brand-400">{eq.codigo}</span>
            </div>
            <div className="text-[8px] text-dim mt-0.5 pl-3.5">{eq.atividade}</div>
          </button>
        ))}
      </div>

      {/* Map area */}
      <div className="flex-1 relative">
        <div className="map-canvas absolute inset-0">
          {/* Grid background */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(var(--brand-400) 1px, transparent 1px), linear-gradient(90deg, var(--brand-400) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>

          {/* Area polygons */}
          <div className="absolute top-[8%] left-[25%] w-[35%] h-[30%] border border-brand-400/20 rounded-lg bg-brand-400/5"></div>
          <div className="absolute top-[50%] left-[55%] w-[25%] h-[25%] border border-green-400/20 rounded-lg bg-green-400/5"></div>
          <div className="absolute top-[65%] left-[10%] w-[30%] h-[20%] border border-amber-400/20 rounded-lg bg-amber-400/5"></div>

          {showLabels && <>
            <div className="absolute top-[12%] left-[32%] text-[9px] font-mono text-brand-400/60 uppercase">Cava Norte</div>
            <div className="absolute top-[54%] left-[62%] text-[9px] font-mono text-green-400/60 uppercase">Britagem</div>
            <div className="absolute top-[69%] left-[18%] text-[9px] font-mono text-amber-400/60 uppercase">Pilha ROM</div>
          </>}

          {/* Equipment dots */}
          {equipamentos.map((eq, i) => {
            const x = 20 + (i % 5) * 16
            const y = 15 + Math.floor(i / 5) * 40
            const isSelected = selectedEquip?.id === eq.id
            const color = eq.status === 'OPERANDO' ? '#22c55e' : eq.status === 'MANUTENÇÃO' ? '#ef4444' : eq.status === 'FILA' ? '#f59e0b' : '#6b7280'
            return (
              <button
                key={eq.id}
                onClick={() => setSelectedEquip(selectedEquip?.id === eq.id ? null : eq)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isSelected ? 'scale-150 z-20' : 'hover:scale-125 z-10'}`}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className="relative">
                  <div className={`w-3.5 h-3.5 rounded-full ${isSelected ? 'ring-2 ring-white/50' : ''}`} style={{ backgroundColor: color, boxShadow: `0 0 ${isSelected ? 12 : 6}px ${color}` }}></div>
                  {eq.vel > 0 && <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-white animate-ping"></div>}
                </div>
                <span className={`text-[7px] font-mono mt-0.5 block text-center whitespace-nowrap ${isSelected ? 'text-white font-bold' : 'text-white/60'}`}>{eq.codigo}</span>
              </button>
            )
          })}
        </div>

        {/* Map controls */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-30">
          {(['dark','satellite','topo'] as const).map(b => (
            <button key={b} onClick={() => setBaseMap(b)} className={`map-ctrl-btn px-2 py-1 text-[8px] font-mono uppercase rounded transition-all ${baseMap===b?'active':''}`}>{b}</button>
          ))}
          <div className="mt-1"></div>
          <button onClick={() => setShowLabels(!showLabels)} className={`map-ctrl-btn px-2 py-1 text-[8px] font-mono rounded transition-all ${showLabels?'active':''}`}>Labels</button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 map-legend rounded-lg px-3 py-2 flex gap-3 z-30">
          {[{c:'#22c55e',l:'Operando'},{c:'#f59e0b',l:'Fila'},{c:'#ef4444',l:'Manutenção'},{c:'#6b7280',l:'Parado'}].map(({c,l})=>(
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{backgroundColor:c}}></div>
              <span className="text-[8px] font-mono">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Snapshot panel (right) */}
      {selectedEquip && (
        <div className="w-64 border-l border-hud-border overflow-y-auto flex-shrink-0 snapshot-panel">
          <div className="p-3 border-b border-hud-border flex items-center justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-brand-400">{selectedEquip.codigo}</div>
              <div className="text-[9px] text-dim">{selectedEquip.modelo}</div>
            </div>
            <button onClick={() => setSelectedEquip(null)} className="w-5 h-5 rounded flex items-center justify-center text-dim hover:text-red-400 hover:bg-red-400/10 transition-all">✕</button>
          </div>
          <div className="p-3 space-y-3">
            <SnapshotSection title="Status">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${selectedEquip.status==='OPERANDO'?'led-ok':'led-crit'}`}></span>
                <span className="text-[10px] font-mono">{selectedEquip.status}</span>
              </div>
              <div className="text-[9px] text-dim mt-1">{selectedEquip.atividade}</div>
            </SnapshotSection>
            <SnapshotSection title="Operador">
              <span className="text-[10px] font-mono">{selectedEquip.operador}</span>
            </SnapshotSection>
            <SnapshotSection title="Telemetria">
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div><span className="text-dim">Vel:</span> <span className="font-bold">{selectedEquip.vel} km/h</span></div>
                <div><span className="text-dim">Fuel:</span> <span className={`font-bold ${selectedEquip.fuel<30?'text-red-400':selectedEquip.fuel<60?'text-amber-400':'text-green-400'}`}>{selectedEquip.fuel}%</span></div>
              </div>
            </SnapshotSection>
            <SnapshotSection title="Produção Turno">
              <div className="text-lg font-mono font-bold">{selectedEquip.prod.toLocaleString()} t</div>
              <div className="h-1.5 rounded-full bg-white/10 mt-1.5 overflow-hidden">
                <div className="h-full rounded-full bg-brand-400 transition-all" style={{width:`${Math.min((selectedEquip.prod/1500)*100,100)}%`}}></div>
              </div>
              <div className="text-[8px] text-dim mt-0.5">Meta: 1.500 t</div>
            </SnapshotSection>
          </div>
        </div>
      )}
    </div>
  )
}

function SnapshotSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="snapshot-section">
      <div className="text-[8px] font-display uppercase tracking-widest text-dim mb-1.5">{title}</div>
      {children}
    </div>
  )
}

function FrotaPanel(_props: IDockviewPanelProps) {
  const [sortKey, setSortKey] = useState<'codigo'|'status'|'fuel'|'prod'>('codigo')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const sorted = useMemo(() => {
    let filtered = filterStatus === 'ALL' ? equipamentos : equipamentos.filter(e => e.status === filterStatus)
    return [...filtered].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      const cmp = typeof av === 'number' ? av - (bv as number) : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [sortKey, sortDir, filterStatus])

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  return (
    <div className="win-content h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-hud-border">
        <span className="text-[9px] font-display uppercase text-dim">Filtro:</span>
        {['ALL','OPERANDO','FILA','MANUTENÇÃO','PARADO'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`filter-btn px-2 py-0.5 text-[9px] font-mono rounded-md transition-all ${filterStatus===s?'active':''}`}>
            {s === 'ALL' ? 'Todos' : s}
          </button>
        ))}
        <span className="ml-auto text-[9px] font-mono text-dim">{sorted.length} equip.</span>
      </div>
      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[10px] font-mono">
          <thead className="sticky top-0 z-10">
            <tr className="table-header">
              {[{k:'codigo',l:'Código'},{k:'status',l:'Status'},{k:'fuel',l:'Fuel'},{k:'prod',l:'Prod(t)'}].map(({k,l}) => (
                <th key={k} onClick={() => toggleSort(k as any)} className="py-2 px-2 text-left cursor-pointer select-none hover:text-brand-400 transition-colors">
                  {l} {sortKey===k && (sortDir==='asc'?'↑':'↓')}
                </th>
              ))}
              <th className="py-2 px-2 text-left">Operador</th>
              <th className="py-2 px-2 text-right">Vel</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(eq => (
              <tr
                key={eq.id}
                onClick={() => setSelectedId(selectedId === eq.id ? null : eq.id)}
                className={`table-row cursor-pointer transition-all duration-150 ${selectedId === eq.id ? 'selected' : ''}`}
              >
                <td className="py-2 px-2 text-brand-400 font-bold">{eq.codigo}</td>
                <td className="py-2 px-2">
                  <span className={`status-badge ${eq.status.toLowerCase().replace('ã','a').replace('ç','c')}`}>{eq.status}</span>
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${eq.fuel<30?'bg-red-400':eq.fuel<60?'bg-amber-400':'bg-green-400'}`} style={{width:`${eq.fuel}%`}}></div>
                    </div>
                    <span className="text-[9px]">{eq.fuel}%</span>
                  </div>
                </td>
                <td className="py-2 px-2 font-bold">{eq.prod.toLocaleString()}</td>
                <td className="py-2 px-2 text-dim">{eq.operador}</td>
                <td className="py-2 px-2 text-right">{eq.vel > 0 ? `${eq.vel} km/h` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AlertasPanel(_props: IDockviewPanelProps) {
  const [alerts, setAlerts] = useState([
    { id: 1, tipo: 'VELOCIDADE', equip: 'CAT-001', msg: 'Excedeu 45 km/h na Rampa Norte', dt: '14:12', prioridade: 'CRITICA', ack: false },
    { id: 2, tipo: 'GEOCERCA', equip: 'VOL-005', msg: 'Entrou em área restrita (Blasting Zone)', dt: '14:08', prioridade: 'CRITICA', ack: false },
    { id: 3, tipo: 'MANUTENÇÃO', equip: 'KOM-003', msg: 'Horímetro atingiu revisão programada (12.000h)', dt: '13:55', prioridade: 'ALTA', ack: false },
    { id: 4, tipo: 'COMBUSTÍVEL', equip: 'CAT-009', msg: 'Nível combustível abaixo de 20%', dt: '13:42', prioridade: 'ALTA', ack: false },
    { id: 5, tipo: 'OCIOSIDADE', equip: 'VOL-005', msg: 'Parado há 47 min sem atividade registrada', dt: '13:30', prioridade: 'MEDIA', ack: true },
    { id: 6, tipo: 'PNEU', equip: 'CAT-002', msg: 'Pressão pneu #4 baixa — 42 PSI (mín: 55)', dt: '13:15', prioridade: 'ALTA', ack: true },
  ])
  const [filter, setFilter] = useState<'ALL'|'CRITICA'|'ALTA'|'MEDIA'>('ALL')

  const ackAlert = (id: number) => setAlerts(prev => prev.map(a => a.id === id ? {...a, ack: true} : a))
  const dismissAlert = (id: number) => setAlerts(prev => prev.filter(a => a.id !== id))

  const filtered = filter === 'ALL' ? alerts : alerts.filter(a => a.prioridade === filter)
  const pending = alerts.filter(a => !a.ack).length

  return (
    <div className="win-content h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 p-2 border-b border-hud-border">
        {(['ALL','CRITICA','ALTA','MEDIA'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`filter-btn px-2 py-0.5 text-[9px] font-mono rounded-md transition-all ${filter===f?'active':''}`}>
            {f === 'ALL' ? `Todos (${alerts.length})` : f}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1.5">
          {pending > 0 && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>}
          <span className="text-[9px] font-mono text-dim">{pending} pendentes</span>
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filtered.map(a => (
          <div key={a.id} className={`alert-card p-3 rounded-lg transition-all duration-200 ${a.prioridade.toLowerCase()} ${a.ack ? 'acked' : ''}`}>
            <div className="flex items-start gap-2">
              <div className={`alert-led w-2 h-2 rounded-full mt-1 flex-shrink-0 ${!a.ack && a.prioridade==='CRITICA' ? 'animate-pulse' : ''}`}></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono text-brand-400 font-bold">{a.equip}</span>
                  <span className="alert-tipo-badge text-[8px] font-mono px-1.5 py-0.5 rounded">{a.tipo}</span>
                  <span className="text-[8px] text-dim ml-auto">{a.dt}</span>
                </div>
                <div className="text-[10px] mt-1">{a.msg}</div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!a.ack && (
                  <button onClick={() => ackAlert(a.id)} className="ack-btn px-2 py-1 text-[8px] font-mono rounded transition-all">ACK</button>
                )}
                <button onClick={() => dismissAlert(a.id)} className="dismiss-btn px-1.5 py-1 text-[8px] rounded transition-all">✕</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center text-dim text-[10px] py-8">Nenhum alerta neste filtro</div>}
      </div>
    </div>
  )
}

function ProducaoPanel(_props: IDockviewPanelProps) {
  const chartTheme = useChartTheme()
  const { theme } = useTheme()
  const [view, setView] = useState<'hora'|'equip'>('hora')

  const horaOption = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { top: 40, right: 20, bottom: 30, left: 50 },
    legend: { data: ['Realizado','Meta'], textStyle: { color: chartTheme.textColor, fontSize: 9 }, top: 5 },
    xAxis: { type: 'category' as const, data: ['06','07','08','09','10','11','12','13','14','15'], axisLabel: { color: chartTheme.textColor, fontSize: 9 }, axisLine: { lineStyle: { color: chartTheme.axisColor }}},
    yAxis: { type: 'value' as const, name: 'ton', axisLabel: { color: chartTheme.textColor, fontSize: 9 }, splitLine: { lineStyle: { color: chartTheme.splitColor }}, nameTextStyle: { color: chartTheme.textColor, fontSize: 9 }},
    series: [
      { name: 'Realizado', type: 'bar' as const, data: [1200,1350,1280,1420,1380,1550,1480,1620,1580,1710], itemStyle: { color: chartTheme.brandColor, borderRadius: [3,3,0,0] }, emphasis: { itemStyle: { shadowBlur: 10, shadowColor: chartTheme.brandColor }}},
      { name: 'Meta', type: 'line' as const, data: Array(10).fill(1400), lineStyle: { color: '#f59e0b', type: 'dashed' as const }, symbol: 'none' }
    ],
    tooltip: { trigger: 'axis' as const, backgroundColor: theme==='dark'?'#1e293b':'#fff', borderColor: chartTheme.axisColor, textStyle: { color: chartTheme.textColor }}
  }), [chartTheme, theme])

  const equipOption = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { top: 20, right: 20, bottom: 40, left: 60 },
    xAxis: { type: 'category' as const, data: equipamentos.filter(e=>e.prod>0).map(e=>e.codigo), axisLabel: { color: chartTheme.textColor, fontSize: 8, rotate: 35 }, axisLine: { lineStyle: { color: chartTheme.axisColor }}},
    yAxis: { type: 'value' as const, axisLabel: { color: chartTheme.textColor, fontSize: 9 }, splitLine: { lineStyle: { color: chartTheme.splitColor }}},
    series: [{ type: 'bar' as const, data: equipamentos.filter(e=>e.prod>0).map(e=>({ value: e.prod, itemStyle: { color: e.tipo==='CARGA'?'#7c3aed':chartTheme.brandColor, borderRadius: [3,3,0,0] }})) }],
    tooltip: { trigger: 'axis' as const, backgroundColor: theme==='dark'?'#1e293b':'#fff', textStyle: { color: chartTheme.textColor }}
  }), [chartTheme, theme])

  return (
    <div className="win-content h-full flex flex-col p-3">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-[9px] font-display uppercase tracking-widest text-dim">Produção</h3>
        <div className="flex gap-1 ml-auto">
          {(['hora','equip'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`periodo-btn px-2.5 py-1 text-[9px] font-mono rounded-md transition-all ${view===v?'active':''}`}>
              {v==='hora'?'Por Hora':'Por Equip'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <ReactECharts option={view==='hora'?horaOption:equipOption} style={{ height: '100%' }} key={`prod-${theme}-${view}`} />
      </div>
    </div>
  )
}

function DispatchPanel(_props: IDockviewPanelProps) {
  const [modo, setModo] = useState<'MANUAL'|'SEMI'|'AUTO'>('SEMI')
  const [selectedRota, setSelectedRota] = useState<number | null>(null)

  const rotas = [
    { id: 1, de: 'Cava Norte', para: 'Britagem', equips: ['CAT-001','CAT-002','LIE-006'], fila: 1, score: 92, distKm: 3.2, tempoCiclo: '18 min' },
    { id: 2, de: 'Cava Sul', para: 'Pilha ROM', equips: ['CAT-004','VOL-005'], fila: 0, score: 87, distKm: 2.1, tempoCiclo: '14 min' },
    { id: 3, de: 'Cava Principal', para: 'Britagem', equips: ['KOM-008','HIT-010','CAT-009'], fila: 2, score: 78, distKm: 4.5, tempoCiclo: '22 min' },
  ]

  return (
    <div className="win-content h-full overflow-y-auto p-3 space-y-3">
      {/* Mode selector */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-display uppercase text-dim">Modo:</span>
        {(['MANUAL','SEMI','AUTO'] as const).map(m => (
          <button key={m} onClick={() => setModo(m)} className={`dispatch-mode-btn px-3 py-1.5 text-[9px] font-mono uppercase rounded-lg transition-all duration-200 ${modo===m?'active':''}`}>
            {m === 'SEMI' ? 'Semi-Auto' : m === 'AUTO' ? 'Automático' : 'Manual'}
          </button>
        ))}
      </div>

      {/* Routes */}
      {rotas.map(r => (
        <button
          key={r.id}
          onClick={() => setSelectedRota(selectedRota === r.id ? null : r.id)}
          className={`dispatch-rota w-full text-left p-3 rounded-xl transition-all duration-200 ${selectedRota===r.id?'selected':''}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold">{r.de}</span>
              <span className="text-brand-400 text-sm">→</span>
              <span className="text-[10px] font-mono font-bold">{r.para}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${r.score>90?'bg-green-400':r.score>80?'bg-brand-400':'bg-amber-400'}`} style={{width:`${r.score}%`}}></div>
              </div>
              <span className="text-[9px] font-mono font-bold">{r.score}%</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {r.equips.map(e => (
              <span key={e} className="equip-chip px-1.5 py-0.5 text-[8px] font-mono rounded">{e}</span>
            ))}
            {r.fila > 0 && <span className="fila-chip px-1.5 py-0.5 text-[8px] font-mono rounded">+{r.fila} fila</span>}
          </div>
          {selectedRota === r.id && (
            <div className="mt-2 pt-2 border-t border-hud-border/30 grid grid-cols-2 gap-2 text-[9px] font-mono text-dim">
              <div>Distância: <span className="text-hud-text font-bold">{r.distKm} km</span></div>
              <div>Ciclo: <span className="text-hud-text font-bold">{r.tempoCiclo}</span></div>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

function AbastecimentoPanel(_props: IDockviewPanelProps) {
  const [tab, setTab] = useState<'registros'|'stats'>('registros')
  const registros = [
    { id:1, equip:'CAT-001', litros:1850, custo:12580, dt:'14:02', tipo:'COMPLETO', nivel:95, operador:'João Silva' },
    { id:2, equip:'KOM-003', litros:2200, custo:14960, dt:'12:45', tipo:'COMPLETO', nivel:100, operador:'Pedro Santos' },
    { id:3, equip:'CAT-004', litros:950, custo:6460, dt:'11:30', tipo:'PARCIAL', nivel:72, operador:'Maria Oliveira' },
    { id:4, equip:'VOL-005', litros:1100, custo:7480, dt:'10:15', tipo:'COMBOIO', nivel:88, operador:'Carlos Lima' },
    { id:5, equip:'LIE-006', litros:2500, custo:17000, dt:'09:00', tipo:'COMPLETO', nivel:96, operador:'Ana Costa' },
  ]

  return (
    <div className="win-content h-full flex flex-col">
      <div className="flex items-center gap-2 p-2 border-b border-hud-border">
        {(['registros','stats'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`periodo-btn px-2.5 py-1 text-[9px] font-mono uppercase rounded-md transition-all ${tab===t?'active':''}`}>
            {t==='registros'?'Registros':'Estatísticas'}
          </button>
        ))}
      </div>
      {tab === 'registros' ? (
        <div className="flex-1 overflow-auto p-2">
          <table className="w-full text-[10px] font-mono">
            <thead><tr className="table-header">
              <th className="py-2 px-2 text-left">Equip</th><th className="py-2 text-right">Litros</th><th className="py-2 text-right">Custo</th><th className="py-2 text-center">Tipo</th><th className="py-2 text-right">Nível</th><th className="py-2 text-right px-2">Hora</th>
            </tr></thead>
            <tbody>{registros.map(r=>(
              <tr key={r.id} className="table-row">
                <td className="py-2 px-2 text-brand-400 font-bold">{r.equip}</td>
                <td className="py-2 text-right">{r.litros.toLocaleString()}</td>
                <td className="py-2 text-right">R$ {(r.custo/1000).toFixed(1)}k</td>
                <td className="py-2 text-center"><span className={`status-badge ${r.tipo.toLowerCase()}`}>{r.tipo}</span></td>
                <td className="py-2 text-right text-green-400">{r.nivel}%</td>
                <td className="py-2 text-right px-2 text-dim">{r.dt}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 p-3 grid grid-cols-2 gap-3 content-start">
          {[{l:'Total Hoje',v:'8.600 L'},{l:'Custo Total',v:'R$ 58.4k'},{l:'Média L/h',v:'42.3'},{l:'Abastecimentos',v:'5'}].map((s,i)=>(
            <div key={i} className="win-card rounded-lg p-3 text-center">
              <div className="text-[8px] font-display uppercase text-dim">{s.l}</div>
              <div className="text-lg font-mono font-bold mt-1">{s.v}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ManutencaoPanel(_props: IDockviewPanelProps) {
  const [filterStatus, setFilterStatus] = useState('ALL')
  const os = [
    { num:'OS-0847', equip:'KOM-003', tipo:'PREVENTIVA', status:'EXECUTANDO', prioridade:'ALTA', prog:65 },
    { num:'OS-0848', equip:'CAT-002', tipo:'CORRETIVA', status:'ABERTA', prioridade:'URGENTE', prog:0 },
    { num:'OS-0845', equip:'CAT-009', tipo:'PREVENTIVA', status:'PROGRAMADA', prioridade:'MEDIA', prog:0 },
    { num:'OS-0842', equip:'VOL-005', tipo:'PREDITIVA', status:'CONCLUIDA', prioridade:'BAIXA', prog:100 },
  ]
  const filtered = filterStatus === 'ALL' ? os : os.filter(o => o.status === filterStatus)

  return (
    <div className="win-content h-full flex flex-col">
      <div className="flex items-center gap-1.5 p-2 border-b border-hud-border overflow-x-auto">
        {['ALL','ABERTA','PROGRAMADA','EXECUTANDO','CONCLUIDA'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`filter-btn px-2 py-0.5 text-[8px] font-mono rounded-md whitespace-nowrap transition-all ${filterStatus===s?'active':''}`}>
            {s==='ALL'?'Todas':s}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filtered.map(o => (
          <div key={o.num} className="os-card p-3 rounded-lg transition-all duration-150">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono text-brand-400 font-bold">{o.num}</span>
              <span className={`status-badge ${o.tipo.toLowerCase()}`}>{o.tipo}</span>
              <span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span>
              <span className={`ml-auto text-[8px] font-mono ${o.prioridade==='URGENTE'?'text-red-400 animate-pulse':o.prioridade==='ALTA'?'text-amber-400':'text-dim'}`}>{o.prioridade}</span>
            </div>
            <div className="text-[9px] text-dim">Equip: {o.equip}</div>
            {o.prog > 0 && o.prog < 100 && (
              <div className="mt-2">
                <div className="flex justify-between text-[8px] text-dim mb-0.5"><span>Progresso</span><span>{o.prog}%</span></div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-400 transition-all" style={{width:`${o.prog}%`}}></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function QualidadePanel(_props: IDockviewPanelProps) {
  const chartTheme = useChartTheme()
  const { theme } = useTheme()
  const [selectedPilha, setSelectedPilha] = useState(0)

  const pilhas = [
    { nome: 'ROM-01', fe: 64.5, sio2: 4.2, al2o3: 2.8, p: 0.045, mn: 0.3, h2o: 8.5 },
    { nome: 'ROM-02', fe: 62.1, sio2: 5.8, al2o3: 3.5, p: 0.062, mn: 0.5, h2o: 10.2 },
    { nome: 'PROD-01', fe: 66.8, sio2: 2.1, al2o3: 1.2, p: 0.031, mn: 0.2, h2o: 6.1 },
  ]

  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    radar: {
      indicator: [
        { name: 'Fe%', max: 70 }, { name: 'SiO2%', max: 10 }, { name: 'Al2O3%', max: 8 },
        { name: 'P%', max: 0.1 }, { name: 'Mn%', max: 1 }, { name: 'H2O%', max: 15 }
      ],
      axisLine: { lineStyle: { color: chartTheme.axisColor }},
      splitLine: { lineStyle: { color: chartTheme.splitColor }},
      axisName: { color: chartTheme.textColor, fontSize: 9 },
      splitArea: { show: false }
    },
    series: [{
      type: 'radar' as const,
      data: [{ value: [pilhas[selectedPilha].fe, pilhas[selectedPilha].sio2, pilhas[selectedPilha].al2o3, pilhas[selectedPilha].p, pilhas[selectedPilha].mn, pilhas[selectedPilha].h2o], name: pilhas[selectedPilha].nome, areaStyle: { color: 'rgba(37,99,235,0.2)' }, lineStyle: { color: chartTheme.brandColor, width: 2 }, itemStyle: { color: chartTheme.brandColor }}]
    }],
    tooltip: {}
  }), [chartTheme, selectedPilha])

  return (
    <div className="win-content h-full flex flex-col p-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-display uppercase text-dim">Pilha:</span>
        {pilhas.map((p, i) => (
          <button key={i} onClick={() => setSelectedPilha(i)} className={`periodo-btn px-2.5 py-1 text-[9px] font-mono rounded-md transition-all ${selectedPilha===i?'active':''}`}>{p.nome}</button>
        ))}
      </div>
      <div className="flex-1">
        <ReactECharts option={option} style={{ height: '100%' }} key={`qual-${theme}-${selectedPilha}`} />
      </div>
    </div>
  )
}

function MensageriaPanel(_props: IDockviewPanelProps) {
  const [messages, setMessages] = useState([
    { id:1, de:'CCO', para:'CAT-001', msg:'Deslocar para Cava Norte, ponto de carga 3', dt:'14:15', outgoing:true },
    { id:2, de:'CAT-001', para:'CCO', msg:'Entendido, deslocando agora', dt:'14:16', outgoing:false },
    { id:3, de:'CCO', para:'TODOS', msg:'⚠️ Detonação em 30min — Zona B. Esvaziar área imediatamente.', dt:'14:05', outgoing:true },
    { id:4, de:'KOM-003', para:'CCO', msg:'Motor apresentando vibração anormal no eixo traseiro', dt:'13:58', outgoing:false },
    { id:5, de:'CCO', para:'KOM-003', msg:'OS aberta. Encaminhar para oficina setor 2.', dt:'14:00', outgoing:true },
  ])
  const [input, setInput] = useState('')

  const send = () => {
    if (!input.trim()) return
    setMessages(prev => [...prev, { id: Date.now(), de: 'CCO', para: 'CAT-001', msg: input, dt: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}), outgoing: true }])
    setInput('')
  }

  return (
    <div className="win-content h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.outgoing ? 'justify-end' : 'justify-start'}`}>
            <div className={`msg-bubble max-w-[80%] px-3 py-2 rounded-xl ${m.outgoing ? 'outgoing' : 'incoming'}`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[8px] font-mono font-bold text-brand-400">{m.de}</span>
                <span className="text-[7px] text-dim">→</span>
                <span className="text-[8px] font-mono text-dim">{m.para}</span>
              </div>
              <div className="text-[10px]">{m.msg}</div>
              <div className="text-right mt-1 text-[7px] text-dim">{m.dt} <span className="text-brand-400">✓✓</span></div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-hud-border flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          className="form-input flex-1 px-3 py-2 text-[10px] rounded-lg"
          placeholder="Digitar mensagem..."
        />
        <button onClick={send} className="send-btn px-4 py-2 text-[9px] font-mono uppercase rounded-lg transition-all">Enviar</button>
      </div>
    </div>
  )
}

function CiclosPanel(_props: IDockviewPanelProps) {
  const chartTheme = useChartTheme()
  const { theme } = useTheme()
  const [view, setView] = useState<'stack'|'pie'>('stack')

  const stackOption = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { top: 40, right: 20, bottom: 35, left: 55 },
    legend: { data: ['Carga','Transporte','Fila','Descarga'], textStyle: { color: chartTheme.textColor, fontSize: 9 }, top: 5, selectedMode: true },
    xAxis: { type: 'category' as const, data: ['CAT-001','CAT-002','CAT-004','VOL-005','LIE-006','CAT-009'], axisLabel: { color: chartTheme.textColor, fontSize: 8, rotate: 30 }, axisLine: { lineStyle: { color: chartTheme.axisColor }}},
    yAxis: { type: 'value' as const, name: 'min', axisLabel: { color: chartTheme.textColor, fontSize: 9 }, splitLine: { lineStyle: { color: chartTheme.splitColor }}, nameTextStyle: { color: chartTheme.textColor }},
    series: [
      { name:'Carga', type:'bar' as const, stack:'t', data:[3.2,3.5,4.1,3.8,3.0,4.5], itemStyle:{color:'#2563eb',borderRadius:[0,0,0,0]}},
      { name:'Transporte', type:'bar' as const, stack:'t', data:[8.5,9.2,7.8,10.1,8.0,11.5], itemStyle:{color:'#7c3aed'}},
      { name:'Fila', type:'bar' as const, stack:'t', data:[2.1,1.5,3.2,0.8,1.2,4.5], itemStyle:{color:'#f59e0b'}},
      { name:'Descarga', type:'bar' as const, stack:'t', data:[1.5,1.8,1.6,2.0,1.4,1.9], itemStyle:{color:'#10b981',borderRadius:[3,3,0,0]}},
    ],
    tooltip: { trigger: 'axis' as const, backgroundColor: theme==='dark'?'#1e293b':'#fff', textStyle: { color: chartTheme.textColor }}
  }), [chartTheme, theme])

  const pieOption = useMemo(() => ({
    backgroundColor: 'transparent',
    series: [{ type: 'pie' as const, radius: ['40%','70%'], data: [
      { value: 3.7, name: 'Carga', itemStyle: { color: '#2563eb' }},
      { value: 9.2, name: 'Transporte', itemStyle: { color: '#7c3aed' }},
      { value: 2.2, name: 'Fila', itemStyle: { color: '#f59e0b' }},
      { value: 1.7, name: 'Descarga', itemStyle: { color: '#10b981' }},
    ], label: { color: chartTheme.textColor, fontSize: 10 }, emphasis: { scaleSize: 8 }}],
    tooltip: { trigger: 'item' as const, backgroundColor: theme==='dark'?'#1e293b':'#fff', textStyle: { color: chartTheme.textColor }}
  }), [chartTheme, theme])

  return (
    <div className="win-content h-full flex flex-col p-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-display uppercase text-dim">Decomposição Ciclo</span>
        <div className="flex gap-1 ml-auto">
          {(['stack','pie'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`periodo-btn px-2.5 py-1 text-[9px] font-mono rounded-md transition-all ${view===v?'active':''}`}>{v==='stack'?'Stacked':'Pizza'}</button>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <ReactECharts option={view==='stack'?stackOption:pieOption} style={{ height: '100%' }} key={`ciclos-${theme}-${view}`} />
      </div>
    </div>
  )
}

function OperadoresPanel(_props: IDockviewPanelProps) {
  const [selected, setSelected] = useState<number|null>(null)
  const ops = [
    { id:1, nome:'João Silva', mat:'OP-001', equip:'CAT-001', turno:'A', status:'ATIVO', horas:'7h23' },
    { id:2, nome:'Pedro Santos', mat:'OP-002', equip:'CAT-002', turno:'A', status:'ATIVO', horas:'7h23' },
    { id:3, nome:'Maria Oliveira', mat:'OP-003', equip:'CAT-004', turno:'A', status:'ATIVO', horas:'7h23' },
    { id:4, nome:'Carlos Lima', mat:'OP-004', equip:'VOL-005', turno:'A', status:'INATIVO', horas:'5h12' },
    { id:5, nome:'Ana Costa', mat:'OP-005', equip:'LIE-006', turno:'B', status:'ATIVO', horas:'3h45' },
    { id:6, nome:'Ricardo Souza', mat:'OP-006', equip:'CAT-007', turno:'A', status:'ATIVO', horas:'7h23' },
    { id:7, nome:'Fernanda Dias', mat:'OP-007', equip:'KOM-008', turno:'A', status:'ATIVO', horas:'7h23' },
    { id:8, nome:'Bruno Alves', mat:'OP-008', equip:'CAT-009', turno:'B', status:'ATIVO', horas:'3h45' },
  ]

  return (
    <div className="win-content h-full overflow-auto p-2">
      <table className="w-full text-[10px] font-mono">
        <thead><tr className="table-header">
          <th className="py-2 px-2 text-left">Nome</th><th className="py-2 text-center">Mat.</th><th className="py-2 text-center">Equip</th><th className="py-2 text-center">Turno</th><th className="py-2 text-center">Horas</th><th className="py-2 text-center">Status</th>
        </tr></thead>
        <tbody>
          {ops.map(op => (
            <tr key={op.id} onClick={() => setSelected(selected===op.id?null:op.id)} className={`table-row cursor-pointer transition-all ${selected===op.id?'selected':''}`}>
              <td className="py-2 px-2">{op.nome}</td>
              <td className="py-2 text-center text-brand-400">{op.mat}</td>
              <td className="py-2 text-center">{op.equip}</td>
              <td className="py-2 text-center"><span className={`px-1.5 py-0.5 rounded text-[8px] ${op.turno==='A'?'bg-brand-400/10 text-brand-400 border border-brand-400/30':'bg-purple-400/10 text-purple-400 border border-purple-400/30'}`}>{op.turno}</span></td>
              <td className="py-2 text-center text-dim">{op.horas}</td>
              <td className="py-2 text-center"><span className={`w-2 h-2 rounded-full inline-block ${op.status==='ATIVO'?'led-ok':'led-off'}`}></span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ===== COMPONENTS MAP =====
const components: Record<string, React.FunctionComponent<IDockviewPanelProps>> = {
  dashboard: DashboardPanel, mapa: MapaPanel, frota: FrotaPanel, operadores: OperadoresPanel,
  alertas: AlertasPanel, producao: ProducaoPanel, dispatch: DispatchPanel,
  abastecimento: AbastecimentoPanel, manutencao: ManutencaoPanel, qualidade: QualidadePanel,
  mensageria: MensageriaPanel, ciclos: CiclosPanel,
}

export default function Desktop() {
  return (
    <div className="h-full">
      <WindowManager windows={windowDefs} components={components} defaultOpen={['dashboard','mapa','alertas']} />
    </div>
  )
}
