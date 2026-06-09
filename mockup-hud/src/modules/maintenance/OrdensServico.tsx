import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, Textarea, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'
import { CheckCircle2, Circle, Clock, XCircle, Wrench, Plus } from 'lucide-react'

/* ─── Workflow Status ─── */
const WORKFLOW = ['ABERTA', 'PROGRAMADA', 'EXECUTANDO', 'CONCLUIDA', 'CANCELADA'] as const
type Status = typeof WORKFLOW[number]

const statusColors: Record<string, string> = {
  ABERTA: 'bg-brand-600/10 text-brand-400 border-brand-600/20',
  PROGRAMADA: 'bg-info/10 text-info border-info/20',
  EXECUTANDO: 'bg-warn/10 text-warn border-warn/20',
  CONCLUIDA: 'bg-ok/10 text-ok border-ok/20',
  CANCELADA: 'bg-white/5 text-dim border-hud-border',
}
const statusIcons: Record<string, any> = {
  ABERTA: Circle,
  PROGRAMADA: Clock,
  EXECUTANDO: Wrench,
  CONCLUIDA: CheckCircle2,
  CANCELADA: XCircle,
}

const prioColors: Record<string, string> = {
  BAIXA: 'bg-white/5 text-dim border-hud-border',
  MEDIA: 'bg-brand-600/10 text-brand-400 border-brand-600/20',
  ALTA: 'bg-warn/10 text-warn border-warn/20',
  URGENTE: 'bg-crit/10 text-crit border-crit/20',
}

/* ─── Mock Items / Peças / Histórico per OS ─── */
const mockItens: Record<number, any[]> = {
  1: [
    { id: 1, descricao: 'Verificar sensor de temperatura', responsavel: 'Marcos Lima', status: 'PENDENTE' },
    { id: 2, descricao: 'Drenar fluido refrigerante', responsavel: 'Marcos Lima', status: 'PENDENTE' },
    { id: 3, descricao: 'Substituir termostato', responsavel: 'Felipe Oliveira', status: 'PENDENTE' },
  ],
  2: [
    { id: 1, descricao: 'Drenar óleo do motor', responsavel: 'Marcos Lima', status: 'EXECUTADO' },
    { id: 2, descricao: 'Substituir filtro de óleo', responsavel: 'Marcos Lima', status: 'EXECUTADO' },
    { id: 3, descricao: 'Reabastecer óleo 15W-40', responsavel: 'Felipe Oliveira', status: 'EXECUTADO' },
    { id: 4, descricao: 'Verificar vazamentos', responsavel: 'Marcos Lima', status: 'PENDENTE' },
  ],
  3: [
    { id: 1, descricao: 'Lubrificar pinos da caçamba', responsavel: 'Luis Ferreira', status: 'EXECUTADO' },
    { id: 2, descricao: 'Lubrificar articulações do braço', responsavel: 'Luis Ferreira', status: 'EXECUTADO' },
    { id: 3, descricao: 'Verificar nível graxa central', responsavel: 'Luis Ferreira', status: 'EXECUTADO' },
  ],
  4: [
    { id: 1, descricao: 'Localizar ponto de vazamento', responsavel: 'Felipe Oliveira', status: 'PENDENTE' },
    { id: 2, descricao: 'Substituir mangueira danificada', responsavel: 'Felipe Oliveira', status: 'PENDENTE' },
    { id: 3, descricao: 'Purgar sistema hidráulico', responsavel: 'Marcos Lima', status: 'PENDENTE' },
    { id: 4, descricao: 'Teste de pressão', responsavel: 'Marcos Lima', status: 'PENDENTE' },
  ],
}

