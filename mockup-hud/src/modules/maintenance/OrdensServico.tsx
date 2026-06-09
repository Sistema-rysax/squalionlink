import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, Textarea, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  {id:1,numero:'OS-2024-0340',equip:'CAT-03',tipo:'CORRETIVA',prioridade:'ALTA',status:'ABERTA',descricao:'Temperatura motor elevada',dt:'2024-06-09'},
  {id:2,numero:'OS-2024-0339',equip:'CAT-01',tipo:'PREVENTIVA',prioridade:'MEDIA',status:'EM_EXECUCAO',descricao:'Troca filtro de óleo - 500h',dt:'2024-06-08'},
  {id:3,numero:'OS-2024-0338',equip:'ESC-02',tipo:'PREVENTIVA',prioridade:'BAIXA',status:'CONCLUIDA',descricao:'Lubrificação geral',dt:'2024-06-07'},
  {id:4,numero:'OS-2024-0337',equip:'CAT-05',tipo:'CORRETIVA',prioridade:'CRITICA',status:'ABERTA',descricao:'Vazamento hidráulico',dt:'2024-06-09'},
]
const empty = {equip:'',tipo:'CORRETIVA',prioridade:'MEDIA',descricao:''}

export default function OrdensServico() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:string) => setForm((p:any)=>({...p,[k]:v}))
  const save = () => {
    if (!form.equip||!form.descricao) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('OS atualizada') }
    else { setData(p=>[...p,{id:Date.now(),numero:'OS-2024-0'+Math.floor(Math.random()*900+100),...form,status:'ABERTA',dt:new Date().toISOString().slice(0,10)}]); toast('OS criada') }
    setOpen(false)
  }
  const prioColor = (p:string) => p==='CRITICA'?'text-crit bg-crit/10 border-crit/20':p==='ALTA'?'text-warn bg-warn/10 border-warn/20':p==='MEDIA'?'text-brand-400 bg-brand-600/10 border-brand-600/20':'text-dim bg-white/5 border-hud-border'
  const statusColor = (s:string) => s==='ABERTA'?'led-warn':s==='EM_EXECUCAO'?'led-ok':'led-off'
  const columns = [
    { key:'numero', label:'Número', render:(r:any)=><span className="text-brand-400 font-bold">{r.numero}</span> },
    { key:'equip', label:'Equipamento', render:(r:any)=><span className="font-bold">{r.equip}</span> },
    { key:'tipo', label:'Tipo', render:(r:any)=><span className={'px-2 py-0.5 rounded text-[10px] border '+(r.tipo==='CORRETIVA'?'text-crit bg-crit/10 border-crit/20':'text-info bg-info/10 border-info/20')}>{r.tipo}</span> },
    { key:'prioridade', label:'Prioridade', render:(r:any)=><span className={'px-2 py-0.5 rounded text-[10px] border '+prioColor(r.prioridade)}>{r.prioridade}</span> },
    { key:'status', label:'Status', render:(r:any)=><div className="flex items-center gap-2"><div className={'led '+statusColor(r.status)}></div><span className="text-[10px]">{r.status.replace('_',' ')}</span></div> },
    { key:'dt', label:'Data' },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Ordens de Serviço" status={data.some(o=>o.prioridade==='CRITICA'&&o.status==='ABERTA')?'crit':'warn'} onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({equip:r.equip,tipo:r.tipo,prioridade:r.prioridade,descricao:r.descricao});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Nova OS" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar OS':'Nova Ordem de Serviço'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6"><FormSection title="Dados"><Select label="Equipamento" value={form.equip} onChange={v=>set('equip',v)} required options={[{value:'CAT-01',label:'CAT-01'},{value:'CAT-02',label:'CAT-02'},{value:'CAT-03',label:'CAT-03'},{value:'CAT-04',label:'CAT-04'},{value:'CAT-05',label:'CAT-05'},{value:'ESC-01',label:'ESC-01'},{value:'ESC-02',label:'ESC-02'}]} /><FormGrid><Select label="Tipo" value={form.tipo} onChange={v=>set('tipo',v)} options={[{value:'CORRETIVA',label:'Corretiva'},{value:'PREVENTIVA',label:'Preventiva'}]} /><Select label="Prioridade" value={form.prioridade} onChange={v=>set('prioridade',v)} options={[{value:'CRITICA',label:'Crítica'},{value:'ALTA',label:'Alta'},{value:'MEDIA',label:'Média'},{value:'BAIXA',label:'Baixa'}]} /></FormGrid></FormSection><FormSection title="Descrição"><Textarea label="Descrição do Serviço" value={form.descricao} onChange={v=>set('descricao',v)} placeholder="Descreva o problema..." /></FormSection></div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('OS removida');setDel(null)}} title="Excluir OS" message={'Excluir '+(del?.numero||'')+'?'} confirmLabel="Excluir" />
  </>)
}