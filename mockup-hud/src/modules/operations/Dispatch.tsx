import { useState } from 'react'
import Drawer from '../../components/panels/Drawer'
import { Select, FormSection, Textarea } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'
import { equipamentos } from '../../mock/data'
import { Send, ArrowRight } from 'lucide-react'

export default function Dispatch() {
  const [equips, setEquips] = useState(equipamentos.map(e=>({...e, rota_atual: e.atividade?.includes('Transporte')?'Frente Norte B3 → Britador':null})))
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState({ destino:'', mensagem:'' })

  const despachar = () => {
    if (!form.destino) { toast('Selecione um destino','error'); return }
    setEquips(p=>p.map(e=>e.id===selected.id?{...e,rota_atual:'→ '+form.destino,atividade:'Em deslocamento'}:e))
    toast(selected.codigo+' despachado para '+form.destino)
    setSelected(null); setForm({destino:'',mensagem:''})
  }

  const caminhoes = equips.filter(e=>e.grupo==='Caminhão')
  const escavadeiras = equips.filter(e=>e.grupo==='Escavadeira')

  return (<div className="flex flex-col gap-4 h-full overflow-y-auto">
    <div className="flex items-center justify-between">
      <h2 className="font-display text-sm tracking-wider text-gray-200 uppercase">Painel de Dispatch</h2>
      <div className="flex items-center gap-2 text-[10px] font-mono text-dim"><div className="w-2 h-2 rounded-full bg-ok animate-pulse"></div>TEMPO REAL</div>
    </div>

    {/* Escavadeiras */}
    <div className="bg-hud-panel border border-hud-border rounded-xl p-4">
      <h3 className="text-[10px] font-display uppercase tracking-widest text-brand-400 mb-3">Pontos de Carga</h3>
      <div className="grid grid-cols-2 gap-3">
        {escavadeiras.map(e=>(
          <div key={e.id} className="bg-hud-bg border border-hud-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-200 font-mono">{e.codigo} — {e.modelo}</span>
              <div className="flex items-center gap-1.5"><div className={'led led-'+(e.status==='OPERANDO'?'ok':'warn')}></div><span className="text-[10px]">{e.status}</span></div>
            </div>
            <p className="text-[10px] text-dim">{e.operador||'Sem operador'}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] text-dim">Fila:</span>
              <div className="flex gap-1">{caminhoes.filter(c=>c.atividade==='Fila de Carga').slice(0,3).map(c=><span key={c.id} className="px-1.5 py-0.5 bg-warn/10 text-warn border border-warn/20 rounded text-[10px] font-mono">{c.codigo}</span>)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Caminhões */}
    <div className="bg-hud-panel border border-hud-border rounded-xl p-4 flex-1">
      <h3 className="text-[10px] font-display uppercase tracking-widest text-brand-400 mb-3">Frota de Transporte</h3>
      <div className="space-y-2">
        {caminhoes.map(e=>(
          <div key={e.id} className="flex items-center justify-between bg-hud-bg border border-hud-border rounded-lg p-3 hover:border-brand-600/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className={'led led-'+(e.status==='OPERANDO'?'ok':e.status==='PARADO'?'warn':'crit')}></div>
              <span className="font-mono text-sm text-brand-400">{e.codigo}</span>
              <span className="text-xs text-dim">{e.operador||'—'}</span>
            </div>
            <div className="flex items-center gap-3">
              {e.rota_atual && <span className="text-[10px] text-dim font-mono flex items-center gap-1"><ArrowRight className="w-3 h-3" />{e.rota_atual}</span>}
              <span className={'px-2 py-0.5 rounded text-[10px] border '+(e.status==='OPERANDO'?'bg-ok/10 text-ok border-ok/20':e.status==='PARADO'?'bg-warn/10 text-warn border-warn/20':'bg-crit/10 text-crit border-crit/20')}>{e.atividade||e.status}</span>
              <button onClick={()=>setSelected(e)} className="px-2 py-1 text-[10px] font-mono text-brand-400 border border-brand-600/40 rounded hover:bg-brand-600/20 transition-colors"><Send className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>

    <Drawer open={!!selected} onClose={()=>setSelected(null)} title="Despachar Equipamento" subtitle={selected?.codigo}
      footer={<><button onClick={()=>setSelected(null)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button><button onClick={despachar} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Despachar</button></>}>
      <div className="space-y-6">
        <FormSection title="Destino">
          <Select label="Destino" value={form.destino} onChange={v=>setForm(p=>({...p,destino:v}))} options={[{value:'Frente Norte B3',label:'Frente Norte B3'},{value:'Frente Sul A1',label:'Frente Sul A1'},{value:'Britador',label:'Britador'},{value:'Pilha ROM',label:'Pilha ROM'},{value:'Pilha Estéril',label:'Pilha Estéril'}]} required />
        </FormSection>
        <FormSection title="Mensagem (opcional)">
          <Textarea label="Mensagem para operador" value={form.mensagem} onChange={v=>setForm(p=>({...p,mensagem:v}))} placeholder="Instruções especiais..." />
        </FormSection>
      </div>
    </Drawer>
  </div>)
}
