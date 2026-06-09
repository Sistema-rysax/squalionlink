import { useState, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useTheme } from '../../contexts/ThemeContext'
import Drawer from '../../components/ui/Drawer'
import { fmtNum } from '../../utils/format'
import { Clock, Route, Truck } from 'lucide-react'

const ciclos = [
  { id:1, equip:'CAT-01', operador:'João Silva', inicio:'06:12', fim:'06:38', duracao:26, carga:4.2, transporte_cheio:8.5, descarga:2.1, transporte_vazio:6.8, fila:4.4, origem:'Frente Norte B3', destino:'Britador', material:'ROM', peso:92 },
  { id:2, equip:'CAT-04', operador:'Pedro Costa', inicio:'06:05', fim:'06:28', duracao:23, carga:3.8, transporte_cheio:7.2, descarga:1.9, transporte_vazio:5.8, fila:4.3, origem:'Frente Sul A1', destino:'Pilha Estéril', material:'Estéril', peso:88 },
  { id:3, equip:'CAT-01', operador:'João Silva', inicio:'06:40', fim:'07:04', duracao:24, carga:4.0, transporte_cheio:8.0, descarga:2.0, transporte_vazio:6.2, fila:3.8, origem:'Frente Norte B3', destino:'Britador', material:'ROM', peso:94 },
  { id:4, equip:'CAT-05', operador:'Roberto Lima', inicio:'06:15', fim:'06:45', duracao:30, carga:5.0, transporte_cheio:9.5, descarga:2.5, transporte_vazio:7.8, fila:5.2, origem:'Frente Norte B3', destino:'Pilha ROM', material:'ROM', peso:90 },
  { id:5, equip:'CAT-04', operador:'Pedro Costa', inicio:'06:30', fim:'06:55', duracao:25, carga:4.1, transporte_cheio:7.8, descarga:2.0, transporte_vazio:6.5, fila:4.6, origem:'Frente Sul A1', destino:'Pilha Estéril', material:'Estéril', peso:86 },
]

