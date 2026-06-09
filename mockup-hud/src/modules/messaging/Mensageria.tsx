import { useState, useRef, useEffect } from 'react'
import { Send, Megaphone, Paperclip, FileText, Check, CheckCheck } from 'lucide-react'
import { toast } from '../../components/ui/Toast'
import Drawer from '../../components/panels/Drawer'
import { Select, Textarea, FormSection, Toggle, Input } from '../../components/controls/FormFields'

/* ─── Types ─── */
type MessageStatus = 'ENVIADA' | 'ENTREGUE' | 'LIDA' | 'CONFIRMADA'
type MessageType = 'TEXTO' | 'ALERTA' | 'INSTRUCAO'
type Direction = 'SALA_EQUIP' | 'EQUIP_SALA'

interface Message {
  id: number
  tipo: MessageType
  direcao: Direction
  conteudo: string
  dt: string
  status: MessageStatus
  requer_confirmacao: boolean
  confirmada: boolean
}

interface Conversation {
  equip_codigo: string
  equip_cor: string
  operador: string
  messages: Message[]
  unread: number
}

/* ─── Mock Data ─── */
const mockConversations: Conversation[] = [
  {
    equip_codigo: 'CAT-01', equip_cor: '#22c55e', operador: 'João Silva', unread: 0,
    messages: [
      { id: 1, tipo: 'TEXTO', direcao: 'EQUIP_SALA', conteudo: 'Chegando na frente de lavra norte', dt: '06:15', status: 'LIDA', requer_confirmacao: false, confirmada: false },
      { id: 2, tipo: 'INSTRUCAO', direcao: 'SALA_EQUIP', conteudo: 'OK, destino Britador Primário após carga. Seguir rota BR-03.', dt: '06:16', status: 'LIDA', requer_confirmacao: true, confirmada: true },
      { id: 3, tipo: 'TEXTO', direcao: 'EQUIP_SALA', conteudo: 'Entendido, seguindo rota BR-03', dt: '06:17', status: 'LIDA', requer_confirmacao: false, confirmada: false },
      { id: 4, tipo: 'TEXTO', direcao: 'EQUIP_SALA', conteudo: 'Carregamento concluído, 42t. Iniciando transporte.', dt: '06:25', status: 'LIDA', requer_confirmacao: false, confirmada: false },
      { id: 5, tipo: 'TEXTO', direcao: 'SALA_EQUIP', conteudo: 'Registrado. Tempo estimado: 8min.', dt: '06:26', status: 'ENTREGUE', requer_confirmacao: false, confirmada: false },
    ]
  },
  {
    equip_codigo: 'CAT-04', equip_cor: '#f59e0b', operador: 'Pedro Costa', unread: 2,
    messages: [
      { id: 6, tipo: 'ALERTA', direcao: 'EQUIP_SALA', conteudo: 'Pneu dianteiro direito com vibração anormal acima de 30km/h', dt: '06:20', status: 'LIDA', requer_confirmacao: false, confirmada: false },
      { id: 7, tipo: 'INSTRUCAO', direcao: 'SALA_EQUIP', conteudo: 'Reduza velocidade para 20km/h e dirija-se à oficina mecânica', dt: '06:22', status: 'ENTREGUE', requer_confirmacao: true, confirmada: false },
      { id: 8, tipo: 'TEXTO', direcao: 'EQUIP_SALA', conteudo: 'Velocidade reduzida. ETA oficina: 12 min', dt: '06:24', status: 'LIDA', requer_confirmacao: false, confirmada: false },
      { id: 9, tipo: 'ALERTA', direcao: 'SALA_EQUIP', conteudo: 'ATENÇÃO: Ao chegar na oficina, aguardar inspeção antes de desligar motor', dt: '06:25', status: 'ENVIADA', requer_confirmacao: true, confirmada: false },
      { id: 10, tipo: 'TEXTO', direcao: 'EQUIP_SALA', conteudo: 'Entendido, aguardando na oficina', dt: '06:30', status: 'LIDA', requer_confirmacao: false, confirmada: false },
      { id: 11, tipo: 'TEXTO', direcao: 'EQUIP_SALA', conteudo: 'Cheguei na oficina, motor ligado', dt: '06:38', status: 'ENVIADA', requer_confirmacao: false, confirmada: false },
    ]
  },
  {
    equip_codigo: 'ESC-01', equip_cor: '#2563eb', operador: 'Ana Souza', unread: 1,
    messages: [
      { id: 12, tipo: 'TEXTO', direcao: 'EQUIP_SALA', conteudo: 'Pronta para próximo caminhão', dt: '06:25', status: 'LIDA', requer_confirmacao: false, confirmada: false },
      { id: 13, tipo: 'INSTRUCAO', direcao: 'SALA_EQUIP', conteudo: 'CAT-02 a caminho, ETA 3min. Preparar carregamento ponto B.', dt: '06:26', status: 'LIDA', requer_confirmacao: false, confirmada: false },
      { id: 14, tipo: 'TEXTO', direcao: 'EQUIP_SALA', conteudo: 'Posicionada no ponto B', dt: '06:28', status: 'LIDA', requer_confirmacao: false, confirmada: false },
      { id: 15, tipo: 'TEXTO', direcao: 'EQUIP_SALA', conteudo: 'Carregamento CAT-02 finalizado: 4 passes, 38t', dt: '06:35', status: 'ENVIADA', requer_confirmacao: false, confirmada: false },
    ]
  },
  {
    equip_codigo: 'CAT-02', equip_cor: '#ef4444', operador: 'Carlos Santos', unread: 0,
    messages: [
      { id: 16, tipo: 'TEXTO', direcao: 'EQUIP_SALA', conteudo: 'Na fila de carga, posição 2', dt: '06:30', status: 'LIDA', requer_confirmacao: false, confirmada: false },
      { id: 17, tipo: 'TEXTO', direcao: 'SALA_EQUIP', conteudo: 'Tempo estimado de espera: 5min', dt: '06:31', status: 'LIDA', requer_confirmacao: false, confirmada: false },
      { id: 18, tipo: 'TEXTO', direcao: 'EQUIP_SALA', conteudo: 'Carga recebida, 38t. Saindo para britagem.', dt: '06:37', status: 'LIDA', requer_confirmacao: false, confirmada: false },
    ]
  },
  {
    equip_codigo: 'MOT-01', equip_cor: '#8b5cf6', operador: 'José Santos', unread: 3,
    messages: [
      { id: 19, tipo: 'INSTRUCAO', direcao: 'SALA_EQUIP', conteudo: 'Iniciar nivelamento pista acesso norte. Prioridade alta.', dt: '06:00', status: 'LIDA', requer_confirmacao: true, confirmada: true },
      { id: 20, tipo: 'TEXTO', direcao: 'EQUIP_SALA', conteudo: 'Iniciando nivelamento setor norte', dt: '06:05', status: 'LIDA', requer_confirmacao: false, confirmada: false },
      { id: 21, tipo: 'TEXTO', direcao: 'EQUIP_SALA', conteudo: '50% concluído, pista em boas condições', dt: '07:00', status: 'LIDA', requer_confirmacao: false, confirmada: false },
      { id: 22, tipo: 'ALERTA', direcao: 'EQUIP_SALA', conteudo: 'Encontrei rocha exposta no km 2.3, preciso de perfuratriz', dt: '07:15', status: 'LIDA', requer_confirmacao: false, confirmada: false },
      { id: 23, tipo: 'INSTRUCAO', direcao: 'SALA_EQUIP', conteudo: 'Contornar rocha por ora, PER-01 será deslocada em 1h', dt: '07:18', status: 'ENVIADA', requer_confirmacao: false, confirmada: false },
      { id: 24, tipo: 'TEXTO', direcao: 'EQUIP_SALA', conteudo: 'OK, contornando', dt: '07:20', status: 'ENVIADA', requer_confirmacao: false, confirmada: false },
      { id: 25, tipo: 'TEXTO', direcao: 'EQUIP_SALA', conteudo: 'Nivelamento setor norte 85% concluído', dt: '08:00', status: 'ENVIADA', requer_confirmacao: false, confirmada: false },
      { id: 26, tipo: 'TEXTO', direcao: 'EQUIP_SALA', conteudo: 'Concluído setor norte, aguardando próxima ordem', dt: '08:30', status: 'ENVIADA', requer_confirmacao: false, confirmada: false },
    ]
  },
]

