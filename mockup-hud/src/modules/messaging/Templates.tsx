import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid, Toggle, Textarea } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, nome:'Aviso Troca Turno', categoria:'OPERACAO', prioridade:'NORMAL', variaveis:'{operador}, {turno}', requer_confirmacao:false },
  { id:2, nome:'Alerta Velocidade', categoria:'SEGURANCA', prioridade:'ALTA', variaveis:'{equip}, {vel_atual}', requer_confirmacao:true },
  { id:3, nome:'Ordem de Deslocamento', categoria:'DISPATCH', prioridade:'NORMAL', variaveis:'{equip}, {destino}', requer_confirmacao:true },
  { id:4, nome:'Evacuação Área', categoria:'EMERGENCIA', prioridade:'URGENTE', variaveis:'{area}', requer_confirmacao:true },
  { id:5, nome:'Checklist Pendente', categoria:'OPERACAO', prioridade:'NORMAL', variaveis:'{equip}, {checklist}', requer_confirmacao:false },
]
const empty = { nome:'', categoria:'OPERACAO', prioridade:'NORMAL', variaveis:'', requer_confirmacao:false, corpo:'' }

export default function Templates() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))

  const save = () => {
    if (!form.nome) { toast('Nome obrigatório','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Template atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form}]); toast('Template criado') }
    setOpen(false)
  }

  const columns = [
    { key:'nome', label:'Nome', render:(r:any)=><span className="text-brand-400 font-bold">{r.nome}</span> },
    { key:'categoria', label:'Categoria', render:(r:any)=><span className="px-2 py-0.5 rounded text-[10px] bg-brand-600/10 text-brand-400 border border-brand-600/20">{r.categoria}</span> },
    { key:'prioridade', label:'Prioridade', render:(r:any)=><span className={'px-2 py-0.5 rounded text-[10px] border '+(r.prioridade==='URGENTE'?'bg-crit/10 text-crit border-crit/20':r.prioridade==='ALTA'?'bg-warn/10 text-warn border-warn/20':'bg-white/5 text-dim border-hud-border')}>{r.prioridade}</span> },
    { key:'variaveis', label:'Variáveis', render:(r:any)=><span className="font-mono text-[10px] text-dim">{r.variaveis}</span> },
    { key:'requer_confirmacao', label:'Confirmação', render:(r:any)=><div className="flex items-center gap-1.5"><div className={'led led-'+(r.requer_confirmacao?'warn':'ok')}></div><span className="text-[10px]">{r.requer_confirmacao?'SIM':'NÃO'}</span></div> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Templates de Mensagem" status="info" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({nome:r.nome,categoria:r.categoria,prioridade:r.prioridade,variaveis:r.variaveis,requer_confirmacao:r.requer_confirmacao,corpo:''});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Template" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Template':'Novo Template'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Dados"><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required /><FormGrid><Select label="Categoria" value={form.categoria} onChange={v=>set('categoria',v)} options={[{value:'OPERACAO',label:'Operação'},{value:'SEGURANCA',label:'Segurança'},{value:'DISPATCH',label:'Dispatch'},{value:'EMERGENCIA',label:'Emergência'}]} /><Select label="Prioridade" value={form.prioridade} onChange={v=>set('prioridade',v)} options={[{value:'NORMAL',label:'Normal'},{value:'ALTA',label:'Alta'},{value:'URGENTE',label:'Urgente'}]} /></FormGrid></FormSection>
        <FormSection title="Conteúdo"><Textarea label="Corpo da Mensagem" value={form.corpo} onChange={v=>set('corpo',v)} placeholder="Olá {operador}, dirija-se para {destino}..." rows={4} /><Input label="Variáveis" value={form.variaveis} onChange={v=>set('variaveis',v)} placeholder="{equip}, {destino}" /></FormSection>
        <FormSection title="Opções"><Toggle label="Requer Confirmação" checked={form.requer_confirmacao} onChange={v=>set('requer_confirmacao',v)} description="Operador deve confirmar leitura" /></FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Template removido');setDel(null)}} title="Excluir Template" message={'Excluir '+(del?.nome||'')+'?'} confirmLabel="Excluir" />
  </>)
}
