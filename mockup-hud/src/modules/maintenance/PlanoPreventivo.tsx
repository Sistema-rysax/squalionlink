import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid, Toggle } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'
import { ArrowUp, ArrowDown, Plus, Trash2 } from 'lucide-react'

/* ─── Mock Plan Items ─── */
const mockItensPlano: Record<number, any[]> = {
  1: [
    { id: 1, descricao: 'Drenar óleo do motor', tipo_servico: 'TROCA', tempo_estimado_min: 30, ordem: 1 },
    { id: 2, descricao: 'Substituir filtro de óleo', tipo_servico: 'SUBSTITUICAO', tempo_estimado_min: 15, ordem: 2 },
    { id: 3, descricao: 'Substituir filtro de combustível', tipo_servico: 'SUBSTITUICAO', tempo_estimado_min: 20, ordem: 3 },
    { id: 4, descricao: 'Reabastecer óleo 15W-40', tipo_servico: 'REABASTECIMENTO', tempo_estimado_min: 15, ordem: 4 },
    { id: 5, descricao: 'Verificar vazamentos após partida', tipo_servico: 'INSPECAO', tempo_estimado_min: 10, ordem: 5 },
  ],
  2: [
    { id: 1, descricao: 'Drenar fluido refrigerante', tipo_servico: 'TROCA', tempo_estimado_min: 45, ordem: 1 },
    { id: 2, descricao: 'Inspecionar mangueiras e conexões', tipo_servico: 'INSPECAO', tempo_estimado_min: 30, ordem: 2 },
    { id: 3, descricao: 'Verificar bomba d\'água', tipo_servico: 'INSPECAO', tempo_estimado_min: 20, ordem: 3 },
    { id: 4, descricao: 'Substituir termostato', tipo_servico: 'SUBSTITUICAO', tempo_estimado_min: 40, ordem: 4 },
    { id: 5, descricao: 'Reabastecer fluido refrigerante', tipo_servico: 'REABASTECIMENTO', tempo_estimado_min: 15, ordem: 5 },
    { id: 6, descricao: 'Teste de pressão no sistema', tipo_servico: 'TESTE', tempo_estimado_min: 30, ordem: 6 },
  ],
  3: [
    { id: 1, descricao: 'Lubrificar pinos da caçamba', tipo_servico: 'LUBRIFICACAO', tempo_estimado_min: 20, ordem: 1 },
    { id: 2, descricao: 'Lubrificar articulações do braço', tipo_servico: 'LUBRIFICACAO', tempo_estimado_min: 25, ordem: 2 },
    { id: 3, descricao: 'Lubrificar cilindros hidráulicos', tipo_servico: 'LUBRIFICACAO', tempo_estimado_min: 30, ordem: 3 },
    { id: 4, descricao: 'Verificar nível graxa central', tipo_servico: 'INSPECAO', tempo_estimado_min: 10, ordem: 4 },
    { id: 5, descricao: 'Inspecionar vedações', tipo_servico: 'INSPECAO', tempo_estimado_min: 20, ordem: 5 },
    { id: 6, descricao: 'Testar sistema de lubrificação automática', tipo_servico: 'TESTE', tempo_estimado_min: 15, ordem: 6 },
  ],
  4: [
    { id: 1, descricao: 'Inspeção visual do trem de força', tipo_servico: 'INSPECAO', tempo_estimado_min: 30, ordem: 1 },
    { id: 2, descricao: 'Verificar torque dos parafusos', tipo_servico: 'INSPECAO', tempo_estimado_min: 45, ordem: 2 },
    { id: 3, descricao: 'Substituir lâmina da motoniveladora', tipo_servico: 'SUBSTITUICAO', tempo_estimado_min: 90, ordem: 3 },
    { id: 4, descricao: 'Calibrar sistema de nivelamento', tipo_servico: 'CALIBRACAO', tempo_estimado_min: 60, ordem: 4 },
  ],
  5: [
    { id: 1, descricao: 'Inspecionar discos de freio', tipo_servico: 'INSPECAO', tempo_estimado_min: 45, ordem: 1 },
    { id: 2, descricao: 'Medir espessura das pastilhas', tipo_servico: 'MEDICAO', tempo_estimado_min: 20, ordem: 2 },
    { id: 3, descricao: 'Verificar nível fluido de freio', tipo_servico: 'INSPECAO', tempo_estimado_min: 10, ordem: 3 },
    { id: 4, descricao: 'Teste de frenagem em rampa', tipo_servico: 'TESTE', tempo_estimado_min: 30, ordem: 4 },
  ],
}

