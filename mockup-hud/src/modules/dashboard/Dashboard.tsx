import { useState, useEffect, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import Gauge from '../../components/indicators/Gauge'
import LiveCounter from '../../components/indicators/LiveCounter'
import SparkLine from '../../components/indicators/SparkLine'
import { equipamentos, producaoHora, dfHora, horas, alertas } from '../../mock/data'
import { AlertTriangle, Fuel } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useChartTheme } from '../../hooks/useChartTheme'

export default function Dashboard() {
  const { theme } = useTheme()
  const chartTheme = useChartTheme()
  const isDark = theme === 'dark'

  const [tick, setTick] = useState(0)
  useEffect(() => { const t = setInterval(() => setTick(p => p + 1), 3000); return () => clearInterval(t) }, [])

  const operando = equipamentos.filter(e => e.status === 'OPERANDO').length
  const parado = equipamentos.filter(e => e.status === 'PARADO').length
  const manut = equipamentos.filter(e => e.status === 'MANUTENCAO').length

  const prodOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' as const, backgroundColor: chartTheme.tooltip.bg, borderColor: chartTheme.tooltip.border, textStyle: { color: chartTheme.tooltip.text, fontFamily: 'JetBrains Mono', fontSize: 11 } },
    grid: { top: 16, right: 16, bottom: 28, left: 48 },
    xAxis: { type: 'category' as const, data: horas, axisLabel: { color: chartTheme.axis.label, fontSize: 10, fontFamily: 'JetBrains Mono' }, axisLine: { lineStyle: { color: chartTheme.axis.line } }, splitLine: { show: false } },
    yAxis: { type: 'value' as const, axisLabel: { color: chartTheme.axis.label, fontSize: 10, fontFamily: 'JetBrains Mono' }, splitLine: { lineStyle: { color: chartTheme.axis.split, type: 'dashed' as const } }, axisLine: { show: false } },
    series: [
      { type: 'line', data: producaoHora, smooth: true, symbol: 'none', lineStyle: { color: chartTheme.brand, width: 2.5 }, areaStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: isDark ? 'rgba(37,99,235,0.25)' : 'rgba(37,99,235,0.1)' }, { offset: 1, color: 'rgba(37,99,235,0)' }] } } },
      { type: 'line', data: Array(12).fill(1400), symbol: 'none', lineStyle: { color: isDark ? 'rgba(239,68,68,0.5)' : 'rgba(220,38,38,0.6)', type: 'dashed' as const, width: 1.5 } }
    ]
  }), [chartTheme, isDark])

  const dfOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' as const, backgroundColor: chartTheme.tooltip.bg, borderColor: chartTheme.tooltip.border, textStyle: { color: chartTheme.tooltip.text, fontFamily: 'JetBrains Mono', fontSize: 11 } },
    grid: { top: 16, right: 16, bottom: 28, left: 44 },
    xAxis: { type: 'category' as const, data: horas, axisLabel: { color: chartTheme.axis.label, fontSize: 9, fontFamily: 'JetBrains Mono' }, axisLine: { lineStyle: { color: chartTheme.axis.line } } },
    yAxis: { type: 'value' as const, min: 60, max: 100, axisLabel: { color: chartTheme.axis.label, fontSize: 9, fontFamily: 'JetBrains Mono', formatter: '{value}%' }, splitLine: { lineStyle: { color: chartTheme.axis.split, type: 'dashed' as const } } },
    series: [{ type: 'bar', data: dfHora, itemStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: chartTheme.ok }, { offset: 1, color: isDark ? 'rgba(34,197,94,0.3)' : 'rgba(22,163,74,0.15)' }] }, borderRadius: [3, 3, 0, 0] }, barWidth: '55%' }]
  }), [chartTheme, isDark])

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      {/* KPI Row */}
      <div className="dash-kpis flex items-center justify-between gap-4 flex-wrap">
        <Gauge value={82.4} label="Disp. Física" status="ok" size={80} />
        <Gauge value={71.2} label="Utilização" status="ok" size={80} />
        <LiveCounter value={14832 + tick * 12} label="Produção Turno" unit="ton" trend={5.4} />
        <LiveCounter value={4.2} label="Ciclos/Hora" unit="c/h" decimals={1} />
        {/* Fleet mini status */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.5)]"></div><span className="font-mono text-sm font-bold">{operando}</span></div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]"></div><span className="font-mono text-sm font-bold">{parado}</span></div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.5)]"></div><span className="font-mono text-sm font-bold">{manut}</span></div>
          </div>
          <span className="text-[8px] font-display uppercase tracking-widest text-dim">Frota Status</span>
        </div>
        <LiveCounter value={35.6} label="Vel. Média" unit="km/h" decimals={1} />
        <LiveCounter value={4230 + tick * 5} label="Consumo Dia" unit="L" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4" style={{ minHeight: '220px' }}>
        {/* Produção Chart */}
        <div className="col-span-2 dash-panel rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[9px] font-display uppercase tracking-widest text-dim">Produção / Hora</h3>
            <span className="text-[9px] font-mono text-dim">Meta: <span className="text-crit">1.400 t</span></span>
          </div>
          <ReactECharts option={prodOption} style={{ height: 190 }} key={'prod-' + chartTheme.key} />
        </div>
        {/* DF Chart */}
        <div className="dash-panel rounded-xl p-3">
          <h3 className="text-[9px] font-display uppercase tracking-widest text-dim mb-1">DF% / Hora</h3>
          <ReactECharts option={dfOption} style={{ height: 190 }} key={'df-' + chartTheme.key} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-5 gap-4" style={{ minHeight: '200px' }}>
        {/* Frota Table */}
        <div className="col-span-3 dash-panel rounded-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-hud-border/50">
            <h3 className="text-[9px] font-display uppercase tracking-widest text-dim">Frota — Status ao Vivo</h3>
          </div>
          <div className="overflow-auto max-h-[240px]">
            {equipamentos.map(e => (
              <div key={e.id} className="flex items-center gap-2.5 px-3 py-1.5 border-b border-hud-border/20 hover:bg-brand-600/[0.03] transition-colors">
                <div className={'w-2 h-2 rounded-full flex-shrink-0 ' + (e.status === 'OPERANDO' ? 'bg-green-400 shadow-[0_0_4px_rgba(34,197,94,0.6)]' : e.status === 'PARADO' ? 'bg-amber-400' : 'bg-red-400')}></div>
                <span className="font-mono text-[11px] text-brand-400 font-bold w-14 flex-shrink-0">{e.codigo}</span>
                <span className="text-[10px] text-dim w-24 truncate flex-shrink-0">{e.atividade || '—'}</span>
                <span className="text-[10px] text-dim w-24 truncate flex-shrink-0">{e.operador || '—'}</span>
                <SparkLine data={[30, 35, 42, 38, e.vel, e.vel + 2, e.vel - 1]} color={e.status === 'OPERANDO' ? (isDark ? '#22c55e' : '#16a34a') : '#94a3b8'} width={50} height={14} />
                <span className="font-mono text-[10px] w-14 text-right flex-shrink-0">{e.vel} km/h</span>
                <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                  <Fuel className={'w-3 h-3 ' + (e.tanque < 30 ? 'text-crit' : e.tanque < 50 ? 'text-warn' : 'text-dim')} />
                  <span className={'font-mono text-[9px] ' + (e.tanque < 30 ? 'text-crit' : e.tanque < 50 ? 'text-warn' : 'text-dim')}>{e.tanque}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas */}
        <div className="col-span-2 dash-panel rounded-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-hud-border/50 flex items-center justify-between">
            <h3 className="text-[9px] font-display uppercase tracking-widest text-dim">Alertas Ativos</h3>
            <span className="text-[9px] font-mono text-crit">{alertas.filter(a=>!a.tratado).length} pendentes</span>
          </div>
          <div className="overflow-auto max-h-[240px]">
            {alertas.map(a => (
              <div key={a.id} className={'flex items-start gap-2.5 px-3 py-2.5 border-b border-hud-border/20 transition-colors ' + (!a.tratado ? 'hover:bg-white/[0.02]' : 'opacity-40')}>
                <AlertTriangle className={'w-3.5 h-3.5 shrink-0 mt-0.5 ' + (a.tipo === 'CRITICO' ? 'text-crit' : a.tipo === 'ALERTA' ? 'text-warn' : 'text-info')} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-300 leading-tight">{a.msg}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-mono text-dim">{a.dt}</span>
                    <span className={'text-[8px] font-mono px-1.5 py-0.5 rounded border ' + (a.tipo === 'CRITICO' ? 'bg-crit/10 text-crit border-crit/20' : a.tipo === 'ALERTA' ? 'bg-warn/10 text-warn border-warn/20' : 'bg-info/10 text-info border-info/20')}>{a.tipo}</span>
                  </div>
                </div>
                {!a.tratado && <button className="text-[8px] font-mono text-dim hover:text-brand-400 border border-hud-border px-2 py-0.5 rounded transition-colors flex-shrink-0">ACK</button>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
