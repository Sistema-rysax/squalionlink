import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, FormSection, FormGrid } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, nome:'Caterpillar', pais:'EUA', modelos:4 },
  { id:2, nome:'Komatsu', pais:'Japão', modelos:1 },
  { id:3, nome:'Volvo', pais:'Suécia', modelos:0 },
  { id:4, nome:'Atlas Copco', pais:'Suécia', modelos:1 },
  { id:5, nome:'Liebherr', pais:'Suíça', modelos:0 },
  { id:6, nome:'Scania', pais:'Suécia', modelos:0 },
]
const empty = { nome:'', pais:'' }

export default function Fabricantes() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))
  const save = () => {
    if (!form.nome) { toast('Nome é obrigatório','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Fabricante atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,modelos:0}]); toast('Fabricante criado') }
    setOpen(false)
  }
  const columns = [
    { key:'nome', label:'Nome' },
    { key:'pais', label:'País de Origem' },
    { key:'modelos', label:'Modelos Vinculados', render:(r:any)=><span className="px-2 py-0.5 bg-brand-900/30 text-brand-400 rounded text-xs">{r.modelos}</span> },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Fabricantes" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({nome:r.nome,pais:r.pais});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Fabricante" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Fabricante':'Novo Fabricante'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6"><FormSection title="Dados"><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Caterpillar" /><Input label="País de Origem" value={form.pais} onChange={v=>set('pais',v)} placeholder="EUA" /></FormSection></div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Fabricante removido');setDel(null)}} title="Excluir fabricante?" message={`Excluir ${del?.nome}? Modelos vinculados serão desassociados.`} confirmLabel="Excluir" />
  </>)
}