/* ─── Init ─── */
const init = [
  { id: 1, nome: 'Troca Óleo e Filtros', id_modelo_equipamento: '777G', horimetro_intervalo: 500, horimetro_ativo: true, dias_intervalo: 0, dias_ativo: false, odometro_intervalo: 0, odometro_ativo: false },
  { id: 2, nome: 'Revisão Sistema Refrigeração', id_modelo_equipamento: '777G', horimetro_intervalo: 2000, horimetro_ativo: true, dias_intervalo: 365, dias_ativo: true, odometro_intervalo: 0, odometro_ativo: false },
  { id: 3, nome: 'Lubrificação Geral', id_modelo_equipamento: 'PC5500', horimetro_intervalo: 250, horimetro_ativo: true, dias_intervalo: 90, dias_ativo: true, odometro_intervalo: 0, odometro_ativo: false },
  { id: 4, nome: 'Revisão Trem de Força', id_modelo_equipamento: 'CAT 16M', horimetro_intervalo: 0, horimetro_ativo: false, dias_intervalo: 0, dias_ativo: false, odometro_intervalo: 10000, odometro_ativo: true },
  { id: 5, nome: 'Inspeção de Freios', id_modelo_equipamento: '785D', horimetro_intervalo: 1000, horimetro_ativo: true, dias_intervalo: 180, dias_ativo: true, odometro_intervalo: 0, odometro_ativo: false },
]

const empty = {
  nome: '', id_modelo_equipamento: '',
  horimetro_intervalo: '', horimetro_ativo: true,
  dias_intervalo: '', dias_ativo: false,
  odometro_intervalo: '', odometro_ativo: false,
}

const tipoServicoColors: Record<string, string> = {
  TROCA: 'bg-warn/10 text-warn border-warn/20',
  SUBSTITUICAO: 'bg-crit/10 text-crit border-crit/20',
  REABASTECIMENTO: 'bg-ok/10 text-ok border-ok/20',
  INSPECAO: 'bg-info/10 text-info border-info/20',
  LUBRIFICACAO: 'bg-brand-600/10 text-brand-400 border-brand-600/20',
  TESTE: 'bg-white/5 text-dim border-hud-border',
  CALIBRACAO: 'bg-info/10 text-info border-info/20',
  MEDICAO: 'bg-white/5 text-dim border-hud-border',
}

