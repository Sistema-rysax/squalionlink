import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  {id:1,nome:'João Silva',matricula:'OP-001',cpf:'123.456.789-00',cargo:'Operador',contratada:'Mineradora ABC',status:'ATIVO',habilitacoes:3},
  {id:2,nome:'Carlos Santos',matricula:'OP-002',cpf:'234.567.890-11',cargo:'Operador',contratada:'Mineradora ABC',status:'ATIVO',habilitacoes:2},
  {id:3,nome:'Pedro Costa',matricula:'OP-003',cpf:'345.678.901-22',cargo:'Operador Sênior',contratada:'TransLog',status:'ATIVO',habilitacoes:5},
  {id:4,nome:'Ana Souza',matricula:'OP-004',cpf:'456.789.012-33',cargo:'Operador',contratada:'Mineradora ABC',status:'ATIVO',habilitacoes:2},
  {id:5,nome:'Roberto Lima',matricula:'OP-005',cpf:'567.890.123-44',cargo:'Operador',contratada:'TransLog',status:'FERIAS',habilitacoes:4},
  {id:6,nome:'Marcos Lima',matricula:'OP-006',cpf:'678.901.234-55',cargo:'Operador',contratada:'Mineradora ABC',status:'ATIVO',habilitacoes:3},
]
const empty = {nome:'',matricula:'',cpf:'',cargo:'Operador',contratada:''}

export default function Operadores() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:string) => setForm((p:any)=>({...p,[k]:v}))
  const save = () => {
    if (!form.nome||!form.matricula) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Operador atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,status:'ATIVO',habilitacoes:0}]); toast('Operador criado') }
    setOpen(false)
  }
  const columns = [
    { key:'nome', label:'Nome', render:(r:any)=><span className="text-gray-200 font-medium">{r.nome}</span> },
    { key:'matricula', label:'Matrícula', render:(r:any)=><span className="text-brand-400">{r.matricula}</span> },
    { key:'cargo', label:'Cargo' },
    { key:'contratada', label:'Contratada' },
    { key:'status', label:'Status', render:(r:any)=><div className="flex items-center gap-2"><div className={'led led-'+(r.status==='ATIVO'?'ok':'warn')}></div><span className="text-[10px]">{r.status}</span></div> },
    { key:'habilitacoes', label:'Hab.', render:(r:any)=><span>{r.habilitacoes} modelos</span> },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Operadores" status="ok" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({nome:r.nome,matricula:r.matricula,cpf:r.cpf,cargo:r.cargo,contratada:r.contratada});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Operador" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Operador':'Novo Operador'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6"><FormSection title="Dados Pessoais"><Input label="Nome Completo" value={form.nome} onChange={v=>set('nome',v)} required /><FormGrid><Input label="Matrícula" value={form.matricula} onChange={v=>set('matricula',v)} required /><Input label="CPF" value={form.cpf} onChange={v=>set('cpf',v)} /></FormGrid></FormSection><FormSection title="Vínculo"><FormGrid><Input label="Cargo" value={form.cargo} onChange={v=>set('cargo',v)} /><Input label="Contratada" value={form.contratada} onChange={v=>set('contratada',v)} /></FormGrid></FormSection></div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Operador removido');setDel(null)}} title="Excluir Operador" message={'Excluir '+(del?.nome||'')+'?'} confirmLabel="Excluir" />
  </>)
}