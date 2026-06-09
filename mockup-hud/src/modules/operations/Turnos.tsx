import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, FormSection, FormGrid, Toggle } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, nome:'Turno A', hora_inicio:'06:00', hora_fim:'14:00', cruza_meia_noite:false },
  { id:2, nome:'Turno B', hora_inicio:'14:00', hora_fim:'22:00', cruza_meia_noite:false },
  { id:3, nome:'Turno C', hora_inicio:'22:00', hora_fim:'06:00', cruza_meia_noite:true },
]
const empty = { nome:'', hora_inicio:'', hora_fim:'', cruza_meia_noite:false }

export default function Turnos() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))

  const save = () => {
    if (!form.nome||!form.hora_inicio||!form.hora_fim) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Turno atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form}]); toast('Turno criado') }
    setOpen(false)
  }

  const columns = [
    { key:'nome', label:'Nome', render:(r:any)=><span className="text-brand-400 font-bold">{r.nome}</span> },
    { key:'hora_inicio', label:'Início', render:(r:any)=><span className="font-mono">{r.hora_inicio}</span> },
    { key:'hora_fim', label:'Fim', render:(r:any)=><span className="font-mono">{r.hora_fim}</span> },
    { key:'cruza_meia_noite', label:'Cruza Meia-Noite', render:(r:any)=><span className={'px-2 py-0.5 rounded text-[10px] border '+(r.cruza_meia_noite?'bg-warn/10 text-warn border-warn/20':'bg-white/5 text-dim border-hud-border')}>{r.cruza_meia_noite?'SIM':'NÃO'}</span> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Turnos" status="info" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({nome:r.nome,hora_inicio:r.hora_inicio,hora_fim:r.hora_fim,cruza_meia_noite:r.cruza_meia_noite});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Turno" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Turno':'Novo Turno'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Dados"><FormGrid><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Turno A" /><Input label="Hora Início" value={form.hora_inicio} onChange={v=>set('hora_inicio',v)} required placeholder="06:00" /></FormGrid><Input label="Hora Fim" value={form.hora_fim} onChange={v=>set('hora_fim',v)} required placeholder="14:00" /></FormSection>
        <FormSection title="Opções"><Toggle label="Cruza Meia-Noite" checked={form.cruza_meia_noite} onChange={v=>set('cruza_meia_noite',v)} description="Turno começa antes e termina depois de 00:00" /></FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Turno removido');setDel(null)}} title="Excluir Turno" message={'Excluir '+(del?.nome||'')+'?'} confirmLabel="Excluir" />
  </>)
}
