import { useState } from 'react'
import { useT } from '../../contexts/LanguageContext'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  {id:1,nome:'Kleyton Miranda',email:'kleyton@rysax.com',perfil:'Administrador',status:'ATIVO',ultimo_acesso:'09/06 10:42'},
  {id:2,nome:'Maria Silva',email:'maria@mineradora.com',perfil:'Supervisor',status:'ATIVO',ultimo_acesso:'09/06 09:15'},
  {id:3,nome:'Carlos Pereira',email:'carlos@mineradora.com',perfil:'Operador Sala',status:'ATIVO',ultimo_acesso:'08/06 22:00'},
  {id:4,nome:'José Santos',email:'jose@translog.com',perfil:'Visualizador',status:'INATIVO',ultimo_acesso:'01/06 14:30'},
]
const empty = {nome:'',email:'',perfil:'Visualizador'}

export default function Usuarios() {
  const t = useT()
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:string) => setForm((p:any)=>({...p,[k]:v}))
  const save = () => {
    if (!form.nome||!form.email) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Usuário atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,status:'ATIVO',ultimo_acesso:'—'}]); toast('Usuário criado') }
    setOpen(false)
  }
  const columns = [
    { key:'nome', label:'Nome', render:(r:any)=><span className="text-gray-200 font-medium">{r.nome}</span> },
    { key:'email', label:'Email', render:(r:any)=><span className="text-brand-400">{r.email}</span> },
    { key:'perfil', label:'Perfil', render:(r:any)=><span className="px-2 py-0.5 bg-brand-600/10 border border-brand-600/20 rounded text-[10px] text-brand-400">{r.perfil}</span> },
    { key:'status', label:'Status', render:(r:any)=><div className="flex items-center gap-2"><div className={'led led-'+(r.status==='ATIVO'?'ok':'off')}></div><span className="text-[10px]">{r.status}</span></div> },
    { key:'ultimo_acesso', label:'Último Acesso' },
  ]
  return (<>
    <DataTable columns={columns} data={data} title={t.admin.users} status="neutral" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({nome:r.nome,email:r.email,perfil:r.perfil});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel={t.admin.newUser} />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing ? t.admin.editUser : t.admin.newUser}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6"><FormSection title="Dados"><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required /><Input label="Email" value={form.email} onChange={v=>set('email',v)} required /><Select label="Perfil" value={form.perfil} onChange={v=>set('perfil',v)} options={[{value:'Administrador',label:'Administrador'},{value:'Supervisor',label:'Supervisor'},{value:'Operador Sala',label:'Operador Sala'},{value:'Visualizador',label:'Visualizador'}]} /></FormSection></div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Usuário removido');setDel(null)}} title="Excluir Usuário" message={'Excluir '+(del?.nome||'')+'?'} confirmLabel="Excluir" />
  </>)
}