import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  {id:1,equip:'CAT-01',litros:580,combustivel:'Diesel S10',posto:'Central',horimetro:12440,dt:'09/06 07:30',operador:'João Silva'},
  {id:2,equip:'CAT-04',litros:620,combustivel:'Diesel S10',posto:'Comboio 01',horimetro:9800,dt:'07/06 14:15',operador:'Pedro Costa'},
  {id:3,equip:'ESC-01',litros:450,combustivel:'Diesel S10',posto:'Central',horimetro:8900,dt:'08/06 06:00',operador:'Ana Souza'},
  {id:4,equip:'CAT-05',litros:590,combustivel:'Diesel S10',posto:'Central',horimetro:10500,dt:'06/06 18:20',operador:'Roberto Lima'},
]
const empty = {equip:'',litros:'',combustivel:'Diesel S10',posto:'Central',horimetro:''}

export default function Abastecimento() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:string) => setForm((p:any)=>({...p,[k]:v}))
  const save = () => {
    if (!form.equip||!form.litros) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form,litros:+form.litros,horimetro:+form.horimetro}:r)); toast('Registro atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,litros:+form.litros,horimetro:+form.horimetro||0,operador:'—',dt:new Date().toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}]); toast('Abastecimento registrado') }
    setOpen(false)
  }
  const columns = [
    { key:'equip', label:'Equipamento', render:(r:any)=><span className="text-brand-400 font-bold">{r.equip}</span> },
    { key:'litros', label:'Litros', render:(r:any)=><span className="text-ok font-bold">{r.litros} L</span> },
    { key:'combustivel', label:'Combustível' },
    { key:'posto', label:'Posto' },
    { key:'horimetro', label:'Horímetro', render:(r:any)=><span>{r.horimetro.toLocaleString('pt-BR')}h</span> },
    { key:'dt', label:'Data/Hora' },
    { key:'operador', label:'Operador' },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Abastecimentos" status="info" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({equip:r.equip,litros:String(r.litros),combustivel:r.combustivel,posto:r.posto,horimetro:String(r.horimetro)});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Registrar" />
    <Drawer open={open} onClose={()=>setOpen(false)} title="Registrar Abastecimento"
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6"><FormSection title="Dados"><Select label="Equipamento" value={form.equip} onChange={v=>set('equip',v)} required options={[{value:'CAT-01',label:'CAT-01'},{value:'CAT-02',label:'CAT-02'},{value:'CAT-03',label:'CAT-03'},{value:'CAT-04',label:'CAT-04'},{value:'CAT-05',label:'CAT-05'},{value:'ESC-01',label:'ESC-01'},{value:'ESC-02',label:'ESC-02'}]} /><FormGrid><Input label="Litros" value={form.litros} onChange={v=>set('litros',v)} type="number" required /><Input label="Horímetro" value={form.horimetro} onChange={v=>set('horimetro',v)} type="number" /></FormGrid><FormGrid><Select label="Combustível" value={form.combustivel} onChange={v=>set('combustivel',v)} options={[{value:'Diesel S10',label:'Diesel S10'},{value:'Diesel S500',label:'Diesel S500'}]} /><Select label="Posto" value={form.posto} onChange={v=>set('posto',v)} options={[{value:'Central',label:'Central'},{value:'Comboio 01',label:'Comboio 01'},{value:'Comboio 02',label:'Comboio 02'}]} /></FormGrid></FormSection></div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Registro removido');setDel(null)}} title="Excluir Registro" message="Excluir este abastecimento?" confirmLabel="Excluir" />
  </>)
}