import { useState, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useChartTheme } from '../../hooks/useChartTheme'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import { FormSection } from '../../components/controls/FormFields'

const ciclos = [
  { id:1, equip:'CAT-01', operador:'João Silva', inicio:'06:12', fim:'06:38', duracao:26, carga:4.2, transporte_cheio:8.5, descarga:2.1, transporte_vazio:6.8, fila:4.4, origem:'Frente Norte B3', destino:'Britador', material:'ROM', peso:92 },
  { id:2, equip:'CAT-04', operador:'Pedro Costa', inicio:'06:05', fim:'06:28', duracao:23, carga:3.8, transporte_cheio:7.2, descarga:1.9, transporte_vazio:5.8, fila:4.3, origem:'Frente Sul A1', destino:'Pilha Estéril', material:'Estéril', peso:88 },
  { id:3, equip:'CAT-01', operador:'João Silva', inicio:'06:40', fim:'07:04', duracao:24, carga:4.0, transporte_cheio:8.0, descarga:2.0, transporte_vazio:6.2, fila:3.8, origem:'Frente Norte B3', destino:'Britador', material:'ROM', peso:94 },
  { id:4, equip:'CAT-05', operador:'Roberto Lima', inicio:'06:15', fim:'06:45', duracao:30, carga:5.0, transporte_cheio:9.5, descarga:2.5, transporte_vazio:7.8, fila:5.2, origem:'Frente Norte B3', destino:'Pilha ROM', material:'ROM', peso:90 },
  { id:5, equip:'CAT-04', operador:'Pedro Costa', inicio:'06:30', fim:'06:55', duracao:25, carga:4.1, transporte_cheio:7.8, descarga:2.0, transporte_vazio:6.5, fila:4.6, origem:'Frente Sul A1', destino:'Pilha Estéril', material:'Estéril', peso:86 },
  { id:6, equip:'CAT-02', operador:'Carlos Santos', inicio:'07:02', fim:'07:30', duracao:28, carga:4.5, transporte_cheio:9.0, descarga:2.3, transporte_vazio:7.0, fila:5.2, origem:'Frente Norte B3', destino:'Britador', material:'ROM', peso:91 },
]

