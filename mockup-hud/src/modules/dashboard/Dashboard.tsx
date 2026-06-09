import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { DockviewReact, DockviewReadyEvent, IDockviewPanelProps } from 'dockview-react'
import ReactECharts from 'echarts-for-react'
import Gauge from '../../components/indicators/Gauge'
import LiveCounter from '../../components/indicators/LiveCounter'
import SparkLine from '../../components/indicators/SparkLine'
import { equipamentos, producaoHora, dfHora, horas, alertas } from '../../mock/data'
import { AlertTriangle, Fuel, RotateCcw } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useChartTheme } from '../../hooks/useChartTheme'

/* ─── KPIs PANEL ─── */
const KPIsPanel = (_props: IDockviewPanelProps) => {
  const [tick, setTick] = useState(0)
  useEffect(() => { const t = setInterval(() => setTick(p => p + 1), 3000); return () => clearInterval(t) }, [])

  const operando = equipamentos.filter(e => e.status === 'OPERANDO').length
  const parado = equipamentos.filter(e => e.status === 'PARADO').length
  const manut = equipamentos.filter(e => e.status === 'MANUTENCAO').length

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Gauge value={82.4} label="Disp. Física" status="ok" size={90} />
        <Gauge value={71.2} label="Utilização" status="ok" size={90} />
        <LiveCounter value={14832 + tick * 12} label="Produção Turno" unit="ton" trend={5.4} />
        <LiveCounter value={4.2} label="Ciclos/Hora" unit="c/h" decimals={1} />
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5"><div className="led led-ok"></div><span className="font-mono text-sm text-gray-200">{operando}</span></div>
            <div className="flex items-center gap-1.5"><div className="led led-warn"></div><span className="font-mono text-sm text-gray-200">{parado}</span></div>
            <div className="flex items-center gap-1.5"><div className="led led-crit"></div><span className="font-mono text-sm text-gray-200">{manut}</span></div>
          </div>
          <span className="text-[9px] font-display uppercase tracking-widest text-dim">Frota Status</span>
        </div>
        <LiveCounter value={35.6} label="Vel. Média" unit="km/h" decimals={1} />
        <LiveCounter value={4230 + tick * 5} label="Consumo Dia" unit="L" />
      </div>
    </div>
  )
}

/* ─── PRODUCAO PANEL ─── */
const ProducaoPanel = (_props: IDockviewPanelProps) => {
  const chartTheme = useChartTheme()

  const prodOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: chartTheme.tooltip.bg, borderColor: chartTheme.tooltip.border, textStyle: { color: chartTheme.tooltip.text, fontFamily: 'JetBrains Mono', fontSize: 11 } },
    grid: { top: 20, right: 16, bottom: 24, left: 45 },
    xAxis: { type: 'category' as const, data: horas, axisLabel: { color: chartTheme.axis.label, fontSize: 10, fontFamily: 'JetBrains Mono' }, axisLine: { lineStyle: { color: chartTheme.axis.line } }, splitLine: { show: false } },
    yAxis: { type: 'value' as const, axisLabel: { color: chartTheme.axis.label, fontSize: 10, fontFamily: 'JetBrains Mono' }, splitLine: { lineStyle: { color: chartTheme.axis.split, type: 'dashed' as const } }, axisLine: { show: false } },
    series: [
      { type: 'line', data: producaoHora, smooth: true, symbol: 'none', lineStyle: { color: chartTheme.brand, width: 2 }, areaStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: chartTheme.isDark ? 'rgba(37,99,235,0.3)' : 'rgba(37,99,235,0.12)' }, { offset: 1, color: 'rgba(37,99,235,0)' }] } } },
      { type: 'line', data: Array(12).fill(1400), symbol: 'none', lineStyle: { color: chartTheme.isDark ? 'rgba(239,68,68,0.4)' : 'rgba(220,38,38,0.5)', type: 'dashed' as const, width: 1 } }
    ]
  }), [chartTheme])

  return (
    <div className="h-full w-full p-2">
      <ReactECharts option={prodOption} style={{ height: '100%', minHeight: 180 }} opts={{ renderer: 'svg' }} key={'prod-' + chartTheme.key} />
    </div>
  )
}

/* ─── DF PANEL ─── */
const DFPanel = (_props: IDockviewPanelProps) => {
  const chartTheme = useChartTheme()

  const dfOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: chartTheme.tooltip.bg, borderColor: chartTheme.tooltip.border, textStyle: { color: chartTheme.tooltip.text, fontFamily: 'JetBrains Mono', fontSize: 11 } },
    grid: { top: 10, right: 16, bottom: 24, left: 40 },
    xAxis: { type: 'category' as const, data: horas, axisLabel: { color: chartTheme.axis.label, fontSize: 9, fontFamily: 'JetBrains Mono' }, axisLine: { lineStyle: { color: chartTheme.axis.line } } },
    yAxis: { type: 'value' as const, min: 60, max: 100, axisLabel: { color: chartTheme.axis.label, fontSize: 9, fontFamily: 'JetBrains Mono', formatter: '{value}%' }, splitLine: { lineStyle: { color: chartTheme.axis.split, type: 'dashed' as const } } },
    series: [{ type: 'bar', data: dfHora, itemStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: chartTheme.ok }, { offset: 1, color: chartTheme.isDark ? 'rgba(34,197,94,0.4)' : 'rgba(22,163,74,0.2)' }] }, borderRadius: [2, 2, 0, 0] }, barWidth: '50%' }]
  }), [chartTheme])

  return (
    <div className="h-full w-full p-2">
      <ReactECharts option={dfOption} style={{ height: '100%', minHeight: 180 }} opts={{ renderer: 'svg' }} key={'df-' + chartTheme.key} />
    </div>
  )
}

