import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid, ColorPicker } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, nome:'Turno A (Diurno)', codigo:'A', hora_inicio:'06:00', hora_fim:'18:00', cor:'#3b82f6', cruza_meia_noite:false, operadores:8 },
  { id:2, nome:'Turno B (Noturno)', codigo:'B', hora_inicio:'18:00', hora_fim:'06:00', cor:'#6366f1', cruza_meia_noite:true, operadores:6 },
  { id:3, nome:'Turno C (Administrativo)', codigo:'C', hora_inicio:'08:00', hora_fim:'17:00', cor:'#22c55e', cruza_meia_noite:false, operadores:3 },
]
const empty = { nome:'', codigo:'', hora_inicio:'', hora_fim:'', cor:'#3b82f6' }

export default function Turnos() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))

  const save = () => {
    if (!form.nome||!form.codigo||!form.hora_inicio||!form.hora_fim) { toast('Campos obrigatórios','error'); return }
    if (form.hora_inicio===form.hora_fim) { toast('Início e fim não podem ser iguais','error'); return }
    const cruza = form.hora_fim < form.hora_inicio
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form,cruza_meia_noite:cruza}:r)); toast('Turno atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,cruza_meia_noite:cruza,operadores:0}]); toast('Turno criado') }
    setOpen(false)
  }

  const columns = [
    { key:'codigo', label:'Código', render:(r:any)=><span className="px-2 py-0.5 rounded text-xs font-bold" style={{background:r.cor+'30',color:r.cor}}>{r.codigo}</span> },
    { key:'nome', label:'Nome' },
    { key:'hora_inicio', label:'Início', render:(r:any)=><span className="font-mono text-sm">{r.hora_inicio}</span> },
    { key:'hora_fim', label:'Fim', render:(r:any)=><span className="font-mono text-sm">{r.hora_fim}</span> },
    { key:'cruza_meia_noite', label:'Cruza 00h', render:(r:any)=>r.cruza_meia_noite?<span className="text-yellow-400 text-xs">🌙 Sim</span>:<span className="text-gray-600 text-xs">Não</span> },
    { key:'operadores', label:'Operadores' },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Turnos" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({nome:r.nome,codigo:r.codigo,hora_inicio:r.hora_inicio,hora_fim:r.hora_fim,cor:r.cor});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Turno" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Turno':'Novo Turno'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Identificação">
          <FormGrid><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Turno A (Diurno)" /><Input label="Código" value={form.codigo} onChange={v=>set('codigo',v)} required placeholder="A" /></FormGrid>
        </FormSection>
        <FormSection title="Horários">
          <FormGrid><Input label="Hora Início" value={form.hora_inicio} onChange={v=>set('hora_inicio',v)} type="time" required /><Input label="Hora Fim" value={form.hora_fim} onChange={v=>set('hora_fim',v)} type="time" required /></FormGrid>
          {form.hora_inicio && form.hora_fim && form.hora_fim < form.hora_inicio && <p className="text-xs text-yellow-400 bg-yellow-900/20 px-3 py-2 rounded">🌙 Este turno cruza a meia-noite</p>}
        </FormSection>
        <FormSection title="Visual"><ColorPicker label="Cor" value={form.cor} onChange={v=>set('cor',v)} /></FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Turno removido');setDel(null)}} title="Excluir turno?" message={`Excluir ${del?.nome}? Verifique se não está em uso.`} confirmLabel="Excluir" />
  </>)
}