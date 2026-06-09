import { useState } from 'react'
import { useT } from '../../contexts/LanguageContext'
import Drawer from '../../components/panels/Drawer'
import { Select, FormSection, Textarea, Input } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'
import { equipamentos } from '../../mock/data'
import { Send, ArrowRight, ChevronDown, ChevronUp, Settings, Clock, Zap } from 'lucide-react'

/* ─── Dispatch History ─── */
const dispatchHistory = [
  { id: 1, ts: '10:42:15', equip: 'CAT-01', de: 'Britador', para: 'Frente Norte B3', motivo: 'Menor fila', score: 0.92 },
  { id: 2, ts: '10:38:03', equip: 'CAT-04', de: 'Frente Sul A1', para: 'Britador', motivo: 'Prioridade carga', score: 0.87 },
  { id: 3, ts: '10:35:22', equip: 'CAT-05', de: 'Britador', para: 'Frente Norte B3', motivo: 'Distância ótima', score: 0.84 },
  { id: 4, ts: '10:30:11', equip: 'CAT-02', de: 'Frente Norte B3', para: 'Britador', motivo: 'Menor fila', score: 0.91 },
  { id: 5, ts: '10:25:48', equip: 'CAT-01', de: 'Frente Sul A1', para: 'Pilha ROM', motivo: 'Compatibilidade', score: 0.78 },
  { id: 6, ts: '10:20:05', equip: 'CAT-04', de: 'Britador', para: 'Frente Sul A1', motivo: 'Balanceamento', score: 0.82 },
  { id: 7, ts: '10:15:30', equip: 'CAT-05', de: 'Frente Norte B3', para: 'Pilha Estéril', motivo: 'Distância ótima', score: 0.88 },
  { id: 8, ts: '10:10:42', equip: 'CAT-02', de: 'Pilha ROM', para: 'Frente Norte B3', motivo: 'Prioridade carga', score: 0.90 },
  { id: 9, ts: '10:05:18', equip: 'CAT-01', de: 'Frente Norte B3', para: 'Britador', motivo: 'Menor fila', score: 0.86 },
  { id: 10, ts: '10:00:55', equip: 'CAT-04', de: 'Britador', para: 'Frente Norte B3', motivo: 'Balanceamento', score: 0.79 },
]

/* ─── Route scores for visual ─── */
const routeScores: Record<string, number> = {
  'CAT-01': 0.92, 'CAT-02': 0.75, 'CAT-04': 0.87, 'CAT-05': 0.68,
}

