import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, Textarea, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const modeloOptions = [
  { value: '777G', label: 'Caterpillar 777G' },
  { value: '785D', label: 'Caterpillar 785D' },
  { value: 'PC5500', label: 'Komatsu PC5500' },
  { value: 'CAT 6060', label: 'CAT 6060' },
  { value: 'CAT 16M', label: 'CAT 16M' },
  { value: 'CAT D10T', label: 'CAT D10T' },
  { value: 'Atlas D65', label: 'Atlas Copco D65' },
  { value: 'CAT 793F', label: 'Caterpillar 793F' },
  { value: 'Komatsu 930E', label: 'Komatsu 930E-5' },
]

const contratadaOptions = [
  { value: 'Mineradora ABC', label: 'Mineradora ABC' },
  { value: 'TransLog', label: 'TransLog Ltda' },
  { value: 'TerraMovel', label: 'TerraMovel S.A.' },
  { value: 'MineServ', label: 'MineServ Operações' },
  { value: 'BrasMina', label: 'BrasMina Serviços' },
]

const statusOptions = [
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'INATIVO', label: 'Inativo' },
  { value: 'FORA_FROTA', label: 'Fora de Frota' },
]

interface Equipamento {
  id: number
  codigo: string
  numero_serie: string
  placa: string
  chassi: string
  ano_fabricacao: string
  modelo: string
  contratada: string
  horimetro_inicial: number
  odometro_inicial: number
  status: string
  foto_url: string
  observacao: string
}

const initData: Equipamento[] = [
  { id:1, codigo:'CAT-01', numero_serie:'SN-777G-2019-0451', placa:'MNG-3A21', chassi:'9BW777G01L0034521', ano_fabricacao:'2019', modelo:'777G', contratada:'Mineradora ABC', horimetro_inicial:0, odometro_inicial:0, status:'ATIVO', foto_url:'', observacao:'Equipamento principal frota transporte mina norte' },
  { id:2, codigo:'CAT-02', numero_serie:'SN-777G-2019-0452', placa:'MNG-3A22', chassi:'9BW777G01L0034522', ano_fabricacao:'2019', modelo:'777G', contratada:'Mineradora ABC', horimetro_inicial:120, odometro_inicial:0, status:'ATIVO', foto_url:'', observacao:'' },
  { id:3, codigo:'CAT-03', numero_serie:'SN-777G-2020-0871', placa:'MNG-4B15', chassi:'9BW777G01M0048715', ano_fabricacao:'2020', modelo:'777G', contratada:'TransLog', horimetro_inicial:0, odometro_inicial:0, status:'INATIVO', foto_url:'', observacao:'Em manutenção corretiva — aguardando peça importada' },
  { id:4, codigo:'CAT-04', numero_serie:'SN-785D-2021-1203', placa:'MNG-5C08', chassi:'9BW785D01N0012038', ano_fabricacao:'2021', modelo:'785D', contratada:'Mineradora ABC', horimetro_inicial:0, odometro_inicial:0, status:'ATIVO', foto_url:'', observacao:'' },
  { id:5, codigo:'CAT-05', numero_serie:'SN-785D-2021-1204', placa:'MNG-5C09', chassi:'9BW785D01N0012049', ano_fabricacao:'2021', modelo:'785D', contratada:'TerraMovel', horimetro_inicial:80, odometro_inicial:0, status:'ATIVO', foto_url:'', observacao:'Transferido da mina sul em jan/2024' },
  { id:6, codigo:'ESC-01', numero_serie:'SN-PC5500-2018-0098', placa:'', chassi:'KMTPC55001J009812', ano_fabricacao:'2018', modelo:'PC5500', contratada:'Mineradora ABC', horimetro_inicial:0, odometro_inicial:0, status:'ATIVO', foto_url:'', observacao:'Escavadeira principal — frente de lavra 01' },
  { id:7, codigo:'ESC-02', numero_serie:'SN-6060-2020-0034', placa:'', chassi:'9BW606001M0003415', ano_fabricacao:'2020', modelo:'CAT 6060', contratada:'MineServ', horimetro_inicial:250, odometro_inicial:0, status:'ATIVO', foto_url:'', observacao:'' },
  { id:8, codigo:'MOT-01', numero_serie:'SN-16M-2017-2210', placa:'MNG-1D44', chassi:'9BW016M01H0022104', ano_fabricacao:'2017', modelo:'CAT 16M', contratada:'TransLog', horimetro_inicial:0, odometro_inicial:15200, status:'ATIVO', foto_url:'', observacao:'Motoniveladora pista principal' },
  { id:9, codigo:'PER-01', numero_serie:'SN-D65-2022-0012', placa:'', chassi:'ATLSD6501N0001234', ano_fabricacao:'2022', modelo:'Atlas D65', contratada:'BrasMina', horimetro_inicial:0, odometro_inicial:0, status:'FORA_FROTA', foto_url:'', observacao:'Aguardando contrato renovação' },
  { id:10, codigo:'TRT-01', numero_serie:'SN-D10T-2019-0567', placa:'MNG-2E33', chassi:'9BWD10T01L0056723', ano_fabricacao:'2019', modelo:'CAT D10T', contratada:'Mineradora ABC', horimetro_inicial:0, odometro_inicial:0, status:'ATIVO', foto_url:'', observacao:'Trator esteira — operação de empurre' },
]

