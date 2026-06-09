import { useState } from 'react'
import { useT } from '../../contexts/LanguageContext'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, Textarea, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'
import { Fuel, Gauge } from 'lucide-react'

/* ─── Mock Data ─── */
const init = [
  { id: 1, id_equipamento: 'CAT-01', id_operador: 'João Silva', id_posto: 'Posto Central', id_combustivel: 'Diesel S10', litros: 580, custo_unitario: 5.89, custo_total: 3416.20, horimetro_registro: 12440, odometro_registro: 0, nivel_antes_pct: 15, nivel_depois_pct: 95, dt_inicio: '2024-06-09 07:15', dt_fim: '2024-06-09 07:32', tipo: 'COMPLETO' as const, observacao: '' },
  { id: 2, id_equipamento: 'CAT-04', id_operador: 'Pedro Costa', id_posto: 'Comboio 01', id_combustivel: 'Diesel S10', litros: 620, custo_unitario: 5.89, custo_total: 3651.80, horimetro_registro: 9800, odometro_registro: 0, nivel_antes_pct: 22, nivel_depois_pct: 100, dt_inicio: '2024-06-07 14:05', dt_fim: '2024-06-07 14:28', tipo: 'COMPLETO' as const, observacao: 'Abastecimento em campo' },
  { id: 3, id_equipamento: 'ESC-01', id_operador: 'Ana Souza', id_posto: 'Posto Central', id_combustivel: 'Diesel S10', litros: 450, custo_unitario: 5.89, custo_total: 2650.50, horimetro_registro: 8900, odometro_registro: 0, nivel_antes_pct: 30, nivel_depois_pct: 88, dt_inicio: '2024-06-08 06:00', dt_fim: '2024-06-08 06:18', tipo: 'PARCIAL' as const, observacao: '' },
  { id: 4, id_equipamento: 'CAT-05', id_operador: 'Roberto Lima', id_posto: 'Posto Central', id_combustivel: 'Diesel S10', litros: 590, custo_unitario: 5.89, custo_total: 3475.10, horimetro_registro: 10500, odometro_registro: 0, nivel_antes_pct: 8, nivel_depois_pct: 92, dt_inicio: '2024-06-06 18:10', dt_fim: '2024-06-06 18:30', tipo: 'COMPLETO' as const, observacao: '' },
  { id: 5, id_equipamento: 'MOT-01', id_operador: 'José Santos', id_posto: 'Comboio 02', id_combustivel: 'Diesel S500', litros: 180, custo_unitario: 5.45, custo_total: 981.00, horimetro_registro: 5400, odometro_registro: 34200, nivel_antes_pct: 40, nivel_depois_pct: 95, dt_inicio: '2024-06-09 10:45', dt_fim: '2024-06-09 10:55', tipo: 'COMBOIO' as const, observacao: 'Comboio na praça de manutenção' },
]

const empty = {
  id_equipamento: '', id_operador: '', id_posto: 'Posto Central', id_combustivel: 'Diesel S10',
  litros: '', custo_unitario: '5.89', custo_total: '',
  horimetro_registro: '', odometro_registro: '',
  nivel_antes_pct: '', nivel_depois_pct: '',
  dt_inicio: '', dt_fim: '', tipo: 'COMPLETO', observacao: '',
}

const tipoColors: Record<string, string> = {
  COMPLETO: 'bg-ok/10 text-ok border-ok/20',
  PARCIAL: 'bg-warn/10 text-warn border-warn/20',
  COMBOIO: 'bg-info/10 text-info border-info/20',
}

