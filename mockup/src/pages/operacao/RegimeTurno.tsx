import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import StatusBadge from '../../components/ui/StatusBadge'
import { Input, Select, FormSection, FormGrid } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, nome:'Regime Padrão Mina', tipo:'FIXO', turnos:'A, B', equips_vinculados:8, dt_inicio:'2024-01-01', dt_fim:null },
  { id:2, nome:'Regime 5x1 Escavadeiras', tipo:'CICLICO', turnos:'A, B', equips_vinculados:2, dt_inicio:'2024-01-01', dt_fim:null },
  { id:3, nome:'Regime Apoio', tipo:'FIXO', turnos:'C', equips_vinculados:3, dt_inicio:'2024-03-01', dt_fim:null },
]
const empty = { nome:'', tipo:'FIXO', turnos_selecionados:'', dt_inicio:'', dt_fim:'', dias_trabalho:'5', dias_folga:'1' }

export default function RegimeTurno() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))

  const save = () => {
    if (!form.nome||!form.tipo||!form.dt_inicio) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,nome:form.nome,tipo:form.tipo,dt_inicio:form.dt_inicio,dt_fim:form.dt_fim||null}:r)); toast('Regime atualizado') }
    else { setData(p=>[...p,{id:Date.now(),nome:form.nome,tipo:form.tipo,turnos:'A, B',equips_vinculados:0,dt_inicio:form.dt_inicio,dt_fim:form.dt_fim||null}]); toast('Regime criado') }
    setOpen(false)
  }

  const columns = [
    { key:'nome', label:'Nome' },
    { key:'tipo', label:'Tipo', render:(r:any)=><StatusBadge status={r.tipo} /> },
    { key:'turnos', label:'Turnos' },
    { key:'equips_vinculados', label:'Equipamentos' },
    { key:'dt_inicio', label:'Vigência', render:(r:any)=><span className="text-xs">{r.dt_inicio} → {r.dt_fim||'∞'}</span> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Regimes de Turno" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({nome:r.nome,tipo:r.tipo,turnos_selecionados:r.turnos,dt_inicio:r.dt_inicio,dt_fim:r.dt_fim||'',dias_trabalho:'5',dias_folga:'1'});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Regime" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Regime':'Novo Regime'} width="w-[640px]"
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Identificação">
          <Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Regime Padrão Mina" />
          <Select label="Tipo" value={form.tipo} onChange={v=>set('tipo',v)} required options={[{value:'FIXO',label:'Fixo (mesmos turnos todo dia)'},{value:'CICLICO',label:'Cíclico (alternância programada)'},{value:'CUSTOMIZADO',label:'Customizado (calendário manual)'}]} />
        </FormSection>
        <FormSection title="Vigência">
          <FormGrid><Input label="Data Início" value={form.dt_inicio} onChange={v=>set('dt_inicio',v)} type="date" required /><Input label="Data Fim (vazio = indefinido)" value={form.dt_fim} onChange={v=>set('dt_fim',v)} type="date" /></FormGrid>
        </FormSection>
        {form.tipo==='CICLICO' && <FormSection title="Ciclo">
          <FormGrid><Input label="Dias de Trabalho" value={form.dias_trabalho} onChange={v=>set('dias_trabalho',v)} type="number" /><Input label="Dias de Folga" value={form.dias_folga} onChange={v=>set('dias_folga',v)} type="number" /></FormGrid>
        </FormSection>}
        <FormSection title="Preview do Calendário">
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d=><span key={d} className="text-xs text-gray-600 font-medium">{d}</span>)}
            {Array.from({length:28},(_,i)=><div key={i} className={`h-8 rounded flex items-center justify-center text-xs ${i%7<5?'bg-blue-900/20 text-blue-400':'bg-surface-3 text-gray-600'}`}>{i+1}</div>)}
          </div>
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Regime removido');setDel(null)}} title="Excluir regime?" message={`Excluir ${del?.nome}?`} confirmLabel="Excluir" />
  </>)
}