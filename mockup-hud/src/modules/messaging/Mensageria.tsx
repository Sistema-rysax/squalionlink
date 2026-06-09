import { useState, useRef, useEffect } from 'react'
import { equipamentos } from '../../mock/data'
import { Send, Megaphone } from 'lucide-react'
import { toast } from '../../components/ui/Toast'
import Drawer from '../../components/panels/Drawer'
import { Select, Textarea, FormSection, Toggle } from '../../components/controls/FormFields'

const initMsgs = [
  { id:1, equip:'CAT-01', operador:'João Silva', direcao:'EQUIP_SALA', conteudo:'Chegando na frente de lavra', dt:'06:15' },
  { id:2, equip:'CAT-01', operador:'João Silva', direcao:'SALA_EQUIP', conteudo:'OK, destino Britador após carga', dt:'06:16' },
  { id:3, equip:'CAT-04', operador:'Pedro Costa', direcao:'EQUIP_SALA', conteudo:'Pneu dianteiro com vibração', dt:'06:20' },
  { id:4, equip:'CAT-04', operador:'Pedro Costa', direcao:'SALA_EQUIP', conteudo:'Entendido, dirija-se à oficina', dt:'06:22' },
  { id:5, equip:'ESC-01', operador:'Ana Souza', direcao:'EQUIP_SALA', conteudo:'Pronta para próximo caminhão', dt:'06:25' },
  { id:6, equip:'CAT-02', operador:'Carlos Santos', direcao:'EQUIP_SALA', conteudo:'Na fila de carga', dt:'06:30' },
]

export default function Mensageria() {
  const [msgs, setMsgs] = useState(initMsgs)
  const [selected, setSelected] = useState('CAT-01')
  const [input, setInput] = useState('')
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [bcForm, setBcForm] = useState({ mensagem:'', prioridade:'NORMAL', requer_confirmacao:false })
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}) }, [msgs, selected])

  const send = () => {
    if (!input.trim()) return
    setMsgs(p=>[...p,{id:Date.now(),equip:selected,operador:equipamentos.find(e=>e.codigo===selected)?.operador||'',direcao:'SALA_EQUIP',conteudo:input,dt:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}])
    setInput(''); toast('Mensagem enviada')
  }

  const broadcast = () => {
    if (!bcForm.mensagem) { toast('Mensagem obrigatória','error'); return }
    const targets = equipamentos.filter(e=>e.operador)
    targets.forEach(e => {
      setMsgs(p=>[...p,{id:Date.now()+Math.random(),equip:e.codigo,operador:e.operador!,direcao:'SALA_EQUIP',conteudo:bcForm.mensagem,dt:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}])
    })
    toast('Broadcast enviado para '+targets.length+' equipamentos')
    setBroadcastOpen(false); setBcForm({mensagem:'',prioridade:'NORMAL',requer_confirmacao:false})
  }

  const filteredMsgs = msgs.filter(m=>m.equip===selected)
  const conversations = [...new Set(msgs.map(m=>m.equip))]

  return (<div className="flex h-full gap-3">
    {/* Conversation list */}
    <div className="w-56 bg-hud-panel border border-hud-border rounded-xl flex flex-col overflow-hidden">
      <div className="p-3 border-b border-hud-border flex items-center justify-between">
        <span className="text-[10px] font-display uppercase tracking-widest text-brand-400">Conversas</span>
        <button onClick={()=>setBroadcastOpen(true)} className="p-1.5 rounded hover:bg-white/5 text-dim" title="Broadcast"><Megaphone className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map(eq=>{
          const lastMsg = msgs.filter(m=>m.equip===eq).slice(-1)[0]
          const op = equipamentos.find(e=>e.codigo===eq)
          return (<button key={eq} onClick={()=>setSelected(eq)} className={'w-full p-3 text-left border-b border-hud-border/30 transition-colors '+(selected===eq?'bg-brand-600/10':'hover:bg-white/[0.02]')}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-brand-400">{eq}</span>
              <span className="text-[9px] text-dim">{lastMsg?.dt}</span>
            </div>
            <p className="text-[10px] text-dim truncate mt-0.5">{op?.operador||'—'}</p>
          </button>)
        })}
      </div>
    </div>

    {/* Messages */}
    <div className="flex-1 bg-hud-panel border border-hud-border rounded-xl flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-hud-border flex items-center gap-3">
        <span className="font-mono text-sm text-brand-400">{selected}</span>
        <span className="text-xs text-dim">{equipamentos.find(e=>e.codigo===selected)?.operador||'—'}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredMsgs.map(m=>(
          <div key={m.id} className={'flex '+(m.direcao==='SALA_EQUIP'?'justify-end':'justify-start')}>
            <div className={'max-w-[70%] px-3 py-2 rounded-lg text-xs '+(m.direcao==='SALA_EQUIP'?'bg-brand-600/20 border border-brand-600/30 text-gray-200':'bg-hud-bg border border-hud-border text-gray-300')}>
              <p>{m.conteudo}</p>
              <span className="text-[9px] text-dim mt-1 block">{m.dt}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="px-4 py-3 border-t border-hud-border flex items-center gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Mensagem..." className="flex-1 px-3 py-2 bg-hud-bg border border-hud-border rounded-md text-sm text-gray-200 font-mono placeholder:text-gray-700 focus:outline-none focus:border-brand-600" />
        <button onClick={send} className="p-2.5 bg-brand-600/20 text-brand-400 border border-brand-600/40 rounded-md hover:bg-brand-600/30 transition-colors"><Send className="w-4 h-4" /></button>
      </div>
    </div>

    <Drawer open={broadcastOpen} onClose={()=>setBroadcastOpen(false)} title="Broadcast"
      footer={<><button onClick={()=>setBroadcastOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button><button onClick={broadcast} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Enviar</button></>}>
      <div className="space-y-6">
        <FormSection title="Broadcast"><Textarea label="Mensagem" value={bcForm.mensagem} onChange={v=>setBcForm(p=>({...p,mensagem:v}))} placeholder="Mensagem para todos..." rows={4} /><Select label="Prioridade" value={bcForm.prioridade} onChange={v=>setBcForm(p=>({...p,prioridade:v}))} options={[{value:'NORMAL',label:'Normal'},{value:'ALTA',label:'Alta'},{value:'URGENTE',label:'Urgente'}]} /><Toggle label="Requer Confirmação" checked={bcForm.requer_confirmacao} onChange={v=>setBcForm(p=>({...p,requer_confirmacao:v}))} /></FormSection>
      </div>
    </Drawer>
  </div>)
}
