import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, nome:'Regime 3x1', tipo:'FIXO', turnos:3, folga:1 },
  { id:2, nome:'Regime 4x2', tipo:'CICLICO', turnos:4, folga:2 },
  { id:3, nome:'Regime Administrativo', tipo:'FIXO', turnos:1, folga:2 },
  { id:4, nome:'Regime Especial Manutenção', tipo:'CUSTOMIZADO', turnos:2, folga:1 },
]
const empty = { nome:'', tipo:'FIXO', turnos:'', folga:'' }

export default function RegimeTurno() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))

  const save = () => {
    if (!form.nome) { toast('Nome obrigatório','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form,turnos:+form.turnos||0,folga:+form.folga||0}:r)); toast('Regime atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,turnos:+form.turnos||0,folga:+form.folga||0}]); toast('Regime criado') }
    setOpen(false)
  }

  const columns = [
    { key:'nome', label:'Nome', render:(r:any)=><span className="text-brand-400 font-bold">{r.nome}</span> },
    { key:'tipo', label:'Tipo', render:(r:any)=><span className={'px-2 py-0.5 rounded text-[10px] border '+(r.tipo==='FIXO'?'bg-ok/10 text-ok border-ok/20':r.tipo==='CICLICO'?'bg-brand-600/10 text-brand-400 border-brand-600/20':'bg-warn/10 text-warn border-warn/20')}>{r.tipo}</span> },
    { key:'turnos', label:'Turnos', render:(r:any)=><span className="font-mono">{r.turnos}</span> },
    { key:'folga', label:'Folgas', render:(r:any)=><span className="font-mono">{r.folga}</span> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Regime de Turno" status="info" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({nome:r.nome,tipo:r.tipo,turnos:String(r.turnos),folga:String(r.folga)});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Regime" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Regime':'Novo Regime'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Dados"><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required /><Select label="Tipo" value={form.tipo} onChange={v=>set('tipo',v)} options={[{value:'FIXO',label:'Fixo'},{value:'CICLICO',label:'Cíclico'},{value:'CUSTOMIZADO',label:'Customizado'}]} /></FormSection>
        <FormSection title="Configuração"><FormGrid><Input label="Turnos" value={form.turnos} onChange={v=>set('turnos',v)} type="number" placeholder="3" /><Input label="Folgas" value={form.folga} onChange={v=>set('folga',v)} type="number" placeholder="1" /></FormGrid></FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Regime removido');setDel(null)}} title="Excluir Regime" message={'Excluir '+(del?.nome||'')+'?'} confirmLabel="Excluir" />
  </>)
}