const mockPecas: Record<number, any[]> = {
  1: [
    { id: 1, nome: 'Sensor Temperatura PT100', quantidade: 1, custo: 450.00 },
    { id: 2, nome: 'Termostato 85°C', quantidade: 1, custo: 1200.00 },
  ],
  2: [
    { id: 1, nome: 'Filtro Óleo Motor', quantidade: 2, custo: 370.00 },
    { id: 2, nome: 'Óleo 15W-40 (20L)', quantidade: 3, custo: 1890.00 },
    { id: 3, nome: 'Anel Vedação Dreno', quantidade: 1, custo: 12.50 },
  ],
  3: [
    { id: 1, nome: 'Graxa Especial EP2 (Balde 20kg)', quantidade: 1, custo: 680.00 },
  ],
  4: [
    { id: 1, nome: 'Mangueira Hidráulica 1"', quantidade: 2, custo: 890.00 },
    { id: 2, nome: 'Conexão Rápida SAE', quantidade: 4, custo: 320.00 },
    { id: 3, nome: 'Fluido Hidráulico ISO 46 (20L)', quantidade: 2, custo: 560.00 },
  ],
}

const mockHistorico: Record<number, any[]> = {
  1: [
    { id: 1, status: 'ABERTA', dt: '2024-06-09 09:30', usuario: 'João Silva' },
  ],
  2: [
    { id: 1, status: 'ABERTA', dt: '2024-06-08 07:00', usuario: 'Sistema' },
    { id: 2, status: 'PROGRAMADA', dt: '2024-06-08 08:15', usuario: 'Carlos Manutenção' },
    { id: 3, status: 'EXECUTANDO', dt: '2024-06-08 10:00', usuario: 'Marcos Lima' },
  ],
  3: [
    { id: 1, status: 'ABERTA', dt: '2024-06-07 06:00', usuario: 'Sistema' },
    { id: 2, status: 'PROGRAMADA', dt: '2024-06-07 06:30', usuario: 'Carlos Manutenção' },
    { id: 3, status: 'EXECUTANDO', dt: '2024-06-07 08:00', usuario: 'Luis Ferreira' },
    { id: 4, status: 'CONCLUIDA', dt: '2024-06-07 11:45', usuario: 'Luis Ferreira' },
  ],
  4: [
    { id: 1, status: 'ABERTA', dt: '2024-06-09 10:15', usuario: 'Roberto Lima' },
  ],
}

/* ─── Init ─── */
const init = [
  { id: 1, numero: 'OS-2024-0340', tipo: 'CORRETIVA' as const, prioridade: 'ALTA' as const, status: 'ABERTA' as Status, id_equipamento: 'CAT-03', id_solicitante: 'João Silva', descricao: 'Temperatura do motor elevada acima de 105°C durante operação', observacao_conclusao: '', dt_abertura: '2024-06-09 09:30', dt_programada: '', dt_inicio_exec: '', dt_conclusao: '' },
  { id: 2, numero: 'OS-2024-0339', tipo: 'PREVENTIVA' as const, prioridade: 'MEDIA' as const, status: 'EXECUTANDO' as Status, id_equipamento: 'CAT-01', id_solicitante: 'Sistema', descricao: 'Troca de óleo e filtro — Preventiva 500h', observacao_conclusao: '', dt_abertura: '2024-06-08 07:00', dt_programada: '2024-06-08 10:00', dt_inicio_exec: '2024-06-08 10:00', dt_conclusao: '' },
  { id: 3, numero: 'OS-2024-0338', tipo: 'PREVENTIVA' as const, prioridade: 'BAIXA' as const, status: 'CONCLUIDA' as Status, id_equipamento: 'ESC-02', id_solicitante: 'Sistema', descricao: 'Lubrificação geral — Plano 90 dias', observacao_conclusao: 'Concluída sem pendências. Próxima lubrificação em 15/09.', dt_abertura: '2024-06-07 06:00', dt_programada: '2024-06-07 08:00', dt_inicio_exec: '2024-06-07 08:00', dt_conclusao: '2024-06-07 11:45' },
  { id: 4, numero: 'OS-2024-0337', tipo: 'CORRETIVA' as const, prioridade: 'URGENTE' as const, status: 'ABERTA' as Status, id_equipamento: 'CAT-05', id_solicitante: 'Roberto Lima', descricao: 'Vazamento hidráulico severo no cilindro da caçamba', observacao_conclusao: '', dt_abertura: '2024-06-09 10:15', dt_programada: '', dt_inicio_exec: '', dt_conclusao: '' },
]

