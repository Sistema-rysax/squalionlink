import { useState } from 'react'
import { useT } from '../../contexts/LanguageContext'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid, ColorPicker } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, codigo:'CAM', nome:'Caminhão', tipo_operacao:'TRANSPORTE', cor:'#22c55e' },
  { id:2, codigo:'ESC', nome:'Escavadeira', tipo_operacao:'ESCAVACAO', cor:'#2563eb' },
  { id:3, codigo:'MOT', nome:'Motoniveladora', tipo_operacao:'APOIO', cor:'#f59e0b' },
  { id:4, codigo:'PER', nome:'Perfuratriz', tipo_operacao:'PERFURACAO', cor:'#a855f7' },
  { id:5, codigo:'TRT', nome:'Trator', tipo_operacao:'APOIO', cor:'#06b6d4' },
]
const empty = { codigo:'', nome:'', tipo_operacao:'TRANSPORTE', cor:'#22c55e' }

export default function GruposEquipamento() {
  const t = useT()
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))

  const save = () => {
    if (!form.codigo||!form.nome) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Grupo atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form}]); toast('Grupo criado') }
    setOpen(false)
  }

  const columns = [
    { key:'codigo', label:'Código', render:(r:any)=><span className="text-brand-400 font-bold">{r.codigo}</span> },
    { key:'nome', label:'Nome' },
    { key:'tipo_operacao', label:'Tipo Operação', render:(r:any)=><span className="px-2 py-0.5 rounded text-[10px] bg-brand-600/10 text-brand-400 border border-brand-600/20">{r.tipo_operacao}</span> },
    { key:'cor', label:'Cor', render:(r:any)=><div className="w-4 h-4 rounded-full" style={{background:r.cor}}></div> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title={t.navSub.groups} status="info" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({codigo:r.codigo,nome:r.nome,tipo_operacao:r.tipo_operacao,cor:r.cor});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel={t.common.add} />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Grupo':'Novo Grupo'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Identificação"><FormGrid><Input label="Código" value={form.codigo} onChange={v=>set('codigo',v)} required placeholder="CAM" /><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Caminhão" /></FormGrid></FormSection>
        <FormSection title="Operação"><Select label="Tipo Operação" value={form.tipo_operacao} onChange={v=>set('tipo_operacao',v)} options={[{value:'TRANSPORTE',label:'Transporte'},{value:'ESCAVACAO',label:'Escavação'},{value:'APOIO',label:'Apoio'},{value:'PERFURACAO',label:'Perfuração'}]} /></FormSection>
        <FormSection title="Visual"><ColorPicker label="Cor" value={form.cor} onChange={v=>set('cor',v)} /></FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Grupo removido');setDel(null)}} title="Excluir Grupo" message={'Excluir '+(del?.nome||'')+'?'} confirmLabel="Excluir" />
  </>)
}