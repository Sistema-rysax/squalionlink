import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import StatusBadge from '../../components/ui/StatusBadge'
import { Input, Select, Textarea, FormSection, FormGrid } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import { operadores as init } from '../../mock/data'

const empty = { nome: '', matricula: '', cpf: '', contratada: '', cargo: '', telefone: '', status: 'ATIVO' }

export default function Operadores() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const set = (k: string, v: string) => setForm(p => ({...p, [k]: v}))

  const save = () => {
    if (!form.nome || !form.matricula || !form.contratada) { toast('Preencha campos obrigatórios','error'); return }
    if (editing) { setData(p => p.map(r => r.id===editing.id ? {...r,...form} : r)); toast('Operador atualizado') }
    else { setData(p => [...p, {id: Date.now(), ...form, habilitacoes: []}]); toast('Operador criado') }
    setOpen(false)
  }

  const columns = [
    { key: 'matricula', label: 'Matrícula', render: (r:any) => <span className="font-mono text-brand-400">{r.matricula}</span> },
    { key: 'nome', label: 'Nome' },
    { key: 'cpf', label: 'CPF' },
    { key: 'contratada', label: 'Contratada' },
    { key: 'cargo', label: 'Cargo' },
    { key: 'habilitacoes', label: 'Habilitações', render: (r:any) => <span className="text-xs text-gray-400">{r.habilitacoes?.join(', ')}</span> },
    { key: 'status', label: 'Status', render: (r:any) => <StatusBadge status={r.status} /> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Operadores" onAdd={() => {setForm(empty);setEditing(null);setOpen(true)}}
      onEdit={(r) => {setForm({nome:r.nome,matricula:r.matricula,cpf:r.cpf||'',contratada:r.contratada,cargo:r.cargo||'',telefone:'',status:r.status});setEditing(r);setOpen(true)}}
      onDelete={setDel} addLabel="Novo Operador" />
    <Drawer open={open} onClose={() => setOpen(false)} title={editing ? 'Editar Operador' : 'Novo Operador'}
      footer={<><button onClick={() => setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Dados Pessoais">
          <Input label="Nome Completo" value={form.nome} onChange={v=>set('nome',v)} required placeholder="João da Silva" />
          <FormGrid>
            <Input label="Matrícula" value={form.matricula} onChange={v=>set('matricula',v)} required placeholder="OP-001" />
            <Input label="CPF" value={form.cpf} onChange={v=>set('cpf',v)} placeholder="000.000.000-00" />
          </FormGrid>
          <FormGrid>
            <Input label="Cargo" value={form.cargo} onChange={v=>set('cargo',v)} placeholder="Operador de Caminhão" />
            <Input label="Telefone" value={form.telefone} onChange={v=>set('telefone',v)} placeholder="(31) 99999-0000" />
          </FormGrid>
        </FormSection>
        <FormSection title="Vínculo">
          <Select label="Contratada" value={form.contratada} onChange={v=>set('contratada',v)} required
            options={[{value:'Mineradora ABC',label:'Mineradora ABC'},{value:'TransLog Ltda',label:'TransLog Ltda'}]} onAdd={() => toast('Criar contratada','info')} />
          <Select label="Status" value={form.status} onChange={v=>set('status',v)} required
            options={[{value:'ATIVO',label:'Ativo'},{value:'INATIVO',label:'Inativo'},{value:'FERIAS',label:'Férias'},{value:'AFASTADO',label:'Afastado'}]} />
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={() => {setData(p=>p.filter(r=>r.id!==del.id));toast('Operador removido');setDel(null)}}
      title="Excluir operador?" message={`Excluir ${del?.nome}? Dados históricos serão preservados.`} confirmLabel="Excluir" />
  </>)
}