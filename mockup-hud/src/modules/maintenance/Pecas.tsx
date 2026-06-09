import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, Textarea, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'
import { Plus, Package, ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react'

/* ─── Mock Movimentações ─── */
const mockMovimentacoes: Record<number, any[]> = {
  1: [
    { id: 1, tipo: 'ENTRADA', quantidade: 20, motivo: 'Compra NF-4521', dt: '2024-06-01 08:00', usuario: 'Carlos Almox' },
    { id: 2, tipo: 'SAIDA', quantidade: 2, motivo: 'OS-2024-0339', dt: '2024-06-08 10:30', usuario: 'Marcos Lima' },
    { id: 3, tipo: 'SAIDA', quantidade: 1, motivo: 'OS-2024-0335', dt: '2024-06-05 14:00', usuario: 'Felipe Oliveira' },
  ],
  2: [
    { id: 1, tipo: 'ENTRADA', quantidade: 15, motivo: 'Compra NF-4521', dt: '2024-06-01 08:00', usuario: 'Carlos Almox' },
    { id: 2, tipo: 'SAIDA', quantidade: 1, motivo: 'OS-2024-0339', dt: '2024-06-08 10:30', usuario: 'Marcos Lima' },
  ],
  3: [
    { id: 1, tipo: 'ENTRADA', quantidade: 10, motivo: 'Compra NF-4480', dt: '2024-05-15 08:00', usuario: 'Carlos Almox' },
    { id: 2, tipo: 'SAIDA', quantidade: 3, motivo: 'OS-2024-0320', dt: '2024-05-20 09:00', usuario: 'Felipe Oliveira' },
    { id: 3, tipo: 'SAIDA', quantidade: 2, motivo: 'OS-2024-0328', dt: '2024-05-28 11:00', usuario: 'Marcos Lima' },
    { id: 4, tipo: 'AJUSTE', quantidade: -1, motivo: 'Inventário — diferença encontrada', dt: '2024-06-01 16:00', usuario: 'Carlos Almox' },
  ],
  4: [
    { id: 1, tipo: 'ENTRADA', quantidade: 24, motivo: 'Compra NF-4490', dt: '2024-05-18 08:00', usuario: 'Carlos Almox' },
    { id: 2, tipo: 'SAIDA', quantidade: 4, motivo: 'OS-2024-0310', dt: '2024-05-22 10:00', usuario: 'Luis Ferreira' },
  ],
  5: [
    { id: 1, tipo: 'ENTRADA', quantidade: 12, motivo: 'Compra NF-4500', dt: '2024-05-20 08:00', usuario: 'Carlos Almox' },
    { id: 2, tipo: 'SAIDA', quantidade: 2, motivo: 'OS-2024-0325', dt: '2024-05-25 14:00', usuario: 'Felipe Oliveira' },
    { id: 3, tipo: 'SAIDA', quantidade: 2, motivo: 'OS-2024-0332', dt: '2024-06-02 09:30', usuario: 'Marcos Lima' },
  ],
  6: [
    { id: 1, tipo: 'ENTRADA', quantidade: 3, motivo: 'Compra NF-4450 — Importação', dt: '2024-04-10 08:00', usuario: 'Carlos Almox' },
    { id: 2, tipo: 'SAIDA', quantidade: 1, motivo: 'OS-2024-0298', dt: '2024-05-05 07:00', usuario: 'Felipe Oliveira' },
  ],
}

/* ─── Init ─── */
const init = [
  { id: 1, codigo: 'PC-0001', nome: 'Filtro Óleo Motor', descricao: 'Filtro óleo para motores CAT C27/C32', categoria: 'FILTRO' as const, estoque_atual: 24, estoque_minimo: 10, estoque_maximo: 50, custo_unitario: 185.00, localizacao: 'Almox A-01', unidade: 'UN' as const },
  { id: 2, codigo: 'PC-0002', nome: 'Filtro Combustível', descricao: 'Filtro separador diesel/água', categoria: 'FILTRO' as const, estoque_atual: 18, estoque_minimo: 8, estoque_maximo: 40, custo_unitario: 220.00, localizacao: 'Almox A-01', unidade: 'UN' as const },
  { id: 3, codigo: 'PC-0003', nome: 'Correia Ventilador', descricao: 'Correia poly-V para sistema de arrefecimento', categoria: 'CORREIA' as const, estoque_atual: 4, estoque_minimo: 6, estoque_maximo: 15, custo_unitario: 890.00, localizacao: 'Almox B-02', unidade: 'UN' as const },
  { id: 4, codigo: 'PC-0004', nome: 'Pastilha Freio HD', descricao: 'Pastilha freio para caminhão fora-de-estrada', categoria: 'OUTRO' as const, estoque_atual: 32, estoque_minimo: 12, estoque_maximo: 60, custo_unitario: 1250.00, localizacao: 'Almox B-03', unidade: 'UN' as const },
  { id: 5, codigo: 'PC-0005', nome: 'Selo Hidráulico Cilindro', descricao: 'Kit vedação cilindro hidráulico principal', categoria: 'VEDACAO' as const, estoque_atual: 8, estoque_minimo: 10, estoque_maximo: 30, custo_unitario: 450.00, localizacao: 'Almox C-01', unidade: 'UN' as const },
  { id: 6, codigo: 'PC-0006', nome: 'Rolamento Giro Mesa', descricao: 'Rolamento mesa giratória escavadeira', categoria: 'ROLAMENTO' as const, estoque_atual: 2, estoque_minimo: 2, estoque_maximo: 5, custo_unitario: 12800.00, localizacao: 'Almox D-01', unidade: 'UN' as const },
  { id: 7, codigo: 'PC-0007', nome: 'Óleo Hidráulico ISO 46', descricao: 'Fluido hidráulico mineral ISO 46 (tambor 200L)', categoria: 'HIDRAULICO' as const, estoque_atual: 1200, estoque_minimo: 400, estoque_maximo: 2000, custo_unitario: 14.00, localizacao: 'Almox E-01', unidade: 'LT' as const },
  { id: 8, codigo: 'PC-0008', nome: 'Sensor Temperatura Motor', descricao: 'Sensor PT100 para monitoramento motor diesel', categoria: 'ELETRICO' as const, estoque_atual: 5, estoque_minimo: 4, estoque_maximo: 12, custo_unitario: 450.00, localizacao: 'Almox F-01', unidade: 'UN' as const },
]

const empty = {
  codigo: '', nome: '', descricao: '', categoria: 'FILTRO',
  estoque_atual: '', estoque_minimo: '', estoque_maximo: '',
  custo_unitario: '', localizacao: '', unidade: 'UN',
}

const categoriaColors: Record<string, string> = {
  FILTRO: 'bg-info/10 text-info border-info/20',
  CORREIA: 'bg-warn/10 text-warn border-warn/20',
  ROLAMENTO: 'bg-brand-600/10 text-brand-400 border-brand-600/20',
  VEDACAO: 'bg-ok/10 text-ok border-ok/20',
  ELETRICO: 'bg-crit/10 text-crit border-crit/20',
  HIDRAULICO: 'bg-info/10 text-info border-info/20',
  OUTRO: 'bg-white/5 text-dim border-hud-border',
}

const movTipoIcons: Record<string, any> = {
  ENTRADA: ArrowDownCircle,
  SAIDA: ArrowUpCircle,
  AJUSTE: RefreshCw,
}
const movTipoColors: Record<string, string> = {
  ENTRADA: 'text-ok',
  SAIDA: 'text-crit',
  AJUSTE: 'text-warn',
}

export default function Pecas() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const [tab, setTab] = useState<'dados' | 'movimentacoes'>('dados')
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }))

  const save = () => {
    if (!form.nome) { toast('Nome obrigatório', 'error'); return }
    const record = {
      ...form,
      estoque_atual: +form.estoque_atual || 0,
      estoque_minimo: +form.estoque_minimo || 0,
      estoque_maximo: +form.estoque_maximo || 0,
      custo_unitario: +form.custo_unitario || 0,
    }
    if (editing) { setData(p => p.map(r => r.id === editing.id ? { ...r, ...record } : r)); toast('Peça atualizada') }
    else {
      const nextCode = 'PC-' + String(data.length + 1).padStart(4, '0')
      setData(p => [...p, { id: Date.now(), ...record, codigo: record.codigo || nextCode }])
      toast('Peça criada')
    }
    setOpen(false)
  }

  const openEdit = (r: any) => {
    setForm({
      codigo: r.codigo, nome: r.nome, descricao: r.descricao, categoria: r.categoria,
      estoque_atual: String(r.estoque_atual), estoque_minimo: String(r.estoque_minimo),
      estoque_maximo: String(r.estoque_maximo), custo_unitario: String(r.custo_unitario),
      localizacao: r.localizacao, unidade: r.unidade,
    })
    setEditing(r)
    setTab('dados')
    setOpen(true)
  }

  const movs = editing ? (mockMovimentacoes[editing.id] || []) : []

  const columns = [
    { key: 'codigo', label: 'Código', render: (r: any) => <span className="text-brand-400 font-bold font-mono">{r.codigo}</span> },
    { key: 'nome', label: 'Nome', render: (r: any) => <span className="text-gray-200">{r.nome}</span> },
    { key: 'categoria', label: 'Categoria', render: (r: any) => (
      <span className={`px-2 py-0.5 rounded text-[10px] border ${categoriaColors[r.categoria] || ''}`}>{r.categoria}</span>
    )},
    { key: 'estoque', label: 'Estoque', render: (r: any) => {
      const pct = r.estoque_maximo > 0 ? (r.estoque_atual / r.estoque_maximo) * 100 : 0
      const belowMin = r.estoque_atual < r.estoque_minimo
      const minPct = r.estoque_maximo > 0 ? (r.estoque_minimo / r.estoque_maximo) * 100 : 0
      return (
        <div className="flex items-center gap-2 min-w-[120px]">
          <span className={`font-mono text-sm font-bold ${belowMin ? 'text-crit' : 'text-ok'}`}>{r.estoque_atual}</span>
          <div className="flex-1 relative">
            <div className="h-2 bg-hud-border rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${belowMin ? 'bg-crit' : pct > 70 ? 'bg-ok' : 'bg-warn'}`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
            </div>
            {/* Min marker */}
            <div className="absolute top-0 h-2 w-px bg-warn/60" style={{ left: `${minPct}%` }}></div>
          </div>
        </div>
      )
    }},
    { key: 'custo_unitario', label: 'Custo', render: (r: any) => <span className="font-mono text-xs">R$ {r.custo_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> },
    { key: 'unidade', label: 'Un.', render: (r: any) => <span className="font-mono text-dim text-xs">{r.unidade}</span> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Peças e Componentes"
      status={data.some(p => p.estoque_atual < p.estoque_minimo) ? 'warn' : 'ok'}
      onAdd={() => { setForm(empty); setEditing(null); setTab('dados'); setOpen(true) }}
      onEdit={openEdit} onDelete={setDel} addLabel="Nova Peça" />

    <Drawer open={open} onClose={() => setOpen(false)} title={editing ? editing.codigo + ' — ' + editing.nome : 'Nova Peça'} width="w-[520px]"
      footer={<>
        <button onClick={() => setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button>
        <button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button>
      </>}>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-hud-border">
        <button onClick={() => setTab('dados')} className={`px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition-colors ${tab === 'dados' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-dim hover:text-gray-400'}`}>Dados</button>
        {editing && <button onClick={() => setTab('movimentacoes')} className={`px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition-colors ${tab === 'movimentacoes' ? 'text-brand-400 border-b-2 border-brand-400' : 'text-dim hover:text-gray-400'}`}>Movimentações ({movs.length})</button>}
      </div>

      {tab === 'dados' && (
        <div className="space-y-6">
          <FormSection title="Identificação">
            <FormGrid>
              <Input label="Código" value={form.codigo} onChange={v => set('codigo', v)} placeholder="PC-0001 (auto)" disabled={!!editing} />
              <Input label="Nome" value={form.nome} onChange={v => set('nome', v)} required placeholder="Filtro Óleo Motor" />
            </FormGrid>
            <Textarea label="Descrição" value={form.descricao} onChange={v => set('descricao', v)} placeholder="Descrição detalhada da peça..." rows={2} />
            <FormGrid>
              <Select label="Categoria" value={form.categoria} onChange={v => set('categoria', v)} options={[
                { value: 'FILTRO', label: 'Filtro' }, { value: 'CORREIA', label: 'Correia' },
                { value: 'ROLAMENTO', label: 'Rolamento' }, { value: 'VEDACAO', label: 'Vedação' },
                { value: 'ELETRICO', label: 'Elétrico' }, { value: 'HIDRAULICO', label: 'Hidráulico' },
                { value: 'OUTRO', label: 'Outro' },
              ]} />
              <Select label="Unidade" value={form.unidade} onChange={v => set('unidade', v)} options={[
                { value: 'UN', label: 'Unidade (UN)' }, { value: 'KG', label: 'Quilograma (KG)' },
                { value: 'LT', label: 'Litro (LT)' }, { value: 'MT', label: 'Metro (MT)' },
              ]} />
            </FormGrid>
          </FormSection>

          <FormSection title="Estoque">
            <FormGrid>
              <Input label="Estoque Atual" value={form.estoque_atual} onChange={v => set('estoque_atual', v)} type="number" />
              <Input label="Estoque Mínimo" value={form.estoque_minimo} onChange={v => set('estoque_minimo', v)} type="number" />
            </FormGrid>
            <Input label="Estoque Máximo" value={form.estoque_maximo} onChange={v => set('estoque_maximo', v)} type="number" />
            {/* Progress bar preview */}
            {(+form.estoque_maximo > 0) && (
              <div className="space-y-1 mt-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-dim">
                  <span>0</span>
                  <span>Mín: {form.estoque_minimo}</span>
                  <span>Máx: {form.estoque_maximo}</span>
                </div>
                <div className="relative h-3 bg-hud-border rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${+form.estoque_atual < +form.estoque_minimo ? 'bg-crit' : (+form.estoque_atual / +form.estoque_maximo) > 0.7 ? 'bg-ok' : 'bg-warn'}`}
                    style={{ width: `${Math.min((+form.estoque_atual / +form.estoque_maximo) * 100, 100)}%` }}></div>
                  {/* Min line */}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-warn" style={{ left: `${(+form.estoque_minimo / +form.estoque_maximo) * 100}%` }}></div>
                </div>
              </div>
            )}
          </FormSection>

          <FormSection title="Custo & Localização">
            <FormGrid>
              <Input label="Custo Unitário (R$)" value={form.custo_unitario} onChange={v => set('custo_unitario', v)} type="number" placeholder="185.00" />
              <Input label="Localização" value={form.localizacao} onChange={v => set('localizacao', v)} placeholder="Almox A-01" />
            </FormGrid>
          </FormSection>
        </div>
      )}

      {tab === 'movimentacoes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-display uppercase tracking-widest text-brand-400">Histórico de Movimentações</h4>
            <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-brand-400 border border-brand-600/40 rounded hover:bg-brand-600/20 transition-colors"><Plus className="w-3 h-3" />Movimentação</button>
          </div>
          <div className="border border-hud-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-hud-bg border-b border-hud-border">
                  <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Tipo</th>
                  <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Qtd</th>
                  <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Motivo</th>
                  <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Data</th>
                  <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-dim">Usuário</th>
                </tr>
              </thead>
              <tbody>
                {movs.map(m => {
                  const Icon = movTipoIcons[m.tipo] || Package
                  return (
                    <tr key={m.id} className="border-b border-hud-border/50 hover:bg-hud-bg/50">
                      <td className="px-3 py-2">
                        <div className={`flex items-center gap-1 ${movTipoColors[m.tipo] || 'text-dim'}`}>
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-mono">{m.tipo}</span>
                        </div>
                      </td>
                      <td className={`px-3 py-2 font-mono font-bold ${m.tipo === 'ENTRADA' ? 'text-ok' : m.tipo === 'SAIDA' ? 'text-crit' : 'text-warn'}`}>
                        {m.tipo === 'ENTRADA' ? '+' : m.tipo === 'SAIDA' ? '-' : ''}{Math.abs(m.quantidade)}
                      </td>
                      <td className="px-3 py-2 text-gray-400">{m.motivo}</td>
                      <td className="px-3 py-2 font-mono text-dim">{m.dt}</td>
                      <td className="px-3 py-2 text-dim">{m.usuario}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Drawer>

    <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={() => { setData(p => p.filter(r => r.id !== del.id)); toast('Peça removida'); setDel(null) }} title="Excluir Peça" message={'Excluir ' + (del?.nome || '') + '?'} confirmLabel="Excluir" />
  </>)
}
