import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid, ColorPicker } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, nome:'ROM', codigo:'ROM', tipo:'MINERIO', densidade:2.8, cor:'#f97316' },
  { id:2, nome:'Estéril', codigo:'EST', tipo:'ESTERIL', densidade:2.4, cor:'#6b7280' },
  { id:3, nome:'Minério Beneficiado', codigo:'MBE', tipo:'MINERIO', densidade:3.2, cor:'#eab308' },
  { id:4, nome:'Itabirito', codigo:'ITA', tipo:'MINERIO', densidade:3.5, cor:'#a855f7' },
  { id:5, nome:'Filito', codigo:'FIL', tipo:'ESTERIL', densidade:2.6, cor:'#64748b' },
]
const empty = { nome:'', codigo:'', tipo:'MINERIO', densidade:'', cor:'#f97316' }

export default function Materiais() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))
  const save = () => {
    if (!form.nome||!form.codigo||!form.tipo) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form,densidade:+form.densidade}:r)); toast('Material atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,densidade:+form.densidade}]); toast('Material criado') }
    setOpen(false)
  }
  const columns = [
    { key:'codigo', label:'Código', render:(r:any)=><span className="font-mono text-xs bg-surface-3 px-2 py-0.5 rounded">{r.codigo}</span> },
    { key:'nome', label:'Nome' },
    { key:'tipo', label:'Tipo', render:(r:any)=><span className={`px-2 py-0.5 rounded text-xs ${r.tipo==='MINERIO'?'bg-yellow-900/30 text-yellow-400':'bg-gray-800 text-gray-400'}`}>{r.tipo}</span> },
    { key:'densidade', label:'Densidade (t/m³)', render:(r:any)=>r.densidade+' t/m³' },
    { key:'cor', label:'Cor', render:(r:any)=><div className="w-4 h-4 rounded" style={{background:r.cor}}></div> },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Materiais" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({nome:r.nome,codigo:r.codigo,tipo:r.tipo,densidade:String(r.densidade),cor:r.cor});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Material" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Material':'Novo Material'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Identificação">
          <FormGrid><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="ROM" /><Input label="Código" value={form.codigo} onChange={v=>set('codigo',v)} required placeholder="ROM" /></FormGrid>
          <Select label="Tipo" value={form.tipo} onChange={v=>set('tipo',v)} required options={[{value:'MINERIO',label:'Minério'},{value:'ESTERIL',label:'Estéril'},{value:'MISTO',label:'Misto'}]} />
        </FormSection>
        <FormSection title="Propriedades">
          <Input label="Densidade (t/m³)" value={form.densidade} onChange={v=>set('densidade',v)} type="number" placeholder="2.8" helper="Necessário para cálculos de volume→tonelagem" />
          <ColorPicker label="Cor no Mapa / Gráficos" value={form.cor} onChange={v=>set('cor',v)} />
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Material removido');setDel(null)}} title="Excluir material?" message={`Excluir ${del?.nome}? Verifique rotas e pilhas vinculadas.`} confirmLabel="Excluir" />
  </>)
}