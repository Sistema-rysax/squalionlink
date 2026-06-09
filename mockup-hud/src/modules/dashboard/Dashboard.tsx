import { useState, useEffect, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import Panel from '../../components/panels/Panel'
import Gauge from '../../components/indicators/Gauge'
import LiveCounter from '../../components/indicators/LiveCounter'
import SparkLine from '../../components/indicators/SparkLine'
import { equipamentos, producaoHora, dfHora, horas, alertas } from '../../mock/data'
import { Truck, AlertTriangle, Fuel } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export default function Dashboard() {
  const [tick, setTick] = useState(0)
  const { theme } = useTheme()
  useEffect(() => { const t = setInterval(()=>setTick(p=>p+1), 3000); return ()=>clearInterval(t) }, [])

  const operando = equipamentos.filter(e=>e.status==='OPERANDO').length
  const parado = equipamentos.filter(e=>e.status==='PARADO').length
  const manut = equipamentos.filter(e=>e.status==='MANUTENCAO').length

  const isDark = theme === 'dark'
  const chartColors = useMemo(() => ({
    tooltip: { bg: isDark ? '#0a0c12' : '#ffffff', border: isDark ? '#1a2030' : '#e2e8f0', text: isDark ? '#e2e8f0' : '#1e293b' },
    axis: { label: isDark ? '#4b5563' : '#64748b', line: isDark ? '#1a2030' : '#e2e8f0', split: isDark ? '#1a2030' : '#f1f5f9' },
    brand: isDark ? '#2563eb' : '#1d4ed8',
    brandArea: isDark ? 'rgba(37,99,235,0.3)' : 'rgba(37,99,235,0.12)',
    brandAreaEnd: isDark ? 'rgba(37,99,235,0)' : 'rgba(37,99,235,0)',
    barTop: isDark ? '#22c55e' : '#16a34a',
    barBottom: isDark ? 'rgba(34,197,94,0.4)' : 'rgba(22,163,74,0.2)',
    metaLine: isDark ? 'rgba(239,68,68,0.4)' : 'rgba(220,38,38,0.5)',
  }), [isDark])

  const prodOption = useMemo(()=>({
    backgroundColor:'transparent',
    tooltip:{trigger:'axis',backgroundColor:chartColors.tooltip.bg,borderColor:chartColors.tooltip.border,textStyle:{color:chartColors.tooltip.text,fontFamily:'JetBrains Mono',fontSize:11}},
    grid:{top:20,right:16,bottom:24,left:45},
    xAxis:{type:'category' as const,data:horas,axisLabel:{color:chartColors.axis.label,fontSize:10,fontFamily:'JetBrains Mono'},axisLine:{lineStyle:{color:chartColors.axis.line}},splitLine:{show:false}},
    yAxis:{type:'value' as const,axisLabel:{color:chartColors.axis.label,fontSize:10,fontFamily:'JetBrains Mono'},splitLine:{lineStyle:{color:chartColors.axis.split,type:'dashed' as const}},axisLine:{show:false}},
    series:[
      {type:'line',data:producaoHora,smooth:true,symbol:'none',lineStyle:{color:chartColors.brand,width:2},areaStyle:{color:{type:'linear' as const,x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:chartColors.brandArea},{offset:1,color:chartColors.brandAreaEnd}]}}},
      {type:'line',data:Array(12).fill(1400),symbol:'none',lineStyle:{color:chartColors.metaLine,type:'dashed' as const,width:1}}
    ]
  }),[chartColors])

  const dfOption = useMemo(()=>({
    backgroundColor:'transparent',
    tooltip:{trigger:'axis',backgroundColor:chartColors.tooltip.bg,borderColor:chartColors.tooltip.border,textStyle:{color:chartColors.tooltip.text,fontFamily:'JetBrains Mono',fontSize:11}},
    grid:{top:10,right:16,bottom:24,left:40},
    xAxis:{type:'category' as const,data:horas,axisLabel:{color:chartColors.axis.label,fontSize:9,fontFamily:'JetBrains Mono'},axisLine:{lineStyle:{color:chartColors.axis.line}}},
    yAxis:{type:'value' as const,min:60,max:100,axisLabel:{color:chartColors.axis.label,fontSize:9,fontFamily:'JetBrains Mono',formatter:'{value}%'},splitLine:{lineStyle:{color:chartColors.axis.split,type:'dashed' as const}}},
    series:[{type:'bar',data:dfHora,itemStyle:{color:{type:'linear' as const,x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:chartColors.barTop},{offset:1,color:chartColors.barBottom}]},borderRadius:[2,2,0,0]},barWidth:'50%'}]
  }),[chartColors])

  return (
    <div className="grid grid-cols-12 grid-rows-[auto_1fr_1fr] gap-3 h-full">
      {/* Row 1: KPI Gauges */}
      <div className="col-span-12">
        <Panel title="Indicadores Operacionais" status="ok" subtitle="TEMPO REAL">
          <div className="flex items-center justify-between py-2">
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
        </Panel>
      </div>

      {/* Row 2: Production + DF */}
      <div className="col-span-7">
        <Panel title="Produção / Hora" status="info" subtitle="META 1.400 ton" className="h-full">
          <ReactECharts option={prodOption} style={{height:'100%',minHeight:200}} opts={{renderer:'svg'}} key={'prod-'+theme} />
        </Panel>
      </div>
      <div className="col-span-5">
        <Panel title="DF% / Hora" status="ok" className="h-full">
          <ReactECharts option={dfOption} style={{height:'100%',minHeight:200}} opts={{renderer:'svg'}} key={'df-'+theme} />
        </Panel>
      </div>

      {/* Row 3: Fleet Table + Alerts */}
      <div className="col-span-7">
        <Panel title="Frota — Status ao Vivo" status="ok" subtitle={equipamentos.length + ' EQUIPAMENTOS'} className="h-full" noPad>
          <div className="divide-y divide-hud-border/30">
            {equipamentos.map(e => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-2 hover:bg-white/[0.02] transition-colors group">
                <div className={'led led-' + (e.status==='OPERANDO'?'ok':e.status==='PARADO'?'warn':'crit')}></div>
                <span className="font-mono text-xs text-brand-400 w-14">{e.codigo}</span>
                <span className="text-xs text-gray-400 w-24 truncate">{e.atividade || '—'}</span>
                <span className="text-xs text-dim w-24 truncate">{e.operador || '—'}</span>
                <SparkLine data={[30,35,42,38,e.vel,e.vel+2,e.vel-1]} color={e.status==='OPERANDO'?(isDark?'#22c55e':'#16a34a'):'#94a3b8'} width={60} height={16} />
                <span className="font-mono text-xs text-gray-300 w-16 text-right">{e.vel} km/h</span>
                <div className="flex-1"></div>
                <div className="flex items-center gap-1">
                  <Fuel className={'w-3 h-3 ' + (e.tanque<30?'text-crit':e.tanque<50?'text-warn':'text-dim')} />
                  <span className={'font-mono text-[10px] ' + (e.tanque<30?'text-crit':e.tanque<50?'text-warn':'text-dim')}>{e.tanque}%</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="col-span-5">
        <Panel title="Alertas Ativos" status={alertas.some(a=>a.tipo==='CRITICO'&&!a.tratado)?'crit':'warn'} subtitle={alertas.filter(a=>!a.tratado).length + ' PENDENTES'} className="h-full" noPad>
          <div className="divide-y divide-hud-border/30">
            {alertas.map(a => (
              <div key={a.id} className={'flex items-start gap-3 px-4 py-3 transition-colors ' + (!a.tratado?'hover:bg-white/[0.02]':'opacity-50')}>
                <AlertTriangle className={'w-4 h-4 shrink-0 mt-0.5 ' + (a.tipo==='CRITICO'?'text-crit animate-breathe':a.tipo==='ALERTA'?'text-warn':'text-info')} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-300 truncate">{a.msg}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-dim">{a.dt}</span>
                    <span className={'text-[9px] font-mono px-1.5 py-0.5 rounded ' + (a.tipo==='CRITICO'?'bg-crit/10 text-crit':a.tipo==='ALERTA'?'bg-warn/10 text-warn':'bg-info/10 text-info')}>{a.tipo}</span>
                  </div>
                </div>
                {!a.tratado && <button className="text-[9px] font-mono text-dim hover:text-brand-400 border border-hud-border px-2 py-1 rounded transition-colors">ACK</button>}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}