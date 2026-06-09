import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, modelo:'777G', gatilho:'HORIMETRO', valor_gatilho:500, descricao:'Troca de óleo e filtros', itens:5, proxima:'12.950h' },
  { id:2, modelo:'777G', gatilho:'HORIMETRO', valor_gatilho:2000, descricao:'Revisão geral motor', itens:12, proxima:'14.450h' },
  { id:3, modelo:'PC5500', gatilho:'CALENDARIO', valor_gatilho:90, descricao:'Lubrificação geral', itens:8, proxima:'15/09/2024' },
  { id:4, modelo:'CAT 16M', gatilho:'ODOMETRO', valor_gatilho:10000, descricao:'Revisão trem de força', itens:6, proxima:'22.400 km' },
  { id:5, modelo:'785D', gatilho:'HORIMETRO', valor_gatilho:1000, descricao:'Inspeção freios', itens:4, proxima:'10.800h' },
]
const empty = { modelo:'', gatilho:'HORIMETRO', valor_gatilho:'', descricao:'' }

export default function PlanoPreventivo() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))

  const save = () => {
    if (!form.modelo||!form.descricao) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form,valor_gatilho:+form.valor_gatilho||0}:r)); toast('Plano atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,valor_gatilho:+form.valor_gatilho||0,itens:0,proxima:'—'}]); toast('Plano criado') }
    setOpen(false)
  }

  const columns = [
    { key:'modelo', label:'Modelo', render:(r:any)=><span className="text-brand-400 font-bold">{r.modelo}</span> },
    { key:'gatilho', label:'Gatilho', render:(r:any)=><span className="px-2 py-0.5 rounded text-[10px] bg-brand-600/10 text-brand-400 border border-brand-600/20">{r.gatilho}</span> },
    { key:'valor_gatilho', label:'Intervalo', render:(r:any)=><span className="font-mono">{r.valor_gatilho.toLocaleString()}{r.gatilho==='HORIMETRO'?'h':r.gatilho==='ODOMETRO'?'km':' dias'}</span> },
    { key:'descricao', label:'Descrição' },
    { key:'itens', label:'Itens', render:(r:any)=><span className="font-mono">{r.itens}</span> },
    { key:'proxima', label:'Próxima', render:(r:any)=><span className="font-mono text-warn">{r.proxima}</span> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Planos Preventivos" status="ok" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({modelo:r.modelo,gatilho:r.gatilho,valor_gatilho:String(r.valor_gatilho),descricao:r.descricao});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Plano" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Plano':'Novo Plano'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Modelo"><Select label="Modelo" value={form.modelo} onChange={v=>set('modelo',v)} required options={[{value:'777G',label:'777G'},{value:'785D',label:'785D'},{value:'PC5500',label:'PC5500'},{value:'CAT 6060',label:'CAT 6060'},{value:'CAT 16M',label:'CAT 16M'},{value:'CAT D10T',label:'CAT D10T'},{value:'Atlas D65',label:'Atlas D65'}]} /></FormSection>
        <FormSection title="Gatilho"><FormGrid><Select label="Tipo" value={form.gatilho} onChange={v=>set('gatilho',v)} options={[{value:'HORIMETRO',label:'Horímetro'},{value:'CALENDARIO',label:'Calendário'},{value:'ODOMETRO',label:'Odômetro'}]} /><Input label="Intervalo" value={form.valor_gatilho} onChange={v=>set('valor_gatilho',v)} type="number" placeholder="500" /></FormGrid></FormSection>
        <FormSection title="Serviço"><Input label="Descrição" value={form.descricao} onChange={v=>set('descricao',v)} required placeholder="Troca de óleo e filtros" /></FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Plano removido');setDel(null)}} title="Excluir Plano" message={'Excluir plano de '+(del?.descricao||'')+'?'} confirmLabel="Excluir" />
  </>)
}