export default function Dispatch() {
  const t = useT()
  const [equips] = useState(equipamentos.map(e => ({
    ...e,
    rota_atual: e.atividade?.includes('Transporte') ? 'Frente Norte B3 → Britador' : null,
    score: routeScores[e.codigo] || null,
  })))
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState({ destino: '', mensagem: '' })
  const [configOpen, setConfigOpen] = useState(false)

  /* ─── Config state ─── */
  const [modo, setModo] = useState<'MANUAL' | 'SEMI_AUTOMATICO' | 'AUTOMATICO'>('SEMI_AUTOMATICO')
  const [pesos, setPesos] = useState({ fila: 0.30, distancia: 0.25, prioridade: 0.25, compatibilidade: 0.20 })
  const [timeout, setTimeout] = useState(45)
  const [intervalo, setIntervalo] = useState(30)

  const setPeso = (k: string, v: number) => {
    setPesos(p => ({ ...p, [k]: v }))
  }

  const despachar = () => {
    if (!form.destino) { toast('Selecione um destino', 'error'); return }
    toast(selected.codigo + ' despachado para ' + form.destino)
    setSelected(null); setForm({ destino: '', mensagem: '' })
  }

  const caminhoes = equips.filter(e => e.grupo === 'Caminhão')
  const escavadeiras = equips.filter(e => e.grupo === 'Escavadeira')

  const modoColors: Record<string, string> = {
    MANUAL: 'border-dim text-dim',
    SEMI_AUTOMATICO: 'border-brand-600/60 text-brand-400',
    AUTOMATICO: 'border-ok/60 text-ok',
  }
  const modoActive: Record<string, string> = {
    MANUAL: 'bg-dim/10 border-dim ring-1 ring-dim/30',
    SEMI_AUTOMATICO: 'bg-brand-600/20 border-brand-600 ring-1 ring-brand-400/30',
    AUTOMATICO: 'bg-ok/20 border-ok ring-1 ring-ok/30',
  }

  const scoreColor = (s: number) => s >= 0.85 ? 'bg-ok' : s >= 0.7 ? 'bg-brand-400' : s >= 0.5 ? 'bg-warn' : 'bg-crit'

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm tracking-wider text-gray-200 uppercase">Painel de Dispatch</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] font-mono text-dim">
            <div className="w-2 h-2 rounded-full bg-ok animate-pulse"></div>TEMPO REAL
          </div>
          <button onClick={() => setConfigOpen(!configOpen)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-brand-400 border border-brand-600/40 rounded hover:bg-brand-600/20 transition-colors">
            <Settings className="w-3 h-3" />{configOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* ─── Config Panel (collapsible) ─── */}
      {configOpen && (
        <div className="bg-hud-panel border border-hud-border rounded-xl p-4 space-y-4 animate-in fade-in">
          <h3 className="text-[10px] font-display uppercase tracking-widest text-brand-400">Configuração do Dispatch</h3>

          {/* Modo */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-wider text-dim">Modo de Operação</label>
            <div className="grid grid-cols-3 gap-2">
              {(['MANUAL', 'SEMI_AUTOMATICO', 'AUTOMATICO'] as const).map(m => (
                <button key={m} onClick={() => setModo(m)}
                  className={`p-3 rounded-lg border text-center transition-all ${modo === m ? modoActive[m] : 'border-hud-border hover:border-gray-600'}`}>
                  <div className={`text-xs font-mono ${modo === m ? modoColors[m] : 'text-dim'}`}>
                    {m === 'MANUAL' && <Zap className="w-4 h-4 mx-auto mb-1 opacity-50" />}
                    {m === 'SEMI_AUTOMATICO' && <Settings className="w-4 h-4 mx-auto mb-1" />}
                    {m === 'AUTOMATICO' && <Zap className="w-4 h-4 mx-auto mb-1" />}
                    {m.replace('_', ' ')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pesos */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-wider text-dim">Pesos do Algoritmo (soma ≈ 1.0)</label>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(pesos).map(([k, v]) => (
                <div key={k} className="space-y-1">
                  <label className="text-[10px] font-mono text-dim capitalize">{k}</label>
                  <input type="range" min="0" max="100" value={Math.round(v * 100)}
                    onChange={e => setPeso(k, +e.target.value / 100)}
                    className="w-full h-1 bg-hud-border rounded-lg appearance-none cursor-pointer accent-brand-400" />
                  <span className="text-[10px] font-mono text-brand-400 block text-center">{v.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="text-[10px] font-mono text-dim text-right">
              Total: <span className={`${Math.abs(Object.values(pesos).reduce((a, b) => a + b, 0) - 1) < 0.05 ? 'text-ok' : 'text-warn'}`}>
                {Object.values(pesos).reduce((a, b) => a + b, 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Timeouts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-dim">Timeout Confirmação (seg)</label>
              <input type="number" value={timeout} onChange={e => setTimeout(+e.target.value)}
                className="w-full px-3 py-2 bg-hud-bg border border-hud-border rounded-md text-sm text-gray-200 font-mono focus:outline-none focus:border-brand-600" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-dim">Intervalo Recálculo (seg)</label>
              <input type="number" value={intervalo} onChange={e => setIntervalo(+e.target.value)}
                className="w-full px-3 py-2 bg-hud-bg border border-hud-border rounded-md text-sm text-gray-200 font-mono focus:outline-none focus:border-brand-600" />
            </div>
          </div>
        </div>
      )}

      {/* Escavadeiras */}
      <div className="bg-hud-panel border border-hud-border rounded-xl p-4">
        <h3 className="text-[10px] font-display uppercase tracking-widest text-brand-400 mb-3">Pontos de Carga</h3>
        <div className="grid grid-cols-2 gap-3">
          {escavadeiras.map(e => (
            <div key={e.id} className="bg-hud-bg border border-hud-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-200 font-mono">{e.codigo} — {e.modelo}</span>
                <div className="flex items-center gap-1.5">
                  <div className={'led led-' + (e.status === 'OPERANDO' ? 'ok' : 'warn')}></div>
                  <span className="text-[10px]">{e.status}</span>
                </div>
              </div>
              <p className="text-[10px] text-dim">{e.operador || 'Sem operador'}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-dim">Fila:</span>
                <div className="flex gap-1">
                  {caminhoes.filter(c => c.atividade === 'Fila de Carga').slice(0, 3).map(c => (
                    <span key={c.id} className="px-1.5 py-0.5 bg-warn/10 text-warn border border-warn/20 rounded text-[10px] font-mono">{c.codigo}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Caminhões */}
      <div className="bg-hud-panel border border-hud-border rounded-xl p-4 flex-1">
        <h3 className="text-[10px] font-display uppercase tracking-widest text-brand-400 mb-3">Frota de Transporte</h3>
        <div className="space-y-2">
          {caminhoes.map(e => (
            <div key={e.id} className="flex items-center justify-between bg-hud-bg border border-hud-border rounded-lg p-3 hover:border-brand-600/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className={'led led-' + (e.status === 'OPERANDO' ? 'ok' : e.status === 'PARADO' ? 'warn' : 'crit')}></div>
                <span className="font-mono text-sm text-brand-400">{e.codigo}</span>
                <span className="text-xs text-dim">{e.operador || '—'}</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Score indicator */}
                {(e as any).score && (
                  <div className="flex items-center gap-1.5" title={`Score: ${((e as any).score * 100).toFixed(0)}%`}>
                    <div className="w-16 h-1.5 bg-hud-border rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${scoreColor((e as any).score)}`} style={{ width: `${(e as any).score * 100}%` }}></div>
                    </div>
                    <span className="text-[10px] font-mono text-dim">{((e as any).score * 100).toFixed(0)}%</span>
                  </div>
                )}
                {(e as any).rota_atual && (
                  <span className="text-[10px] text-dim font-mono flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" />{(e as any).rota_atual}
                  </span>
                )}
                <span className={'px-2 py-0.5 rounded text-[10px] border ' + (e.status === 'OPERANDO' ? 'bg-ok/10 text-ok border-ok/20' : e.status === 'PARADO' ? 'bg-warn/10 text-warn border-warn/20' : 'bg-crit/10 text-crit border-crit/20')}>
                  {e.atividade || e.status}
                </span>
                <button onClick={() => setSelected(e)} className="px-2 py-1 text-[10px] font-mono text-brand-400 border border-brand-600/40 rounded hover:bg-brand-600/20 transition-colors">
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── History Panel ─── */}
      <div className="bg-hud-panel border border-hud-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-display uppercase tracking-widest text-brand-400">Histórico de Dispatch</h3>
          <div className="flex items-center gap-1 text-[10px] font-mono text-dim"><Clock className="w-3 h-3" />Últimos 10</div>
        </div>
        <div className="border border-hud-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-hud-bg border-b border-hud-border">
                <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Hora</th>
                <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Equip</th>
                <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Rota</th>
                <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Motivo</th>
                <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Score</th>
              </tr>
            </thead>
            <tbody>
              {dispatchHistory.map(h => (
                <tr key={h.id} className="border-b border-hud-border/50 hover:bg-hud-bg/50">
                  <td className="px-3 py-1.5 font-mono text-dim">{h.ts}</td>
                  <td className="px-3 py-1.5 font-mono text-brand-400">{h.equip}</td>
                  <td className="px-3 py-1.5 text-gray-300">{h.de} → {h.para}</td>
                  <td className="px-3 py-1.5 text-gray-400">{h.motivo}</td>
                  <td className="px-3 py-1.5">
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-1 bg-hud-border rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${scoreColor(h.score)}`} style={{ width: `${h.score * 100}%` }}></div>
                      </div>
                      <span className="font-mono text-[10px] text-dim">{(h.score * 100).toFixed(0)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Despachar Equipamento" subtitle={selected?.codigo}
        footer={<>
          <button onClick={() => setSelected(null)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button>
          <button onClick={despachar} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Despachar</button>
        </>}>
        <div className="space-y-6">
          <FormSection title="Destino">
            <Select label="Destino" value={form.destino} onChange={v => setForm(p => ({ ...p, destino: v }))} options={[
              { value: 'Frente Norte B3', label: 'Frente Norte B3' }, { value: 'Frente Sul A1', label: 'Frente Sul A1' },
              { value: 'Britador', label: 'Britador' }, { value: 'Pilha ROM', label: 'Pilha ROM' },
              { value: 'Pilha Estéril', label: 'Pilha Estéril' },
            ]} required />
          </FormSection>
          <FormSection title="Mensagem (opcional)">
            <Textarea label="Mensagem para operador" value={form.mensagem} onChange={v => setForm(p => ({ ...p, mensagem: v }))} placeholder="Instruções especiais..." />
          </FormSection>
        </div>
      </Drawer>
    </div>
  )
}