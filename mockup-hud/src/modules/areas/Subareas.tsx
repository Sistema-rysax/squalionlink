import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid, Toggle, ColorPicker } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [{"id":1,"nome":"Bancada B3-N1","area":"Frente Norte B3","material":"ROM","aplica_todas":false,"cor":"#f97316"},{"id":2,"nome":"Bancada A1-S1","area":"Frente Sul A1","material":"Estéril","aplica_todas":false,"cor":"#6b7280"},{"id":3,"nome":"Zona Segurança","area":"","material":"","aplica_todas":true,"cor":"#ef4444"}]
const empty = {"nome":"","area":"","material":"","aplica_todas":false,"cor":"#f97316"}

export default function Subareas() {
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
  const columns = [{key:'nome',label:'Nome',render:(r:any)=><span className="text-gray-200 font-medium">{r.nome}</span>},{key:'area',label:'Área',render:(r:any)=>r.aplica_todas?<span className="px-2 py-0.5 bg-warn/10 text-warn border border-warn/20 rounded text-[10px]">TODAS</span>:r.area},{key:'material',label:'Material'},{key:'cor',label:'Cor',render:(r:any)=><div className="w-4 h-4 rounded" style={{background:r.cor}}></div>}]
  return (<>
    <DataTable columns={columns} data={data} title="Subáreas / Bancadas" status="info" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm(Object.fromEntries(Object.keys(empty).map(k=>[k,r[k]||''])));setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar':'Novo'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6"><FormSection title="Dados"><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required /><Toggle label="Aplica a TODAS as áreas" checked={form.aplica_todas} onChange={v=>set('aplica_todas',v)} />{!form.aplica_todas&&<><Input label="Área Pai" value={form.area} onChange={v=>set('area',v)} /><Input label="Material" value={form.material} onChange={v=>set('material',v)} /></>}</FormSection><FormSection title="Visual"><ColorPicker label="Cor" value={form.cor} onChange={v=>set('cor',v)} /></FormSection></div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Removido');setDel(null)}} title="Excluir" message="Confirma exclusão?" confirmLabel="Excluir" />
  </>)
}