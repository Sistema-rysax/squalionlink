import { useMemo } from 'react'
import { IDockviewPanelProps } from 'dockview-react'
import WindowManager, { WindowDef } from '../../components/hud/WindowManager'
import ReactECharts from 'echarts-for-react'
import { useChartTheme } from '../../hooks/useChartTheme'
import { useTheme } from '../../contexts/ThemeContext'

// ===== WINDOW DEFINITIONS =====
const windowDefs: WindowDef[] = [
  { id: 'dashboard', title: 'Dashboard', icon: '📊', component: 'dashboard', defaultWidth: 850, defaultHeight: 550, singleton: true },
  { id: 'mapa', title: 'Mapa', icon: '🗺️', component: 'mapa', defaultWidth: 900, defaultHeight: 600, singleton: true },
  { id: 'frota', title: 'Frota', icon: '🚛', component: 'frota', defaultWidth: 750, defaultHeight: 500, singleton: true },
  { id: 'operadores', title: 'Operadores', icon: '👷', component: 'operadores', defaultWidth: 700, defaultHeight: 450, singleton: true },
  { id: 'alertas', title: 'Alertas', icon: '🚨', component: 'alertas', defaultWidth: 650, defaultHeight: 400, singleton: true },
  { id: 'producao', title: 'Produção', icon: '⛏️', component: 'producao', defaultWidth: 800, defaultHeight: 500, singleton: true },
  { id: 'dispatch', title: 'Dispatch', icon: '🎯', component: 'dispatch', defaultWidth: 750, defaultHeight: 500, singleton: true },
  { id: 'abastecimento', title: 'Abastecimento', icon: '⛽', component: 'abastecimento', defaultWidth: 700, defaultHeight: 450, singleton: true },
  { id: 'manutencao', title: 'Manutenção', icon: '🔧', component: 'manutencao', defaultWidth: 750, defaultHeight: 500, singleton: true },
  { id: 'qualidade', title: 'Qualidade', icon: '🧪', component: 'qualidade', defaultWidth: 700, defaultHeight: 450, singleton: true },
  { id: 'mensageria', title: 'Mensagens', icon: '💬', component: 'mensageria', defaultWidth: 650, defaultHeight: 500, singleton: true },
  { id: 'ciclos', title: 'Ciclos', icon: '🔄', component: 'ciclos', defaultWidth: 700, defaultHeight: 450, singleton: true },
]

// ===== MOCK DATA =====
const equipamentos = [
  { codigo: 'CAT-001', modelo: 'CAT 793F', status: 'OPERANDO', operador: 'João Silva', vel: 42, fuel: 78, prod: 1240 },
  { codigo: 'CAT-002', modelo: 'CAT 793F', status: 'OPERANDO', operador: 'Pedro Santos', vel: 38, fuel: 65, prod: 1180 },
  { codigo: 'KOM-003', modelo: 'Komatsu 930E', status: 'MANUTENÇÃO', operador: '-', vel: 0, fuel: 45, prod: 0 },
  { codigo: 'CAT-004', modelo: 'CAT 785D', status: 'OPERANDO', operador: 'Maria Oliveira', vel: 35, fuel: 82, prod: 980 },
  { codigo: 'VOL-005', modelo: 'Volvo A60H', status: 'PARADO', operador: 'Carlos Lima', vel: 0, fuel: 91, prod: 0 },
  { codigo: 'LIE-006', modelo: 'Liebherr T264', status: 'OPERANDO', operador: 'Ana Costa', vel: 44, fuel: 72, prod: 1350 },
  { codigo: 'CAT-007', modelo: 'CAT 390F', status: 'OPERANDO', operador: 'Ricardo Souza', vel: 0, fuel: 88, prod: 2100 },
  { codigo: 'KOM-008', modelo: 'Komatsu PC5500', status: 'OPERANDO', operador: 'Fernanda Dias', vel: 0, fuel: 67, prod: 2400 },
  { codigo: 'CAT-009', modelo: 'CAT D11T', status: 'FILA', operador: 'Bruno Alves', vel: 0, fuel: 55, prod: 890 },
  { codigo: 'HIT-010', modelo: 'Hitachi EX5600', status: 'OPERANDO', operador: 'Lucas Melo', vel: 0, fuel: 73, prod: 2650 },
]

