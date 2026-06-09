import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'
import { Plus, Trash2 } from 'lucide-react'

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
  { value: 'FERIAS', label: 'Férias' },
  { value: 'AFASTADO', label: 'Afastado' },
]

const cargoOptions = [
  { value: 'Operador', label: 'Operador' },
  { value: 'Operador Sênior', label: 'Operador Sênior' },
  { value: 'Operador Líder', label: 'Operador Líder' },
  { value: 'Operador Trainee', label: 'Operador Trainee' },
]

interface Operador {
  id: number
  nome: string
  matricula: string
  cpf: string
  cargo: string
  telefone: string
  dt_admissao: string
  contratada: string
  status: string
}

const init: Operador[] = [
  { id:1, nome:'João Silva', matricula:'OP-001', cpf:'123.456.789-00', cargo:'Operador', telefone:'(31) 99876-5432', dt_admissao:'2019-03-15', contratada:'Mineradora ABC', status:'ATIVO' },
  { id:2, nome:'Carlos Santos', matricula:'OP-002', cpf:'234.567.890-11', cargo:'Operador', telefone:'(31) 99765-4321', dt_admissao:'2020-01-10', contratada:'Mineradora ABC', status:'ATIVO' },
  { id:3, nome:'Pedro Costa', matricula:'OP-003', cpf:'345.678.901-22', cargo:'Operador Sênior', telefone:'(31) 99654-3210', dt_admissao:'2017-06-20', contratada:'TransLog', status:'ATIVO' },
  { id:4, nome:'Ana Souza', matricula:'OP-004', cpf:'456.789.012-33', cargo:'Operador', telefone:'(31) 99543-2109', dt_admissao:'2021-08-01', contratada:'Mineradora ABC', status:'ATIVO' },
  { id:5, nome:'Roberto Lima', matricula:'OP-005', cpf:'567.890.123-44', cargo:'Operador Líder', telefone:'(31) 99432-1098', dt_admissao:'2016-02-12', contratada:'TransLog', status:'FERIAS' },
  { id:6, nome:'Marcos Lima', matricula:'OP-006', cpf:'678.901.234-55', cargo:'Operador', telefone:'(31) 99321-0987', dt_admissao:'2022-04-05', contratada:'Mineradora ABC', status:'ATIVO' },
  { id:7, nome:'Felipe Oliveira', matricula:'OP-007', cpf:'789.012.345-66', cargo:'Operador Sênior', telefone:'(31) 99210-9876', dt_admissao:'2018-09-18', contratada:'TerraMovel', status:'ATIVO' },
  { id:8, nome:'José Santos', matricula:'OP-008', cpf:'890.123.456-77', cargo:'Operador', telefone:'(31) 99109-8765', dt_admissao:'2020-11-25', contratada:'MineServ', status:'ATIVO' },
  { id:9, nome:'Luis Ferreira', matricula:'OP-009', cpf:'901.234.567-88', cargo:'Operador Trainee', telefone:'(31) 98998-7654', dt_admissao:'2024-01-08', contratada:'BrasMina', status:'ATIVO' },
  { id:10, nome:'Ricardo Mendes', matricula:'OP-010', cpf:'012.345.678-99', cargo:'Operador', telefone:'(31) 98887-6543', dt_admissao:'2019-07-22', contratada:'Mineradora ABC', status:'AFASTADO' },
]

