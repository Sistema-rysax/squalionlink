import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import SmartSelect from '../../components/ui/SmartSelect'
import { Input, Select, FormSection, FormGrid, Switch, ColorPicker } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import { areas } from '../../mock/data'

const init = [
  { id:1, nome:'Bancada B3-N1', area:'Frente Norte B3', material:'ROM', poligono:true, aplica_todas:false, cor:'#f97316', fe:59.2 },
  { id:2, nome:'Bancada B3-N2', area:'Frente Norte B3', material:'ROM', poligono:true, aplica_todas:false, cor:'#f59e0b', fe:61.0 },
  { id:3, nome:'Bancada A1-S1', area:'Frente Sul A1', material:'Estéril', poligono:true, aplica_todas:false, cor:'#6b7280', fe:22.5 },
  { id:4, nome:'Zona de Segurança', area:'—', material:'—', poligono:true, aplica_todas:true, cor:'#ef4444', fe:null },
  { id:5, nome:'Limite Operacional', area:'—', material:'—', poligono:true, aplica_todas:true, cor:'#eab308', fe:null },
]
const empty = { nome:'', area:'', material:'', aplica_todas:false, cor:'#f97316' }

export default function Subareas() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))

  const save = () => {
    if (!form.nome) { toast('Nome obrigatório','error'); return }
    if (!form.aplica_todas && !form.area) { toast('Selecione a área ou marque "aplica a todas"','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Subárea atualizada') }
    else { setData(p=>[...p,{id:Date.now(),...form,poligono:true,fe:null}]); toast('Subárea criada') }
    setOpen(false)
  }

  const areaOptions = areas.map(a=>({value:a.nome,label:a.nome}))

  const columns = [
    { key:'nome', label:'Nome' },
    { key:'area', label:'Área Pai', render:(r:any)=>r.aplica_todas?<span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 rounded text-xs">TODAS</span>:r.area },
    { key:'material', label:'Material' },
    { key:'cor', label:'Cor', render:(r:any)=><div className="w-4 h-4 rounded" style={{background:r.cor}}></div> },
    { key:'poligono', label:'Polígono', render:(r:any)=>r.poligono?<span className="text-green-400 text-xs">✓ Definido</span>:<span className="text-gray-600 text-xs">Pendente</span> },
    { key:'fe', label:'Fe%', render:(r:any)=>r.fe?<span className="font-mono text-sm">{r.fe.toFixed(1)}%</span>:<span className="text-gray-600">—</span> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Subáreas / Bancadas" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({nome:r.nome,area:r.area||'',material:r.material||'',aplica_todas:r.aplica_todas,cor:r.cor});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Nova Subárea" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Subárea':'Nova Subárea'} width="w-[600px]"
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Identificação">
          <Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Bancada B3-N1" />
          <Switch label="Polígono aplica a TODAS as áreas" checked={form.aplica_todas} onChange={v=>set('aplica_todas',v)} description="Ex: zona de segurança, limite operacional" />
          {!form.aplica_todas && <SmartSelect label="Área Pai" value={form.area} onChange={v=>set('area',v)} required options={areaOptions} canCreate createLabel="Nova Área" createFields={[{key:'nome',label:'Nome da Área',required:true}]} />}
          {!form.aplica_todas && <SmartSelect label="Material" value={form.material} onChange={v=>set('material',v)} options={[{value:'ROM',label:'ROM'},{value:'Estéril',label:'Estéril'},{value:'Minério',label:'Minério'},{value:'Itabirito',label:'Itabirito'}]} canCreate createLabel="Novo Material" createFields={[{key:'nome',label:'Nome',required:true},{key:'codigo',label:'Código',required:true}]} />}
        </FormSection>
        <FormSection title="Polígono (Geofence)">
          <div className="h-48 bg-surface-2 border border-surface-4 rounded-lg flex flex-col items-center justify-center text-sm text-gray-500 gap-2">
            <span>🗺️ Desenhar polígono no editor</span>
            <span className="text-xs text-gray-600">Clique para adicionar pontos. Feche o polígono clicando no primeiro ponto.</span>
            <div className="flex gap-2 mt-2">
              <button className="px-3 py-1 bg-brand-600 text-white text-xs rounded">Desenhar</button>
              <button className="px-3 py-1 bg-surface-3 text-gray-400 text-xs rounded">Importar GeoJSON</button>
            </div>
          </div>
        </FormSection>
        <FormSection title="Visual"><ColorPicker label="Cor no Mapa" value={form.cor} onChange={v=>set('cor',v)} /></FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Subárea removida');setDel(null)}} title="Excluir subárea?" message={`Excluir ${del?.nome}?`} confirmLabel="Excluir" />
  </>)
}