/* ─── Status Tick Renderer ─── */
function StatusTick({ status }: { status: MessageStatus }) {
  switch (status) {
    case 'ENVIADA': return <span className="text-dim text-[10px]">✓</span>
    case 'ENTREGUE': return <span className="text-dim text-[10px]">✓✓</span>
    case 'LIDA': return <span className="text-brand-400 text-[10px]">✓✓</span>
    case 'CONFIRMADA': return <span className="text-ok text-[10px]">✓✓✓</span>
  }
}

function MessageTypeBadge({ tipo }: { tipo: MessageType }) {
  if (tipo === 'TEXTO') return null
  const cls = tipo === 'ALERTA' ? 'bg-crit/20 text-crit border-crit/30' : 'bg-brand-600/20 text-brand-400 border-brand-600/30'
  return <span className={`px-1.5 py-0 rounded text-[9px] font-mono border ${cls}`}>{tipo}</span>
}

type Filter = 'ALL' | 'NAO_LIDAS' | 'BROADCAST'

export default function Mensageria() {
  const t = useT()
  const [conversations, setConversations] = useState(mockConversations)
  const [selected, setSelected] = useState('CAT-01')
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<Filter>('ALL')
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [bcForm, setBcForm] = useState({ mensagem: '', template: '', prioridade: 'NORMAL', requer_confirmacao: false, destinatarios: [] as string[] })
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [conversations, selected])

  const activeConv = conversations.find(c => c.equip_codigo === selected)
  const filteredConvs = conversations.filter(c => {
    if (filter === 'NAO_LIDAS') return c.unread > 0
    return true
  })

  const send = () => {
    if (!input.trim()) return
    setConversations(p => p.map(c => {
      if (c.equip_codigo !== selected) return c
      const newMsg: Message = { id: Date.now(), tipo: 'TEXTO', direcao: 'SALA_EQUIP', conteudo: input, dt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), status: 'ENVIADA', requer_confirmacao: false, confirmada: false }
      return { ...c, messages: [...c.messages, newMsg] }
    }))
    setInput('')
    toast('Mensagem enviada')
  }

  const broadcast = () => {
    if (!bcForm.mensagem) { toast('Mensagem obrigatória', 'error'); return }
    const targets = bcForm.destinatarios.length > 0 ? bcForm.destinatarios : conversations.map(c => c.equip_codigo)
    setConversations(p => p.map(c => {
      if (!targets.includes(c.equip_codigo)) return c
      const newMsg: Message = { id: Date.now() + Math.random(), tipo: 'INSTRUCAO', direcao: 'SALA_EQUIP', conteudo: bcForm.mensagem, dt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), status: 'ENVIADA', requer_confirmacao: bcForm.requer_confirmacao, confirmada: false }
      return { ...c, messages: [...c.messages, newMsg] }
    }))
    toast(`Broadcast enviado para ${targets.length} equipamentos`)
    setBroadcastOpen(false)
    setBcForm({ mensagem: '', template: '', prioridade: 'NORMAL', requer_confirmacao: false, destinatarios: [] })
  }

  const confirmMessage = (msgId: number) => {
    setConversations(p => p.map(c => {
      if (c.equip_codigo !== selected) return c
      return { ...c, messages: c.messages.map(m => m.id === msgId ? { ...m, confirmada: true, status: 'CONFIRMADA' as MessageStatus } : m) }
    }))
    toast('Mensagem confirmada')
  }

  const toggleDestinatario = (code: string) => {
    setBcForm(p => ({ ...p, destinatarios: p.destinatarios.includes(code) ? p.destinatarios.filter(d => d !== code) : [...p.destinatarios, code] }))
  }

  return (
    <div className="flex h-full gap-3">
      {/* ─── LEFT: Conversation List ─── */}
      <div className="w-64 bg-hud-panel border border-hud-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-3 border-b border-hud-border">
          <h3 className="text-xs font-display uppercase tracking-wider text-gray-400 mb-2">Conversas</h3>
          <div className="flex gap-1">
            {(['ALL', 'NAO_LIDAS', 'BROADCAST'] as Filter[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-2 py-1 rounded text-[9px] font-mono uppercase transition-all ${filter === f ? 'bg-brand-600/20 text-brand-400 border border-brand-600/40' : 'text-dim hover:text-gray-300 border border-transparent'}`}>
                {f === 'ALL' ? 'Todas' : f === 'NAO_LIDAS' ? 'Não Lidas' : 'Broadcast'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConvs.map(c => {
            const lastMsg = c.messages[c.messages.length - 1]
            return (
              <div key={c.equip_codigo} onClick={() => setSelected(c.equip_codigo)}
                className={`px-3 py-2.5 cursor-pointer border-b border-hud-border/30 transition-all ${selected === c.equip_codigo ? 'bg-brand-600/10' : 'hover:bg-white/5'}`}>
                <div className="flex items-center gap-2">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[9px] font-mono font-bold text-white" style={{ backgroundColor: c.equip_cor }}>
                    {c.equip_codigo.slice(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-200 font-medium">{c.equip_codigo}</span>
                      <span className="text-[9px] font-mono text-dim">{lastMsg?.dt}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {lastMsg?.direcao === 'SALA_EQUIP' && <StatusTick status={lastMsg.status} />}
                      <span className="text-[10px] text-dim truncate">{lastMsg?.conteudo}</span>
                    </div>
                  </div>
                  {c.unread > 0 && (
                    <div className="w-4 h-4 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-mono text-white">{c.unread}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── RIGHT: Chat View ─── */}
      <div className="flex-1 flex flex-col bg-hud-panel border border-hud-border rounded-xl overflow-hidden">
        {/* Chat header */}
        <div className="p-3 border-b border-hud-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeConv && <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-mono font-bold text-white" style={{ backgroundColor: activeConv.equip_cor }}>{activeConv.equip_codigo.slice(0, 3)}</div>}
            <div>
              <span className="text-sm font-display text-gray-200">{activeConv?.equip_codigo}</span>
              <span className="text-[10px] font-mono text-dim ml-2">{activeConv?.operador}</span>
            </div>
          </div>
          <button onClick={() => setBroadcastOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600/20 text-brand-400 border border-brand-600/40 rounded-md text-[10px] font-mono uppercase tracking-wider hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">
            <Megaphone className="w-3.5 h-3.5" />Broadcast
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeConv?.messages.map(msg => {
            const isSent = msg.direcao === 'SALA_EQUIP'
            return (
              <div key={msg.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-xl px-3 py-2 border ${isSent ? 'bg-brand-600/20 border-brand-600/30' : 'bg-white/5 border-hud-border'}`}>
                  {msg.tipo !== 'TEXTO' && <div className="mb-1"><MessageTypeBadge tipo={msg.tipo} /></div>}
                  <p className="text-xs text-gray-200">{msg.conteudo}</p>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <span className="text-[9px] font-mono text-dim">{msg.dt}</span>
                    {isSent && <StatusTick status={msg.status} />}
                  </div>
                  {/* Confirmation button for received messages that require it */}
                  {!isSent && msg.requer_confirmacao && !msg.confirmada && (
                    <button onClick={() => confirmMessage(msg.id)} className="mt-2 px-2 py-1 text-[10px] font-mono uppercase bg-ok/20 text-ok border border-ok/30 rounded hover:bg-ok/30 transition-all w-full">
                      CONFIRMAR
                    </button>
                  )}
                  {!isSent && msg.requer_confirmacao && msg.confirmada && (
                    <div className="mt-1.5 flex items-center gap-1 text-[9px] text-ok font-mono">
                      <CheckCheck className="w-3 h-3" />CONFIRMADO
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="p-3 border-t border-hud-border flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-white/5 text-dim transition-colors"><Paperclip className="w-4 h-4" /></button>
          <button className="p-2 rounded-lg hover:bg-white/5 text-dim transition-colors"><FileText className="w-4 h-4" /></button>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Digite uma mensagem..."
            className="flex-1 px-3 py-2 bg-hud-bg border border-hud-border rounded-lg text-xs text-gray-200 font-mono placeholder:text-gray-700 focus:outline-none focus:border-brand-600 transition-all" />
          <button onClick={send} className="p-2 rounded-lg bg-brand-600/20 text-brand-400 border border-brand-600/40 hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Broadcast Drawer ─── */}
      <Drawer open={broadcastOpen} onClose={() => setBroadcastOpen(false)} title="Broadcast" subtitle="Enviar para múltiplos equipamentos" footer={
        <button onClick={broadcast} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:shadow-glow-sm transition-all">Enviar Broadcast</button>
      }>
        <div className="space-y-6">
          <FormSection title="Mensagem">
            <Textarea label="Conteúdo" value={bcForm.mensagem} onChange={v => setBcForm(p => ({ ...p, mensagem: v }))} rows={4} placeholder="Mensagem para todos os equipamentos..." />
            <Select label="Prioridade" value={bcForm.prioridade} onChange={v => setBcForm(p => ({ ...p, prioridade: v }))} options={[{ value: 'NORMAL', label: 'Normal' }, { value: 'ALTA', label: 'Alta' }, { value: 'URGENTE', label: 'Urgente' }]} />
            <Toggle label="Requer Confirmação" checked={bcForm.requer_confirmacao} onChange={v => setBcForm(p => ({ ...p, requer_confirmacao: v }))} description="Operadores devem confirmar recebimento" />
          </FormSection>
          <FormSection title="Destinatários">
            <p className="text-[10px] text-dim mb-2">Deixe vazio para enviar a todos</p>
            <div className="space-y-1">
              {conversations.map(c => (
                <button key={c.equip_codigo} onClick={() => toggleDestinatario(c.equip_codigo)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${bcForm.destinatarios.includes(c.equip_codigo) ? 'bg-brand-600/10 border-brand-600/30' : 'bg-hud-bg border-hud-border hover:bg-white/5'}`}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-mono font-bold text-white" style={{ backgroundColor: c.equip_cor }}>{c.equip_codigo.slice(0, 2)}</div>
                  <span className="text-xs text-gray-300">{c.equip_codigo}</span>
                  <span className="text-[10px] text-dim ml-auto">{c.operador}</span>
                </button>
              ))}
            </div>
          </FormSection>
        </div>
      </Drawer>
    </div>
  )
}