export default function Ciclos() {
  const ct = useChartTheme()
  const [selected, setSelected] = useState<any>(null)

  const overviewOption = useMemo(()=>({
    backgroundColor:'transparent',
    tooltip:{trigger:'axis',axisPointer:{type:'shadow'},backgroundColor:ct.tooltip.bg,borderColor:ct.tooltip.border,textStyle:{color:ct.tooltip.text,fontFamily:'JetBrains Mono',fontSize:11}},
    legend:{bottom:0,textStyle:{color:ct.legend.text,fontSize:10}},
    grid:{top:20,right:20,bottom:40,left:50},
    xAxis:{type:'category' as const,data:ciclos.map(c=>c.equip+' '+c.inicio),axisLabel:{color:ct.axis.label,fontSize:9,fontFamily:'JetBrains Mono'},axisLine:{lineStyle:{color:ct.axis.line}}},
    yAxis:{type:'value' as const,name:'min',axisLabel:{color:ct.axis.label,fontSize:10,fontFamily:'JetBrains Mono'},splitLine:{lineStyle:{color:ct.axis.split,type:'dashed' as const}}},
    series:[
      {name:'Fila',type:'bar',stack:'total',data:ciclos.map(c=>c.fila),itemStyle:{color:'#f59e0b'}},
      {name:'Carga',type:'bar',stack:'total',data:ciclos.map(c=>c.carga),itemStyle:{color:'#2563eb'}},
      {name:'Transp. Cheio',type:'bar',stack:'total',data:ciclos.map(c=>c.transporte_cheio),itemStyle:{color:'#22c55e'}},
      {name:'Descarga',type:'bar',stack:'total',data:ciclos.map(c=>c.descarga),itemStyle:{color:'#a855f7'}},
      {name:'Transp. Vazio',type:'bar',stack:'total',data:ciclos.map(c=>c.transporte_vazio),itemStyle:{color:'#06b6d4'}},
    ]
  }),[])

  const breakdownOption = useMemo(()=>{
    if (!selected) return {}
    const etapas = ['Fila','Carga','Transp. Cheio','Descarga','Transp. Vazio']
    const valores = [selected.fila,selected.carga,selected.transporte_cheio,selected.descarga,selected.transporte_vazio]
    const cores = ['#f59e0b','#2563eb','#22c55e','#a855f7','#06b6d4']
    return {
      backgroundColor:'transparent',
      tooltip:{trigger:'axis',axisPointer:{type:'shadow'},backgroundColor:ct.tooltip.bg,borderColor:ct.tooltip.border,textStyle:{color:ct.tooltip.text,fontFamily:'JetBrains Mono',fontSize:11}},
      grid:{top:10,right:30,bottom:20,left:100},
      xAxis:{type:'value' as const,axisLabel:{color:ct.axis.label,fontSize:10,fontFamily:'JetBrains Mono',formatter:'{value} min'},splitLine:{lineStyle:{color:ct.axis.split,type:'dashed' as const}}},
      yAxis:{type:'category' as const,data:etapas,axisLabel:{color:'#9ca3af',fontSize:11,fontFamily:'JetBrains Mono'},axisLine:{lineStyle:{color:ct.axis.line}}},
      series:[{type:'bar',data:valores.map((v,i)=>({value:v,itemStyle:{color:cores[i],borderRadius:[0,4,4,0]}})),barWidth:'60%'}]
    }
  },[selected])

  const columns = [
    { key:'equip', label:'Equip', render:(r:any)=><span className="text-brand-400 font-bold">{r.equip}</span> },
    { key:'operador', label:'Operador' },
    { key:'inicio', label:'Início', render:(r:any)=><span className="font-mono">{r.inicio}</span> },
    { key:'fim', label:'Fim', render:(r:any)=><span className="font-mono">{r.fim}</span> },
    { key:'duracao', label:'Duração', render:(r:any)=><span className="font-mono text-brand-400">{r.duracao} min</span> },
    { key:'origem', label:'Origem' },
    { key:'destino', label:'Destino' },
    { key:'peso', label:'Peso (ton)', render:(r:any)=><span className="font-mono">{r.peso}</span> },
  ]

  return (<div className="flex flex-col gap-4 h-full">
    <div className="bg-hud-panel border border-hud-border rounded-xl p-4">
      <h3 className="text-[10px] font-display uppercase tracking-widest text-brand-400 mb-2">Breakdown de Ciclos</h3>
      <ReactECharts option={overviewOption} style={{height:180}} />
    </div>
    <div className="flex-1 min-h-0">
      <DataTable columns={columns} data={ciclos} title="Ciclos" status="ok" onEdit={setSelected} addLabel="" />
    </div>
    <Drawer open={!!selected} onClose={()=>setSelected(null)} title="Detalhe do Ciclo" subtitle={selected?.equip+' — '+selected?.inicio}>
      {selected && <div className="space-y-6">
        <FormSection title="Resumo">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-hud-bg border border-hud-border rounded-lg p-3"><span className="text-[10px] text-dim font-mono block">EQUIPAMENTO</span><span className="font-mono text-brand-400">{selected.equip}</span></div>
            <div className="bg-hud-bg border border-hud-border rounded-lg p-3"><span className="text-[10px] text-dim font-mono block">OPERADOR</span><span className="text-sm text-gray-300">{selected.operador}</span></div>
            <div className="bg-hud-bg border border-hud-border rounded-lg p-3"><span className="text-[10px] text-dim font-mono block">ROTA</span><span className="text-sm text-gray-300">{selected.origem} → {selected.destino}</span></div>
            <div className="bg-hud-bg border border-hud-border rounded-lg p-3"><span className="text-[10px] text-dim font-mono block">PESO</span><span className="font-mono text-lg text-gray-200">{selected.peso} ton</span></div>
          </div>
        </FormSection>
        <FormSection title="Breakdown Horizontal">
          <ReactECharts option={breakdownOption} style={{height:200}} />
        </FormSection>
      </div>}
    </Drawer>
  </div>)
}
