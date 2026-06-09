import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, razao_social:'Mineradora ABC Ltda', cnpj:'12.345.678/0001-90', tipo:'PROPRIA', equipamentos:6 },
  { id:2, razao_social:'TransLog Transportes Ltda', cnpj:'98.765.432/0001-10', tipo:'TERCEIRA', equipamentos:4 },
  { id:3, razao_social:'ServiMina Serviços', cnpj:'11.222.333/0001-44', tipo:'TERCEIRA', equipamentos:0 },
]
const empty = { razao_social:'', cnpj:'', tipo:'PROPRIA' }

export default function Contratadas() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))

  const save = () => {
    if (!form.razao_social||!form.cnpj) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Contratada atualizada') }
    else { setData(p=>[...p,{id:Date.now(),...form,equipamentos:0}]); toast('Contratada criada') }
    setOpen(false)
  }

  const columns = [
    { key:'razao_social', label:'Razão Social', render:(r:any)=><span className="text-brand-400 font-bold">{r.razao_social}</span> },
    { key:'cnpj', label:'CNPJ', render:(r:any)=><span className="font-mono text-dim">{r.cnpj}</span> },
    { key:'tipo', label:'Tipo', render:(r:any)=><span className={'px-2 py-0.5 rounded text-[10px] border '+(r.tipo==='PROPRIA'?'bg-ok/10 text-ok border-ok/20':'bg-warn/10 text-warn border-warn/20')}>{r.tipo}</span> },
    { key:'equipamentos', label:'Equipamentos', render:(r:any)=><span className="font-mono">{r.equipamentos}</span> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Contratadas" status="info" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({razao_social:r.razao_social,cnpj:r.cnpj,tipo:r.tipo});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Nova Contratada" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Contratada':'Nova Contratada'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Dados"><FormGrid><Input label="Razão Social" value={form.razao_social} onChange={v=>set('razao_social',v)} required /><Input label="CNPJ" value={form.cnpj} onChange={v=>set('cnpj',v)} required placeholder="00.000.000/0000-00" /></FormGrid><Select label="Tipo" value={form.tipo} onChange={v=>set('tipo',v)} options={[{value:'PROPRIA',label:'Própria'},{value:'TERCEIRA',label:'Terceira'}]} /></FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Contratada removida');setDel(null)}} title="Excluir Contratada" message={'Excluir '+(del?.razao_social||'')+'?'} confirmLabel="Excluir" />
  </>)
}