const empty = {
  tipo: 'CORRETIVA', prioridade: 'MEDIA', id_equipamento: '', id_solicitante: '',
  descricao: '', observacao_conclusao: '', dt_programada: '',
}

export default function OrdensServico() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const [tab, setTab] = useState<'dados' | 'itens' | 'pecas' | 'historico'>('dados')
  const set = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }))

  const save = () => {
    if (!form.id_equipamento || !form.descricao) { toast('Equipamento e descrição obrigatórios', 'error'); return }
    if (editing) {
      setData(p => p.map(r => r.id === editing.id ? { ...r, ...form } : r))
      toast('OS atualizada')
    } else {
      const numero = 'OS-2024-0' + Math.floor(Math.random() * 900 + 100)
      setData(p => [...p, { id: Date.now(), numero, ...form, status: 'ABERTA' as Status, dt_abertura: new Date().toISOString().slice(0, 16).replace('T', ' '), dt_inicio_exec: '', dt_conclusao: '' }])
      toast('OS criada')
    }
    setOpen(false)
  }

  const openEdit = (r: any) => {
    setForm({
      tipo: r.tipo, prioridade: r.prioridade, id_equipamento: r.id_equipamento,
      id_solicitante: r.id_solicitante, descricao: r.descricao,
      observacao_conclusao: r.observacao_conclusao, dt_programada: r.dt_programada,
    })
    setEditing(r)
    setTab('dados')
    setOpen(true)
  }

  const itens = editing ? (mockItens[editing.id] || []) : []
  const pecas = editing ? (mockPecas[editing.id] || []) : []
  const historico = editing ? (mockHistorico[editing.id] || []) : []

  const columns = [
    { key: 'numero', label: 'Número', render: (r: any) => <span className="text-brand-400 font-bold font-mono">{r.numero}</span> },
    { key: 'id_equipamento', label: 'Equipamento', render: (r: any) => <span className="font-bold">{r.id_equipamento}</span> },
    { key: 'tipo', label: 'Tipo', render: (r: any) => (
      <span className={`px-2 py-0.5 rounded text-[10px] border ${r.tipo === 'CORRETIVA' ? 'text-crit bg-crit/10 border-crit/20' : r.tipo === 'PREDITIVA' ? 'text-warn bg-warn/10 border-warn/20' : 'text-info bg-info/10 border-info/20'}`}>{r.tipo}</span>
    )},
    { key: 'prioridade', label: 'Prioridade', render: (r: any) => (
      <span className={`px-2 py-0.5 rounded text-[10px] border ${prioColors[r.prioridade] || ''}`}>{r.prioridade}</span>
    )},
    { key: 'status', label: 'Status', render: (r: any) => {
      const Icon = statusIcons[r.status] || Circle
      return (
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${r.status === 'CONCLUIDA' ? 'text-ok' : r.status === 'EXECUTANDO' ? 'text-warn' : r.status === 'CANCELADA' ? 'text-dim' : 'text-brand-400'}`} />
          <span className={`px-2 py-0.5 rounded text-[10px] border ${statusColors[r.status] || ''}`}>{r.status}</span>
        </div>
      )
    }},
    { key: 'dt_abertura', label: 'Abertura', render: (r: any) => <span className="font-mono text-xs text-dim">{r.dt_abertura}</span> },
  ]

  const itemStatusColors: Record<string, string> = {
    PENDENTE: 'bg-warn/10 text-warn border-warn/20',
    EXECUTADO: 'bg-ok/10 text-ok border-ok/20',
    CANCELADO: 'bg-white/5 text-dim border-hud-border',
  }

  return (<>
    <DataTable columns={columns} data={data} title="Ordens de Serviço"
      status={data.some(o => o.prioridade === 'URGENTE' && o.status === 'ABERTA') ? 'crit' : 'warn'}
      onAdd={() => { setForm(empty); setEditing(null); setTab('dados'); setOpen(true) }}
      onEdit={openEdit} onDelete={setDel} addLabel="Nova OS" />

    <Drawer open={open} onClose={() => setOpen(false)} title={editing ? editing.numero : 'Nova Ordem de Serviço'} subtitle={editing?.descricao?.slice(0, 50)} width="w-[560px]"
      footer={<>
        <button onClick={() => setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button>
        <button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button>
      </>}>

      {/* Workflow Steps */}
      {editing && (
        <div className="flex items-center gap-1 mb-6 px-2">
          {WORKFLOW.filter(s => s !== 'CANCELADA').map((step, i, arr) => {
            const current = WORKFLOW.indexOf(editing.status)
            const stepIdx = WORKFLOW.indexOf(step)
            const isActive = stepIdx === current
            const isDone = stepIdx < current
            const Icon = statusIcons[step]
            return (
              <span key={step} className="flex items-center gap-1">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono transition-all ${isActive ? 'bg-brand-600/20 border border-brand-600 text-brand-400 ring-1 ring-brand-400/30' : isDone ? 'bg-ok/10 text-ok border border-ok/20' : 'bg-hud-bg text-dim border border-hud-border'}`}>
                  <Icon className="w-3 h-3" />
                  {step}
                </div>
                {i < arr.length - 1 && <div className={`w-4 h-px ${isDone ? 'bg-ok' : 'bg-hud-border'}`}></div>}
              </span>
            )
          })}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-hud-border">
        <button onClick={() => setTab('dados')} className={`px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition-colors ${tab === 'dados' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-dim hover:text-gray-400'}`}>Dados</button>
        {editing && <>
          <button onClick={() => setTab('itens')} className={`px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition-colors ${tab === 'itens' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-dim hover:text-gray-400'}`}>Itens ({itens.length})</button>
          <button onClick={() => setTab('pecas')} className={`px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition-colors ${tab === 'pecas' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-dim hover:text-gray-400'}`}>Peças ({pecas.length})</button>
          <button onClick={() => setTab('historico')} className={`px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition-colors ${tab === 'historico' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-dim hover:text-gray-400'}`}>Histórico ({historico.length})</button>
        </>}
      </div>

      {/* Tab: Dados */}
      {tab === 'dados' && (
        <div className="space-y-6">
          <FormSection title="Classificação">
            <FormGrid>
              <Select label="Tipo" value={form.tipo} onChange={v => set('tipo', v)} options={[
                { value: 'PREVENTIVA', label: 'Preventiva' }, { value: 'CORRETIVA', label: 'Corretiva' }, { value: 'PREDITIVA', label: 'Preditiva' },
              ]} />
              <Select label="Prioridade" value={form.prioridade} onChange={v => set('prioridade', v)} options={[
                { value: 'BAIXA', label: 'Baixa' }, { value: 'MEDIA', label: 'Média' },
                { value: 'ALTA', label: 'Alta' }, { value: 'URGENTE', label: 'Urgente' },
              ]} />
            </FormGrid>
          </FormSection>
          <FormSection title="Equipamento & Solicitante">
            <FormGrid>
              <Select label="Equipamento" value={form.id_equipamento} onChange={v => set('id_equipamento', v)} required options={[
                { value: 'CAT-01', label: 'CAT-01 (777G)' }, { value: 'CAT-02', label: 'CAT-02 (777G)' },
                { value: 'CAT-03', label: 'CAT-03 (777G)' }, { value: 'CAT-04', label: 'CAT-04 (785D)' },
                { value: 'CAT-05', label: 'CAT-05 (785D)' }, { value: 'ESC-01', label: 'ESC-01 (PC5500)' },
                { value: 'ESC-02', label: 'ESC-02 (CAT 6060)' }, { value: 'MOT-01', label: 'MOT-01 (CAT 16M)' },
              ]} />
              <Select label="Solicitante" value={form.id_solicitante} onChange={v => set('id_solicitante', v)} options={[
                { value: 'João Silva', label: 'João Silva' }, { value: 'Carlos Santos', label: 'Carlos Santos' },
                { value: 'Roberto Lima', label: 'Roberto Lima' }, { value: 'Sistema', label: 'Sistema (Automático)' },
              ]} />
            </FormGrid>
          </FormSection>
          <FormSection title="Datas">
            <FormGrid>
              <Input label="Data Programada" value={form.dt_programada} onChange={v => set('dt_programada', v)} placeholder="2024-06-10 08:00" />
              <Input label="Data Abertura" value={editing?.dt_abertura || ''} onChange={() => {}} disabled />
            </FormGrid>
          </FormSection>
          <FormSection title="Descrição">
            <Textarea label="Descrição do Serviço" value={form.descricao} onChange={v => set('descricao', v)} placeholder="Descreva o problema ou serviço..." rows={3} />
            <Textarea label="Observação de Conclusão" value={form.observacao_conclusao} onChange={v => set('observacao_conclusao', v)} placeholder="Preenchido ao concluir a OS..." rows={2} />
          </FormSection>
        </div>
      )}

      {/* Tab: Itens */}
      {tab === 'itens' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-display uppercase tracking-widest text-brand-400">Itens da OS</h4>
            <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-brand-400 border border-brand-600/40 rounded hover:bg-brand-600/20 transition-colors"><Plus className="w-3 h-3" />Item</button>
          </div>
          <div className="border border-hud-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-hud-bg border-b border-hud-border">
                  <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Descrição</th>
                  <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Responsável</th>
                  <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Status</th>
                </tr>
              </thead>
              <tbody>
                {itens.map(item => (
                  <tr key={item.id} className="border-b border-hud-border/50 hover:bg-hud-bg/50">
                    <td className="px-3 py-2 text-gray-300">{item.descricao}</td>
                    <td className="px-3 py-2 text-dim">{item.responsavel}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${itemStatusColors[item.status] || ''}`}>{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-[10px] text-dim font-mono">
            {itens.filter(i => i.status === 'EXECUTADO').length}/{itens.length} executados
          </div>
        </div>
      )}

      {/* Tab: Peças */}
      {tab === 'pecas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-display uppercase tracking-widest text-brand-400">Peças Consumidas</h4>
            <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-brand-400 border border-brand-600/40 rounded hover:bg-brand-600/20 transition-colors"><Plus className="w-3 h-3" />Peça</button>
          </div>
          <div className="border border-hud-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-hud-bg border-b border-hud-border">
                  <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Peça</th>
                  <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Qtd</th>
                  <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Custo</th>
                </tr>
              </thead>
              <tbody>
                {pecas.map(p => (
                  <tr key={p.id} className="border-b border-hud-border/50 hover:bg-hud-bg/50">
                    <td className="px-3 py-2 text-gray-300">{p.nome}</td>
                    <td className="px-3 py-2 font-mono">{p.quantidade}</td>
                    <td className="px-3 py-2 font-mono text-ok">R$ {p.custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-2 py-2 bg-hud-bg border border-hud-border rounded-md">
            <span className="text-[10px] font-mono uppercase text-dim">Total Peças:</span>
            <span className="font-mono text-sm text-ok font-bold">R$ {pecas.reduce((a, p) => a + p.custo, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}

      {/* Tab: Histórico */}
      {tab === 'historico' && (
        <div className="space-y-4">
          <h4 className="text-[10px] font-display uppercase tracking-widest text-brand-400">Histórico de Status</h4>
          <div className="relative pl-4 border-l border-hud-border space-y-4">
            {historico.map((h, i) => {
              const Icon = statusIcons[h.status] || Circle
              return (
                <div key={h.id} className="relative">
                  <div className={`absolute -left-[21px] top-0 w-3 h-3 rounded-full border-2 bg-hud-panel ${h.status === 'CONCLUIDA' ? 'border-ok' : h.status === 'EXECUTANDO' ? 'border-warn' : 'border-brand-600'}`}></div>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${statusColors[h.status] || ''}`}>{h.status}</span>
                        <span className="text-[10px] font-mono text-dim">{h.dt}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">por {h.usuario}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Drawer>

    <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={() => { setData(p => p.filter(r => r.id !== del.id)); toast('OS removida'); setDel(null) }} title="Excluir OS" message={'Excluir ' + (del?.numero || '') + '?'} confirmLabel="Excluir" />
  </>)
}