const alertas = [
  { id: 1, tipo: 'VELOCIDADE', equip: 'CAT-001', msg: 'Excedeu 45 km/h na Rampa Norte', dt: '14:12', prioridade: 'ALTA' },
  { id: 2, tipo: 'CERCA', equip: 'VOL-005', msg: 'Entrou em área restrita (Blasting Zone)', dt: '14:08', prioridade: 'CRITICA' },
  { id: 3, tipo: 'MANUTENÇÃO', equip: 'KOM-003', msg: 'Horímetro atingiu revisão programada', dt: '13:55', prioridade: 'MEDIA' },
  { id: 4, tipo: 'COMBUSTÍVEL', equip: 'CAT-009', msg: 'Nível abaixo de 20%', dt: '13:42', prioridade: 'ALTA' },
  { id: 5, tipo: 'OCIOSIDADE', equip: 'VOL-005', msg: 'Parado há 47 min sem atividade registrada', dt: '13:30', prioridade: 'MEDIA' },
  { id: 6, tipo: 'PNEU', equip: 'CAT-002', msg: 'Pressão pneu traseiro esquerdo baixa (42 PSI)', dt: '13:15', prioridade: 'ALTA' },
]

// ===== PANEL COMPONENTS =====

function DashboardPanel(_props: IDockviewPanelProps) {
  const chartTheme = useChartTheme()
  const prodData = [120,135,128,142,138,155,148,162,158,171,165,178]
  const dfData = [88,91,87,93,89,92,90,94,88,91,93,90]

  const prodOption = {
    backgroundColor: 'transparent',
    grid: { top: 30, right: 20, bottom: 30, left: 50 },
    xAxis: { type: 'category' as const, data: ['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'], axisLine: { lineStyle: { color: chartTheme.axisColor }}, axisLabel: { color: chartTheme.textColor, fontSize: 9 }},
    yAxis: { type: 'value' as const, axisLine: { lineStyle: { color: chartTheme.axisColor }}, axisLabel: { color: chartTheme.textColor, fontSize: 9 }, splitLine: { lineStyle: { color: chartTheme.splitColor }}},
    series: [{ data: prodData, type: 'line' as const, smooth: true, areaStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(37,99,235,0.3)' }, { offset: 1, color: 'rgba(37,99,235,0)' }]}}, lineStyle: { color: '#2563eb', width: 2 }, itemStyle: { color: '#2563eb' }}],
    tooltip: { trigger: 'axis' as const }
  }

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Produção', value: '14.820 t', delta: '+12%', ok: true },
          { label: 'DF%', value: '91.2%', delta: '+2.1%', ok: true },
          { label: 'Ciclos/h', value: '8.4', delta: '-0.3', ok: false },
          { label: 'Vel. Média', value: '38 km/h', delta: '=', ok: true },
        ].map((kpi, i) => (
          <div key={i} className="bg-hud-panel border border-hud-border rounded-lg p-2.5 text-center">
            <div className="text-[9px] font-mono uppercase text-dim">{kpi.label}</div>
            <div className="text-lg font-mono font-bold text-hud-text mt-0.5">{kpi.value}</div>
            <div className={`text-[9px] font-mono ${kpi.ok ? 'text-green-400' : 'text-amber-400'}`}>{kpi.delta}</div>
          </div>
        ))}
      </div>
      {/* Chart */}
      <div className="bg-hud-panel border border-hud-border rounded-lg p-2">
        <div className="text-[9px] font-mono uppercase text-dim mb-1">Produção por Hora (ton)</div>
        <ReactECharts option={prodOption} style={{ height: 180 }} />
      </div>
      {/* Mini fleet status */}
      <div className="bg-hud-panel border border-hud-border rounded-lg p-2">
        <div className="text-[9px] font-mono uppercase text-dim mb-2">Status Frota</div>
        <div className="grid grid-cols-5 gap-2 text-center">
          {[{l:'Operando',v:7,c:'bg-green-400'},{l:'Fila',v:1,c:'bg-amber-400'},{l:'Manutenção',v:1,c:'bg-red-400'},{l:'Parado',v:1,c:'bg-gray-400'},{l:'Total',v:10,c:'bg-brand-400'}].map((s,i)=>(
            <div key={i}>
              <div className={`w-2 h-2 rounded-full ${s.c} mx-auto mb-1`}></div>
              <div className="text-sm font-mono font-bold text-hud-text">{s.v}</div>
              <div className="text-[8px] text-dim">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MapaPanel(_props: IDockviewPanelProps) {
  return (
    <div className="h-full relative bg-[#1a1a2e] flex items-center justify-center overflow-hidden">
      {/* Simulated map background with grid */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(37,99,235,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      {/* Equipment dots on "map" */}
      {equipamentos.map((eq, i) => {
        const x = 15 + (i % 5) * 18
        const y = 20 + Math.floor(i / 5) * 35
        const color = eq.status === 'OPERANDO' ? '#22c55e' : eq.status === 'MANUTENÇÃO' ? '#ef4444' : eq.status === 'FILA' ? '#f59e0b' : '#6b7280'
        return (
          <div key={eq.codigo} className="absolute flex flex-col items-center" style={{ left: `${x}%`, top: `${y}%` }}>
            <div className="w-3 h-3 rounded-full animate-pulse shadow-lg" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></div>
            <span className="text-[8px] font-mono text-white/70 mt-0.5">{eq.codigo}</span>
          </div>
        )
      })}
      {/* Area labels */}
      <div className="absolute top-[10%] left-[30%] text-[10px] font-mono text-brand-400/50 uppercase">Cava Principal</div>
      <div className="absolute top-[60%] left-[60%] text-[10px] font-mono text-brand-400/50 uppercase">Britagem</div>
      <div className="absolute top-[75%] left-[20%] text-[10px] font-mono text-brand-400/50 uppercase">Pilha ROM</div>
      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur rounded px-2 py-1 flex gap-3">
        {[{c:'#22c55e',l:'Operando'},{c:'#f59e0b',l:'Fila'},{c:'#ef4444',l:'Manutenção'},{c:'#6b7280',l:'Parado'}].map(({c,l})=>(
          <div key={l} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{backgroundColor:c}}></div>
            <span className="text-[8px] text-white/70">{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FrotaPanel(_props: IDockviewPanelProps) {
  return (
    <div className="h-full overflow-auto p-2">
      <table className="w-full text-[10px] font-mono">
        <thead>
          <tr className="text-dim uppercase border-b border-hud-border">
            <th className="py-1.5 text-left px-2">Código</th>
            <th className="py-1.5 text-left">Modelo</th>
            <th className="py-1.5 text-center">Status</th>
            <th className="py-1.5 text-left">Operador</th>
            <th className="py-1.5 text-right px-2">Vel</th>
            <th className="py-1.5 text-right px-2">Fuel%</th>
            <th className="py-1.5 text-right px-2">Prod(t)</th>
          </tr>
        </thead>
        <tbody>
          {equipamentos.map(eq => (
            <tr key={eq.codigo} className="border-b border-hud-border/30 hover:bg-brand-600/5 transition-colors">
              <td className="py-1.5 px-2 text-brand-400 font-bold">{eq.codigo}</td>
              <td className="py-1.5 text-hud-text">{eq.modelo}</td>
              <td className="py-1.5 text-center">
                <span className={`px-1.5 py-0.5 rounded text-[8px] border ${
                  eq.status === 'OPERANDO' ? 'text-green-400 border-green-400/30 bg-green-400/10' :
                  eq.status === 'MANUTENÇÃO' ? 'text-red-400 border-red-400/30 bg-red-400/10' :
                  eq.status === 'FILA' ? 'text-amber-400 border-amber-400/30 bg-amber-400/10' :
                  'text-gray-400 border-gray-400/30 bg-gray-400/10'
                }`}>{eq.status}</span>
              </td>
              <td className="py-1.5 text-hud-text">{eq.operador}</td>
              <td className="py-1.5 text-right px-2 text-hud-text">{eq.vel}</td>
              <td className="py-1.5 text-right px-2">
                <span className={`${eq.fuel < 30 ? 'text-red-400' : eq.fuel < 60 ? 'text-amber-400' : 'text-green-400'}`}>{eq.fuel}%</span>
              </td>
              <td className="py-1.5 text-right px-2 text-hud-text">{eq.prod}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function OperadoresPanel(_props: IDockviewPanelProps) {
  const ops = [
    { nome: 'João Silva', matricula: 'OP-001', equip: 'CAT-001', turno: 'A (06-18h)', status: 'ATIVO' },
    { nome: 'Pedro Santos', matricula: 'OP-002', equip: 'CAT-002', turno: 'A (06-18h)', status: 'ATIVO' },
    { nome: 'Maria Oliveira', matricula: 'OP-003', equip: 'CAT-004', turno: 'A (06-18h)', status: 'ATIVO' },
    { nome: 'Carlos Lima', matricula: 'OP-004', equip: 'VOL-005', turno: 'A (06-18h)', status: 'INATIVO' },
    { nome: 'Ana Costa', matricula: 'OP-005', equip: 'LIE-006', turno: 'B (18-06h)', status: 'ATIVO' },
    { nome: 'Ricardo Souza', matricula: 'OP-006', equip: 'CAT-007', turno: 'A (06-18h)', status: 'ATIVO' },
    { nome: 'Fernanda Dias', matricula: 'OP-007', equip: 'KOM-008', turno: 'A (06-18h)', status: 'ATIVO' },
    { nome: 'Bruno Alves', matricula: 'OP-008', equip: 'CAT-009', turno: 'B (18-06h)', status: 'ATIVO' },
  ]
  return (
    <div className="h-full overflow-auto p-2">
      <table className="w-full text-[10px] font-mono">
        <thead><tr className="text-dim uppercase border-b border-hud-border">
          <th className="py-1.5 text-left px-2">Nome</th><th className="py-1.5">Mat.</th><th className="py-1.5">Equip</th><th className="py-1.5">Turno</th><th className="py-1.5 text-center">Status</th>
        </tr></thead>
        <tbody>
          {ops.map(op => (
            <tr key={op.matricula} className="border-b border-hud-border/30 hover:bg-brand-600/5">
              <td className="py-1.5 px-2 text-hud-text">{op.nome}</td>
              <td className="py-1.5 text-brand-400">{op.matricula}</td>
              <td className="py-1.5 text-hud-text">{op.equip}</td>
              <td className="py-1.5 text-dim">{op.turno}</td>
              <td className="py-1.5 text-center"><span className={`w-2 h-2 rounded-full inline-block ${op.status==='ATIVO'?'bg-green-400':'bg-gray-400'}`}></span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AlertasPanel(_props: IDockviewPanelProps) {
  return (
    <div className="h-full overflow-auto p-2 space-y-1.5">
      {alertas.map(a => (
        <div key={a.id} className={`flex items-start gap-2 p-2 rounded border ${
          a.prioridade === 'CRITICA' ? 'border-red-500/50 bg-red-500/10' :
          a.prioridade === 'ALTA' ? 'border-amber-500/40 bg-amber-500/5' :
          'border-hud-border bg-white/[0.02]'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
            a.prioridade === 'CRITICA' ? 'bg-red-500 animate-pulse' :
            a.prioridade === 'ALTA' ? 'bg-amber-400' : 'bg-blue-400'
          }`}></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-brand-400 font-bold">{a.equip}</span>
              <span className="text-[8px] font-mono text-dim px-1 py-0.5 rounded bg-white/5 border border-hud-border">{a.tipo}</span>
              <span className="text-[8px] text-dim ml-auto">{a.dt}</span>
            </div>
            <div className="text-[10px] text-hud-text mt-0.5">{a.msg}</div>
          </div>
          <button className="text-[8px] font-mono text-brand-400 border border-brand-400/30 px-1.5 py-0.5 rounded hover:bg-brand-400/10 flex-shrink-0">ACK</button>
        </div>
      ))}
    </div>
  )
}

function ProducaoPanel(_props: IDockviewPanelProps) {
  const chartTheme = useChartTheme()
  const option = {
    backgroundColor: 'transparent',
    grid: { top: 40, right: 20, bottom: 30, left: 50 },
    legend: { data: ['Realizado', 'Meta'], textStyle: { color: chartTheme.textColor, fontSize: 9 }, top: 5 },
    xAxis: { type: 'category' as const, data: ['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00'], axisLabel: { color: chartTheme.textColor, fontSize: 9 }, axisLine: { lineStyle: { color: chartTheme.axisColor }}},
    yAxis: { type: 'value' as const, name: 'ton', axisLabel: { color: chartTheme.textColor, fontSize: 9 }, splitLine: { lineStyle: { color: chartTheme.splitColor }}, nameTextStyle: { color: chartTheme.textColor }},
    series: [
      { name: 'Realizado', type: 'bar' as const, data: [1200,1350,1280,1420,1380,1550,1480,1620,1580,1710], itemStyle: { color: '#2563eb' }},
      { name: 'Meta', type: 'line' as const, data: [1400,1400,1400,1400,1400,1400,1400,1400,1400,1400], lineStyle: { color: '#f59e0b', type: 'dashed' as const }, symbol: 'none' }
    ],
    tooltip: { trigger: 'axis' as const }
  }
  return (
    <div className="h-full p-2">
      <ReactECharts option={option} style={{ height: '100%' }} />
    </div>
  )
}

function DispatchPanel(_props: IDockviewPanelProps) {
  const rotas = [
    { de: 'Cava Norte', para: 'Britagem', equips: ['CAT-001','CAT-002','LIE-006'], fila: 1, score: 92 },
    { de: 'Cava Sul', para: 'Pilha ROM', equips: ['CAT-004','VOL-005'], fila: 0, score: 87 },
    { de: 'Cava Principal', para: 'Britagem', equips: ['KOM-008','HIT-010','CAT-009'], fila: 2, score: 78 },
  ]
  return (
    <div className="h-full overflow-auto p-3 space-y-3">
      <div className="flex items-center gap-4 mb-2">
        <span className="text-[9px] font-mono text-dim uppercase">Modo:</span>
        {['Manual','Semi-Auto','Automático'].map((m,i)=>(
          <button key={m} className={`px-2 py-1 text-[9px] font-mono rounded border transition-all ${i===1 ? 'text-brand-400 border-brand-400/50 bg-brand-600/15' : 'text-dim border-hud-border hover:border-brand-400/30'}`}>{m}</button>
        ))}
      </div>
      {rotas.map((r,i) => (
        <div key={i} className="bg-hud-panel border border-hud-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-hud-text font-bold">{r.de}</span>
              <span className="text-brand-400">→</span>
              <span className="text-[10px] font-mono text-hud-text font-bold">{r.para}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-dim">Score:</span>
              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${r.score > 90 ? 'bg-green-400' : r.score > 80 ? 'bg-brand-400' : 'bg-amber-400'}`} style={{width:`${r.score}%`}}></div>
              </div>
              <span className="text-[9px] font-mono text-hud-text">{r.score}%</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {r.equips.map(e => (
              <span key={e} className="px-1.5 py-0.5 text-[8px] font-mono text-brand-400 bg-brand-600/10 border border-brand-600/30 rounded">{e}</span>
            ))}
            {r.fila > 0 && <span className="px-1.5 py-0.5 text-[8px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded">+{r.fila} fila</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

function AbastecimentoPanel(_props: IDockviewPanelProps) {
  const registros = [
    { equip: 'CAT-001', litros: 1850, custo: 'R$ 12.580', dt: '14:02', tipo: 'COMPLETO', nivel: 95 },
    { equip: 'KOM-003', litros: 2200, custo: 'R$ 14.960', dt: '12:45', tipo: 'COMPLETO', nivel: 100 },
    { equip: 'CAT-004', litros: 950, custo: 'R$ 6.460', dt: '11:30', tipo: 'PARCIAL', nivel: 72 },
    { equip: 'VOL-005', litros: 1100, custo: 'R$ 7.480', dt: '10:15', tipo: 'COMBOIO', nivel: 88 },
    { equip: 'LIE-006', litros: 2500, custo: 'R$ 17.000', dt: '09:00', tipo: 'COMPLETO', nivel: 96 },
  ]
  return (
    <div className="h-full overflow-auto p-2">
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-hud-panel border border-hud-border rounded p-2 text-center">
          <div className="text-[8px] text-dim uppercase">Hoje</div>
          <div className="text-sm font-mono font-bold text-hud-text">8.600 L</div>
        </div>
        <div className="bg-hud-panel border border-hud-border rounded p-2 text-center">
          <div className="text-[8px] text-dim uppercase">Custo</div>
          <div className="text-sm font-mono font-bold text-hud-text">R$ 58.4k</div>
        </div>
        <div className="bg-hud-panel border border-hud-border rounded p-2 text-center">
          <div className="text-[8px] text-dim uppercase">Média L/h</div>
          <div className="text-sm font-mono font-bold text-hud-text">42.3</div>
        </div>
      </div>
      <table className="w-full text-[10px] font-mono">
        <thead><tr className="text-dim uppercase border-b border-hud-border">
          <th className="py-1 text-left px-2">Equip</th><th className="py-1 text-right">Litros</th><th className="py-1 text-right">Custo</th><th className="py-1 text-center">Tipo</th><th className="py-1 text-right px-2">Nível</th><th className="py-1 text-right">Hora</th>
        </tr></thead>
        <tbody>{registros.map(r=>(
          <tr key={r.equip+r.dt} className="border-b border-hud-border/30">
            <td className="py-1 px-2 text-brand-400">{r.equip}</td>
            <td className="py-1 text-right text-hud-text">{r.litros.toLocaleString()}</td>
            <td className="py-1 text-right text-hud-text">{r.custo}</td>
            <td className="py-1 text-center"><span className={`px-1 py-0.5 rounded text-[8px] border ${r.tipo==='COMPLETO'?'text-green-400 border-green-400/30':'text-amber-400 border-amber-400/30'}`}>{r.tipo}</span></td>
            <td className="py-1 text-right px-2 text-green-400">{r.nivel}%</td>
            <td className="py-1 text-right text-dim">{r.dt}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}

function ManutencaoPanel(_props: IDockviewPanelProps) {
  const os = [
    { num: 'OS-2024-0847', equip: 'KOM-003', tipo: 'PREVENTIVA', status: 'EXECUTANDO', prioridade: 'ALTA', dt: '13:00' },
    { num: 'OS-2024-0848', equip: 'CAT-002', tipo: 'CORRETIVA', status: 'ABERTA', prioridade: 'URGENTE', dt: '14:10' },
    { num: 'OS-2024-0845', equip: 'CAT-009', tipo: 'PREVENTIVA', status: 'PROGRAMADA', prioridade: 'MEDIA', dt: '15:00' },
    { num: 'OS-2024-0842', equip: 'VOL-005', tipo: 'PREDITIVA', status: 'CONCLUIDA', prioridade: 'BAIXA', dt: '11:30' },
  ]
  return (
    <div className="h-full overflow-auto p-2 space-y-1.5">
      {os.map(o => (
        <div key={o.num} className="flex items-center gap-3 p-2 rounded border border-hud-border hover:bg-brand-600/5 transition-colors">
          <div className={`w-1.5 h-8 rounded-full ${
            o.status==='EXECUTANDO'?'bg-amber-400':o.status==='ABERTA'?'bg-brand-400':o.status==='PROGRAMADA'?'bg-blue-400':'bg-green-400'
          }`}></div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-brand-400 font-bold">{o.num}</span>
              <span className="text-[8px] px-1 py-0.5 rounded border text-dim border-hud-border">{o.tipo}</span>
              <span className={`text-[8px] px-1 py-0.5 rounded border ${
                o.prioridade==='URGENTE'?'text-red-400 border-red-400/30 animate-pulse':
                o.prioridade==='ALTA'?'text-amber-400 border-amber-400/30':
                'text-dim border-hud-border'
              }`}>{o.prioridade}</span>
            </div>
            <div className="text-[9px] text-hud-text mt-0.5">{o.equip} • {o.status} • {o.dt}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function QualidadePanel(_props: IDockviewPanelProps) {
  const chartTheme = useChartTheme()
  const option = {
    backgroundColor: 'transparent',
    radar: {
      indicator: [
        { name: 'Fe%', max: 70 }, { name: 'SiO2%', max: 10 }, { name: 'Al2O3%', max: 8 },
        { name: 'P%', max: 0.1 }, { name: 'Mn%', max: 1 }, { name: 'H2O%', max: 15 }
      ],
      axisLine: { lineStyle: { color: chartTheme.axisColor }},
      splitLine: { lineStyle: { color: chartTheme.splitColor }},
      axisName: { color: chartTheme.textColor, fontSize: 9 }
    },
    series: [{ type: 'radar' as const, data: [
      { value: [64.5, 4.2, 2.8, 0.045, 0.3, 8.5], name: 'Pilha ROM-01' },
      { value: [62.1, 5.8, 3.5, 0.062, 0.5, 10.2], name: 'Pilha ROM-02' }
    ], areaStyle: { opacity: 0.15 }}]
  }
  return (
    <div className="h-full p-2">
      <ReactECharts option={option} style={{ height: '100%' }} />
    </div>
  )
}

function MensageriaPanel(_props: IDockviewPanelProps) {
  const msgs = [
    { de: 'CCO', para: 'CAT-001', msg: 'Deslocar para Cava Norte, ponto de carga 3', dt: '14:15', status: '✓✓' },
    { de: 'CAT-001', para: 'CCO', msg: 'Entendido, deslocando', dt: '14:16', status: '✓✓' },
    { de: 'CCO', para: 'ALL', msg: '⚠️ Detonação em 30min - Zona B. Esvaziar área.', dt: '14:05', status: '✓' },
    { de: 'KOM-003', para: 'CCO', msg: 'Motor apresentando vibração anormal', dt: '13:58', status: '✓✓' },
    { de: 'CCO', para: 'KOM-003', msg: 'OS aberta. Encaminhar para oficina.', dt: '14:00', status: '✓✓' },
  ]
  return (
    <div className="h-full flex flex-col p-2">
      <div className="flex-1 overflow-y-auto space-y-1.5">
        {msgs.map((m,i) => (
          <div key={i} className={`flex ${m.de==='CCO' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-2.5 py-1.5 rounded-lg text-[10px] ${
              m.de==='CCO' ? 'bg-brand-600/20 border border-brand-600/30 text-hud-text' : 'bg-white/5 border border-hud-border text-hud-text'
            }`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-mono text-brand-400 text-[8px] font-bold">{m.de}</span>
                <span className="text-dim text-[8px]">→</span>
                <span className="font-mono text-[8px] text-dim">{m.para}</span>
              </div>
              <div>{m.msg}</div>
              <div className="text-right mt-0.5 text-[8px] text-dim">{m.dt} <span className="text-brand-400">{m.status}</span></div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        <input className="flex-1 bg-white/5 border border-hud-border rounded px-2 py-1.5 text-[10px] text-hud-text placeholder:text-dim/50 focus:border-brand-400/50 outline-none" placeholder="Mensagem..." />
        <button className="px-3 py-1.5 text-[9px] font-mono text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded hover:bg-brand-600/30">Enviar</button>
      </div>
    </div>
  )
}

function CiclosPanel(_props: IDockviewPanelProps) {
  const chartTheme = useChartTheme()
  const option = {
    backgroundColor: 'transparent',
    grid: { top: 30, right: 20, bottom: 30, left: 50 },
    xAxis: { type: 'category' as const, data: ['CAT-001','CAT-002','CAT-004','VOL-005','LIE-006','CAT-009'], axisLabel: { color: chartTheme.textColor, fontSize: 8, rotate: 30 }, axisLine: { lineStyle: { color: chartTheme.axisColor }}},
    yAxis: { type: 'value' as const, name: 'min', axisLabel: { color: chartTheme.textColor, fontSize: 9 }, splitLine: { lineStyle: { color: chartTheme.splitColor }}, nameTextStyle: { color: chartTheme.textColor }},
    series: [
      { name: 'Carga', type: 'bar' as const, stack: 'total', data: [3.2,3.5,4.1,3.8,3.0,4.5], itemStyle: { color: '#2563eb' }},
      { name: 'Transporte', type: 'bar' as const, stack: 'total', data: [8.5,9.2,7.8,10.1,8.0,11.5], itemStyle: { color: '#7c3aed' }},
      { name: 'Fila', type: 'bar' as const, stack: 'total', data: [2.1,1.5,3.2,0.8,1.2,4.5], itemStyle: { color: '#f59e0b' }},
      { name: 'Descarga', type: 'bar' as const, stack: 'total', data: [1.5,1.8,1.6,2.0,1.4,1.9], itemStyle: { color: '#10b981' }},
    ],
    legend: { data: ['Carga','Transporte','Fila','Descarga'], textStyle: { color: chartTheme.textColor, fontSize: 9 }, top: 0 },
    tooltip: { trigger: 'axis' as const }
  }
  return (
    <div className="h-full p-2">
      <ReactECharts option={option} style={{ height: '100%' }} />
    </div>
  )
}

// ===== COMPONENTS MAP =====
const components: Record<string, React.FunctionComponent<IDockviewPanelProps>> = {
  dashboard: DashboardPanel,
  mapa: MapaPanel,
  frota: FrotaPanel,
  operadores: OperadoresPanel,
  alertas: AlertasPanel,
  producao: ProducaoPanel,
  dispatch: DispatchPanel,
  abastecimento: AbastecimentoPanel,
  manutencao: ManutencaoPanel,
  qualidade: QualidadePanel,
  mensageria: MensageriaPanel,
  ciclos: CiclosPanel,
}

// ===== MAIN EXPORT =====
export default function Desktop() {
  return (
    <div className="h-full">
      <WindowManager
        windows={windowDefs}
        components={components}
        defaultOpen={['dashboard', 'mapa', 'alertas']}
      />
    </div>
  )
}