export default function PlanoPreventivo() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const [tab, setTab] = useState<'config' | 'itens'>('config')
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }))

  const save = () => {
    if (!form.nome || !form.id_modelo_equipamento) { toast('Nome e modelo obrigatórios', 'error'); return }
    const record = {
      ...form,
      horimetro_intervalo: +form.horimetro_intervalo || 0,
      dias_intervalo: +form.dias_intervalo || 0,
      odometro_intervalo: +form.odometro_intervalo || 0,
    }
    if (editing) { setData(p => p.map(r => r.id === editing.id ? { ...r, ...record } : r)); toast('Plano atualizado') }
    else { setData(p => [...p, { id: Date.now(), ...record }]); toast('Plano criado') }
    setOpen(false)
  }

  const openEdit = (r: any) => {
    setForm({
      nome: r.nome, id_modelo_equipamento: r.id_modelo_equipamento,
      horimetro_intervalo: String(r.horimetro_intervalo || ''), horimetro_ativo: r.horimetro_ativo,
      dias_intervalo: String(r.dias_intervalo || ''), dias_ativo: r.dias_ativo,
      odometro_intervalo: String(r.odometro_intervalo || ''), odometro_ativo: r.odometro_ativo,
    })
    setEditing(r)
    setTab('config')
    setOpen(true)
  }

  const itensPlano = editing ? (mockItensPlano[editing.id] || []) : []

  const activeGatilhos = (r: any) => {
    const g: string[] = []
    if (r.horimetro_ativo && r.horimetro_intervalo) g.push(r.horimetro_intervalo.toLocaleString() + 'h')
    if (r.dias_ativo && r.dias_intervalo) g.push(r.dias_intervalo + ' dias')
    if (r.odometro_ativo && r.odometro_intervalo) g.push(r.odometro_intervalo.toLocaleString() + ' km')
    return g
  }

  const columns = [
    { key: 'nome', label: 'Nome', render: (r: any) => <span className="text-brand-400 font-bold">{r.nome}</span> },
    { key: 'id_modelo_equipamento', label: 'Modelo', render: (r: any) => <span className="font-mono">{r.id_modelo_equipamento}</span> },
    { key: 'gatilhos', label: 'Gatilhos', render: (r: any) => (
      <div className="flex flex-wrap gap-1">
        {activeGatilhos(r).map((g, i) => (
          <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-brand-600/10 text-brand-400 border border-brand-600/20 font-mono">{g}</span>
        ))}
      </div>
    )},
    { key: 'itens', label: 'Itens', render: (r: any) => <span className="font-mono">{(mockItensPlano[r.id] || []).length}</span> },
    { key: 'tempo', label: 'Tempo Est.', render: (r: any) => {
      const total = (mockItensPlano[r.id] || []).reduce((a: number, i: any) => a + i.tempo_estimado_min, 0)
      return <span className="font-mono text-dim">{total} min</span>
    }},
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Planos Preventivos" status="ok"
      onAdd={() => { setForm(empty); setEditing(null); setTab('config'); setOpen(true) }}
      onEdit={openEdit} onDelete={setDel} addLabel="Novo Plano" />

    <Drawer open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Plano' : 'Novo Plano'} subtitle={editing?.nome} width="w-[520px]"
      footer={<>
        <button onClick={() => setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button>
        <button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button>
      </>}>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-hud-border">
        <button onClick={() => setTab('config')} className={`px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition-colors ${tab === 'config' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-dim hover:text-gray-400'}`}>Configuração</button>
        {editing && <button onClick={() => setTab('itens')} className={`px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition-colors ${tab === 'itens' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-dim hover:text-gray-400'}`}>Itens do Plano ({itensPlano.length})</button>}
      </div>

      {tab === 'config' && (
        <div className="space-y-6">
          <FormSection title="Identificação">
            <Input label="Nome do Plano" value={form.nome} onChange={v => set('nome', v)} required placeholder="Troca Óleo e Filtros" />
            <Select label="Modelo Equipamento" value={form.id_modelo_equipamento} onChange={v => set('id_modelo_equipamento', v)} required options={[
              { value: '777G', label: '777G — Caminhão Fora-de-Estrada' },
              { value: '785D', label: '785D — Caminhão Fora-de-Estrada' },
              { value: 'PC5500', label: 'PC5500 — Escavadeira Hidráulica' },
              { value: 'CAT 6060', label: 'CAT 6060 — Escavadeira' },
              { value: 'CAT 16M', label: 'CAT 16M — Motoniveladora' },
              { value: 'CAT D10T', label: 'CAT D10T — Trator de Esteira' },
              { value: 'Atlas D65', label: 'Atlas D65 — Perfuratriz' },
            ]} />
          </FormSection>

          <FormSection title="Gatilhos">
            <div className="space-y-4">
              {/* Horímetro */}
              <div className={`p-3 rounded-lg border transition-all ${form.horimetro_ativo ? 'border-brand-600/40 bg-brand-600/5' : 'border-hud-border bg-hud-bg opacity-60'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-300 font-mono">Horímetro</span>
                  <Toggle label="" checked={form.horimetro_ativo} onChange={v => set('horimetro_ativo', v)} />
                </div>
                {form.horimetro_ativo && (
                  <Input label="A cada (horas)" value={form.horimetro_intervalo} onChange={v => set('horimetro_intervalo', v)} type="number" placeholder="500" />
                )}
              </div>

              {/* Dias */}
              <div className={`p-3 rounded-lg border transition-all ${form.dias_ativo ? 'border-brand-600/40 bg-brand-600/5' : 'border-hud-border bg-hud-bg opacity-60'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-300 font-mono">Calendário (dias)</span>
                  <Toggle label="" checked={form.dias_ativo} onChange={v => set('dias_ativo', v)} />
                </div>
                {form.dias_ativo && (
                  <Input label="A cada (dias)" value={form.dias_intervalo} onChange={v => set('dias_intervalo', v)} type="number" placeholder="90" />
                )}
              </div>

              {/* Odômetro */}
              <div className={`p-3 rounded-lg border transition-all ${form.odometro_ativo ? 'border-brand-600/40 bg-brand-600/5' : 'border-hud-border bg-hud-bg opacity-60'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-300 font-mono">Odômetro (km)</span>
                  <Toggle label="" checked={form.odometro_ativo} onChange={v => set('odometro_ativo', v)} />
                </div>
                {form.odometro_ativo && (
                  <Input label="A cada (km)" value={form.odometro_intervalo} onChange={v => set('odometro_intervalo', v)} type="number" placeholder="10000" />
                )}
              </div>
            </div>
          </FormSection>
        </div>
      )}

      {tab === 'itens' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-display uppercase tracking-widest text-brand-400">Itens do Plano</h4>
            <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-brand-400 border border-brand-600/40 rounded hover:bg-brand-600/20 transition-colors"><Plus className="w-3 h-3" />Item</button>
          </div>
          <div className="border border-hud-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-hud-bg border-b border-hud-border">
                  <th className="text-left px-2 py-2 text-[10px] font-mono uppercase text-dim w-8">#</th>
                  <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Descrição</th>
                  <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Tipo</th>
                  <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Tempo</th>
                  <th className="text-left px-2 py-2 text-[10px] font-mono uppercase text-dim w-16">Ordem</th>
                </tr>
              </thead>
              <tbody>
                {itensPlano.sort((a: any, b: any) => a.ordem - b.ordem).map((item: any) => (
                  <tr key={item.id} className="border-b border-hud-border/50 hover:bg-hud-bg/50">
                    <td className="px-2 py-2 font-mono text-dim">{item.ordem}</td>
                    <td className="px-3 py-2 text-gray-300">{item.descricao}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${tipoServicoColors[item.tipo_servico] || 'bg-white/5 text-dim border-hud-border'}`}>{item.tipo_servico}</span>
                    </td>
                    <td className="px-3 py-2 font-mono text-dim">{item.tempo_estimado_min} min</td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-0.5">
                        <button className="p-0.5 text-dim hover:text-gray-300"><ArrowUp className="w-3 h-3" /></button>
                        <button className="p-0.5 text-dim hover:text-gray-300"><ArrowDown className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-2 py-2 bg-hud-bg border border-hud-border rounded-md">
            <span className="text-[10px] font-mono uppercase text-dim">Tempo Total Estimado:</span>
            <span className="font-mono text-sm text-brand-400 font-bold">{itensPlano.reduce((a: number, i: any) => a + i.tempo_estimado_min, 0)} min</span>
          </div>
        </div>
      )}
    </Drawer>

    <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={() => { setData(p => p.filter(r => r.id !== del.id)); toast('Plano removido'); setDel(null) }} title="Excluir Plano" message={'Excluir plano "' + (del?.nome || '') + '"?'} confirmLabel="Excluir" />
  </>)
}
