import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid, Toggle } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, tipo:'VELOCIDADE', condicao:'vel > 50 km/h', severidade:'ALERTA', ativa:true },
  { id:2, tipo:'TEMPERATURA', condicao:'temp_motor > 105°C', severidade:'CRITICO', ativa:true },
  { id:3, tipo:'COMBUSTIVEL', condicao:'tanque < 20%', severidade:'ALERTA', ativa:true },
  { id:4, tipo:'HORIMETRO', condicao:'horimetro >= 500h (preventiva)', severidade:'INFO', ativa:true },
  { id:5, tipo:'CERCA_VIRTUAL', condicao:'fora_area_operacao', severidade:'CRITICO', ativa:false },
  { id:6, tipo:'OCIOSIDADE', condicao:'parado > 30min sem justificativa', severidade:'ALERTA', ativa:true },
]
const empty = { tipo:'VELOCIDADE', condicao:'', severidade:'ALERTA', ativa:true }

export default function RegrasAlerta() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))

  const save = () => {
    if (!form.condicao) { toast('Condição obrigatória','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Regra atualizada') }
    else { setData(p=>[...p,{id:Date.now(),...form}]); toast('Regra criada') }
    setOpen(false)
  }

  const columns = [
    { key:'tipo', label:'Tipo', render:(r:any)=><span className="text-brand-400 font-bold">{r.tipo}</span> },
    { key:'condicao', label:'Condição', render:(r:any)=><span className="font-mono text-xs">{r.condicao}</span> },
    { key:'severidade', label:'Severidade', render:(r:any)=><span className={'px-2 py-0.5 rounded text-[10px] border '+(r.severidade==='CRITICO'?'bg-crit/10 text-crit border-crit/20':r.severidade==='ALERTA'?'bg-warn/10 text-warn border-warn/20':'bg-brand-600/10 text-brand-400 border-brand-600/20')}>{r.severidade}</span> },
    { key:'ativa', label:'Ativa', render:(r:any)=><div className="flex items-center gap-1.5"><div className={'led led-'+(r.ativa?'ok':'crit')}></div><span className="text-[10px]">{r.ativa?'SIM':'NÃO'}</span></div> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Regras de Alerta" status="warn" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({tipo:r.tipo,condicao:r.condicao,severidade:r.severidade,ativa:r.ativa});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Nova Regra" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Regra':'Nova Regra'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Definição"><Select label="Tipo" value={form.tipo} onChange={v=>set('tipo',v)} options={[{value:'VELOCIDADE',label:'Velocidade'},{value:'TEMPERATURA',label:'Temperatura'},{value:'COMBUSTIVEL',label:'Combustível'},{value:'HORIMETRO',label:'Horímetro'},{value:'CERCA_VIRTUAL',label:'Cerca Virtual'},{value:'OCIOSIDADE',label:'Ociosidade'}]} /><Input label="Condição" value={form.condicao} onChange={v=>set('condicao',v)} required placeholder="vel > 50 km/h" /></FormSection>
        <FormSection title="Configuração"><Select label="Severidade" value={form.severidade} onChange={v=>set('severidade',v)} options={[{value:'INFO',label:'Info'},{value:'ALERTA',label:'Alerta'},{value:'CRITICO',label:'Crítico'}]} /><Toggle label="Regra Ativa" checked={form.ativa} onChange={v=>set('ativa',v)} /></FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Regra removida');setDel(null)}} title="Excluir Regra" message={'Excluir regra de '+(del?.tipo||'')+'?'} confirmLabel="Excluir" />
  </>)
}