export default function Ciclos() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [selected, setSelected] = useState<any>(null)
  const textColor = isDark ? '#9ca3af' : '#64748b'
  const axisLine = isDark ? '#2a2a4a' : '#e2e8f0'

  const breakdownOption = useMemo(() => {
    if (!selected) return {}
    const etapas = ['Fila','Carga','Transp. Cheio','Descarga','Transp. Vazio']
    const valores = [selected.fila, selected.carga, selected.transporte_cheio, selected.descarga, selected.transporte_vazio]
    const cores = ['#f59e0b','#2563eb','#22c55e','#a855f7','#06b6d4']
    return {
      backgroundColor:'transparent',
      tooltip:{trigger:'axis',axisPointer:{type:'shadow'},backgroundColor:isDark?'#1a1a2e':'#fff',borderColor:isDark?'#3a3a5a':'#e2e8f0',textStyle:{color:isDark?'#f3f4f6':'#1e293b'},formatter:(p:any)=>`${p[0].name}: ${p[0].value.toFixed(1)} min`},
      grid:{top:10,right:30,bottom:20,left:110},
      xAxis:{type:'value',axisLabel:{color:textColor,fontSize:11,formatter:'{value} min'},splitLine:{lineStyle:{color:axisLine,type:'dashed'}}},
      yAxis:{type:'category',data:etapas,axisLabel:{color:textColor,fontSize:12},axisLine:{lineStyle:{color:axisLine}}},
      series:[{type:'bar',data:valores.map((v,i)=>({value:v,itemStyle:{color:cores[i],borderRadius:[0,4,4,0]}})),barWidth:'60%'}]
    }
  }, [selected, isDark])

  const overviewOption = useMemo(() => ({
    backgroundColor:'transparent',
    tooltip:{trigger:'axis',backgroundColor:isDark?'#1a1a2e':'#fff',borderColor:isDark?'#3a3a5a':'#e2e8f0',textStyle:{color:isDark?'#f3f4f6':'#1e293b'}},
    legend:{bottom:0,textStyle:{color:textColor,fontSize:11}},
    grid:{top:20,right:20,bottom:40,left:50},
    xAxis:{type:'category',data:ciclos.map(c=>`${c.equip} ${c.inicio}`),axisLabel:{color:textColor,fontSize:10,rotate:20},axisLine:{lineStyle:{color:axisLine}}},
    yAxis:{type:'value',name:'min',axisLabel:{color:textColor,fontSize:11},splitLine:{lineStyle:{color:axisLine,type:'dashed'}},nameTextStyle:{color:textColor}},
    series:[
      {name:'Fila',type:'bar',stack:'total',data:ciclos.map(c=>c.fila),itemStyle:{color:'#f59e0b'}},
      {name:'Carga',type:'bar',stack:'total',data:ciclos.map(c=>c.carga),itemStyle:{color:'#2563eb'}},
      {name:'Transp.',type:'bar',stack:'total',data:ciclos.map(c=>c.transporte_cheio+c.transporte_vazio),itemStyle:{color:'#22c55e'}},
      {name:'Descarga',type:'bar',stack:'total',data:ciclos.map(c=>c.descarga),itemStyle:{color:'#a855f7'}},
    ]
  }), [isDark])

  return (<div className="space-y-6">
    <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-2">Ciclos — Breakdown Empilhado</h3>
      <ReactECharts option={overviewOption} style={{height:220}} opts={{renderer:'svg'}} />
    </div>
    <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Ciclos Registrados</h3>
      <div className="space-y-2">{ciclos.map(c=>(
        <button key={c.id} onClick={()=>setSelected(c)} className={`w-full flex items-center gap-4 p-3 rounded-lg text-left transition-colors ${selected?.id===c.id?'bg-brand-900/30 border border-brand-600':'bg-surface-2 hover:bg-surface-3'}`}>
          <Truck className="w-4 h-4 text-brand-400 shrink-0"/>
          <span className="font-mono text-brand-400 w-14 text-xs">{c.equip}</span>
          <span className="text-gray-300 text-xs w-24">{c.operador}</span>
          <span className="text-gray-500 text-xs w-20"><Clock className="w-3 h-3 inline mr-1"/>{c.inicio}–{c.fim}</span>
          <span className="text-gray-400 text-xs font-mono w-12">{fmtNum(c.duracao,0)} min</span>
          <span className="text-gray-500 text-xs flex-1"><Route className="w-3 h-3 inline mr-1"/>{c.origem} → {c.destino}</span>
          <span className="text-gray-300 text-xs font-mono">{fmtNum(c.peso,0)} ton</span>
        </button>
      ))}</div>
    </div>
    <Drawer open={!!selected} onClose={()=>setSelected(null)} title={`Ciclo — ${selected?.equip || ''}`} subtitle={`${selected?.inicio||''} → ${selected?.fim||''} | ${selected?.operador||''}`}
      footer={<button onClick={()=>setSelected(null)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Fechar</button>}>
      {selected && <div className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-surface-2 rounded-lg text-center"><span className="text-xs text-gray-500">Duração</span><p className="text-lg font-bold text-gray-200">{fmtNum(selected.duracao,0)} min</p></div>
          <div className="p-3 bg-surface-2 rounded-lg text-center"><span className="text-xs text-gray-500">Peso</span><p className="text-lg font-bold text-brand-400">{fmtNum(selected.peso,0)} ton</p></div>
          <div className="p-3 bg-surface-2 rounded-lg text-center"><span className="text-xs text-gray-500">Material</span><p className="text-sm font-medium text-gray-200">{selected.material}</p></div>
        </div>
        <div className="p-3 bg-surface-2 rounded-lg"><span className="text-xs text-gray-500">Rota</span><p className="text-sm text-gray-200 mt-1">{selected.origem} → {selected.destino}</p></div>
        <div>
          <h4 className="text-xs font-medium text-gray-400 mb-2">Breakdown por Etapa</h4>
          <ReactECharts option={breakdownOption} style={{height:180}} opts={{renderer:'svg'}} />
        </div>
      </div>}
    </Drawer>
  </div>)
}