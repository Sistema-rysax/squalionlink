import { useState } from 'react'
import { mensagens, equipamentos } from '../../mock/data'
import { Send, AlertCircle } from 'lucide-react'

export default function Mensageria() {
  const [selected, setSelected] = useState('CAT-01')
  const convs = ['CAT-01', 'CAT-02', 'CAT-05', 'ESC-01']
  const msgs = mensagens.filter(m => m.equip === selected)

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      {/* Conversas */}
      <div className="w-72 bg-surface-1 border border-surface-3 rounded-xl overflow-hidden flex flex-col">
        <div className="p-3 border-b border-surface-3"><h3 className="text-sm font-medium text-gray-300">Conversas</h3></div>
        <div className="flex-1 overflow-y-auto">
          {convs.map(c => {
            const e = equipamentos.find(eq => eq.codigo === c)
            const lastMsg = mensagens.filter(m => m.equip === c).pop()
            return (
              <div key={c} onClick={() => setSelected(c)} className={`p-3 border-b border-surface-3 cursor-pointer transition-colors ${selected === c ? 'bg-surface-3' : 'hover:bg-surface-2'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{background: e?.cor || '#666'}}></div>
                  <span className="text-sm font-medium text-gray-200">{c}</span>
                  <span className="text-xs text-gray-600 ml-auto">{e?.operador?.split(' ')[0]}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate ml-4">{lastMsg?.conteudo}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 bg-surface-1 border border-surface-3 rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-surface-3 flex items-center gap-3">
          <span className="font-medium text-white">{selected}</span>
          <span className="text-xs text-gray-500">{equipamentos.find(e => e.codigo === selected)?.operador}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {msgs.map(m => (
            <div key={m.id} className={`flex ${m.direcao === 'SALA_EQUIP' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-xl px-4 py-2.5 ${m.direcao === 'SALA_EQUIP' ? 'bg-brand-600/20 border border-brand-700' : 'bg-surface-3 border border-surface-4'}`}>
                {m.prioridade === 'EMERGENCIA' && <div className="flex items-center gap-1 mb-1 text-red-400 text-xs"><AlertCircle className="w-3 h-3" /> EMERGÊNCIA</div>}
                <p className="text-sm text-gray-200">{m.conteudo}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-600">{new Date(m.dt).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'})}</span>
                  <span className="text-xs text-gray-600">{m.status === 'LIDO' ? '✓✓' : '✓'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-surface-3">
          <div className="flex gap-2 mb-2">
            {['✅ Entendido', '🚗 A caminho', '🔧 Apoio'].map(r => (
              <button key={r} className="px-3 py-1 bg-surface-2 border border-surface-4 rounded-lg text-xs text-gray-400 hover:border-brand-500 transition-colors">{r}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input placeholder="Digite uma mensagem..." className="flex-1 px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-brand-500" />
            <button className="px-4 py-2 bg-brand-600 hover:bg-brand-700 rounded-lg text-white text-sm flex items-center gap-2 transition-colors"><Send className="w-4 h-4" /> Enviar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
