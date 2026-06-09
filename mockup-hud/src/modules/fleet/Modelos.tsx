import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, nome:'777G', fabricante:'Caterpillar', tipo_operacao:'TRANSPORTE', capacidade_carga:98 },
  { id:2, nome:'785D', fabricante:'Caterpillar', tipo_operacao:'TRANSPORTE', capacidade_carga:136 },
  { id:3, nome:'PC5500', fabricante:'Komatsu', tipo_operacao:'ESCAVACAO', capacidade_carga:0 },
  { id:4, nome:'CAT 6060', fabricante:'Caterpillar', tipo_operacao:'ESCAVACAO', capacidade_carga:0 },
  { id:5, nome:'CAT 16M', fabricante:'Caterpillar', tipo_operacao:'APOIO', capacidade_carga:0 },
  { id:6, nome:'CAT D10T', fabricante:'Caterpillar', tipo_operacao:'APOIO', capacidade_carga:0 },
  { id:7, nome:'Atlas D65', fabricante:'Atlas Copco', tipo_operacao:'PERFURACAO', capacidade_carga:0 },
]
const empty = { nome:'', fabricante:'', tipo_operacao:'TRANSPORTE', capacidade_carga:'' }

export default function Modelos() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))

  const save = () => {
    if (!form.nome||!form.fabricante) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form,capacidade_carga:+form.capacidade_carga||0}:r)); toast('Modelo atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,capacidade_carga:+form.capacidade_carga||0}]); toast('Modelo criado') }
    setOpen(false)
  }

  const columns = [
    { key:'nome', label:'Nome', render:(r:any)=><span className="text-brand-400 font-bold">{r.nome}</span> },
    { key:'fabricante', label:'Fabricante' },
    { key:'tipo_operacao', label:'Tipo Operação', render:(r:any)=><span className="px-2 py-0.5 rounded text-[10px] bg-brand-600/10 text-brand-400 border border-brand-600/20">{r.tipo_operacao}</span> },
    { key:'capacidade_carga', label:'Capacidade (ton)', render:(r:any)=><span className="font-mono">{r.capacidade_carga||'—'}</span> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Modelos" status="info" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({nome:r.nome,fabricante:r.fabricante,tipo_operacao:r.tipo_operacao,capacidade_carga:String(r.capacidade_carga)});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Modelo" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Modelo':'Novo Modelo'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Identificação"><FormGrid><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="777G" /><Input label="Fabricante" value={form.fabricante} onChange={v=>set('fabricante',v)} required placeholder="Caterpillar" /></FormGrid></FormSection>
        <FormSection title="Operação"><FormGrid><Select label="Tipo Operação" value={form.tipo_operacao} onChange={v=>set('tipo_operacao',v)} options={[{value:'TRANSPORTE',label:'Transporte'},{value:'ESCAVACAO',label:'Escavação'},{value:'APOIO',label:'Apoio'},{value:'PERFURACAO',label:'Perfuração'}]} /><Input label="Capacidade Carga (ton)" value={form.capacidade_carga} onChange={v=>set('capacidade_carga',v)} type="number" placeholder="98" /></FormGrid></FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Modelo removido');setDel(null)}} title="Excluir Modelo" message={'Excluir '+(del?.nome||'')+'?'} confirmLabel="Excluir" />
  </>)
}
