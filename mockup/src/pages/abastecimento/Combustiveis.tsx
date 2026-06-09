import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, nome:'Diesel S10', codigo:'DS10', unidade:'L', custo:5.89, ativo:true },
  { id:2, nome:'Diesel S500', codigo:'DS500', unidade:'L', custo:5.45, ativo:true },
  { id:3, nome:'Arla 32', codigo:'ARLA', unidade:'L', custo:3.20, ativo:true },
  { id:4, nome:'Graxa EP2', codigo:'GXE2', unidade:'kg', custo:12.50, ativo:true },
]
const empty = { nome:'', codigo:'', unidade:'L', custo:'' }

export default function Combustiveis() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))
  const save = () => {
    if (!form.nome||!form.codigo) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form,custo:+form.custo}:r)); toast('Combustível atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,custo:+form.custo,ativo:true}]); toast('Combustível criado') }
    setOpen(false)
  }
  const columns = [
    { key:'codigo', label:'Código', render:(r:any)=><span className="font-mono text-xs bg-surface-3 px-2 py-0.5 rounded">{r.codigo}</span> },
    { key:'nome', label:'Nome' },
    { key:'unidade', label:'Unidade' },
    { key:'custo', label:'Custo Unit.', render:(r:any)=><span className="font-mono">R$ {r.custo.toFixed(2)}</span> },
    { key:'ativo', label:'Status', render:(r:any)=>r.ativo?<span className="text-green-400 text-xs">Ativo</span>:<span className="text-gray-600 text-xs">Inativo</span> },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Combustíveis & Lubrificantes" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({nome:r.nome,codigo:r.codigo,unidade:r.unidade,custo:String(r.custo)});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Combustível" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Combustível':'Novo Combustível'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Identificação">
          <FormGrid><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Diesel S10" /><Input label="Código" value={form.codigo} onChange={v=>set('codigo',v)} required placeholder="DS10" /></FormGrid>
          <FormGrid><Select label="Unidade" value={form.unidade} onChange={v=>set('unidade',v)} options={[{value:'L',label:'Litros (L)'},{value:'kg',label:'Quilogramas (kg)'},{value:'un',label:'Unidade'}]} /><Input label="Custo Unitário (R$)" value={form.custo} onChange={v=>set('custo',v)} type="number" placeholder="5.89" /></FormGrid>
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Combustível removido');setDel(null)}} title="Excluir combustível?" message={`Excluir ${del?.nome}?`} confirmLabel="Excluir" />
  </>)
}