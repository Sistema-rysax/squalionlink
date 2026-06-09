import { useState } from 'react'
import { useT } from '../../contexts/LanguageContext'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid, ColorPicker, Toggle } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'
import { AlertTriangle, Bell, ShieldAlert } from 'lucide-react'

/* ─── Mock Rules ─── */
const mockRegras: Record<number, Regra[]> = {
  1: [
    { id: 1, condicao: 'VELOCIDADE_ACIMA', valor: '55', acao: 'ALERTA' },
    { id: 2, condicao: 'TEMPO_PARADA_ACIMA', valor: '5', acao: 'NOTIFICAR' },
  ],
  2: [
    { id: 1, condicao: 'VELOCIDADE_ACIMA', valor: '50', acao: 'ALERTA' },
    { id: 2, condicao: 'VELOCIDADE_ABAIXO', valor: '3', acao: 'NOTIFICAR' },
    { id: 3, condicao: 'TEMPO_ATIVIDADE_ACIMA', valor: '120', acao: 'BLOQUEAR' },
  ],
  3: [
    { id: 1, condicao: 'VELOCIDADE_ACIMA', valor: '5', acao: 'BLOQUEAR' },
    { id: 2, condicao: 'TEMPO_PARADA_ACIMA', valor: '15', acao: 'ALERTA' },
  ],
  4: [
    { id: 1, condicao: 'TEMPO_ATIVIDADE_ACIMA', valor: '30', acao: 'ALERTA' },
    { id: 2, condicao: 'TEMPO_ATIVIDADE_ACIMA', valor: '60', acao: 'NOTIFICAR' },
    { id: 3, condicao: 'VELOCIDADE_ACIMA', valor: '3', acao: 'BLOQUEAR' },
  ],
  5: [
    { id: 1, condicao: 'VELOCIDADE_ACIMA', valor: '12', acao: 'ALERTA' },
    { id: 2, condicao: 'TEMPO_ATIVIDADE_ACIMA', valor: '20', acao: 'NOTIFICAR' },
  ],
  6: [
    { id: 1, condicao: 'VELOCIDADE_ACIMA', valor: '0', acao: 'BLOQUEAR' },
    { id: 2, condicao: 'TEMPO_ATIVIDADE_ACIMA', valor: '480', acao: 'NOTIFICAR' },
  ],
}

interface Regra { id: number; condicao: string; valor: string; acao: string }

/* ─── Mock Data ─── */
const init = [
  { id: 1, nome: 'Transporte Cheio', classificacao: 'PRODUTIVA' as const, tipo_movimento: 'MOVIMENTO' as const, vel_min_kmh: 5, vel_max_kmh: 60, cor: '#22c55e', icone: 'truck', logoff_auto_min: 0, tempo_maximo_min: 0, gera_alerta_parada: true, gera_alerta_movimento: false, id_atividade_tipo: '1', id_atividade_grupo: '1' },
  { id: 2, nome: 'Transporte Vazio', classificacao: 'PRODUTIVA' as const, tipo_movimento: 'MOVIMENTO' as const, vel_min_kmh: 5, vel_max_kmh: 55, cor: '#06b6d4', icone: 'truck', logoff_auto_min: 0, tempo_maximo_min: 0, gera_alerta_parada: true, gera_alerta_movimento: false, id_atividade_tipo: '1', id_atividade_grupo: '1' },
  { id: 3, nome: 'Carregamento', classificacao: 'PRODUTIVA' as const, tipo_movimento: 'PARADA' as const, vel_min_kmh: 0, vel_max_kmh: 3, cor: '#2563eb', icone: 'loader', logoff_auto_min: 0, tempo_maximo_min: 30, gera_alerta_parada: false, gera_alerta_movimento: true, id_atividade_tipo: '2', id_atividade_grupo: '1' },
  { id: 4, nome: 'Fila de Carga', classificacao: 'IMPRODUTIVA' as const, tipo_movimento: 'PARADA' as const, vel_min_kmh: 0, vel_max_kmh: 2, cor: '#f59e0b', icone: 'clock', logoff_auto_min: 60, tempo_maximo_min: 45, gera_alerta_parada: false, gera_alerta_movimento: true, id_atividade_tipo: '3', id_atividade_grupo: '2' },
  { id: 5, nome: 'Manobra', classificacao: 'APOIO' as const, tipo_movimento: 'AMBOS' as const, vel_min_kmh: 0, vel_max_kmh: 12, cor: '#a855f7', icone: 'rotate', logoff_auto_min: 0, tempo_maximo_min: 20, gera_alerta_parada: false, gera_alerta_movimento: false, id_atividade_tipo: '4', id_atividade_grupo: '1' },
  { id: 6, nome: 'Manutenção Corretiva', classificacao: 'MANUTENCAO' as const, tipo_movimento: 'PARADA' as const, vel_min_kmh: 0, vel_max_kmh: 0, cor: '#ef4444', icone: 'wrench', logoff_auto_min: 480, tempo_maximo_min: 0, gera_alerta_parada: false, gera_alerta_movimento: true, id_atividade_tipo: '5', id_atividade_grupo: '3' },
  { id: 7, nome: 'Reserva Operacional', classificacao: 'RESERVA' as const, tipo_movimento: 'PARADA' as const, vel_min_kmh: 0, vel_max_kmh: 0, cor: '#6b7280', icone: 'pause', logoff_auto_min: 120, tempo_maximo_min: 0, gera_alerta_parada: false, gera_alerta_movimento: true, id_atividade_tipo: '6', id_atividade_grupo: '4' },
]

