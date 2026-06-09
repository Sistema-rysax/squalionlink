import { useState } from 'react'
import { Link } from 'react-router-dom'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import StatusBadge from '../../components/ui/StatusBadge'
import { Input, Select, Textarea, FormSection, FormGrid, Switch } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import { equipamentos as initialData } from '../../mock/data'

const emptyForm = { codigo: '', modelo: '', grupo: '', contratada: '', status: 'ATIVO', numero_serie: '', placa: '', ano_fabricacao: '', horimetro_inicial: '0', odometro_inicial: '0', observacao: '' }

export default function Equipamentos() {
  const [data, setData] = useState(initialData.map((e, i) => ({ ...e, numero_serie: 'SN-' + (1000+i), placa: '', ano_fabricacao: '2020', observacao: '' })))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [form, setForm] = useState(emptyForm)

  const openCreate = () => { setForm(emptyForm); setEditing(null); setDrawerOpen(true) }
  const openEdit = (row: any) => {
    setForm({ codigo: row.codigo, modelo: row.modelo, grupo: row.grupo, contratada: row.contratada, status: row.status, numero_serie: row.numero_serie || '', placa: row.placa || '', ano_fabricacao: row.ano_fabricacao || '', horimetro_inicial: String(row.horimetro || 0), odometro_inicial: String(row.odometro || 0), observacao: row.observacao || '' })
    setEditing(row)
    setDrawerOpen(true)
  }
  const handleSave = () => {
    if (!form.codigo || !form.modelo || !form.contratada) { toast('Preencha os campos obrigatórios', 'error'); return }
    if (editing) {
      setData(prev => prev.map(e => e.id === editing.id ? { ...e, ...form } : e))
      toast('Equipamento atualizado com sucesso')
    } else {
      setData(prev => [...prev, { id: Date.now(), ...form, lat: -20.12 + Math.random()*0.01, lng: -43.98 + Math.random()*0.01, vel: 0, atividade: null, operador: null, matricula: null, horimetro: Number(form.horimetro_inicial), odometro: Number(form.odometro_inicial), tanque: 100, turno: null, cor: '#6b7280' }])
      toast('Equipamento criado com sucesso')
    }
    setDrawerOpen(false)
  }
  const handleDelete = () => {
    setData(prev => prev.filter(e => e.id !== deleteTarget.id))
    toast('Equipamento removido')
    setDeleteTarget(null)
  }

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }))

  const columns = [
    { key: 'codigo', label: 'Código', render: (r: any) => <Link to={`/frota/equipamentos/${r.id}`} className="text-brand-400 hover:text-brand-300 font-medium">{r.codigo}</Link> },
    { key: 'modelo', label: 'Modelo' },
    { key: 'grupo', label: 'Grupo' },
    { key: 'contratada', label: 'Contratada' },
    { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
    { key: 'operador', label: 'Operador', render: (r: any) => r.operador || <span className="text-gray-600">—</span> },
    { key: 'horimetro', label: 'Horímetro', render: (r: any) => `${r.horimetro?.toLocaleString() || 0}h` },
    { key: 'tanque', label: 'Tanque', render: (r: any) => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-surface-3 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${r.tanque > 30 ? 'bg-green-500' : r.tanque > 15 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${r.tanque}%`}}></div>
        </div>
        <span className="text-xs text-gray-500">{r.tanque}%</span>
      </div>
    )},
  ]

  return (
    <>
      <DataTable columns={columns} data={data} title="Equipamentos" onAdd={openCreate} onEdit={openEdit} onDelete={setDeleteTarget} addLabel="Novo Equipamento" />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Editar Equipamento' : 'Novo Equipamento'} subtitle={editing ? editing.codigo : 'Preencha os dados do equipamento'}
        footer={<>
          <button onClick={() => setDrawerOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300 hover:bg-surface-3">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button>
        </>}>
        <div className="space-y-6">
          <FormSection title="Identificação">
            <FormGrid>
              <Input label="Código / TAG" value={form.codigo} onChange={v => set('codigo', v)} required placeholder="CAT-01" />
              <Input label="Número de Série" value={form.numero_serie} onChange={v => set('numero_serie', v)} placeholder="SN-0001" />
            </FormGrid>
            <FormGrid>
              <Input label="Placa" value={form.placa} onChange={v => set('placa', v)} placeholder="ABC-1234" />
              <Input label="Ano Fabricação" value={form.ano_fabricacao} onChange={v => set('ano_fabricacao', v)} type="number" placeholder="2020" />
            </FormGrid>
          </FormSection>

          <FormSection title="Classificação">
            <Select label="Modelo" value={form.modelo} onChange={v => set('modelo', v)} required onAdd={() => toast('Abriria formulário de novo modelo', 'info')}
              options={[{value:'Caterpillar 777G',label:'Caterpillar 777G'},{value:'Komatsu PC5500',label:'Komatsu PC5500'},{value:'CAT 6060',label:'CAT 6060'},{value:'CAT 16M',label:'CAT 16M'},{value:'CAT D10T',label:'CAT D10T'}]} />
            <Select label="Contratada" value={form.contratada} onChange={v => set('contratada', v)} required onAdd={() => toast('Abriria formulário de nova contratada', 'info')}
              options={[{value:'Mineradora ABC',label:'Mineradora ABC'},{value:'TransLog Ltda',label:'TransLog Ltda'}]} />
            <Select label="Status" value={form.status} onChange={v => set('status', v)} required
              options={[{value:'ATIVO',label:'Ativo'},{value:'INATIVO',label:'Inativo'},{value:'MANUTENCAO',label:'Em Manutenção'}]} />
          </FormSection>

          <FormSection title="Contadores Iniciais">
            <FormGrid>
              <Input label="Horímetro Inicial" value={form.horimetro_inicial} onChange={v => set('horimetro_inicial', v)} type="number" />
              <Input label="Odômetro Inicial" value={form.odometro_inicial} onChange={v => set('odometro_inicial', v)} type="number" />
            </FormGrid>
          </FormSection>

          <FormSection title="Observações">
            <Textarea label="Observação" value={form.observacao} onChange={v => set('observacao', v)} placeholder="Informações adicionais..." />
          </FormSection>
        </div>
      </Drawer>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Excluir equipamento?" message={`Tem certeza que deseja excluir ${deleteTarget?.codigo}? Esta ação não pode ser desfeita.`} confirmLabel="Excluir" />
    </>
  )
}
