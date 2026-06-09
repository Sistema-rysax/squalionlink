import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import StatusBadge from '../../components/ui/StatusBadge'
import { Input, Select, FormSection, FormGrid, Switch } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, nome:'Revisão 500h', modelos:'CAT 777G', gatilho:'HORIMETRO', intervalo:500, ultima:'2024-05-20', proxima:'2024-06-15', itens:12, status:'PROGRAMADA' },
  { id:2, nome:'Troca de Óleo', modelos:'Todos', gatilho:'HORIMETRO', intervalo:250, ultima:'2024-06-01', proxima:'2024-06-20', itens:5, status:'PROGRAMADA' },
  { id:3, nome:'Inspeção Anual', modelos:'Komatsu PC5500', gatilho:'CALENDARIO', intervalo:365, ultima:'2024-01-10', proxima:'2025-01-10', itens:28, status:'PROGRAMADA' },
  { id:4, nome:'Troca Filtros', modelos:'CAT 777G', gatilho:'HORIMETRO', intervalo:1000, ultima:'2024-04-01', proxima:'2024-07-01', itens:8, status:'PROGRAMADA' },
]
const empty = { nome:'', modelos:'', gatilho:'HORIMETRO', intervalo:'', gerar_os_auto:true }

export default function PlanoPreventivo() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))
  const save = () => {
    if (!form.nome||!form.intervalo) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,nome:form.nome,gatilho:form.gatilho,intervalo:+form.intervalo}:r)); toast('Plano atualizado') }
    else { setData(p=>[...p,{id:Date.now(),nome:form.nome,modelos:form.modelos||'—',gatilho:form.gatilho,intervalo:+form.intervalo,ultima:'—',proxima:'—',itens:0,status:'PROGRAMADA'}]); toast('Plano criado') }
    setOpen(false)
  }
  const columns = [
    { key:'nome', label:'Nome' },
    { key:'modelos', label:'Modelos' },
    { key:'gatilho', label:'Gatilho', render:(r:any)=><span className="px-2 py-0.5 bg-surface-3 rounded text-xs">{r.gatilho}</span> },
    { key:'intervalo', label:'Intervalo', render:(r:any)=>r.gatilho==='HORIMETRO'?r.intervalo+'h':r.intervalo+' dias' },
    { key:'itens', label:'Itens' },
    { key:'proxima', label:'Próxima' },
    { key:'status', label:'Status', render:(r:any)=><StatusBadge status={r.status} /> },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Planos de Manutenção Preventiva" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({nome:r.nome,modelos:r.modelos,gatilho:r.gatilho,intervalo:String(r.intervalo),gerar_os_auto:true});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Plano" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Plano':'Novo Plano Preventivo'} width="w-[640px]"
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Identificação">
          <Input label="Nome do Plano" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Revisão 500h" />
          <Select label="Modelos Aplicáveis" value={form.modelos} onChange={v=>set('modelos',v)} options={[{value:'CAT 777G',label:'CAT 777G'},{value:'Komatsu PC5500',label:'Komatsu PC5500'},{value:'Todos',label:'Todos os modelos'}]} />
        </FormSection>
        <FormSection title="Gatilho">
          <FormGrid>
            <Select label="Tipo de Gatilho" value={form.gatilho} onChange={v=>set('gatilho',v)} required options={[{value:'HORIMETRO',label:'Horímetro (horas)'},{value:'CALENDARIO',label:'Calendário (dias)'},{value:'ODOMETRO',label:'Odômetro (km)'}]} />
            <Input label={form.gatilho==='HORIMETRO'?'Intervalo (h)':form.gatilho==='CALENDARIO'?'Intervalo (dias)':'Intervalo (km)'} value={form.intervalo} onChange={v=>set('intervalo',v)} type="number" required placeholder="500" />
          </FormGrid>
        </FormSection>
        <FormSection title="Comportamento">
          <Switch label="Gerar OS automaticamente" checked={form.gerar_os_auto} onChange={v=>set('gerar_os_auto',v)} description="Ao atingir o gatilho, criar OS com status PROGRAMADA automaticamente" />
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Plano removido');setDel(null)}} title="Excluir plano?" message={`Excluir ${del?.nome}?`} confirmLabel="Excluir" />
  </>)
}