import { useState } from 'react'
import StatusBadge from '../../components/ui/StatusBadge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Drawer from '../../components/ui/Drawer'
import { Textarea, FormSection } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import { Lock, Unlock, RotateCcw } from 'lucide-react'

const init = [
  { id:1, mes:'2024-06', nome:'Junho 2024', status:'ABERTO', dt_fechamento:null, fechado_por:null },
  { id:2, mes:'2024-05', nome:'Maio 2024', status:'FECHADO', dt_fechamento:'2024-06-05 10:00', fechado_por:'Kleyton Miranda' },
  { id:3, mes:'2024-04', nome:'Abril 2024', status:'FECHADO', dt_fechamento:'2024-05-03 14:30', fechado_por:'Kleyton Miranda' },
  { id:4, mes:'2024-03', nome:'Março 2024', status:'FECHADO', dt_fechamento:'2024-04-04 09:00', fechado_por:'Ricardo Alves' },
]

export default function Fechamento() {
  const [data, setData] = useState(init)
  const [confirmAction, setConfirmAction] = useState<{id:number,action:string}|null>(null)
  const [reopenDrawer, setReopenDrawer] = useState<any>(null)
  const [justificativa, setJustificativa] = useState('')

  const fechar = (id:number) => { setData(p=>p.map(r=>r.id===id?{...r,status:'FECHADO',dt_fechamento:new Date().toISOString(),fechado_por:'Kleyton Miranda'}:r)); toast('Período fechado'); setConfirmAction(null) }
  const reabrir = (item:any) => { setReopenDrawer(item) }
  const confirmarReabertura = () => {
    if (!justificativa.trim()) { toast('Justificativa é obrigatória','error'); return }
    setData(p=>p.map(r=>r.id===reopenDrawer.id?{...r,status:'REABERTO'}:r))
    toast('Período reaberto')
    setReopenDrawer(null); setJustificativa('')
  }

  return (<div className="space-y-4">
    <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-white">Fechamento de Período</h2></div>
    <div className="space-y-3">
      {data.map(p => (
        <div key={p.id} className="bg-surface-1 border border-surface-3 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${p.status==='ABERTO'?'bg-brand-900/30':'bg-surface-3'}`}>
              {p.status==='ABERTO'?<Unlock className="w-5 h-5 text-brand-400"/>:<Lock className="w-5 h-5 text-gray-500"/>}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-200">{p.nome}</h3>
              <p className="text-xs text-gray-500">{p.dt_fechamento?'Fechado em '+new Date(p.dt_fechamento).toLocaleDateString('pt-BR')+' por '+p.fechado_por:'Em aberto'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={p.status} />
            {p.status==='ABERTO' && <button onClick={()=>setConfirmAction({id:p.id,action:'fechar'})} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg flex items-center gap-1"><Lock className="w-3.5 h-3.5"/>Fechar</button>}
            {p.status==='FECHADO' && <button onClick={()=>reabrir(p)} className="px-3 py-1.5 bg-surface-3 hover:bg-surface-4 text-gray-300 text-xs rounded-lg flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5"/>Reabrir</button>}
          </div>
        </div>
      ))}
    </div>
    <ConfirmDialog open={!!confirmAction} onClose={()=>setConfirmAction(null)} onConfirm={()=>fechar(confirmAction!.id)} title="Fechar período?" message="Após o fechamento, dados deste período não poderão ser alterados sem reabertura justificada." confirmLabel="Fechar Período" variant="warning" />
    <Drawer open={!!reopenDrawer} onClose={()=>{setReopenDrawer(null);setJustificativa('')}} title="Reabrir Período" subtitle={reopenDrawer?.nome}
      footer={<><button onClick={()=>{setReopenDrawer(null);setJustificativa('')}} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={confirmarReabertura} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg">Confirmar Reabertura</button></>}>
      <div className="space-y-6">
        <FormSection title="Justificativa Obrigatória">
          <div className="p-3 bg-yellow-900/20 border border-yellow-800/50 rounded-lg text-xs text-yellow-300 mb-4">⚠️ A reabertura será registrada no audit trail. Informe o motivo detalhadamente.</div>
          <Textarea label="Justificativa" value={justificativa} onChange={setJustificativa} required rows={4} placeholder="Motivo da reabertura..." />
        </FormSection>
      </div>
    </Drawer>
  </div>)
}