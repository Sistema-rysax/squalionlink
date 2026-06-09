import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid, Toggle, ColorPicker } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [{"id":1,"nome":"Portaria Principal","tipo":"PORTARIA","lat":-20.118,"lng":-43.995,"cor":"#3b82f6"},{"id":2,"nome":"Balança 01","tipo":"BALANCA","lat":-20.12,"lng":-43.992,"cor":"#22c55e"},{"id":3,"nome":"Oficina Central","tipo":"OFICINA","lat":-20.122,"lng":-43.989,"cor":"#f97316"},{"id":4,"nome":"Posto Combustível","tipo":"POSTO","lat":-20.121,"lng":-43.986,"cor":"#eab308"}]
const empty = {"nome":"","tipo":"PORTARIA","lat":"","lng":"","cor":"#3b82f6"}

export default function PontosAcesso() {
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
  const columns = [{key:'nome',label:'Nome',render:(r:any)=><span className="text-gray-200 font-medium">{r.nome}</span>},{key:'tipo',label:'Tipo',render:(r:any)=><span className="px-2 py-0.5 bg-white/5 border border-hud-border rounded text-[10px]">{r.tipo}</span>},{key:'lat',label:'Lat',render:(r:any)=><span className="font-mono text-[10px]">{r.lat}</span>},{key:'lng',label:'Lng',render:(r:any)=><span className="font-mono text-[10px]">{r.lng}</span>},{key:'cor',label:'Cor',render:(r:any)=><div className="w-4 h-4 rounded-full" style={{background:r.cor}}></div>}]
  return (<>
    <DataTable columns={columns} data={data} title="Pontos de Acesso" status="info" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm(Object.fromEntries(Object.keys(empty).map(k=>[k,r[k]||''])));setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar':'Novo'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6"><FormSection title="Identificação"><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required /><Select label="Tipo" value={form.tipo} onChange={v=>set('tipo',v)} options={[{value:'PORTARIA',label:'Portaria'},{value:'BALANCA',label:'Balança'},{value:'OFICINA',label:'Oficina'},{value:'POSTO',label:'Posto'},{value:'APOIO',label:'Apoio'}]} /></FormSection><FormSection title="Localização"><FormGrid><Input label="Latitude" value={form.lat} onChange={v=>set('lat',v)} type="number" /><Input label="Longitude" value={form.lng} onChange={v=>set('lng',v)} type="number" /></FormGrid></FormSection><FormSection title="Visual"><ColorPicker label="Cor" value={form.cor} onChange={v=>set('cor',v)} /></FormSection></div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Removido');setDel(null)}} title="Excluir" message="Confirma exclusão?" confirmLabel="Excluir" />
  </>)
}