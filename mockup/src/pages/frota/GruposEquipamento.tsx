import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid, ColorPicker } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, nome:'Caminhão Fora de Estrada', codigo:'CFE', tipo_operacao:'TRANSPORTE', cor:'#3b82f6', modelos:1, equips:5 },
  { id:2, nome:'Escavadeira Hidráulica', codigo:'ESC', tipo_operacao:'CARGA', cor:'#f97316', modelos:2, equips:2 },
  { id:3, nome:'Motoniveladora', codigo:'MOT', tipo_operacao:'APOIO', cor:'#22c55e', modelos:1, equips:1 },
  { id:4, nome:'Trator de Esteira', codigo:'TES', tipo_operacao:'APOIO', cor:'#eab308', modelos:1, equips:1 },
  { id:5, nome:'Perfuratriz', codigo:'PER', tipo_operacao:'PERFURACAO', cor:'#a855f7', modelos:1, equips:1 },
]
const empty = { nome:'', codigo:'', tipo_operacao:'TRANSPORTE', cor:'#3b82f6' }

export default function GruposEquipamento() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))
  const save = () => {
    if (!form.nome||!form.codigo||!form.tipo_operacao) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Grupo atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,modelos:0,equips:0}]); toast('Grupo criado') }
    setOpen(false)
  }
  const columns = [
    { key:'codigo', label:'Código', render:(r:any)=><span className="font-mono text-xs bg-surface-3 px-2 py-0.5 rounded">{r.codigo}</span> },
    { key:'nome', label:'Nome' },
    { key:'tipo_operacao', label:'Tipo Operação', render:(r:any)=><span className="px-2 py-0.5 bg-surface-3 rounded text-xs">{r.tipo_operacao}</span> },
    { key:'cor', label:'Cor', render:(r:any)=><div className="w-4 h-4 rounded" style={{background:r.cor}}></div> },
    { key:'modelos', label:'Modelos' },
    { key:'equips', label:'Equipamentos' },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Grupos de Equipamento" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({nome:r.nome,codigo:r.codigo,tipo_operacao:r.tipo_operacao,cor:r.cor});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Grupo" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Grupo':'Novo Grupo'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Identificação">
          <FormGrid><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Caminhão Fora de Estrada" /><Input label="Código" value={form.codigo} onChange={v=>set('codigo',v)} required placeholder="CFE" /></FormGrid>
          <Select label="Tipo de Operação" value={form.tipo_operacao} onChange={v=>set('tipo_operacao',v)} required options={[{value:'TRANSPORTE',label:'Transporte'},{value:'CARGA',label:'Carga'},{value:'APOIO',label:'Apoio'},{value:'PERFURACAO',label:'Perfuração'}]} />
          <ColorPicker label="Cor" value={form.cor} onChange={v=>set('cor',v)} />
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Grupo removido');setDel(null)}} title="Excluir grupo?" message={`Excluir ${del?.nome}?`} confirmLabel="Excluir" />
  </>)
}