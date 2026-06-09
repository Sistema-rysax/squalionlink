import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid, Toggle, ColorPicker } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [{"id":1,"origem":"Frente Norte B3","destino":"Britador","material":"ROM","distancia":3.2,"dmt":2.8,"tempo_ref":12},{"id":2,"origem":"Frente Sul A1","destino":"Pilha Estéril","material":"Estéril","distancia":2.5,"dmt":2.1,"tempo_ref":9},{"id":3,"origem":"Frente Norte B3","destino":"Pilha ROM","material":"ROM","distancia":1.8,"dmt":1.5,"tempo_ref":7}]
const empty = {"origem":"","destino":"","material":"","distancia":"","dmt":"","tempo_ref":""}

export default function Rotas() {
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
  const columns = [{key:'origem',label:'Origem',render:(r:any)=><span className="text-brand-400">{r.origem}</span>},{key:'destino',label:'Destino',render:(r:any)=><span className="text-ok">{r.destino}</span>},{key:'material',label:'Material'},{key:'distancia',label:'Dist.',render:(r:any)=><span className="font-mono">{r.distancia} km</span>},{key:'dmt',label:'DMT',render:(r:any)=><span className="font-mono">{r.dmt} km</span>},{key:'tempo_ref',label:'Tempo Ref',render:(r:any)=><span className="font-mono">{r.tempo_ref} min</span>}]
  return (<>
    <DataTable columns={columns} data={data} title="Rotas Operacionais" status="info" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm(Object.fromEntries(Object.keys(empty).map(k=>[k,r[k]||''])));setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar':'Novo'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6"><FormSection title="Rota"><FormGrid><Input label="Origem" value={form.origem} onChange={v=>set('origem',v)} required /><Input label="Destino" value={form.destino} onChange={v=>set('destino',v)} required /></FormGrid><Input label="Material" value={form.material} onChange={v=>set('material',v)} /></FormSection><FormSection title="Distâncias"><FormGrid><Input label="Distância (km)" value={form.distancia} onChange={v=>set('distancia',v)} type="number" /><Input label="DMT (km)" value={form.dmt} onChange={v=>set('dmt',v)} type="number" /></FormGrid><Input label="Tempo Ref. (min)" value={form.tempo_ref} onChange={v=>set('tempo_ref',v)} type="number" /></FormSection></div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Removido');setDel(null)}} title="Excluir" message="Confirma exclusão?" confirmLabel="Excluir" />
  </>)
}