import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import { FormSection } from '../../components/ui/FormFields'
import { CheckCircle, XCircle, Camera } from 'lucide-react'

const init = [
  { id:1, grupo:'Pré-Operação Caminhão', equip:'CAT-01', operador:'João Silva', turno:'A', dt:'2024-06-09T06:05:00', itens:22, conformes:22, ncs:0 },
  { id:2, grupo:'Pré-Operação Caminhão', equip:'CAT-02', operador:'Carlos Santos', turno:'A', dt:'2024-06-09T06:10:00', itens:22, conformes:20, ncs:2 },
  { id:3, grupo:'Pré-Operação Escavadeira', equip:'ESC-01', operador:'Maria Souza', turno:'A', dt:'2024-06-09T06:08:00', itens:18, conformes:18, ncs:0 },
  { id:4, grupo:'Fim de Turno', equip:'CAT-04', operador:'Pedro Costa', turno:'B', dt:'2024-06-08T18:00:00', itens:12, conformes:11, ncs:1 },
  { id:5, grupo:'Pré-Operação Caminhão', equip:'CAT-05', operador:'Roberto Lima', turno:'A', dt:'2024-06-09T06:15:00', itens:22, conformes:19, ncs:3 },
]

export default function Execucoes() {
  const [detail, setDetail] = useState<any>(null)
  const columns = [
    { key:'grupo', label:'Checklist' },
    { key:'equip', label:'Equipamento', render:(r:any)=><span className="font-medium text-brand-400">{r.equip}</span> },
    { key:'operador', label:'Operador' },
    { key:'turno', label:'Turno' },
    { key:'dt', label:'Data/Hora', render:(r:any)=>new Date(r.dt).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) },
    { key:'ncs', label:'NCs', render:(r:any)=>r.ncs>0?<span className="px-2 py-0.5 bg-red-900/30 text-red-400 rounded text-xs font-bold">{r.ncs}</span>:<span className="text-green-400 text-xs">✓ OK</span> },
  ]
  const mockItems = Array.from({length:8},(_,i)=>({desc:`Item ${i+1} do checklist`,conforme:i!==2&&i!==5,obs:i===2?'Desgaste visível na correia':'',foto:i===2}))

  return (<>
    <DataTable columns={columns} data={init} title="Execuções de Checklist" onView={setDetail} actions={true} />
    <Drawer open={!!detail} onClose={()=>setDetail(null)} title="Detalhe da Execução" subtitle={detail?detail.grupo+' — '+detail.equip:''} width="w-[640px]">
      {detail && <div className="space-y-6">
        <FormSection title="Informações">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500 block text-xs">Equipamento</span><span className="text-gray-200">{detail.equip}</span></div>
            <div><span className="text-gray-500 block text-xs">Operador</span><span className="text-gray-200">{detail.operador}</span></div>
            <div><span className="text-gray-500 block text-xs">Data/Hora</span><span className="text-gray-200">{new Date(detail.dt).toLocaleString('pt-BR')}</span></div>
            <div><span className="text-gray-500 block text-xs">Resultado</span><span className={`${detail.ncs>0?'text-red-400':'text-green-400'}`}>{detail.conformes}/{detail.itens} conformes</span></div>
          </div>
        </FormSection>
        <FormSection title="Respostas">
          <div className="space-y-2">
            {mockItems.map((it,i)=><div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${it.conforme?'bg-surface-2':'bg-red-900/10 border border-red-900/30'}`}>
              {it.conforme?<CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0"/>:<XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0"/>}
              <div className="flex-1"><p className="text-sm text-gray-300">{it.desc}</p>{it.obs&&<p className="text-xs text-red-300 mt-1">{it.obs}</p>}</div>
              {it.foto&&<Camera className="w-4 h-4 text-gray-500"/>}
            </div>)}
          </div>
        </FormSection>
      </div>}
    </Drawer>
  </>)
}