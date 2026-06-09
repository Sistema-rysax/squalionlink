import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid, ColorPicker } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  {id:1,codigo:'TRANSP_CHEIO',nome:'Transporte Cheio',tipo:'PRODUTIVA',cor:'#22c55e',vel_min:5,vel_max:60},
  {id:2,codigo:'TRANSP_VAZIO',nome:'Transporte Vazio',tipo:'PRODUTIVA',cor:'#06b6d4',vel_min:5,vel_max:60},
  {id:3,codigo:'CARREGAMENTO',nome:'Carregamento',tipo:'PRODUTIVA',cor:'#2563eb',vel_min:0,vel_max:3},
  {id:4,codigo:'FILA_CARGA',nome:'Fila de Carga',tipo:'IMPRODUTIVA',cor:'#f59e0b',vel_min:0,vel_max:2},
  {id:5,codigo:'MANOBRA',nome:'Manobra',tipo:'AUXILIAR',cor:'#a855f7',vel_min:0,vel_max:10},
  {id:6,codigo:'MANUT_CORR',nome:'Manutenção Corretiva',tipo:'IMPRODUTIVA',cor:'#ef4444',vel_min:0,vel_max:0},
]
const empty = {codigo:'',nome:'',tipo:'PRODUTIVA',cor:'#22c55e',vel_min:'',vel_max:''}

export default function Atividades() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))
  const save = () => {
    if (!form.codigo||!form.nome) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form,vel_min:+form.vel_min,vel_max:+form.vel_max}:r)); toast('Atividade atualizada') }
    else { setData(p=>[...p,{id:Date.now(),...form,vel_min:+form.vel_min||0,vel_max:+form.vel_max||0}]); toast('Atividade criada') }
    setOpen(false)
  }
  const columns = [
    { key:'codigo', label:'Código', render:(r:any)=><span className="font-bold">{r.codigo}</span> },
    { key:'nome', label:'Nome' },
    { key:'tipo', label:'Tipo', render:(r:any)=><span className={'px-2 py-0.5 rounded text-[10px] '+(r.tipo==='PRODUTIVA'?'bg-ok/10 text-ok border border-ok/20':r.tipo==='IMPRODUTIVA'?'bg-warn/10 text-warn border border-warn/20':'bg-info/10 text-info border border-info/20')}>{r.tipo}</span> },
    { key:'cor', label:'Cor', render:(r:any)=><div className="w-4 h-4 rounded-full" style={{background:r.cor}}></div> },
    { key:'vel', label:'Velocidade', render:(r:any)=><span>{r.vel_min}–{r.vel_max} km/h</span> },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Atividades" status="info" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({codigo:r.codigo,nome:r.nome,tipo:r.tipo,cor:r.cor,vel_min:String(r.vel_min),vel_max:String(r.vel_max)});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Nova Atividade" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Atividade':'Nova Atividade'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Dados"><FormGrid><Input label="Código" value={form.codigo} onChange={v=>set('codigo',v)} required /><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required /></FormGrid><Select label="Tipo" value={form.tipo} onChange={v=>set('tipo',v)} options={[{value:'PRODUTIVA',label:'Produtiva'},{value:'IMPRODUTIVA',label:'Improdutiva'},{value:'AUXILIAR',label:'Auxiliar'}]} /></FormSection>
        <FormSection title="Regras de Velocidade"><FormGrid><Input label="Vel. Mín (km/h)" value={form.vel_min} onChange={v=>set('vel_min',v)} type="number" /><Input label="Vel. Máx (km/h)" value={form.vel_max} onChange={v=>set('vel_max',v)} type="number" /></FormGrid></FormSection>
        <FormSection title="Visual"><ColorPicker label="Cor" value={form.cor} onChange={v=>set('cor',v)} /></FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Atividade removida');setDel(null)}} title="Excluir Atividade" message={'Excluir '+(del?.nome||'')+'?'} confirmLabel="Excluir" />
  </>)
}