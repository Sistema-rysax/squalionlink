import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, nome:'Diesel S10', codigo:'DIS10', unidade:'L', custo_unitario:5.89 },
  { id:2, nome:'Diesel S500', codigo:'DIS500', unidade:'L', custo_unitario:5.45 },
  { id:3, nome:'Graxa EP2', codigo:'GRX02', unidade:'kg', custo_unitario:12.50 },
  { id:4, nome:'Óleo Hidráulico 68', codigo:'OHD68', unidade:'L', custo_unitario:28.90 },
  { id:5, nome:'Óleo Motor 15W40', codigo:'OMT40', unidade:'L', custo_unitario:32.00 },
]
const empty = { nome:'', codigo:'', unidade:'L', custo_unitario:'' }

export default function Combustiveis() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))

  const save = () => {
    if (!form.nome||!form.codigo) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form,custo_unitario:+form.custo_unitario||0}:r)); toast('Combustível atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,custo_unitario:+form.custo_unitario||0}]); toast('Combustível criado') }
    setOpen(false)
  }

  const columns = [
    { key:'codigo', label:'Código', render:(r:any)=><span className="text-brand-400 font-bold font-mono">{r.codigo}</span> },
    { key:'nome', label:'Nome' },
    { key:'unidade', label:'Unidade', render:(r:any)=><span className="font-mono">{r.unidade}</span> },
    { key:'custo_unitario', label:'Custo Unit. (R$)', render:(r:any)=><span className="font-mono">R$ {r.custo_unitario.toFixed(2)}</span> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Combustíveis / Lubrificantes" status="info" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({nome:r.nome,codigo:r.codigo,unidade:r.unidade,custo_unitario:String(r.custo_unitario)});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Combustível" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Combustível':'Novo Combustível'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Dados"><FormGrid><Input label="Código" value={form.codigo} onChange={v=>set('codigo',v)} required placeholder="DIS10" /><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Diesel S10" /></FormGrid><FormGrid><Input label="Unidade" value={form.unidade} onChange={v=>set('unidade',v)} placeholder="L" /><Input label="Custo Unitário (R$)" value={form.custo_unitario} onChange={v=>set('custo_unitario',v)} type="number" placeholder="5.89" /></FormGrid></FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Combustível removido');setDel(null)}} title="Excluir Combustível" message={'Excluir '+(del?.nome||'')+'?'} confirmLabel="Excluir" />
  </>)
}
