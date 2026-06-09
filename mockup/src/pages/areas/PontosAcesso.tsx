import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid, ColorPicker } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import { MapPin } from 'lucide-react'

const init = [
  { id:1, nome:'Portaria Principal', tipo:'PORTARIA', lat:-20.1180, lng:-43.9950, icone:'gate', cor:'#3b82f6', ativo:true },
  { id:2, nome:'Balança 01', tipo:'BALANCA', lat:-20.1200, lng:-43.9920, icone:'scale', cor:'#22c55e', ativo:true },
  { id:3, nome:'Oficina Central', tipo:'OFICINA', lat:-20.1220, lng:-43.9890, icone:'wrench', cor:'#f97316', ativo:true },
  { id:4, nome:'Refeitório', tipo:'APOIO', lat:-20.1195, lng:-43.9880, icone:'utensils', cor:'#a855f7', ativo:true },
  { id:5, nome:'Posto Combustível Central', tipo:'POSTO', lat:-20.1210, lng:-43.9860, icone:'fuel', cor:'#eab308', ativo:true },
  { id:6, nome:'Escritório Mina', tipo:'APOIO', lat:-20.1185, lng:-43.9870, icone:'building', cor:'#06b6d4', ativo:true },
]
const empty = { nome:'', tipo:'PORTARIA', lat:'', lng:'', cor:'#3b82f6' }

export default function PontosAcesso() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))
  const save = () => {
    if (!form.nome||!form.tipo) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form,lat:+form.lat||r.lat,lng:+form.lng||r.lng}:r)); toast('Ponto atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,lat:+form.lat||-20.12,lng:+form.lng||-43.99,icone:'pin',ativo:true}]); toast('Ponto criado') }
    setOpen(false)
  }
  const columns = [
    { key:'nome', label:'Nome', render:(r:any)=><span className="flex items-center gap-2"><MapPin className="w-4 h-4" style={{color:r.cor}}/>{r.nome}</span> },
    { key:'tipo', label:'Tipo', render:(r:any)=><span className="px-2 py-0.5 bg-surface-3 rounded text-xs">{r.tipo}</span> },
    { key:'lat', label:'Latitude', render:(r:any)=><span className="font-mono text-xs">{r.lat.toFixed(4)}</span> },
    { key:'lng', label:'Longitude', render:(r:any)=><span className="font-mono text-xs">{r.lng.toFixed(4)}</span> },
    { key:'cor', label:'Cor', render:(r:any)=><div className="w-4 h-4 rounded" style={{background:r.cor}}></div> },
    { key:'ativo', label:'Ativo', render:(r:any)=>r.ativo?<span className="text-green-400 text-xs">✓</span>:<span className="text-gray-600 text-xs">✗</span> },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Pontos de Acesso" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({nome:r.nome,tipo:r.tipo,lat:String(r.lat),lng:String(r.lng),cor:r.cor});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Ponto" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Ponto':'Novo Ponto de Acesso'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Identificação">
          <Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Portaria Principal" />
          <Select label="Tipo" value={form.tipo} onChange={v=>set('tipo',v)} required options={[{value:'PORTARIA',label:'Portaria'},{value:'BALANCA',label:'Balança'},{value:'OFICINA',label:'Oficina'},{value:'POSTO',label:'Posto Combustível'},{value:'APOIO',label:'Apoio/Infraestrutura'},{value:'PONTO_ENCONTRO',label:'Ponto de Encontro (emergência)'}]} />
        </FormSection>
        <FormSection title="Localização">
          <FormGrid><Input label="Latitude" value={form.lat} onChange={v=>set('lat',v)} type="number" placeholder="-20.1180" /><Input label="Longitude" value={form.lng} onChange={v=>set('lng',v)} type="number" placeholder="-43.9950" /></FormGrid>
          <div className="h-32 bg-surface-2 border border-surface-4 rounded-lg flex items-center justify-center text-xs text-gray-600">📍 Clique no mapa para definir posição</div>
        </FormSection>
        <FormSection title="Visual"><ColorPicker label="Cor do Marcador" value={form.cor} onChange={v=>set('cor',v)} /></FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Ponto removido');setDel(null)}} title="Excluir ponto?" message={`Excluir ${del?.nome}?`} confirmLabel="Excluir" />
  </>)
}