const empty = {
  nome: '', classificacao: 'PRODUTIVA', tipo_movimento: 'PARADA', vel_min_kmh: '', vel_max_kmh: '',
  cor: '#22c55e', icone: '', logoff_auto_min: '', tempo_maximo_min: '',
  gera_alerta_parada: false, gera_alerta_movimento: false,
  id_atividade_tipo: '', id_atividade_grupo: '',
}

const classificacaoColors: Record<string, string> = {
  PRODUTIVA: 'bg-ok/10 text-ok border-ok/20',
  IMPRODUTIVA: 'bg-warn/10 text-warn border-warn/20',
  MANUTENCAO: 'bg-crit/10 text-crit border-crit/20',
  APOIO: 'bg-info/10 text-info border-info/20',
  RESERVA: 'bg-white/5 text-dim border-hud-border',
}

const tipoMovColors: Record<string, string> = {
  PARADA: 'bg-warn/10 text-warn border-warn/20',
  MOVIMENTO: 'bg-ok/10 text-ok border-ok/20',
  AMBOS: 'bg-info/10 text-info border-info/20',
}

export default function Atividades() {
  const t = useT()
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const [tab, setTab] = useState<'dados' | 'regras'>('dados')
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }))

  const save = () => {
    if (!form.nome) { toast('Nome obrigatório', 'error'); return }
    if (editing) {
      setData(p => p.map(r => r.id === editing.id ? { ...r, ...form, vel_min_kmh: +form.vel_min_kmh || 0, vel_max_kmh: +form.vel_max_kmh || 0, logoff_auto_min: +form.logoff_auto_min || 0, tempo_maximo_min: +form.tempo_maximo_min || 0 } : r))
      toast('Atividade atualizada')
    } else {
      setData(p => [...p, { id: Date.now(), ...form, vel_min_kmh: +form.vel_min_kmh || 0, vel_max_kmh: +form.vel_max_kmh || 0, logoff_auto_min: +form.logoff_auto_min || 0, tempo_maximo_min: +form.tempo_maximo_min || 0 }])
      toast('Atividade criada')
    }
    setOpen(false)
  }

  const openEdit = (r: any) => {
    setForm({
      nome: r.nome, classificacao: r.classificacao, tipo_movimento: r.tipo_movimento,
      vel_min_kmh: String(r.vel_min_kmh), vel_max_kmh: String(r.vel_max_kmh),
      cor: r.cor, icone: r.icone, logoff_auto_min: String(r.logoff_auto_min),
      tempo_maximo_min: String(r.tempo_maximo_min), gera_alerta_parada: r.gera_alerta_parada,
      gera_alerta_movimento: r.gera_alerta_movimento, id_atividade_tipo: r.id_atividade_tipo,
      id_atividade_grupo: r.id_atividade_grupo,
    })
    setEditing(r)
    setTab('dados')
    setOpen(true)
  }

  const regras = editing ? (mockRegras[editing.id] || []) : []

  const columns = [
    { key: 'nome', label: 'Nome', render: (r: any) => (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full ring-1 ring-white/10" style={{ background: r.cor }}></div>
        <span className="font-bold text-gray-200">{r.nome}</span>
      </div>
    )},
    { key: 'classificacao', label: 'Classificação', render: (r: any) => (
      <span className={`px-2 py-0.5 rounded text-[10px] border ${classificacaoColors[r.classificacao] || ''}`}>{r.classificacao}</span>
    )},
    { key: 'tipo_movimento', label: 'Movimento', render: (r: any) => (
      <span className={`px-2 py-0.5 rounded text-[10px] border ${tipoMovColors[r.tipo_movimento] || ''}`}>{r.tipo_movimento}</span>
    )},
    { key: 'vel', label: 'Velocidade', render: (r: any) => (
      <span className="font-mono text-xs">{r.vel_min_kmh}–{r.vel_max_kmh} km/h</span>
    )},
    { key: 'logoff_auto_min', label: 'Logoff', render: (r: any) => (
      <span className="font-mono text-xs text-dim">{r.logoff_auto_min ? r.logoff_auto_min + ' min' : '—'}</span>
    )},
    { key: 'alertas', label: 'Alertas', render: (r: any) => (
      <div className="flex items-center gap-1.5">
        {r.gera_alerta_parada && <AlertTriangle className="w-3.5 h-3.5 text-warn" title="Alerta Parada" />}
        {r.gera_alerta_movimento && <Bell className="w-3.5 h-3.5 text-info" title="Alerta Movimento" />}
        {!r.gera_alerta_parada && !r.gera_alerta_movimento && <span className="text-[10px] text-dim">—</span>}
      </div>
    )},
  ]

  const acaoColors: Record<string, string> = {
    ALERTA: 'bg-warn/10 text-warn border-warn/20',
    BLOQUEAR: 'bg-crit/10 text-crit border-crit/20',
    NOTIFICAR: 'bg-info/10 text-info border-info/20',
  }

  return (<>
    <DataTable columns={columns} data={data} title={t.operations.activities} status="info"
      onAdd={() => { setForm(empty); setEditing(null); setTab('dados'); setOpen(true) }}
      onEdit={openEdit} onDelete={setDel} addLabel={t.operations.newActivity} />

    <Drawer open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Atividade' : 'Nova Atividade'} subtitle={editing?.nome}
      footer={<>
        <button onClick={() => setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button>
        <button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button>
      </>}>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-hud-border">
        <button onClick={() => setTab('dados')} className={`px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition-colors ${tab === 'dados' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-dim hover:text-gray-400'}`}>Dados</button>
        {editing && <button onClick={() => setTab('regras')} className={`px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition-colors ${tab === 'regras' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-dim hover:text-gray-400'}`}>Regras ({regras.length})</button>}
      </div>

      {tab === 'dados' && (
        <div className="space-y-6">
          <FormSection title="Identificação">
            <Input label="Nome" value={form.nome} onChange={v => set('nome', v)} required placeholder="Transporte Cheio" />
            <FormGrid>
              <Select label="Classificação" value={form.classificacao} onChange={v => set('classificacao', v)} options={[
                { value: 'PRODUTIVA', label: 'Produtiva' }, { value: 'IMPRODUTIVA', label: 'Improdutiva' },
                { value: 'MANUTENCAO', label: 'Manutenção' }, { value: 'APOIO', label: 'Apoio' },
                { value: 'RESERVA', label: 'Reserva' },
              ]} />
              <Select label="Tipo Movimento" value={form.tipo_movimento} onChange={v => set('tipo_movimento', v)} options={[
                { value: 'PARADA', label: 'Parada' }, { value: 'MOVIMENTO', label: 'Movimento' }, { value: 'AMBOS', label: 'Ambos' },
              ]} />
            </FormGrid>
          </FormSection>

          <FormSection title="Velocidade (km/h)">
            <FormGrid>
              <Input label="Vel. Mínima" value={form.vel_min_kmh} onChange={v => set('vel_min_kmh', v)} type="number" placeholder="0" />
              <Input label="Vel. Máxima" value={form.vel_max_kmh} onChange={v => set('vel_max_kmh', v)} type="number" placeholder="60" />
            </FormGrid>
          </FormSection>

          <FormSection title="Tempos">
            <FormGrid>
              <Input label="Logoff Automático (min)" value={form.logoff_auto_min} onChange={v => set('logoff_auto_min', v)} type="number" placeholder="0 = desativado" />
              <Input label="Tempo Máximo (min)" value={form.tempo_maximo_min} onChange={v => set('tempo_maximo_min', v)} type="number" placeholder="0 = sem limite" />
            </FormGrid>
          </FormSection>

          <FormSection title="Alertas">
            <Toggle label="Gera alerta em parada" checked={form.gera_alerta_parada} onChange={v => set('gera_alerta_parada', v)} description="Dispara alerta se equipamento parar nesta atividade" />
            <Toggle label="Gera alerta em movimento" checked={form.gera_alerta_movimento} onChange={v => set('gera_alerta_movimento', v)} description="Dispara alerta se equipamento se mover nesta atividade" />
          </FormSection>

          <FormSection title="Vínculos">
            <FormGrid>
              <Select label="Tipo Atividade" value={form.id_atividade_tipo} onChange={v => set('id_atividade_tipo', v)} options={[
                { value: '1', label: 'Transporte' }, { value: '2', label: 'Carga' },
                { value: '3', label: 'Espera' }, { value: '4', label: 'Apoio' },
                { value: '5', label: 'Manutenção' }, { value: '6', label: 'Reserva' },
              ]} />
              <Select label="Grupo Atividade" value={form.id_atividade_grupo} onChange={v => set('id_atividade_grupo', v)} options={[
                { value: '1', label: 'Operação Mina' }, { value: '2', label: 'Apoio Operacional' },
                { value: '3', label: 'Manutenção' }, { value: '4', label: 'Reserva/Ociosidade' },
              ]} />
            </FormGrid>
          </FormSection>

          <FormSection title="Visual">
            <ColorPicker label="Cor" value={form.cor} onChange={v => set('cor', v)} />
            <Input label="Ícone" value={form.icone} onChange={v => set('icone', v)} placeholder="truck, loader, wrench..." />
          </FormSection>
        </div>
      )}

      {tab === 'regras' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-display uppercase tracking-widest text-brand-400">Regras de Controle</h4>
            <button className="px-2 py-1 text-[10px] font-mono text-brand-400 border border-brand-600/40 rounded hover:bg-brand-600/20 transition-colors">+ Regra</button>
          </div>
          <div className="border border-hud-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-hud-bg border-b border-hud-border">
                  <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Condição</th>
                  <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Valor</th>
                  <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Ação</th>
                </tr>
              </thead>
              <tbody>
                {regras.map(r => (
                  <tr key={r.id} className="border-b border-hud-border/50 hover:bg-hud-bg/50">
                    <td className="px-3 py-2 font-mono text-gray-300">{r.condicao.replace(/_/g, ' ')}</td>
                    <td className="px-3 py-2 font-mono text-gray-200">{r.valor}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${acaoColors[r.acao] || ''}`}>{r.acao}</span>
                    </td>
                  </tr>
                ))}
                {regras.length === 0 && (
                  <tr><td colSpan={3} className="px-3 py-6 text-center text-dim text-xs">Nenhuma regra cadastrada</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-dim">Regras são avaliadas em tempo real pelo módulo de telemetria.</p>
        </div>
      )}
    </Drawer>

    <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={() => { setData(p => p.filter(r => r.id !== del.id)); toast('Atividade removida'); setDel(null) }} title="Excluir Atividade" message={'Excluir ' + (del?.nome || '') + '?'} confirmLabel="Excluir" />
  </>)
}