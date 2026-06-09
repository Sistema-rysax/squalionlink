import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, nome:'Caterpillar', pais:'EUA', modelos:5 },
  { id:2, nome:'Komatsu', pais:'Japão', modelos:1 },
  { id:3, nome:'Atlas Copco', pais:'Suécia', modelos:1 },
  { id:4, nome:'Volvo', pais:'Suécia', modelos:0 },
  { id:5, nome:'Liebherr', pais:'Alemanha', modelos:0 },
]
const empty = { nome:'', pais:'' }

export default function Fabricantes() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))

  const save = () => {
    if (!form.nome) { toast('Nome obrigatório','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Fabricante atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,modelos:0}]); toast('Fabricante criado') }
    setOpen(false)
  }

  const columns = [
    { key:'nome', label:'Nome', render:(r:any)=><span className="text-brand-400 font-bold">{r.nome}</span> },
    { key:'pais', label:'País' },
    { key:'modelos', label:'Modelos', render:(r:any)=><span className="font-mono">{r.modelos}</span> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Fabricantes" status="info" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({nome:r.nome,pais:r.pais});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Fabricante" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Fabricante':'Novo Fabricante'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Dados"><FormGrid><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Caterpillar" /><Input label="País" value={form.pais} onChange={v=>set('pais',v)} placeholder="EUA" /></FormGrid></FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Fabricante removido');setDel(null)}} title="Excluir Fabricante" message={'Excluir '+(del?.nome||'')+'?'} confirmLabel="Excluir" />
  </>)
}
