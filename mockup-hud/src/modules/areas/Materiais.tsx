import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid, Toggle, ColorPicker } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [{"id":1,"nome":"ROM","tipo":"MINERIO","densidade":2.8,"cor":"#f97316"},{"id":2,"nome":"Hematita","tipo":"MINERIO","densidade":5.1,"cor":"#ef4444"},{"id":3,"nome":"Itabirito","tipo":"MINERIO","densidade":3.5,"cor":"#a855f7"},{"id":4,"nome":"Estéril","tipo":"ESTERIL","densidade":2.2,"cor":"#6b7280"}]
const empty = {"nome":"","tipo":"MINERIO","densidade":"","cor":"#f97316"}

export default function Materiais() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))
  const save = () => {
    if (!form[Object.keys(empty)[0]]) { toast('Campo obrigatório','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form}]); toast('Criado') }
    setOpen(false)
  }
  const columns = [{key:'nome',label:'Nome',render:(r:any)=><span className="text-gray-200 font-medium">{r.nome}</span>},{key:'tipo',label:'Tipo',render:(r:any)=><span className={'px-2 py-0.5 rounded text-[10px] border '+(r.tipo==='MINERIO'?'text-brand-400 bg-brand-600/10 border-brand-600/20':'text-dim bg-white/5 border-hud-border')}>{r.tipo}</span>},{key:'densidade',label:'Densidade',render:(r:any)=><span className="font-mono">{r.densidade} t/m³</span>},{key:'cor',label:'Cor',render:(r:any)=><div className="w-4 h-4 rounded" style={{background:r.cor}}></div>}]
  return (<>
    <DataTable columns={columns} data={data} title="Materiais" status="info" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm(Object.fromEntries(Object.keys(empty).map(k=>[k,r[k]||''])));setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar':'Novo'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6"><FormSection title="Dados"><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required /><FormGrid><Select label="Tipo" value={form.tipo} onChange={v=>set('tipo',v)} options={[{value:'MINERIO',label:'Minério'},{value:'ESTERIL',label:'Estéril'}]} /><Input label="Densidade (t/m³)" value={form.densidade} onChange={v=>set('densidade',v)} type="number" /></FormGrid><ColorPicker label="Cor" value={form.cor} onChange={v=>set('cor',v)} /></FormSection></div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Removido');setDel(null)}} title="Excluir" message="Confirma exclusão?" confirmLabel="Excluir" />
  </>)
}