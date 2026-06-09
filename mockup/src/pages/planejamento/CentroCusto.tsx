import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, FormSection } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, codigo:'CC-001', nome:'Lavra Norte', rotas_vinculadas:3 },
  { id:2, codigo:'CC-002', nome:'Lavra Sul', rotas_vinculadas:2 },
  { id:3, codigo:'CC-003', nome:'Infraestrutura', rotas_vinculadas:0 },
  { id:4, codigo:'CC-004', nome:'Beneficiamento', rotas_vinculadas:1 },
  { id:5, codigo:'CC-005', nome:'Apoio Operacional', rotas_vinculadas:0 },
]
const empty = { codigo:'', nome:'' }

export default function CentroCusto() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))
  const save = () => {
    if (!form.codigo||!form.nome) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Centro de custo atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,rotas_vinculadas:0}]); toast('Centro de custo criado') }
    setOpen(false)
  }
  const columns = [
    { key:'codigo', label:'Código', render:(r:any)=><span className="font-mono text-brand-400">{r.codigo}</span> },
    { key:'nome', label:'Nome' },
    { key:'rotas_vinculadas', label:'Rotas Vinculadas' },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Centros de Custo" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({codigo:r.codigo,nome:r.nome});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Centro" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Centro de Custo':'Novo Centro de Custo'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6"><FormSection title="Dados"><Input label="Código" value={form.codigo} onChange={v=>set('codigo',v)} required placeholder="CC-001" /><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Lavra Norte" /></FormSection></div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Centro removido');setDel(null)}} title="Excluir centro de custo?" message={`Excluir ${del?.codigo} — ${del?.nome}?`} confirmLabel="Excluir" />
  </>)
}