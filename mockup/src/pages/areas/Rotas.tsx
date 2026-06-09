import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, origem:'Frente Norte B3', destino:'Britador', material:'ROM', distancia:3.2, dmt:3.8, tempo_ref:24 },
  { id:2, origem:'Frente Norte B3', destino:'Pilha Estéril', material:'Estéril', distancia:2.8, dmt:3.4, tempo_ref:20 },
  { id:3, origem:'Frente Sul A1', destino:'Britador', material:'ROM', distancia:4.1, dmt:4.6, tempo_ref:28 },
  { id:4, origem:'Frente Sul A1', destino:'Pilha Estéril', material:'Estéril', distancia:3.5, dmt:4.0, tempo_ref:22 },
  { id:5, origem:'Frente Leste C2', destino:'Britador', material:'ROM', distancia:5.0, dmt:5.5, tempo_ref:32 },
]
const empty = { origem:'', destino:'', material:'', distancia:'', dmt:'', tempo_ref:'' }

export default function Rotas() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))
  const save = () => {
    if (!form.origem||!form.destino||!form.material) { toast('Campos obrigatórios','error'); return }
    if (form.origem===form.destino) { toast('Origem e destino devem ser diferentes','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form,distancia:+form.distancia,dmt:+form.dmt,tempo_ref:+form.tempo_ref}:r)); toast('Rota atualizada') }
    else { setData(p=>[...p,{id:Date.now(),...form,distancia:+form.distancia,dmt:+form.dmt,tempo_ref:+form.tempo_ref}]); toast('Rota criada') }
    setOpen(false)
  }
  const columns = [
    { key:'origem', label:'Origem' },
    { key:'destino', label:'Destino' },
    { key:'material', label:'Material', render:(r:any)=><span className={`px-2 py-0.5 rounded text-xs ${r.material==='ROM'?'bg-yellow-900/30 text-yellow-400':'bg-gray-800 text-gray-400'}`}>{r.material}</span> },
    { key:'distancia', label:'Distância', render:(r:any)=>r.distancia+' km' },
    { key:'dmt', label:'DMT', render:(r:any)=>r.dmt+' km' },
    { key:'tempo_ref', label:'Tempo Ref.', render:(r:any)=>r.tempo_ref+' min' },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Rotas (Origem → Destino)" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({origem:r.origem,destino:r.destino,material:r.material,distancia:String(r.distancia),dmt:String(r.dmt),tempo_ref:String(r.tempo_ref)});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Nova Rota" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Rota':'Nova Rota'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Rota">
          <Select label="Origem (área)" value={form.origem} onChange={v=>set('origem',v)} required onAdd={()=>toast('Criar área','info')} options={[{value:'Frente Norte B3',label:'Frente Norte B3'},{value:'Frente Sul A1',label:'Frente Sul A1'},{value:'Frente Leste C2',label:'Frente Leste C2'}]} />
          <Select label="Destino (área)" value={form.destino} onChange={v=>set('destino',v)} required onAdd={()=>toast('Criar área','info')} options={[{value:'Britador',label:'Britador'},{value:'Pilha Estéril',label:'Pilha Estéril'},{value:'Pilha ROM',label:'Pilha ROM'}]} />
          <Select label="Material" value={form.material} onChange={v=>set('material',v)} required onAdd={()=>toast('Criar material','info')} options={[{value:'ROM',label:'ROM'},{value:'Estéril',label:'Estéril'},{value:'Minério',label:'Minério'}]} />
        </FormSection>
        <FormSection title="Métricas">
          <FormGrid><Input label="Distância (km)" value={form.distancia} onChange={v=>set('distancia',v)} type="number" placeholder="3.2" /><Input label="DMT (km)" value={form.dmt} onChange={v=>set('dmt',v)} type="number" placeholder="3.8" helper="Distância Média de Transporte" /></FormGrid>
          <Input label="Tempo Referência (min)" value={form.tempo_ref} onChange={v=>set('tempo_ref',v)} type="number" placeholder="24" helper="Tempo esperado para um ciclo nesta rota" />
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Rota removida');setDel(null)}} title="Excluir rota?" message={`Excluir ${del?.origem} → ${del?.destino}?`} confirmLabel="Excluir" />
  </>)
}