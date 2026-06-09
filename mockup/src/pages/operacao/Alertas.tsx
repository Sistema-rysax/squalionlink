import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import { FormSection } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import { alertas as init } from '../../mock/data'
import { CheckCircle } from 'lucide-react'

export default function Alertas() {
  const [data, setData] = useState(init)
  const [detail, setDetail] = useState<any>(null)

  const tratar = (id:number) => {
    setData(p=>p.map(r=>r.id===id?{...r,tratado:true}:r))
    toast('Alerta tratado')
    setDetail(null)
  }

  const columns = [
    { key:'severidade', label:'Sev.', render:(r:any)=><span className={`px-2 py-0.5 rounded text-xs font-bold ${r.severidade==='CRITICAL'?'bg-red-900/30 text-red-400':r.severidade==='WARNING'?'bg-yellow-900/30 text-yellow-400':'bg-blue-900/30 text-blue-400'}`}>{r.severidade}</span> },
    { key:'tipo', label:'Tipo', render:(r:any)=><span className="text-xs">{r.tipo.replace(/_/g,' ')}</span> },
    { key:'equipamento', label:'Equipamento', render:(r:any)=><span className="font-medium text-brand-400">{r.equipamento}</span> },
    { key:'operador', label:'Operador', render:(r:any)=>r.operador||<span className="text-gray-600">—</span> },
    { key:'descricao', label:'Descrição' },
    { key:'dt', label:'Data/Hora', render:(r:any)=>new Date(r.dt).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) },
    { key:'tratado', label:'Status', render:(r:any)=>r.tratado?<span className="text-green-400 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3"/>Tratado</span>:<span className="text-yellow-400 text-xs">Pendente</span> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Alertas Operacionais" onView={setDetail} actions={true} />
    <Drawer open={!!detail} onClose={()=>setDetail(null)} title="Detalhe do Alerta" subtitle={detail?.tipo?.replace(/_/g,' ')}
      footer={!detail?.tratado ? <button onClick={()=>tratar(detail?.id)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg flex items-center gap-2"><CheckCircle className="w-4 h-4"/>Marcar como Tratado</button> : undefined}>
      {detail && <div className="space-y-6">
        <FormSection title="Informações">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500 block text-xs">Equipamento</span><span className="text-gray-200">{detail.equipamento}</span></div>
            <div><span className="text-gray-500 block text-xs">Operador</span><span className="text-gray-200">{detail.operador||'—'}</span></div>
            <div><span className="text-gray-500 block text-xs">Severidade</span><span className={`${detail.severidade==='CRITICAL'?'text-red-400':'text-yellow-400'}`}>{detail.severidade}</span></div>
            <div><span className="text-gray-500 block text-xs">Data/Hora</span><span className="text-gray-200">{new Date(detail.dt).toLocaleString('pt-BR')}</span></div>
          </div>
          <div className="mt-4 p-3 bg-surface-2 rounded-lg"><p className="text-sm text-gray-300">{detail.descricao}</p></div>
        </FormSection>
        <FormSection title="Ações Possíveis">
          <div className="space-y-2 text-sm text-gray-400">
            <p>• Enviar mensagem para operador</p>
            <p>• Criar OS de manutenção</p>
            <p>• Despachar para outra rota</p>
            <p>• Registrar observação</p>
          </div>
        </FormSection>
      </div>}
    </Drawer>
  </>)
}