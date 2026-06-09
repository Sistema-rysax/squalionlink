import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import { FormSection, FormGrid } from '../../components/ui/FormFields'
import { ciclos as init } from '../../mock/data'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function Ciclos() {
  const [detail, setDetail] = useState<any>(null)
  const [data] = useState(init)

  const columns = [
    { key:'equip', label:'Equip.', render:(r:any)=><span className="font-medium text-brand-400">{r.equip}</span> },
    { key:'operador', label:'Operador' },
    { key:'origem', label:'Origem' },
    { key:'destino', label:'Destino' },
    { key:'material', label:'Material', render:(r:any)=><span className={`px-2 py-0.5 rounded text-xs ${r.material==='ROM'?'bg-yellow-900/30 text-yellow-400':'bg-gray-800 text-gray-400'}`}>{r.material}</span> },
    { key:'carga', label:'Carga', render:(r:any)=>r.carga+' ton' },
    { key:'duracao', label:'Duração', render:(r:any)=><span className={`font-mono ${r.duracao>25?'text-yellow-400':'text-green-400'}`}>{r.duracao} min</span> },
    { key:'dt', label:'Hora', render:(r:any)=>new Date(r.dt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) },
  ]

  const chartData = detail ? [
    { nome:'Fila Carga', min:detail.fila_carga, cor:'#eab308' },
    { nome:'Carga', min:detail.carga_tempo, cor:'#3b82f6' },
    { nome:'Viagem Cheio', min:detail.viagem_cheio, cor:'#22c55e' },
    { nome:'Descarga', min:detail.descarga, cor:'#f97316' },
    { nome:'Viagem Vazio', min:detail.viagem_vazio, cor:'#a855f7' },
  ] : []

  return (<>
    <DataTable columns={columns} data={data} title="Ciclos Operacionais" onView={setDetail} actions={true} />
    <Drawer open={!!detail} onClose={()=>setDetail(null)} title="Detalhe do Ciclo" subtitle={detail?`${detail.equip} — ${detail.origem} → ${detail.destino}`:''} width="w-[600px]">
      {detail && <div className="space-y-6">
        <FormSection title="Informações Gerais">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500 block text-xs">Equipamento</span><span className="text-brand-400 font-medium">{detail.equip}</span></div>
            <div><span className="text-gray-500 block text-xs">Operador</span><span className="text-gray-200">{detail.operador}</span></div>
            <div><span className="text-gray-500 block text-xs">Rota</span><span className="text-gray-200">{detail.origem} → {detail.destino}</span></div>
            <div><span className="text-gray-500 block text-xs">Material</span><span className="text-gray-200">{detail.material}</span></div>
            <div><span className="text-gray-500 block text-xs">Carga</span><span className="text-gray-200">{detail.carga} ton</span></div>
            <div><span className="text-gray-500 block text-xs">Duração Total</span><span className={`font-bold ${detail.duracao>25?'text-yellow-400':'text-green-400'}`}>{detail.duracao} min</span></div>
          </div>
        </FormSection>
        <FormSection title="Breakdown do Ciclo">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" tick={{fill:'#6b7280',fontSize:11}} unit=" min" />
              <YAxis type="category" dataKey="nome" tick={{fill:'#9ca3af',fontSize:11}} width={90} />
              <Tooltip contentStyle={{background:'#1a1a2e',border:'1px solid #2a2a4a',borderRadius:8}} />
              <Bar dataKey="min" radius={[0,4,4,0]}>
                {chartData.map((e,i)=><Cell key={i} fill={e.cor} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-5 gap-2 mt-4">
            {chartData.map(e=><div key={e.nome} className="text-center p-2 bg-surface-2 rounded-lg"><span className="text-lg font-bold text-gray-200">{e.min}</span><span className="block text-xs text-gray-500 mt-1">{e.nome}</span></div>)}
          </div>
        </FormSection>
        <FormSection title="Indicadores">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-surface-2 rounded-lg"><span className="text-xs text-gray-500">Velocidade Média</span><p className="text-lg font-bold text-gray-200">{(3.2/detail.viagem_cheio*60).toFixed(1)} km/h</p></div>
            <div className="p-3 bg-surface-2 rounded-lg"><span className="text-xs text-gray-500">Produtividade</span><p className="text-lg font-bold text-gray-200">{(detail.carga/(detail.duracao/60)).toFixed(0)} t/h</p></div>
            <div className="p-3 bg-surface-2 rounded-lg"><span className="text-xs text-gray-500">% Tempo Improdutivo</span><p className={`text-lg font-bold ${(detail.fila_carga/detail.duracao*100)>20?'text-red-400':'text-green-400'}`}>{(detail.fila_carga/detail.duracao*100).toFixed(0)}%</p></div>
            <div className="p-3 bg-surface-2 rounded-lg"><span className="text-xs text-gray-500">DMT Efetivo</span><p className="text-lg font-bold text-gray-200">3.8 km</p></div>
          </div>
        </FormSection>
      </div>}
    </Drawer>
  </>)
}