import { useState } from 'react'
import Drawer from '../../components/ui/Drawer'
import { Select, FormSection, FormGrid, Textarea } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import StatusBadge from '../../components/ui/StatusBadge'
import { equipamentos } from '../../mock/data'
import { Send, ArrowRight, Truck } from 'lucide-react'

export default function Dispatch() {
  const [equips, setEquips] = useState(equipamentos.map(e=>({...e, rota_atual: e.atividade?.includes('Transporte')?'Frente Norte B3 → Britador':null})))
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState({ destino:'', mensagem:'' })

  const despachar = () => {
    if (!form.destino) { toast('Selecione um destino','error'); return }
    setEquips(p=>p.map(e=>e.id===selected.id?{...e,rota_atual:`→ ${form.destino}`,atividade:'Em deslocamento'}:e))
    toast(`${selected.codigo} despachado para ${form.destino}`)
    setSelected(null); setForm({destino:'',mensagem:''})
  }

  const caminhoes = equips.filter(e=>e.grupo==='Caminhão')
  const escavadeiras = equips.filter(e=>e.grupo==='Escavadeira')

  return (<div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-white">Painel de Dispatch</h2>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Tempo real
      </div>
    </div>

    {/* Escavadeiras - pontos de carga */}
    <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Pontos de Carga</h3>
      <div className="grid grid-cols-2 gap-3">
        {escavadeiras.map(e=>(
          <div key={e.id} className="p-4 bg-surface-2 rounded-lg border border-surface-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-200">{e.codigo} — {e.modelo}</span>
              <StatusBadge status={e.status} />
            </div>
            <p className="text-xs text-gray-500">{e.operador || 'Sem operador'}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-400">Fila:</span>
              <div className="flex gap-1">{caminhoes.filter(c=>c.atividade==='Fila de Carga').slice(0,3).map(c=><span key={c.id} className="px-1.5 py-0.5 bg-yellow-900/30 text-yellow-400 rounded text-xs">{c.codigo}</span>)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Caminhões */}
    <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Frota de Transporte</h3>
      <div className="space-y-2">
        {caminhoes.map(e=>(
          <div key={e.id} className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${selected?.id===e.id?'bg-brand-900/20 border border-brand-800':'bg-surface-2 hover:bg-surface-3 border border-transparent'}`} onClick={()=>setSelected(e)}>
            <Truck className="w-5 h-5 text-gray-500" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-200">{e.codigo}</span>
                <StatusBadge status={e.status} />
              </div>
              <p className="text-xs text-gray-500 truncate">{e.operador || 'Sem operador'} — {e.atividade || 'Parado'}</p>
            </div>
            {e.rota_atual && <span className="text-xs text-gray-400 flex items-center gap-1"><ArrowRight className="w-3 h-3"/>{e.rota_atual}</span>}
            <span className="text-xs font-mono text-gray-500">{e.vel} km/h</span>
          </div>
        ))}
      </div>
    </div>

    {/* Drawer de despacho */}
    <Drawer open={!!selected} onClose={()=>setSelected(null)} title={`Despachar ${selected?.codigo||''}`} subtitle={selected?.operador||'Sem operador'}
      footer={<><button onClick={()=>setSelected(null)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={despachar} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg flex items-center gap-2"><Send className="w-4 h-4"/>Despachar</button></>}>
      {selected && <div className="space-y-6">
        <FormSection title="Status Atual">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-surface-2 rounded-lg"><span className="text-xs text-gray-500">Atividade</span><p className="text-gray-200">{selected.atividade||'—'}</p></div>
            <div className="p-3 bg-surface-2 rounded-lg"><span className="text-xs text-gray-500">Velocidade</span><p className="text-gray-200">{selected.vel} km/h</p></div>
            <div className="p-3 bg-surface-2 rounded-lg"><span className="text-xs text-gray-500">Tanque</span><p className={`${selected.tanque<30?'text-red-400':'text-green-400'}`}>{selected.tanque}%</p></div>
            <div className="p-3 bg-surface-2 rounded-lg"><span className="text-xs text-gray-500">Rota Atual</span><p className="text-gray-200">{selected.rota_atual||'Nenhuma'}</p></div>
          </div>
        </FormSection>
        <FormSection title="Novo Despacho">
          <Select label="Destino" value={form.destino} onChange={v=>setForm(p=>({...p,destino:v}))} required options={[{value:'Frente Norte B3',label:'Frente Norte B3'},{value:'Frente Sul A1',label:'Frente Sul A1'},{value:'Britador',label:'Britador'},{value:'Pilha Estéril',label:'Pilha Estéril'},{value:'Posto Central',label:'Posto Central (abastecimento)'}]} />
          <Textarea label="Mensagem para operador (opcional)" value={form.mensagem} onChange={v=>setForm(p=>({...p,mensagem:v}))} placeholder="Instruções adicionais..." rows={2} />
        </FormSection>
      </div>}
    </Drawer>
  </div>)
}