// Habilitações mock
const habilitacoesMock: Record<number, any[]> = {
  1: [
    { id:1, modelo:'777G', dt_habilitacao:'2019-04-10', dt_vencimento:'2025-04-10' },
    { id:2, modelo:'785D', dt_habilitacao:'2020-06-15', dt_vencimento:'2026-06-15' },
    { id:3, modelo:'CAT 793F', dt_habilitacao:'2023-01-20', dt_vencimento:'2025-01-20' },
  ],
  2: [
    { id:4, modelo:'777G', dt_habilitacao:'2020-02-01', dt_vencimento:'2026-02-01' },
    { id:5, modelo:'785D', dt_habilitacao:'2021-03-10', dt_vencimento:'2025-03-10' },
  ],
  3: [
    { id:6, modelo:'777G', dt_habilitacao:'2017-08-05', dt_vencimento:'2025-08-05' },
    { id:7, modelo:'785D', dt_habilitacao:'2018-01-12', dt_vencimento:'2026-01-12' },
    { id:8, modelo:'CAT 793F', dt_habilitacao:'2019-05-20', dt_vencimento:'2025-05-20' },
    { id:9, modelo:'PC5500', dt_habilitacao:'2020-11-08', dt_vencimento:'2026-11-08' },
    { id:10, modelo:'CAT D10T', dt_habilitacao:'2021-07-15', dt_vencimento:'2025-07-15' },
  ],
  4: [
    { id:11, modelo:'PC5500', dt_habilitacao:'2021-09-01', dt_vencimento:'2025-09-01' },
    { id:12, modelo:'CAT 6060', dt_habilitacao:'2022-03-18', dt_vencimento:'2026-03-18' },
  ],
  5: [
    { id:13, modelo:'777G', dt_habilitacao:'2016-04-10', dt_vencimento:'2024-04-10' },
    { id:14, modelo:'785D', dt_habilitacao:'2017-09-22', dt_vencimento:'2025-09-22' },
    { id:15, modelo:'CAT 16M', dt_habilitacao:'2018-12-05', dt_vencimento:'2024-12-05' },
    { id:16, modelo:'CAT D10T', dt_habilitacao:'2020-03-15', dt_vencimento:'2026-03-15' },
  ],
  7: [
    { id:17, modelo:'CAT D10T', dt_habilitacao:'2018-10-10', dt_vencimento:'2026-10-10' },
    { id:18, modelo:'CAT 16M', dt_habilitacao:'2019-05-22', dt_vencimento:'2025-05-22' },
  ],
  9: [
    { id:19, modelo:'Atlas D65', dt_habilitacao:'2024-02-01', dt_vencimento:'2026-02-01' },
  ],
}

// Documentos mock
const documentosMock: Record<number, any[]> = {
  1: [
    { id:1, tipo:'CNH', numero:'04851239876', dt_emissao:'2021-05-10', dt_vencimento:'2026-05-10', status:'VIGENTE' },
    { id:2, tipo:'ASO', numero:'ASO-2024-0451', dt_emissao:'2024-03-15', dt_vencimento:'2025-03-15', status:'VIGENTE' },
    { id:3, tipo:'NR-11', numero:'NR11-2023-089', dt_emissao:'2023-08-20', dt_vencimento:'2024-08-20', status:'VENCIDO' },
  ],
  2: [
    { id:4, tipo:'CNH', numero:'05962340987', dt_emissao:'2020-11-22', dt_vencimento:'2025-11-22', status:'VIGENTE' },
    { id:5, tipo:'ASO', numero:'ASO-2024-0452', dt_emissao:'2024-04-01', dt_vencimento:'2025-04-01', status:'VIGENTE' },
    { id:6, tipo:'NR-11', numero:'NR11-2024-012', dt_emissao:'2024-01-10', dt_vencimento:'2025-01-10', status:'VENCIDO' },
    { id:7, tipo:'NR-12', numero:'NR12-2023-045', dt_emissao:'2023-06-15', dt_vencimento:'2024-06-15', status:'VENCIDO' },
  ],
  3: [
    { id:8, tipo:'CNH', numero:'03740128765', dt_emissao:'2022-02-14', dt_vencimento:'2027-02-14', status:'VIGENTE' },
    { id:9, tipo:'ASO', numero:'ASO-2024-0453', dt_emissao:'2024-05-20', dt_vencimento:'2025-05-20', status:'VIGENTE' },
    { id:10, tipo:'NR-11', numero:'NR11-2024-056', dt_emissao:'2024-04-08', dt_vencimento:'2025-04-08', status:'VIGENTE' },
    { id:11, tipo:'NR-12', numero:'NR12-2024-078', dt_emissao:'2024-03-22', dt_vencimento:'2025-03-22', status:'VIGENTE' },
  ],
  5: [
    { id:12, tipo:'CNH', numero:'02639017654', dt_emissao:'2019-08-05', dt_vencimento:'2024-08-05', status:'VENCIDO' },
    { id:13, tipo:'ASO', numero:'ASO-2024-0455', dt_emissao:'2024-02-28', dt_vencimento:'2025-02-28', status:'VIGENTE' },
    { id:14, tipo:'NR-11', numero:'NR11-2023-034', dt_emissao:'2023-05-12', dt_vencimento:'2024-05-12', status:'VENCIDO' },
  ],
  9: [
    { id:15, tipo:'CNH', numero:'08173245098', dt_emissao:'2023-12-01', dt_vencimento:'2028-12-01', status:'VIGENTE' },
    { id:16, tipo:'ASO', numero:'ASO-2024-0459', dt_emissao:'2024-01-15', dt_vencimento:'2025-01-15', status:'VIGENTE' },
  ],
}

const emptyForm = { nome: '', matricula: '', cpf: '', cargo: 'Operador', telefone: '', dt_admissao: '', contratada: '', status: 'ATIVO' }

