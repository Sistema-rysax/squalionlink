import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import StatusBadge from '../../components/ui/StatusBadge'
import { Input, Select, FormSection, FormGrid } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, origem:'Frente Norte B3', destino:'Britador', material:'ROM', centro_custo:'CC-001 Lavra Norte', dmt:3.8, tempo_carga:4, tempo_descarga:2, tempo_ciclo_ref:24, status:'ATIVO' },
  { id:2, origem:'Frente Norte B3', destino:'Pilha Estéril', material:'Estéril', centro_custo:'CC-001 Lavra Norte', dmt:3.4, tempo_carga:4, tempo_descarga:2, tempo_ciclo_ref:20, status:'ATIVO' },
  { id:3, origem:'Frente Sul A1', destino:'Britador', material:'ROM', centro_custo:'CC-002 Lavra Sul', dmt:4.6, tempo_carga:5, tempo_descarga:2, tempo_ciclo_ref:28, status:'ATIVO' },
]
const empty = { origem:'', destino:'', material:'', centro_custo:'', dmt:'', tempo_carga:'', tempo_descarga:'', tempo_ciclo_ref:'' }

export default function Apropriacao() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))
  const save = () => {
    if (!form.origem||!form.destino||!form.material||!form.centro_custo) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form,dmt:+form.dmt,tempo_carga:+form.tempo_carga,tempo_descarga:+form.tempo_descarga,tempo_ciclo_ref:+form.tempo_ciclo_ref}:r)); toast('Apropriação atualizada') }
    else { setData(p=>[...p,{id:Date.now(),...form,dmt:+form.dmt,tempo_carga:+form.tempo_carga,tempo_descarga:+form.tempo_descarga,tempo_ciclo_ref:+form.tempo_ciclo_ref,status:'ATIVO'}]); toast('Apropriação criada') }
    setOpen(false)
  }
  const columns = [
    { key:'origem', label:'Origem' },
    { key:'destino', label:'Destino' },
    { key:'material', label:'Material' },
    { key:'centro_custo', label:'Centro de Custo', render:(r:any)=><span className="text-brand-400 text-xs">{r.centro_custo}</span> },
    { key:'dmt', label:'DMT', render:(r:any)=>r.dmt+' km' },
    { key:'tempo_ciclo_ref', label:'Ciclo Ref.', render:(r:any)=>r.tempo_ciclo_ref+' min' },
    { key:'status', label:'Status', render:(r:any)=><StatusBadge status={r.status} /> },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Apropriação de Rotas" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({origem:r.origem,destino:r.destino,material:r.material,centro_custo:r.centro_custo,dmt:String(r.dmt),tempo_carga:String(r.tempo_carga),tempo_descarga:String(r.tempo_descarga),tempo_ciclo_ref:String(r.tempo_ciclo_ref)});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Nova Apropriação" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Apropriação':'Nova Apropriação'} width="w-[640px]"
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Rota">
          <Select label="Origem" value={form.origem} onChange={v=>set('origem',v)} required options={[{value:'Frente Norte B3',label:'Frente Norte B3'},{value:'Frente Sul A1',label:'Frente Sul A1'},{value:'Frente Leste C2',label:'Frente Leste C2'}]} />
          <Select label="Destino" value={form.destino} onChange={v=>set('destino',v)} required options={[{value:'Britador',label:'Britador'},{value:'Pilha Estéril',label:'Pilha Estéril'},{value:'Pilha ROM',label:'Pilha ROM'}]} />
          <Select label="Material" value={form.material} onChange={v=>set('material',v)} required options={[{value:'ROM',label:'ROM'},{value:'Estéril',label:'Estéril'},{value:'Minério',label:'Minério'}]} />
        </FormSection>
        <FormSection title="Custeio">
          <Select label="Centro de Custo" value={form.centro_custo} onChange={v=>set('centro_custo',v)} required onAdd={()=>toast('Criar centro de custo','info')} options={[{value:'CC-001 Lavra Norte',label:'CC-001 Lavra Norte'},{value:'CC-002 Lavra Sul',label:'CC-002 Lavra Sul'},{value:'CC-003 Infraestrutura',label:'CC-003 Infraestrutura'}]} />
          <Input label="DMT (km)" value={form.dmt} onChange={v=>set('dmt',v)} type="number" placeholder="3.8" helper="Distância Média de Transporte" />
        </FormSection>
        <FormSection title="Tempos de Referência (minutos)">
          <FormGrid><Input label="Tempo Carga" value={form.tempo_carga} onChange={v=>set('tempo_carga',v)} type="number" placeholder="4" /><Input label="Tempo Descarga" value={form.tempo_descarga} onChange={v=>set('tempo_descarga',v)} type="number" placeholder="2" /></FormGrid>
          <Input label="Tempo Ciclo Total Ref." value={form.tempo_ciclo_ref} onChange={v=>set('tempo_ciclo_ref',v)} type="number" placeholder="24" />
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Apropriação removida');setDel(null)}} title="Excluir apropriação?" message={`Excluir ${del?.origem} → ${del?.destino}?`} confirmLabel="Excluir" />
  </>)
}