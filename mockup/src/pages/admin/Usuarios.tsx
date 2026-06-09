import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import StatusBadge from '../../components/ui/StatusBadge'
import { Input, Select, FormSection, FormGrid, Switch } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, nome:'Kleyton Miranda', email:'kleyton@mineradoraabc.com', perfil:'Administrador', contratada:'Mineradora ABC', status:'ATIVO', ultimo:'09/06 09:30' },
  { id:2, nome:'Ricardo Alves', email:'ricardo@mineradoraabc.com', perfil:'Supervisor Operação', contratada:'Mineradora ABC', status:'ATIVO', ultimo:'09/06 08:15' },
  { id:3, nome:'Camila Torres', email:'camila@mineradoraabc.com', perfil:'Analista Manutenção', contratada:'Mineradora ABC', status:'ATIVO', ultimo:'08/06 17:45' },
  { id:4, nome:'Diego Souza', email:'diego@mineradoraabc.com', perfil:'Operador Sala', contratada:'Mineradora ABC', status:'ATIVO', ultimo:'09/06 06:00' },
  { id:5, nome:'Fernanda Lima', email:'fernanda@mineradoraabc.com', perfil:'Gestor Qualidade', contratada:'Mineradora ABC', status:'INATIVO', ultimo:'01/06 14:00' },
]
const empty = { nome:'', email:'', perfil:'', contratada:'', idioma:'pt-BR', mfa:false }
export default function Usuarios() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any)=>setForm((p:any)=>({...p,[k]:v}))
  const save = () => { if (!form.nome||!form.email||!form.perfil) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Usuário atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,status:'ATIVO',ultimo:'—'}]); toast('Usuário criado') } setOpen(false) }
  const columns = [
    { key:'nome', label:'Nome' },
    { key:'email', label:'Email' },
    { key:'perfil', label:'Perfil', render:(r:any)=><span className="px-2 py-0.5 bg-brand-900/30 text-brand-400 rounded text-xs">{r.perfil}</span> },
    { key:'contratada', label:'Contratada' },
    { key:'status', label:'Status', render:(r:any)=><StatusBadge status={r.status} /> },
    { key:'ultimo', label:'Último Acesso' },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Usuários" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({nome:r.nome,email:r.email,perfil:r.perfil,contratada:r.contratada||'',idioma:'pt-BR',mfa:false});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Usuário" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Usuário':'Novo Usuário'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Dados do Usuário">
          <Input label="Nome Completo" value={form.nome} onChange={v=>set('nome',v)} required />
          <Input label="Email" value={form.email} onChange={v=>set('email',v)} required type="email" placeholder="usuario@empresa.com" />
          <FormGrid>
            <Select label="Perfil" value={form.perfil} onChange={v=>set('perfil',v)} required options={[{value:'Administrador',label:'Administrador'},{value:'Supervisor Operação',label:'Supervisor Operação'},{value:'Operador Sala',label:'Operador Sala'},{value:'Analista Manutenção',label:'Analista Manutenção'},{value:'Gestor Qualidade',label:'Gestor Qualidade'}]} />
            <Select label="Contratada" value={form.contratada} onChange={v=>set('contratada',v)} options={[{value:'Mineradora ABC',label:'Mineradora ABC'},{value:'TransLog Ltda',label:'TransLog Ltda'}]} />
          </FormGrid>
          <Select label="Idioma" value={form.idioma} onChange={v=>set('idioma',v)} options={[{value:'pt-BR',label:'Português (BR)'},{value:'en',label:'English'},{value:'es',label:'Español'}]} />
        </FormSection>
        <FormSection title="Segurança">
          <Switch label="MFA Obrigatório" checked={form.mfa} onChange={v=>set('mfa',v)} description="Exigir autenticação em duas etapas" />
          {!editing && <Input label="Senha Temporária" value="••••••••" onChange={()=>{}} helper="Usuário deverá trocar no primeiro acesso" disabled />}
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Usuário removido');setDel(null)}} title="Desativar usuário?" message={`Desativar ${del?.nome}? O acesso será revogado imediatamente.`} confirmLabel="Desativar" />
  </>)
}