import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import StatusBadge from '../../components/ui/StatusBadge'
import { Input, Select, FormSection, FormGrid } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id: 1, nome: 'Mineradora ABC', razao: 'Mineradora ABC S.A.', cnpj: '12.345.678/0001-90', tipo: 'PROPRIA', equipamentos: 7, operadores: 6, email: 'contato@mineradoraabc.com', telefone: '(31) 3333-0000' },
  { id: 2, nome: 'TransLog Ltda', razao: 'TransLog Transportes Ltda', cnpj: '98.765.432/0001-10', tipo: 'TERCEIRIZADA', equipamentos: 3, operadores: 2, email: 'ops@translog.com', telefone: '(31) 3444-0000' },
]
const empty = { nome:'', razao:'', cnpj:'', tipo:'PROPRIA', email:'', telefone:'' }

export default function Contratadas() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))
  const save = () => {
    if (!form.nome || !form.tipo) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Contratada atualizada') }
    else { setData(p=>[...p,{id:Date.now(),...form,equipamentos:0,operadores:0}]); toast('Contratada criada') }
    setOpen(false)
  }
  const columns = [
    { key: 'nome', label: 'Nome Fantasia' },
    { key: 'cnpj', label: 'CNPJ' },
    { key: 'tipo', label: 'Tipo', render: (r:any) => <StatusBadge status={r.tipo} /> },
    { key: 'equipamentos', label: 'Equipamentos' },
    { key: 'operadores', label: 'Operadores' },
    { key: 'email', label: 'Email' },
    { key: 'telefone', label: 'Telefone' },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Contratadas" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}}
      onEdit={(r)=>{setForm({nome:r.nome,razao:r.razao||'',cnpj:r.cnpj||'',tipo:r.tipo,email:r.email||'',telefone:r.telefone||''});setEditing(r);setOpen(true)}}
      onDelete={setDel} addLabel="Nova Contratada" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Contratada':'Nova Contratada'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Dados da Empresa">
          <Input label="Nome Fantasia" value={form.nome} onChange={v=>set('nome',v)} required />
          <Input label="Razão Social" value={form.razao} onChange={v=>set('razao',v)} />
          <FormGrid>
            <Input label="CNPJ" value={form.cnpj} onChange={v=>set('cnpj',v)} placeholder="00.000.000/0000-00" />
            <Select label="Tipo" value={form.tipo} onChange={v=>set('tipo',v)} required options={[{value:'PROPRIA',label:'Própria'},{value:'TERCEIRIZADA',label:'Terceirizada'}]} />
          </FormGrid>
        </FormSection>
        <FormSection title="Contato">
          <FormGrid>
            <Input label="Email" value={form.email} onChange={v=>set('email',v)} type="email" />
            <Input label="Telefone" value={form.telefone} onChange={v=>set('telefone',v)} />
          </FormGrid>
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Contratada removida');setDel(null)}}
      title="Excluir contratada?" message={`Excluir ${del?.nome}? Só é possível se não houver vínculos ativos.`} confirmLabel="Excluir" />
  </>)
}