export default function Abastecimento() {
  const t = useT()
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)

  const set = (k: string, v: string) => {
    const next = { ...form, [k]: v }
    // Auto-calculate custo_total
    if (k === 'litros' || k === 'custo_unitario') {
      const litros = k === 'litros' ? +v : +form.litros
      const custo = k === 'custo_unitario' ? +v : +form.custo_unitario
      next.custo_total = (litros * custo).toFixed(2)
    }
    setForm(next)
  }

  const save = () => {
    if (!form.id_equipamento || !form.litros) { toast('Equipamento e litros obrigatórios', 'error'); return }
    const record = {
      ...form,
      litros: +form.litros,
      custo_unitario: +form.custo_unitario || 5.89,
      custo_total: +form.custo_total || (+form.litros * (+form.custo_unitario || 5.89)),
      horimetro_registro: +form.horimetro_registro || 0,
      odometro_registro: +form.odometro_registro || 0,
      nivel_antes_pct: +form.nivel_antes_pct || 0,
      nivel_depois_pct: +form.nivel_depois_pct || 0,
    }
    if (editing) {
      setData(p => p.map(r => r.id === editing.id ? { ...r, ...record } : r))
      toast('Abastecimento atualizado')
    } else {
      setData(p => [...p, { id: Date.now(), ...record }])
      toast('Abastecimento registrado')
    }
    setOpen(false)
  }

  const openEdit = (r: any) => {
    setForm({
      id_equipamento: r.id_equipamento, id_operador: r.id_operador, id_posto: r.id_posto,
      id_combustivel: r.id_combustivel, litros: String(r.litros), custo_unitario: String(r.custo_unitario),
      custo_total: String(r.custo_total), horimetro_registro: String(r.horimetro_registro),
      odometro_registro: String(r.odometro_registro), nivel_antes_pct: String(r.nivel_antes_pct),
      nivel_depois_pct: String(r.nivel_depois_pct), dt_inicio: r.dt_inicio, dt_fim: r.dt_fim,
      tipo: r.tipo, observacao: r.observacao,
    })
    setEditing(r)
    setOpen(true)
  }

  const columns = [
    { key: 'id_equipamento', label: 'Equipamento', render: (r: any) => <span className="text-brand-400 font-bold font-mono">{r.id_equipamento}</span> },
    { key: 'id_operador', label: 'Operador', render: (r: any) => <span className="text-gray-300">{r.id_operador}</span> },
    { key: 'litros', label: 'Litros', render: (r: any) => (
      <div className="flex items-center gap-1">
        <Fuel className="w-3 h-3 text-ok" />
        <span className="text-ok font-bold font-mono">{r.litros} L</span>
      </div>
    )},
    { key: 'custo_total', label: 'Custo Total', render: (r: any) => <span className="font-mono">R$ {r.custo_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> },
    { key: 'tipo', label: 'Tipo', render: (r: any) => <span className={`px-2 py-0.5 rounded text-[10px] border ${tipoColors[r.tipo] || ''}`}>{r.tipo}</span> },
    { key: 'dt_inicio', label: 'Data/Hora', render: (r: any) => <span className="font-mono text-dim text-xs">{r.dt_inicio}</span> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title={t.fueling.title} status="info"
      onAdd={() => { setForm(empty); setEditing(null); setOpen(true) }}
      onEdit={openEdit} onDelete={setDel} addLabel="Registrar" />

    <Drawer open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Abastecimento' : 'Registrar Abastecimento'}
      footer={<>
        <button onClick={() => setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button>
        <button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button>
      </>}>
      <div className="space-y-6">
        <FormSection title="Equipamento & Operador">
          <FormGrid>
            <Select label="Equipamento" value={form.id_equipamento} onChange={v => set('id_equipamento', v)} required options={[
              { value: 'CAT-01', label: 'CAT-01 (777G)' }, { value: 'CAT-02', label: 'CAT-02 (777G)' },
              { value: 'CAT-03', label: 'CAT-03 (777G)' }, { value: 'CAT-04', label: 'CAT-04 (785D)' },
              { value: 'CAT-05', label: 'CAT-05 (785D)' }, { value: 'ESC-01', label: 'ESC-01 (PC5500)' },
              { value: 'ESC-02', label: 'ESC-02 (CAT 6060)' }, { value: 'MOT-01', label: 'MOT-01 (CAT 16M)' },
            ]} />
            <Select label="Operador" value={form.id_operador} onChange={v => set('id_operador', v)} options={[
              { value: 'João Silva', label: 'João Silva' }, { value: 'Carlos Santos', label: 'Carlos Santos' },
              { value: 'Pedro Costa', label: 'Pedro Costa' }, { value: 'Roberto Lima', label: 'Roberto Lima' },
              { value: 'Ana Souza', label: 'Ana Souza' }, { value: 'José Santos', label: 'José Santos' },
            ]} />
          </FormGrid>
        </FormSection>

        <FormSection title="Combustível">
          <FormGrid>
            <Select label="Posto" value={form.id_posto} onChange={v => set('id_posto', v)} options={[
              { value: 'Posto Central', label: 'Posto Central' }, { value: 'Comboio 01', label: 'Comboio 01' },
              { value: 'Comboio 02', label: 'Comboio 02' }, { value: 'Posto Sul', label: 'Posto Sul' },
            ]} />
            <Select label="Combustível" value={form.id_combustivel} onChange={v => set('id_combustivel', v)} options={[
              { value: 'Diesel S10', label: 'Diesel S10' }, { value: 'Diesel S500', label: 'Diesel S500' },
              { value: 'Arla 32', label: 'Arla 32' },
            ]} />
          </FormGrid>
          <FormGrid>
            <Input label="Litros" value={form.litros} onChange={v => set('litros', v)} type="number" required placeholder="580" />
            <Input label="Custo Unitário (R$)" value={form.custo_unitario} onChange={v => set('custo_unitario', v)} type="number" placeholder="5.89" />
          </FormGrid>
          <div className="flex items-center gap-2 px-3 py-2 bg-hud-bg border border-hud-border rounded-md">
            <span className="text-[10px] font-mono uppercase text-dim">Custo Total:</span>
            <span className="font-mono text-sm text-ok font-bold">R$ {form.custo_total || '0.00'}</span>
          </div>
          <Select label="Tipo" value={form.tipo} onChange={v => set('tipo', v)} options={[
            { value: 'COMPLETO', label: 'Completo' }, { value: 'PARCIAL', label: 'Parcial' }, { value: 'COMBOIO', label: 'Comboio' },
          ]} />
        </FormSection>

        <FormSection title="Medidores">
          <FormGrid>
            <Input label="Horímetro" value={form.horimetro_registro} onChange={v => set('horimetro_registro', v)} type="number" placeholder="12440" />
            <Input label="Odômetro (km)" value={form.odometro_registro} onChange={v => set('odometro_registro', v)} type="number" placeholder="0" />
          </FormGrid>
          <FormGrid>
            <Input label="Data/Hora Início" value={form.dt_inicio} onChange={v => set('dt_inicio', v)} placeholder="2024-06-09 07:15" />
            <Input label="Data/Hora Fim" value={form.dt_fim} onChange={v => set('dt_fim', v)} placeholder="2024-06-09 07:32" />
          </FormGrid>
        </FormSection>

        <FormSection title="Níveis">
          <FormGrid>
            <Input label="Nível Antes (%)" value={form.nivel_antes_pct} onChange={v => set('nivel_antes_pct', v)} type="number" placeholder="15" />
            <Input label="Nível Depois (%)" value={form.nivel_depois_pct} onChange={v => set('nivel_depois_pct', v)} type="number" placeholder="95" />
          </FormGrid>
          {/* Visual level indicator */}
          {(+form.nivel_antes_pct > 0 || +form.nivel_depois_pct > 0) && (
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-mono text-dim">Antes</span>
                <div className="h-2 bg-hud-border rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${+form.nivel_antes_pct < 20 ? 'bg-crit' : +form.nivel_antes_pct < 40 ? 'bg-warn' : 'bg-ok'}`} style={{ width: `${form.nivel_antes_pct || 0}%` }}></div>
                </div>
              </div>
              <Gauge className="w-4 h-4 text-dim shrink-0" />
              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-mono text-dim">Depois</span>
                <div className="h-2 bg-hud-border rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${+form.nivel_depois_pct < 20 ? 'bg-crit' : +form.nivel_depois_pct < 40 ? 'bg-warn' : 'bg-ok'}`} style={{ width: `${form.nivel_depois_pct || 0}%` }}></div>
                </div>
              </div>
            </div>
          )}
        </FormSection>

        <FormSection title="Observação">
          <Textarea label="Observações" value={form.observacao} onChange={v => set('observacao', v)} placeholder="Informações adicionais..." />
        </FormSection>
      </div>
    </Drawer>

    <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={() => { setData(p => p.filter(r => r.id !== del.id)); toast('Registro removido'); setDel(null) }} title="Excluir Abastecimento" message="Excluir este registro?" confirmLabel="Excluir" />
  </>)
}