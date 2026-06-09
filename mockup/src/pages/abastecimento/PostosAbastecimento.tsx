import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, nome:'Central', tipo:'FIXO', capacidade:50000, nivel_atual:72, area:'Base Mina', abast_mes:85 },
  { id:2, nome:'Comboio 01', tipo:'COMBOIO', capacidade:15000, nivel_atual:45, area:'—', abast_mes:42 },
  { id:3, nome:'Comboio 02', tipo:'COMBOIO', capacidade:15000, nivel_atual:88, area:'—', abast_mes:38 },
  { id:4, nome:'Posto Norte', tipo:'FIXO', capacidade:30000, nivel_atual:56, area:'Frente Norte', abast_mes:62 },
]
const empty = { nome:'', tipo:'FIXO', capacidade:'', equip_comboio:'' }

export default function PostosAbastecimento() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))
  const save = () => {
    if (!form.nome||!form.tipo) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,nome:form.nome,tipo:form.tipo,capacidade:+form.capacidade}:r)); toast('Posto atualizado') }
    else { setData(p=>[...p,{id:Date.now(),nome:form.nome,tipo:form.tipo,capacidade:+form.capacidade,nivel_atual:100,area:'—',abast_mes:0}]); toast('Posto criado') }
    setOpen(false)
  }
  const columns = [
    { key:'nome', label:'Nome' },
    { key:'tipo', label:'Tipo', render:(r:any)=><span className={`px-2 py-0.5 rounded text-xs ${r.tipo==='FIXO'?'bg-blue-900/30 text-blue-400':'bg-purple-900/30 text-purple-400'}`}>{r.tipo}</span> },
    { key:'capacidade', label:'Capacidade', render:(r:any)=>(r.capacidade/1000).toFixed(0)+'k L' },
    { key:'nivel_atual', label:'Nível', render:(r:any)=>(
      <div className="flex items-center gap-2"><div className="w-20 h-2 bg-surface-3 rounded-full overflow-hidden"><div className={`h-full rounded-full ${r.nivel_atual>30?'bg-green-500':r.nivel_atual>15?'bg-yellow-500':'bg-red-500'}`} style={{width:r.nivel_atual+'%'}}></div></div><span className="text-xs text-gray-500">{r.nivel_atual}%</span></div>
    )},
    { key:'abast_mes', label:'Abast./mês' },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Postos de Abastecimento" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({nome:r.nome,tipo:r.tipo,capacidade:String(r.capacidade),equip_comboio:''});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Posto" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Posto':'Novo Posto'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Identificação">
          <Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Central" />
          <Select label="Tipo" value={form.tipo} onChange={v=>set('tipo',v)} required options={[{value:'FIXO',label:'Fixo (tanque estacionário)'},{value:'COMBOIO',label:'Comboio (caminhão-tanque)'}]} />
          <Input label="Capacidade Total (L)" value={form.capacidade} onChange={v=>set('capacidade',v)} type="number" placeholder="50000" />
          {form.tipo==='COMBOIO' && <Select label="Equipamento (comboio)" value={form.equip_comboio} onChange={v=>set('equip_comboio',v)} options={[{value:'COMB-01',label:'COMB-01 — Scania P310'},{value:'COMB-02',label:'COMB-02 — Volvo VM270'}]} />}
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Posto removido');setDel(null)}} title="Excluir posto?" message={`Excluir ${del?.nome}?`} confirmLabel="Excluir" />
  </>)
}