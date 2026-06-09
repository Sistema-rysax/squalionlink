import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'
import { equipamentos as initData } from '../../mock/data'

const empty = { codigo:'', modelo:'', grupo:'', contratada:'', status:'OPERANDO' }

export default function Equipamentos() {
  const [data, setData] = useState(initData)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:string) => setForm((p:any)=>({...p,[k]:v}))

  const save = () => {
    if (!form.codigo||!form.modelo) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Equipamento atualizado') }
    else { setData(p=>[...p,{id:Date.now(),lat:-20.12,lng:-43.99,vel:0,horimetro:0,tanque:100,operador:null,atividade:null,cor:'#22c55e',...form}]); toast('Equipamento criado') }
    setOpen(false)
  }

  const columns = [
    { key:'codigo', label:'Código', render:(r:any)=><span className="text-brand-400 font-bold">{r.codigo}</span> },
    { key:'modelo', label:'Modelo' },
    { key:'grupo', label:'Grupo', render:(r:any)=><span className="px-2 py-0.5 bg-brand-600/10 border border-brand-600/20 rounded text-[10px] text-brand-400">{r.grupo}</span> },
    { key:'status', label:'Status', render:(r:any)=><div className="flex items-center gap-2"><div className={'led led-'+(r.status==='OPERANDO'?'ok':r.status==='PARADO'?'warn':'crit')}></div><span className="text-[10px]">{r.status}</span></div> },
    { key:'operador', label:'Operador', render:(r:any)=>r.operador||<span className="text-dim">—</span> },
    { key:'horimetro', label:'Horímetro', render:(r:any)=><span>{r.horimetro.toLocaleString('pt-BR')}h</span> },
    { key:'tanque', label:'Tanque', render:(r:any)=><span className={r.tanque<30?'text-crit':r.tanque<50?'text-warn':'text-ok'}>{r.tanque}%</span> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Equipamentos" status="ok" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({codigo:r.codigo,modelo:r.modelo,grupo:r.grupo,contratada:r.contratada||'',status:r.status});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Equip" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Equipamento':'Novo Equipamento'} subtitle={editing?.codigo}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300 transition-colors">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Identificação"><FormGrid><Input label="Código" value={form.codigo} onChange={v=>set('codigo',v)} required placeholder="CAT-01" /><Select label="Grupo" value={form.grupo} onChange={v=>set('grupo',v)} required options={[{value:'Caminhão',label:'Caminhão'},{value:'Escavadeira',label:'Escavadeira'},{value:'Motoniveladora',label:'Motoniveladora'},{value:'Perfuratriz',label:'Perfuratriz'},{value:'Trator',label:'Trator'}]} /></FormGrid><Select label="Modelo" value={form.modelo} onChange={v=>set('modelo',v)} required options={[{value:'777G',label:'Caterpillar 777G'},{value:'785D',label:'CAT 785D'},{value:'PC5500',label:'Komatsu PC5500'},{value:'CAT 6060',label:'CAT 6060'},{value:'CAT 16M',label:'CAT 16M'},{value:'CAT D10T',label:'CAT D10T'},{value:'Atlas D65',label:'Atlas Copco D65'}]} /></FormSection>
        <FormSection title="Operação"><Select label="Status" value={form.status} onChange={v=>set('status',v)} options={[{value:'OPERANDO',label:'Operando'},{value:'PARADO',label:'Parado'},{value:'MANUTENCAO',label:'Manutenção'},{value:'INATIVO',label:'Inativo'}]} /><Input label="Contratada" value={form.contratada} onChange={v=>set('contratada',v)} placeholder="Mineradora ABC" /></FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Equipamento removido');setDel(null)}} title="Excluir Equipamento" message={'Excluir '+(del?.codigo||'')+'?'} confirmLabel="Excluir" />
  </>)
}