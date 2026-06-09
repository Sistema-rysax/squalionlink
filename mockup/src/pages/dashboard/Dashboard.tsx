import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useTheme } from '../../contexts/ThemeContext'
import { equipamentos } from '../../mock/data'
import { fmtNum } from '../../utils/format'
import { Activity, Gauge, TrendingUp, Zap, Truck, AlertTriangle, Wind, Fuel } from 'lucide-react'

const kpis = [
  { icon: Activity, label: 'Disponibilidade Física', value: 82.4, suffix: '%', trend: '+2.1%', good: true },
  { icon: Gauge, label: 'Utilização Física', value: 71.2, suffix: '%', trend: '-1.3%', good: false },
  { icon: TrendingUp, label: 'Produção Turno', value: 14832, suffix: 'ton', trend: '+5.4%', good: true },
  { icon: Zap, label: 'Ciclos/Hora', value: 4.2, suffix: 'c/h', trend: null, good: true },
  { icon: Truck, label: 'Operando', value: '7', suffix: '/10', trend: null, good: true },
  { icon: AlertTriangle, label: 'Alertas', value: '4', suffix: 'abertos', trend: null, good: false },
  { icon: Wind, label: 'Vel. Média', value: 35.6, suffix: 'km/h', trend: null, good: true },
  { icon: Fuel, label: 'Consumo', value: 4230, suffix: 'L hoje', trend: null, good: true },
]

const hours = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00']
const prodData = [420,1180,1350,1280,1200,1100,980,1350,1200,1050,1300,900]
const dfData = [78,82,85,80,84,88,86,92,85,87,90,88]
const meta = 1400

export default function Dashboard() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const textColor = isDark ? '#9ca3af' : '#64748b'
  const axisLine = isDark ? '#2a2a4a' : '#e2e8f0'
  const bgColor = 'transparent'

  const prodOption = useMemo(() => ({
    backgroundColor: bgColor,
    tooltip: { trigger: 'axis', backgroundColor: isDark?'#1a1a2e':'#fff', borderColor: isDark?'#3a3a5a':'#e2e8f0', textStyle:{color:isDark?'#f3f4f6':'#1e293b'} },
    grid: { top: 40, right: 20, bottom: 30, left: 50 },
    xAxis: { type: 'category', data: hours, axisLine:{lineStyle:{color:axisLine}}, axisLabel:{color:textColor,fontSize:11} },
    yAxis: { type: 'value', axisLine:{show:false}, splitLine:{lineStyle:{color:axisLine,type:'dashed'}}, axisLabel:{color:textColor,fontSize:11} },
    series: [
      { name:'Produção', type:'line', data:prodData, smooth:true, areaStyle:{color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:isDark?'rgba(37,99,235,0.4)':'rgba(37,99,235,0.2)'},{offset:1,color:'rgba(37,99,235,0)'}]}}, lineStyle:{color:'#2563eb',width:2}, itemStyle:{color:'#2563eb'}, symbol:'circle', symbolSize:4 },
      { name:'Meta', type:'line', data:Array(12).fill(meta), lineStyle:{color:'#6b7280',type:'dashed',width:1.5}, symbol:'none', tooltip:{show:false} }
    ]
  }), [isDark])

  const statusCounts = { operando: equipamentos.filter(e=>e.status==='OPERANDO').length, parado: equipamentos.filter(e=>e.status==='PARADO').length, manutencao: equipamentos.filter(e=>e.status==='MANUTENCAO').length }
  const pieOption = useMemo(() => ({
    backgroundColor: bgColor,
    tooltip: { trigger:'item', backgroundColor: isDark?'#1a1a2e':'#fff', borderColor: isDark?'#3a3a5a':'#e2e8f0', textStyle:{color:isDark?'#f3f4f6':'#1e293b'} },
    legend: { bottom:10, textStyle:{color:textColor,fontSize:11}, itemWidth:10, itemHeight:10 },
    series: [{ type:'pie', radius:['50%','75%'], center:['50%','45%'], avoidLabelOverlap:false, label:{show:false}, emphasis:{label:{show:false}}, data:[
      {value:statusCounts.operando,name:`Operando (${statusCounts.operando})`,itemStyle:{color:'#22c55e'}},
      {value:statusCounts.parado,name:`Parado (${statusCounts.parado})`,itemStyle:{color:'#f59e0b'}},
      {value:statusCounts.manutencao,name:`Manutenção (${statusCounts.manutencao})`,itemStyle:{color:'#ef4444'}},
    ]}]
  }), [isDark])

  const dfOption = useMemo(() => ({
    backgroundColor: bgColor,
    tooltip: { trigger:'axis', backgroundColor: isDark?'#1a1a2e':'#fff', borderColor: isDark?'#3a3a5a':'#e2e8f0', textStyle:{color:isDark?'#f3f4f6':'#1e293b'}, formatter:(p:any)=>`${p[0].axisValue}<br/>DF: ${p[0].value.toFixed(1)}%` },
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    xAxis: { type:'category', data:hours, axisLine:{lineStyle:{color:axisLine}}, axisLabel:{color:textColor,fontSize:11} },
    yAxis: { type:'value', min:60, max:100, axisLine:{show:false}, splitLine:{lineStyle:{color:axisLine,type:'dashed'}}, axisLabel:{color:textColor,fontSize:11,formatter:'{value}%'} },
    series: [{ type:'bar', data:dfData, itemStyle:{color:'#22c55e',borderRadius:[3,3,0,0]}, barWidth:'60%' }]
  }), [isDark])

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-8 gap-3">
        {kpis.map((k,i) => (
          <div key={i} className="bg-surface-1 border border-surface-3 rounded-xl p-4 flex flex-col items-center text-center gap-1 relative overflow-hidden">
            <k.icon className="w-5 h-5 text-brand-400 mb-1" />
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold text-white">{typeof k.value==='number'?fmtNum(k.value,k.suffix==='%'||k.suffix==='c/h'?1:0):k.value}</span>
              <span className="text-xs text-gray-500">{k.suffix}</span>
            </div>
            <span className="text-[10px] text-gray-500 leading-tight">{k.label}</span>
            {k.trend && <span className={`absolute top-2 right-2 text-[10px] font-medium ${k.good?'text-green-400':'text-red-400'}`}>{k.trend}</span>}
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Produção por Hora (ton)</h3>
          <ReactECharts option={prodOption} style={{height:220}} opts={{renderer:'svg'}} />
        </div>
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Status da Frota</h3>
          <ReactECharts option={pieOption} style={{height:220}} opts={{renderer:'svg'}} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-2">DF% por Hora</h3>
          <ReactECharts option={dfOption} style={{height:200}} opts={{renderer:'svg'}} />
        </div>
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Equipamentos — Status Atual</h3>
          <div className="space-y-2 mt-3 max-h-[180px] overflow-y-auto">
            {equipamentos.slice(0,8).map(e => (
              <div key={e.id} className="flex items-center gap-3 text-sm px-2 py-1.5 rounded-lg hover:bg-surface-2">
                <span className={`w-2.5 h-2.5 rounded-full ${e.status==='OPERANDO'?'bg-green-500':e.status==='PARADO'?'bg-yellow-500':'bg-red-500'}`}></span>
                <span className="font-mono text-brand-400 w-14 text-xs">{e.codigo}</span>
                <span className="text-gray-300 flex-1 text-xs truncate">{e.atividade||'—'}</span>
                <span className="text-gray-500 text-xs w-20 text-right">{e.operador?.split(' ')[0]||'—'}</span>
                <span className="text-gray-400 text-xs font-mono w-12 text-right">{e.vel} km/h</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}