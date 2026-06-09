import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid, ColorPicker } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  {id:1,nome:'Frente Norte B3',tipo:'LAVRA',material:'ROM',status:'ATIVA',cor:'#f97316'},
  {id:2,nome:'Frente Sul A1',tipo:'LAVRA',material:'Estéril',status:'ATIVA',cor:'#22c55e'},
  {id:3,nome:'Britador Primário',tipo:'BENEFICIAMENTO',material:'ROM',status:'ATIVA',cor:'#ef4444'},
  {id:4,nome:'Pilha Estéril',tipo:'DEPOSITO',material:'Estéril',status:'ATIVA',cor:'#6b7280'},
  {id:5,nome:'Pilha ROM',tipo:'DEPOSITO',material:'ROM',status:'ATIVA',cor:'#2563eb'},
  {id:6,nome:'Oficina Central',tipo:'APOIO',material:'—',status:'ATIVA',cor:'#a855f7'},
]
const empty = {nome:'',tipo:'LAVRA',material:'',cor:'#2563eb'}

export default function AreasPage() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))
  const save = () => {
    if (!form.nome) { toast('Nome obrigatório','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Área atualizada') }
    else { setData(p=>[...p,{id:Date.now(),...form,status:'ATIVA'}]); toast('Área criada') }
    setOpen(false)
  }
  const columns = [
    { key:'nome', label:'Nome', render:(r:any)=><span className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{background:r.cor}}></div><span className="font-medium text-gray-200">{r.nome}</span></span> },
    { key:'tipo', label:'Tipo', render:(r:any)=><span className="px-2 py-0.5 bg-white/5 border border-hud-border rounded text-[10px]">{r.tipo}</span> },
    { key:'material', label:'Material' },
    { key:'status', label:'Status', render:(r:any)=><div className="flex items-center gap-2"><div className={'led led-'+(r.status==='ATIVA'?'ok':'off')}></div><span className="text-[10px]">{r.status}</span></div> },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Áreas Operacionais" status="info" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({nome:r.nome,tipo:r.tipo,material:r.material,cor:r.cor});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Nova Área" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Área':'Nova Área'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6"><FormSection title="Dados"><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required /><FormGrid><Select label="Tipo" value={form.tipo} onChange={v=>set('tipo',v)} options={[{value:'LAVRA',label:'Lavra'},{value:'DEPOSITO',label:'Depósito'},{value:'BENEFICIAMENTO',label:'Beneficiamento'},{value:'APOIO',label:'Apoio'}]} /><Input label="Material" value={form.material} onChange={v=>set('material',v)} /></FormGrid></FormSection><FormSection title="Visual"><ColorPicker label="Cor no Mapa" value={form.cor} onChange={v=>set('cor',v)} /></FormSection></div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Área removida');setDel(null)}} title="Excluir Área" message={'Excluir '+(del?.nome||'')+'?'} confirmLabel="Excluir" />
  </>)
}