export default function Operadores() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(emptyForm)
  const set = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }))

  // Detail state
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailOp, setDetailOp] = useState<any>(null)
  const [detailTab, setDetailTab] = useState<'habilitacoes' | 'documentos'>('habilitacoes')
  const [habData, setHabData] = useState<any[]>([])
  const [docData, setDocData] = useState<any[]>([])

  // Hab form
  const [habForm, setHabForm] = useState({ modelo: '', dt_habilitacao: '', dt_vencimento: '' })
  // Doc form
  const [docForm, setDocForm] = useState({ tipo: 'CNH', numero: '', dt_emissao: '', dt_vencimento: '' })

  const save = () => {
    if (!form.nome || !form.matricula) { toast('Nome e Matrícula obrigatórios', 'error'); return }
    if (editing) {
      setData(p => p.map(r => r.id === editing.id ? { ...r, ...form } : r))
      toast('Operador atualizado')
    } else {
      setData(p => [...p, { id: Date.now(), ...form }])
      toast('Operador criado')
    }
    setOpen(false)
  }

  const openEdit = (r: any) => {
    setForm({ nome: r.nome, matricula: r.matricula, cpf: r.cpf, cargo: r.cargo, telefone: r.telefone, dt_admissao: r.dt_admissao, contratada: r.contratada, status: r.status })
    setEditing(r)
    setOpen(true)
  }

  const openDetail = (r: any) => {
    setDetailOp(r)
    setHabData(habilitacoesMock[r.id] || [])
    setDocData(documentosMock[r.id] || [])
    setDetailTab('habilitacoes')
    setDetailOpen(true)
  }

  const addHab = () => {
    if (!habForm.modelo || !habForm.dt_habilitacao) { toast('Modelo e data obrigatórios', 'error'); return }
    setHabData(p => [...p, { id: Date.now(), ...habForm }])
    setHabForm({ modelo: '', dt_habilitacao: '', dt_vencimento: '' })
    toast('Habilitação adicionada')
  }

  const addDoc = () => {
    if (!docForm.tipo || !docForm.numero) { toast('Tipo e Número obrigatórios', 'error'); return }
    const status = new Date(docForm.dt_vencimento) < new Date() ? 'VENCIDO' : 'VIGENTE'
    setDocData(p => [...p, { id: Date.now(), ...docForm, status }])
    setDocForm({ tipo: 'CNH', numero: '', dt_emissao: '', dt_vencimento: '' })
    toast('Documento adicionado')
  }

  const isVencida = (dt: string) => new Date(dt) < new Date()

  const columns = [
    { key: 'nome', label: 'Nome', render: (r: any) => <button onClick={() => openDetail(r)} className="text-gray-200 font-medium hover:text-brand-400 transition-colors">{r.nome}</button> },
    { key: 'matricula', label: 'Matrícula', render: (r: any) => <span className="text-brand-400 font-mono">{r.matricula}</span> },
    { key: 'cpf', label: 'CPF', render: (r: any) => <span className="font-mono text-gray-400 text-[11px]">{r.cpf}</span> },
    { key: 'cargo', label: 'Cargo' },
    { key: 'telefone', label: 'Telefone', render: (r: any) => <span className="font-mono text-[11px]">{r.telefone}</span> },
    { key: 'contratada', label: 'Contratada' },
    { key: 'dt_admissao', label: 'Admissão', render: (r: any) => <span className="font-mono text-gray-400">{r.dt_admissao}</span> },
    { key: 'status', label: 'Status', render: (r: any) => (
      <div className="flex items-center gap-2">
        <div className={`led led-${r.status === 'ATIVO' ? 'ok' : r.status === 'FERIAS' ? 'warn' : 'crit'}`}></div>
        <span className="px-2 py-0.5 rounded text-[10px] border" style={{
          background: r.status === 'ATIVO' ? 'rgba(34,197,94,0.1)' : r.status === 'FERIAS' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
          borderColor: r.status === 'ATIVO' ? 'rgba(34,197,94,0.2)' : r.status === 'FERIAS' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
          color: r.status === 'ATIVO' ? '#22c55e' : r.status === 'FERIAS' ? '#f59e0b' : '#ef4444'
        }}>{r.status}</span>
      </div>
    )},
  ]

  return (<>
    <DataTable
      columns={columns}
      data={data}
      title="Operadores"
      subtitle={`${data.filter(d => d.status === 'ATIVO').length} ativos de ${data.length} cadastrados`}
      status="ok"
      onAdd={() => { setForm(emptyForm); setEditing(null); setOpen(true) }}
      onEdit={openEdit}
      onDelete={setDel}
      onRowClick={openDetail}
      addLabel="Novo Operador"
    />

    {/* Create/Edit Drawer */}
    <Drawer open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Operador' : 'Novo Operador'} subtitle={editing?.matricula}
      footer={<>
        <button onClick={() => setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300 transition-colors">Cancelar</button>
        <button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button>
      </>}>
      <div className="space-y-6">
        <FormSection title="Dados Pessoais">
          <Input label="Nome Completo" value={form.nome} onChange={v => set('nome', v)} required placeholder="João da Silva" />
          <FormGrid>
            <Input label="CPF" value={form.cpf} onChange={v => set('cpf', v)} placeholder="000.000.000-00" />
            <Input label="Telefone" value={form.telefone} onChange={v => set('telefone', v)} placeholder="(31) 99999-9999" />
          </FormGrid>
        </FormSection>
        <FormSection title="Profissional">
          <FormGrid>
            <Input label="Matrícula" value={form.matricula} onChange={v => set('matricula', v)} required placeholder="OP-001" />
            <Select label="Cargo" value={form.cargo} onChange={v => set('cargo', v)} options={cargoOptions} />
          </FormGrid>
          <FormGrid>
            <Input label="Data Admissão" value={form.dt_admissao} onChange={v => set('dt_admissao', v)} type="date" />
            <Select label="Contratada" value={form.contratada} onChange={v => set('contratada', v)} options={contratadaOptions} />
          </FormGrid>
          <Select label="Status" value={form.status} onChange={v => set('status', v)} options={statusOptions} />
        </FormSection>
      </div>
    </Drawer>

    {/* Detail Drawer with Tabs */}
    <Drawer open={detailOpen} onClose={() => setDetailOpen(false)} title={detailOp?.nome || ''} subtitle={`${detailOp?.matricula || ''} • ${detailOp?.cargo || ''}`} width="w-[600px]">
      <div className="space-y-4">
        {/* Detail Tabs */}
        <div className="flex gap-1 border-b border-hud-border">
          <button onClick={() => setDetailTab('habilitacoes')} className={`px-4 py-2 text-[10px] font-mono uppercase tracking-wider border-b-2 transition-all ${detailTab === 'habilitacoes' ? 'border-brand-400 text-brand-400' : 'border-transparent text-dim hover:text-gray-300'}`}>Habilitações</button>
          <button onClick={() => setDetailTab('documentos')} className={`px-4 py-2 text-[10px] font-mono uppercase tracking-wider border-b-2 transition-all ${detailTab === 'documentos' ? 'border-brand-400 text-brand-400' : 'border-transparent text-dim hover:text-gray-300'}`}>Documentos</button>
        </div>

        {/* Habilitações Tab */}
        {detailTab === 'habilitacoes' && (
          <div className="space-y-3">
            <div className="bg-hud-bg border border-hud-border rounded-lg overflow-hidden">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-hud-border bg-black/20">
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Modelo</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Dt. Habilitação</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Dt. Vencimento</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Status</th>
                    <th className="px-3 py-2 text-right font-mono text-dim uppercase">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {habData.map(h => {
                    const vencida = isVencida(h.dt_vencimento)
                    return (
                      <tr key={h.id} className={`border-b border-hud-border/50 ${vencida ? 'bg-crit/5' : 'hover:bg-white/[0.02]'}`}>
                        <td className="px-3 py-2 text-brand-400 font-mono font-bold">{h.modelo}</td>
                        <td className="px-3 py-2 font-mono text-gray-400">{h.dt_habilitacao}</td>
                        <td className={`px-3 py-2 font-mono ${vencida ? 'text-crit font-bold' : 'text-gray-400'}`}>{h.dt_vencimento}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] border ${vencida ? 'bg-crit/10 text-crit border-crit/20' : 'bg-ok/10 text-ok border-ok/20'}`}>{vencida ? 'VENCIDA' : 'VIGENTE'}</span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button onClick={() => setHabData(p => p.filter(x => x.id !== h.id))} className="p-1 text-crit/60 hover:text-crit transition-colors"><Trash2 className="w-3 h-3" /></button>
                        </td>
                      </tr>
                    )
                  })}
                  {habData.length === 0 && (
                    <tr><td colSpan={5} className="px-3 py-6 text-center text-dim text-xs">Nenhuma habilitação registrada</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1"><Select label="Modelo" value={habForm.modelo} onChange={v => setHabForm(p => ({ ...p, modelo: v }))} options={[
                { value: '777G', label: '777G' }, { value: '785D', label: '785D' },
                { value: 'CAT 793F', label: 'CAT 793F' }, { value: 'PC5500', label: 'PC5500' },
                { value: 'CAT 6060', label: 'CAT 6060' }, { value: 'CAT 16M', label: 'CAT 16M' },
                { value: 'CAT D10T', label: 'CAT D10T' }, { value: 'Atlas D65', label: 'Atlas D65' },
              ]} /></div>
              <div className="w-32"><Input label="Dt. Hab." value={habForm.dt_habilitacao} onChange={v => setHabForm(p => ({ ...p, dt_habilitacao: v }))} type="date" /></div>
              <div className="w-32"><Input label="Dt. Venc." value={habForm.dt_vencimento} onChange={v => setHabForm(p => ({ ...p, dt_vencimento: v }))} type="date" /></div>
              <button onClick={addHab} className="mb-0.5 flex items-center gap-1 px-3 py-2 bg-brand-600/20 text-brand-400 border border-brand-600/40 rounded-md text-[10px] font-mono uppercase hover:bg-brand-600/30 transition-all"><Plus className="w-3 h-3" />Add</button>
            </div>
          </div>
        )}

        {/* Documentos Tab */}
        {detailTab === 'documentos' && (
          <div className="space-y-3">
            <div className="bg-hud-bg border border-hud-border rounded-lg overflow-hidden">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-hud-border bg-black/20">
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Tipo</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Número</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Dt. Emissão</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Dt. Vencimento</th>
                    <th className="px-3 py-2 text-left font-mono text-dim uppercase">Status</th>
                    <th className="px-3 py-2 text-right font-mono text-dim uppercase">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {docData.map(d => {
                    const vencido = d.status === 'VENCIDO'
                    return (
                      <tr key={d.id} className={`border-b border-hud-border/50 ${vencido ? 'bg-crit/5' : 'hover:bg-white/[0.02]'}`}>
                        <td className="px-3 py-2"><span className="px-2 py-0.5 rounded text-[10px] border border-hud-border bg-white/5 font-mono">{d.tipo}</span></td>
                        <td className="px-3 py-2 font-mono text-brand-400">{d.numero}</td>
                        <td className="px-3 py-2 font-mono text-gray-400">{d.dt_emissao}</td>
                        <td className={`px-3 py-2 font-mono ${vencido ? 'text-crit font-bold' : 'text-gray-400'}`}>{d.dt_vencimento}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] border ${vencido ? 'bg-crit/10 text-crit border-crit/20' : 'bg-ok/10 text-ok border-ok/20'}`}>{d.status}</span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button onClick={() => setDocData(p => p.filter(x => x.id !== d.id))} className="p-1 text-crit/60 hover:text-crit transition-colors"><Trash2 className="w-3 h-3" /></button>
                        </td>
                      </tr>
                    )
                  })}
                  {docData.length === 0 && (
                    <tr><td colSpan={6} className="px-3 py-6 text-center text-dim text-xs">Nenhum documento registrado</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 items-end">
              <div className="w-24"><Select label="Tipo" value={docForm.tipo} onChange={v => setDocForm(p => ({ ...p, tipo: v }))} options={[
                { value: 'CNH', label: 'CNH' }, { value: 'ASO', label: 'ASO' },
                { value: 'NR-11', label: 'NR-11' }, { value: 'NR-12', label: 'NR-12' },
              ]} /></div>
              <div className="flex-1"><Input label="Número" value={docForm.numero} onChange={v => setDocForm(p => ({ ...p, numero: v }))} placeholder="Nº documento" /></div>
              <div className="w-32"><Input label="Emissão" value={docForm.dt_emissao} onChange={v => setDocForm(p => ({ ...p, dt_emissao: v }))} type="date" /></div>
              <div className="w-32"><Input label="Vencimento" value={docForm.dt_vencimento} onChange={v => setDocForm(p => ({ ...p, dt_vencimento: v }))} type="date" /></div>
              <button onClick={addDoc} className="mb-0.5 flex items-center gap-1 px-3 py-2 bg-brand-600/20 text-brand-400 border border-brand-600/40 rounded-md text-[10px] font-mono uppercase hover:bg-brand-600/30 transition-all"><Plus className="w-3 h-3" />Add</button>
            </div>
          </div>
        )}
      </div>
    </Drawer>

    <ConfirmDialog
      open={!!del}
      onClose={() => setDel(null)}
      onConfirm={() => { setData(p => p.filter(r => r.id !== del.id)); toast('Operador removido'); setDel(null) }}
      title="Excluir Operador"
      message={`Confirma exclusão do operador ${del?.nome || ''}?`}
      confirmLabel="Excluir"
    />
  </>)
}
