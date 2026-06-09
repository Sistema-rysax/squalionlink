import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid, ColorPicker } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import { areas as init } from '../../mock/data'

const empty = { nome:'', tipo:'FRENTE_LAVRA', cor:'#22c55e', material_padrao:'' }
export default function Areas() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))
  const save = () => { if (!form.nome) { toast('Nome é obrigatório','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Área atualizada') }
    else { setData(p=>[...p,{id:Date.now(),...form}]); toast('Área criada') } setOpen(false) }
  const columns = [
    { key:'nome', label:'Nome' },
    { key:'tipo', label:'Tipo', render:(r:any)=><span className="px-2 py-0.5 bg-surface-3 rounded text-xs">{r.tipo}</span> },
    { key:'cor', label:'Cor', render:(r:any)=><div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{background:r.cor}}></div><span className="text-xs font-mono text-gray-500">{r.cor}</span></div> },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Áreas & Geofences" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({nome:r.nome,tipo:r.tipo,cor:r.cor,material_padrao:''});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Nova Área" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Área':'Nova Área'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Dados da Área">
          <Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Frente Norte B3" />
          <Select label="Tipo" value={form.tipo} onChange={v=>set('tipo',v)} required options={[{value:'FRENTE_LAVRA',label:'Frente de Lavra'},{value:'PILHA',label:'Pilha'},{value:'BRITADOR',label:'Britador'},{value:'ROTA',label:'Rota'},{value:'APOIO',label:'Apoio'},{value:'DESCARGA',label:'Descarga'}]} />
          <ColorPicker label="Cor no Mapa" value={form.cor} onChange={v=>set('cor',v)} />
          <Select label="Material Padrão" value={form.material_padrao} onChange={v=>set('material_padrao',v)} options={[{value:'ROM',label:'ROM'},{value:'Estéril',label:'Estéril'},{value:'Minério',label:'Minério'}]} />
        </FormSection>
        <FormSection title="Geofence">
          <div className="h-48 bg-surface-2 border border-surface-4 rounded-lg flex items-center justify-center text-sm text-gray-600">🗺️ Editor de polígono (desenhar no mapa)</div>
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Área removida');setDel(null)}} title="Excluir área?" message={`Excluir ${del?.nome}?`} confirmLabel="Excluir" />
  </>)
}