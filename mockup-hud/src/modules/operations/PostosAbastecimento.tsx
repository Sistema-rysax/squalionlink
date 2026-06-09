import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, nome:'Posto Central 01', tipo:'FIXO', capacidade:50000, nivel_atual:78, lat:-20.121, lng:-43.986 },
  { id:2, nome:'Posto Norte 02', tipo:'FIXO', capacidade:30000, nivel_atual:45, lat:-20.118, lng:-43.992 },
  { id:3, nome:'Comboio Alpha', tipo:'COMBOIO', capacidade:8000, nivel_atual:92, lat:-20.124, lng:-43.984 },
  { id:4, nome:'Comboio Bravo', tipo:'COMBOIO', capacidade:8000, nivel_atual:30, lat:-20.128, lng:-43.980 },
]
const empty = { nome:'', tipo:'FIXO', capacidade:'' }

export default function PostosAbastecimento() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))

  const save = () => {
    if (!form.nome) { toast('Nome obrigatório','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form,capacidade:+form.capacidade||0}:r)); toast('Posto atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,capacidade:+form.capacidade||0,nivel_atual:100,lat:-20.12,lng:-43.98}]); toast('Posto criado') }
    setOpen(false)
  }

  const columns = [
    { key:'nome', label:'Nome', render:(r:any)=><span className="text-brand-400 font-bold">{r.nome}</span> },
    { key:'tipo', label:'Tipo', render:(r:any)=><span className={'px-2 py-0.5 rounded text-[10px] border '+(r.tipo==='FIXO'?'bg-brand-600/10 text-brand-400 border-brand-600/20':'bg-warn/10 text-warn border-warn/20')}>{r.tipo}</span> },
    { key:'capacidade', label:'Capacidade (L)', render:(r:any)=><span className="font-mono">{r.capacidade.toLocaleString()}</span> },
    { key:'nivel_atual', label:'Nível', render:(r:any)=><span className={'font-mono '+(r.nivel_atual<30?'text-crit':r.nivel_atual<50?'text-warn':'text-ok')}>{r.nivel_atual}%</span> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Postos de Abastecimento" status="ok" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({nome:r.nome,tipo:r.tipo,capacidade:String(r.capacidade)});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Posto" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Posto':'Novo Posto'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Dados"><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required /><FormGrid><Select label="Tipo" value={form.tipo} onChange={v=>set('tipo',v)} options={[{value:'FIXO',label:'Fixo'},{value:'COMBOIO',label:'Comboio'}]} /><Input label="Capacidade (L)" value={form.capacidade} onChange={v=>set('capacidade',v)} type="number" placeholder="50000" /></FormGrid></FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Posto removido');setDel(null)}} title="Excluir Posto" message={'Excluir '+(del?.nome||'')+'?'} confirmLabel="Excluir" />
  </>)
}
