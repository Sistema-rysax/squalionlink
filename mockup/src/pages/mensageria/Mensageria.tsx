import { useState, useRef, useEffect } from 'react'
import { equipamentos, mensagens as init } from '../../mock/data'
import { Send, Megaphone, AlertTriangle } from 'lucide-react'
import { toast } from '../../components/ui/Toast'
import Drawer from '../../components/ui/Drawer'
import { Select, Textarea, FormSection, Switch } from '../../components/ui/FormFields'

export default function Mensageria() {
  const [msgs, setMsgs] = useState(init)
  const [selected, setSelected] = useState('CAT-01')
  const [input, setInput] = useState('')
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [bcForm, setBcForm] = useState({ mensagem:'', prioridade:'NORMAL', requer_confirmacao:false })
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView() }, [msgs, selected])

  const send = () => {
    if (!input.trim()) return
    setMsgs(p=>[...p,{id:Date.now(),equip:selected,operador:equipamentos.find(e=>e.codigo===selected)?.operador||'',direcao:'SALA_EQUIP',conteudo:input,prioridade:'NORMAL',status:'ENVIADO',dt:new Date().toISOString()}])
    setInput('')
    toast('Mensagem enviada')
  }

  const broadcast = () => {
    if (!bcForm.mensagem) { toast('Mensagem obrigatória','error'); return }
    equipamentos.filter(e=>e.operador).forEach(e => {
      setMsgs(p=>[...p,{id:Date.now()+Math.random(),equip:e.codigo,operador:e.operador!,direcao:'SALA_EQUIP',conteudo:bcForm.mensagem,prioridade:bcForm.prioridade,status:'ENVIADO',dt:new Date().toISOString()}])
    })
    toast(`Broadcast enviado para ${equipamentos.filter(e=>e.operador).length} equipamentos`)
    setBroadcastOpen(false); setBcForm({mensagem:'',prioridade:'NORMAL',requer_confirmacao:false})
  }

  const filteredMsgs = msgs.filter(m=>m.equip===selected)
  const conversations = [...new Set(msgs.map(m=>m.equip))]

  return (<div className="flex h-[calc(100vh-8rem)] gap-4">
    {/* Lista de conversas */}
    <div className="w-64 bg-surface-1 border border-surface-3 rounded-xl flex flex-col overflow-hidden">
      <div className="p-3 border-b border-surface-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">Conversas</span>
        <button onClick={()=>setBroadcastOpen(true)} className="p-1.5 rounded-lg hover:bg-surface-2 text-gray-400" title="Broadcast"><Megaphone className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map(eq=>{
          const lastMsg = msgs.filter(m=>m.equip===eq).slice(-1)[0]
          const op = equipamentos.find(e=>e.codigo===eq)
          return (<button key={eq} onClick={()=>setSelected(eq)} className={`w-full p-3 text-left border-b border-surface-3 transition-colors ${selected===eq?'bg-surface-3':'hover:bg-surface-2'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-200">{eq}</span>
              <span className="text-xs text-gray-600">{new Date(lastMsg?.dt||'').toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span>
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">{op?.operador||'—'}</p>
            <p className="text-xs text-gray-600 truncate mt-0.5">{lastMsg?.conteudo}</p>
          </button>)
        })}
      </div>
    </div>

    {/* Chat */}
    <div className="flex-1 bg-surface-1 border border-surface-3 rounded-xl flex flex-col overflow-hidden">
      <div className="p-4 border-b border-surface-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">{selected.slice(0,2)}</div>
        <div><p className="text-sm font-medium text-gray-200">{selected}</p><p className="text-xs text-gray-500">{equipamentos.find(e=>e.codigo===selected)?.operador||'Sem operador'}</p></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredMsgs.map(m=>(
          <div key={m.id} className={`flex ${m.direcao==='SALA_EQUIP'?'justify-end':'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-xl ${m.direcao==='SALA_EQUIP'?'bg-brand-900/40 border border-brand-800/50':'bg-surface-2 border border-surface-4'}`}>
              {m.prioridade==='EMERGENCIA' && <div className="flex items-center gap-1 text-xs text-red-400 mb-1"><AlertTriangle className="w-3 h-3"/>EMERGÊNCIA</div>}
              <p className="text-sm text-gray-200">{m.conteudo}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-600">{new Date(m.dt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span>
                {m.direcao==='SALA_EQUIP' && <span className={`text-xs ${m.status==='LIDO'?'text-brand-400':'text-gray-600'}`}>{m.status==='LIDO'?'✓✓':'✓'}</span>}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>
      <div className="p-4 border-t border-surface-3 flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send()}} placeholder="Digitar mensagem..." className="flex-1 px-4 py-2.5 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-brand-500" />
        <button onClick={send} className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"><Send className="w-4 h-4 text-white" /></button>
      </div>
    </div>

    {/* Broadcast drawer */}
    <Drawer open={broadcastOpen} onClose={()=>setBroadcastOpen(false)} title="Broadcast — Todos os Equipamentos" subtitle={`Enviará para ${equipamentos.filter(e=>e.operador).length} equipamentos com operador`}
      footer={<><button onClick={()=>setBroadcastOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={broadcast} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg flex items-center gap-2"><Megaphone className="w-4 h-4"/>Enviar Broadcast</button></>}>
      <div className="space-y-6">
        <FormSection title="Mensagem">
          <Textarea label="Conteúdo" value={bcForm.mensagem} onChange={v=>setBcForm(p=>({...p,mensagem:v}))} required rows={4} placeholder="Mensagem para todos..." />
          <Select label="Prioridade" value={bcForm.prioridade} onChange={v=>setBcForm(p=>({...p,prioridade:v}))} options={[{value:'NORMAL',label:'Normal'},{value:'URGENTE',label:'Urgente'},{value:'EMERGENCIA',label:'Emergência'}]} />
          <Switch label="Requer confirmação de leitura" checked={bcForm.requer_confirmacao} onChange={v=>setBcForm(p=>({...p,requer_confirmacao:v}))} />
        </FormSection>
      </div>
    </Drawer>
  </div>)
}