const emptyForm = {
  codigo: '', numero_serie: '', placa: '', chassi: '', ano_fabricacao: '',
  modelo: '', contratada: '', horimetro_inicial: '', odometro_inicial: '',
  status: 'ATIVO', foto_url: '', observacao: ''
}

export default function Equipamentos() {
  const navigate = useNavigate()
  const [data, setData] = useState(initData)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(emptyForm)
  const set = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }))

  const save = () => {
    if (!form.codigo || !form.modelo) { toast('Código e Modelo são obrigatórios', 'error'); return }
    if (editing) {
      setData(p => p.map(r => r.id === editing.id ? { ...r, ...form, horimetro_inicial: +form.horimetro_inicial || 0, odometro_inicial: +form.odometro_inicial || 0 } : r))
      toast('Equipamento atualizado')
    } else {
      setData(p => [...p, { id: Date.now(), ...form, horimetro_inicial: +form.horimetro_inicial || 0, odometro_inicial: +form.odometro_inicial || 0 }])
      toast('Equipamento criado')
    }
    setOpen(false)
  }

  const openEdit = (r: any) => {
    setForm({
      codigo: r.codigo, numero_serie: r.numero_serie, placa: r.placa, chassi: r.chassi,
      ano_fabricacao: r.ano_fabricacao, modelo: r.modelo, contratada: r.contratada,
      horimetro_inicial: String(r.horimetro_inicial), odometro_inicial: String(r.odometro_inicial),
      status: r.status, foto_url: r.foto_url, observacao: r.observacao
    })
    setEditing(r)
    setOpen(true)
  }

  const columns = [
    { key: 'codigo', label: 'Código', render: (r: any) => <button onClick={() => navigate(`/frota/${r.id}`)} className="text-brand-400 font-bold hover:underline">{r.codigo}</button> },
    { key: 'numero_serie', label: 'Nº Série', render: (r: any) => <span className="font-mono text-[11px] text-gray-400">{r.numero_serie}</span> },
    { key: 'modelo', label: 'Modelo', render: (r: any) => <span className="font-mono">{r.modelo}</span> },
    { key: 'placa', label: 'Placa', render: (r: any) => <span className="font-mono">{r.placa || '—'}</span> },
    { key: 'contratada', label: 'Contratada' },
    { key: 'ano_fabricacao', label: 'Ano', render: (r: any) => <span className="font-mono">{r.ano_fabricacao}</span> },
    { key: 'status', label: 'Status', render: (r: any) => (
      <div className="flex items-center gap-2">
        <div className={`led led-${r.status === 'ATIVO' ? 'ok' : r.status === 'INATIVO' ? 'warn' : 'crit'}`}></div>
        <span className="px-2 py-0.5 rounded text-[10px] border" style={{
          background: r.status === 'ATIVO' ? 'rgba(34,197,94,0.1)' : r.status === 'INATIVO' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
          borderColor: r.status === 'ATIVO' ? 'rgba(34,197,94,0.2)' : r.status === 'INATIVO' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
          color: r.status === 'ATIVO' ? '#22c55e' : r.status === 'INATIVO' ? '#f59e0b' : '#ef4444'
        }}>{r.status.replace('_', ' ')}</span>
      </div>
    )},
  ]

  return (<>
    <DataTable
      columns={columns}
      data={data}
      title="Equipamentos"
      subtitle={`${data.filter(d => d.status === 'ATIVO').length} ativos de ${data.length} cadastrados`}
      status="ok"
      onAdd={() => { setForm(emptyForm); setEditing(null); setOpen(true) }}
      onEdit={openEdit}
      onDelete={setDel}
      onRowClick={(r: any) => navigate(`/frota/${r.id}`)}
      addLabel="Novo Equipamento"
    />

    <Drawer open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Equipamento' : 'Novo Equipamento'} subtitle={editing?.codigo}
      footer={<>
        <button onClick={() => setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300 transition-colors">Cancelar</button>
        <button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button>
      </>}>
      <div className="space-y-6">
        <FormSection title="Identificação">
          <FormGrid>
            <Input label="Código" value={form.codigo} onChange={v => set('codigo', v)} required placeholder="CAT-01" />
            <Input label="Nº Série" value={form.numero_serie} onChange={v => set('numero_serie', v)} placeholder="SN-777G-2019-0451" />
          </FormGrid>
          <FormGrid>
            <Input label="Placa" value={form.placa} onChange={v => set('placa', v)} placeholder="MNG-3A21" />
            <Input label="Chassi" value={form.chassi} onChange={v => set('chassi', v)} placeholder="9BW777G01L0034521" />
          </FormGrid>
          <FormGrid>
            <Input label="Ano Fabricação" value={form.ano_fabricacao} onChange={v => set('ano_fabricacao', v)} type="number" placeholder="2021" />
            <Select label="Status" value={form.status} onChange={v => set('status', v)} options={statusOptions} required />
          </FormGrid>
        </FormSection>

        <FormSection title="Técnico">
          <Select label="Modelo" value={form.modelo} onChange={v => set('modelo', v)} options={modeloOptions} required />
          <Select label="Contratada" value={form.contratada} onChange={v => set('contratada', v)} options={contratadaOptions} />
        </FormSection>

        <FormSection title="Medidores">
          <FormGrid>
            <Input label="Horímetro Inicial (h)" value={form.horimetro_inicial} onChange={v => set('horimetro_inicial', v)} type="number" placeholder="0" />
            <Input label="Odômetro Inicial (km)" value={form.odometro_inicial} onChange={v => set('odometro_inicial', v)} type="number" placeholder="0" />
          </FormGrid>
        </FormSection>

        <FormSection title="Observações">
          <Input label="URL da Foto" value={form.foto_url} onChange={v => set('foto_url', v)} placeholder="https://..." />
          <Textarea label="Observação" value={form.observacao} onChange={v => set('observacao', v)} placeholder="Notas sobre o equipamento..." rows={4} />
        </FormSection>
      </div>
    </Drawer>

    <ConfirmDialog
      open={!!del}
      onClose={() => setDel(null)}
      onConfirm={() => { setData(p => p.filter(r => r.id !== del.id)); toast('Equipamento removido'); setDel(null) }}
      title="Excluir Equipamento"
      message={`Confirma exclusão do equipamento ${del?.codigo || ''}?`}
      confirmLabel="Excluir"
    />
  </>)
}
