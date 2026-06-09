import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import StatusBadge from '../../components/ui/StatusBadge'
import { Input, Select, FormSection, FormGrid } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import { Cpu } from 'lucide-react'

const init = [
  { id:1, sn:'HW-GPS-001', tipo:'GPS', modelo:'Teltonika FMC130', firmware:'v3.28.1', status:'INSTALADO', equip:'CAT-01', tenant:'Mineradora ABC' },
  { id:2, sn:'HW-GPS-002', tipo:'GPS', modelo:'Teltonika FMC130', firmware:'v3.28.1', status:'INSTALADO', equip:'CAT-02', tenant:'Mineradora ABC' },
  { id:3, sn:'HW-TAB-001', tipo:'Tablet', modelo:'Samsung Tab Active4', firmware:'Android 13', status:'INSTALADO', equip:'CAT-01', tenant:'Mineradora ABC' },
  { id:4, sn:'HW-GPS-010', tipo:'GPS', modelo:'Teltonika FMC130', firmware:'v3.28.1', status:'ESTOQUE', equip:null, tenant:null },
  { id:5, sn:'HW-CAM-001', tipo:'Câmera', modelo:'Hikvision DS-2CD', firmware:'v5.7.1', status:'INSTALADO', equip:'ESC-01', tenant:'Mineradora ABC' },
  { id:6, sn:'HW-TAB-005', tipo:'Tablet', modelo:'Samsung Tab Active4', firmware:'Android 13', status:'MANUTENCAO', equip:null, tenant:null },
]
const empty = { sn:'', tipo:'GPS', modelo:'', firmware:'' }

export default function Hardware() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))
  const save = () => {
    if (!form.sn||!form.tipo) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Hardware atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,status:'ESTOQUE',equip:null,tenant:null}]); toast('Hardware registrado') }
    setOpen(false)
  }
  const columns = [
    { key:'sn', label:'Nº Série', render:(r:any)=><span className="font-mono text-brand-400 flex items-center gap-2"><Cpu className="w-3.5 h-3.5"/>{r.sn}</span> },
    { key:'tipo', label:'Tipo' },
    { key:'modelo', label:'Modelo' },
    { key:'firmware', label:'Firmware', render:(r:any)=><span className="text-xs text-gray-500">{r.firmware}</span> },
    { key:'status', label:'Status', render:(r:any)=><StatusBadge status={r.status} /> },
    { key:'equip', label:'Equipamento', render:(r:any)=>r.equip||<span className="text-gray-600">—</span> },
    { key:'tenant', label:'Cliente', render:(r:any)=>r.tenant||<span className="text-gray-600">—</span> },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Hardware (Plataforma Rysax)" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({sn:r.sn,tipo:r.tipo,modelo:r.modelo,firmware:r.firmware});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Hardware" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Hardware':'Registrar Hardware'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Dados do Device">
          <Input label="Número de Série" value={form.sn} onChange={v=>set('sn',v)} required placeholder="HW-GPS-001" />
          <FormGrid><Select label="Tipo" value={form.tipo} onChange={v=>set('tipo',v)} required options={[{value:'GPS',label:'GPS Tracker'},{value:'Tablet',label:'Tablet'},{value:'Câmera',label:'Câmera'},{value:'Sensor',label:'Sensor'}]} /><Input label="Modelo" value={form.modelo} onChange={v=>set('modelo',v)} placeholder="Teltonika FMC130" /></FormGrid>
          <Input label="Firmware" value={form.firmware} onChange={v=>set('firmware',v)} placeholder="v3.28.1" />
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Hardware removido');setDel(null)}} title="Descartar hardware?" message={`Remover ${del?.sn}?`} confirmLabel="Remover" />
  </>)
}