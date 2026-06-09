import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import StatusBadge from '../../components/ui/StatusBadge'
import { Input, Select, Textarea, FormSection, FormGrid } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import { ordensServico as init } from '../../mock/data'

const empty = { equip:'', tipo:'CORRETIVA', prioridade:'MEDIA', descricao:'', componente:'', dt_previsao:'' }
export default function OrdensServico() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const set = (k:string,v:string)=>setForm(p=>({...p,[k]:v}))
  const save = () => { if (!form.equip||!form.descricao) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('OS atualizada') }
    else { setData(p=>[...p,{id:Date.now(),numero:`OS-2024-${String(p.length+343).padStart(4,'0')}`,...form,status:'ABERTA',dt_abertura:new Date().toISOString()}]); toast('OS criada') } setOpen(false) }
  const columns = [
    { key:'numero', label:'Número', render:(r:any)=><span className="font-mono text-brand-400">{r.numero}</span> },
    { key:'equip', label:'Equipamento' },
    { key:'tipo', label:'Tipo', render:(r:any)=><StatusBadge status={r.tipo} /> },
    { key:'prioridade', label:'Prioridade', render:(r:any)=><span className={`text-xs ${r.prioridade==='ALTA'||r.prioridade==='URGENTE'?'text-red-400':'text-gray-400'}`}>{r.prioridade}</span> },
    { key:'status', label:'Status', render:(r:any)=><StatusBadge status={r.status} /> },
    { key:'descricao', label:'Descrição' },
    { key:'dt_abertura', label:'Abertura', render:(r:any)=>new Date(r.dt_abertura).toLocaleDateString('pt-BR') },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Ordens de Serviço" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({equip:r.equip,tipo:r.tipo,prioridade:r.prioridade,descricao:r.descricao,componente:'',dt_previsao:''});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Nova OS" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar OS':'Nova Ordem de Serviço'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Dados da OS">
          <Select label="Equipamento" value={form.equip} onChange={v=>set('equip',v)} required options={[{value:'CAT-01',label:'CAT-01'},{value:'CAT-02',label:'CAT-02'},{value:'CAT-03',label:'CAT-03'},{value:'ESC-01',label:'ESC-01'},{value:'ESC-02',label:'ESC-02'}]} />
          <FormGrid>
            <Select label="Tipo" value={form.tipo} onChange={v=>set('tipo',v)} required options={[{value:'CORRETIVA',label:'Corretiva'},{value:'PREVENTIVA',label:'Preventiva'}]} />
            <Select label="Prioridade" value={form.prioridade} onChange={v=>set('prioridade',v)} required options={[{value:'BAIXA',label:'Baixa'},{value:'MEDIA',label:'Média'},{value:'ALTA',label:'Alta'},{value:'URGENTE',label:'Urgente'}]} />
          </FormGrid>
          <Textarea label="Descrição do Problema" value={form.descricao} onChange={v=>set('descricao',v)} required rows={4} placeholder="Descreva o problema..." />
          <Input label="Data Prevista" value={form.dt_previsao} onChange={v=>set('dt_previsao',v)} type="date" />
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('OS removida');setDel(null)}} title="Excluir OS?" message={`Excluir ${del?.numero}?`} confirmLabel="Excluir" />
  </>)
}