/* ─── FROTA PANEL ─── */
const FrotaPanel = (_props: IDockviewPanelProps) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="h-full overflow-auto">
      <div className="divide-y divide-hud-border/30">
        {equipamentos.map(e => (
          <div key={e.id} className="flex items-center gap-3 px-4 py-2 hover:bg-white/[0.02] transition-colors group">
            <div className={'led led-' + (e.status === 'OPERANDO' ? 'ok' : e.status === 'PARADO' ? 'warn' : 'crit')}></div>
            <span className="font-mono text-xs text-brand-400 w-14">{e.codigo}</span>
            <span className="text-xs text-gray-400 w-24 truncate">{e.atividade || '—'}</span>
            <span className="text-xs text-dim w-24 truncate">{e.operador || '—'}</span>
            <SparkLine data={[30, 35, 42, 38, e.vel, e.vel + 2, e.vel - 1]} color={e.status === 'OPERANDO' ? (isDark ? '#22c55e' : '#16a34a') : '#94a3b8'} width={60} height={16} />
            <span className="font-mono text-xs text-gray-300 w-16 text-right">{e.vel} km/h</span>
            <div className="flex-1"></div>
            <div className="flex items-center gap-1">
              <Fuel className={'w-3 h-3 ' + (e.tanque < 30 ? 'text-crit' : e.tanque < 50 ? 'text-warn' : 'text-dim')} />
              <span className={'font-mono text-[10px] ' + (e.tanque < 30 ? 'text-crit' : e.tanque < 50 ? 'text-warn' : 'text-dim')}>{e.tanque}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── ALERTAS PANEL ─── */
const AlertasPanel = (_props: IDockviewPanelProps) => {
  return (
    <div className="h-full overflow-auto">
      <div className="divide-y divide-hud-border/30">
        {alertas.map(a => (
          <div key={a.id} className={'flex items-start gap-3 px-4 py-3 transition-colors ' + (!a.tratado ? 'hover:bg-white/[0.02]' : 'opacity-50')}>
            <AlertTriangle className={'w-4 h-4 shrink-0 mt-0.5 ' + (a.tipo === 'CRITICO' ? 'text-crit animate-breathe' : a.tipo === 'ALERTA' ? 'text-warn' : 'text-info')} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-300 truncate">{a.msg}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-dim">{a.dt}</span>
                <span className={'text-[9px] font-mono px-1.5 py-0.5 rounded ' + (a.tipo === 'CRITICO' ? 'bg-crit/10 text-crit' : a.tipo === 'ALERTA' ? 'bg-warn/10 text-warn' : 'bg-info/10 text-info')}>{a.tipo}</span>
              </div>
            </div>
            {!a.tratado && <button className="text-[9px] font-mono text-dim hover:text-brand-400 border border-hud-border px-2 py-1 rounded transition-colors">ACK</button>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── MAIN DASHBOARD COMPONENT ─── */
const components = {
  kpis: KPIsPanel,
  producao: ProducaoPanel,
  df: DFPanel,
  frota: FrotaPanel,
  alertas: AlertasPanel,
}

export default function Dashboard() {
  const apiRef = useRef<any>(null)

  const onReady = useCallback((event: DockviewReadyEvent) => {
    apiRef.current = event.api

    event.api.addPanel({ id: 'kpis', component: 'kpis', title: 'Indicadores Operacionais' })
    event.api.addPanel({ id: 'producao', component: 'producao', title: 'Produção / Hora', position: { referencePanel: 'kpis', direction: 'below' } })
    event.api.addPanel({ id: 'df', component: 'df', title: 'DF% / Hora', position: { referencePanel: 'producao', direction: 'right' } })
    event.api.addPanel({ id: 'frota', component: 'frota', title: 'Frota — Status ao Vivo', position: { referencePanel: 'producao', direction: 'below' } })
    event.api.addPanel({ id: 'alertas', component: 'alertas', title: 'Alertas Ativos', position: { referencePanel: 'frota', direction: 'right' } })
  }, [])

  const resetLayout = useCallback(() => {
    if (!apiRef.current) return
    const api = apiRef.current
    // Clear all panels and re-add
    const panels = api.panels
    panels.forEach((p: any) => p.api.close())
    api.addPanel({ id: 'kpis', component: 'kpis', title: 'Indicadores Operacionais' })
    api.addPanel({ id: 'producao', component: 'producao', title: 'Produção / Hora', position: { referencePanel: 'kpis', direction: 'below' } })
    api.addPanel({ id: 'df', component: 'df', title: 'DF% / Hora', position: { referencePanel: 'producao', direction: 'right' } })
    api.addPanel({ id: 'frota', component: 'frota', title: 'Frota — Status ao Vivo', position: { referencePanel: 'producao', direction: 'below' } })
    api.addPanel({ id: 'alertas', component: 'alertas', title: 'Alertas Ativos', position: { referencePanel: 'frota', direction: 'right' } })
  }, [])

  return (
    <div className="h-full relative">
      <button
        onClick={resetLayout}
        className="absolute top-2 right-2 z-50 flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase text-dim hover:text-brand-400 bg-hud-panel/90 border border-hud-border rounded-md hover:shadow-glow-sm transition-all backdrop-blur-sm"
        title="Resetar Layout"
      >
        <RotateCcw className="w-3 h-3" />Reset
      </button>
      <DockviewReact
        onReady={onReady}
        components={components}
        className="dockview-theme-dark h-full"
        watermarkComponent={() => null}
      />
    </div>
  )
}
