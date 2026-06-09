import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid, Toggle } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'
import { Plus, Trash2 } from 'lucide-react'

const init = [
  { id:1, nome:'Checklist Pré-Operação Caminhão', tipo:'PRE_OPERACAO', itens:12, ativo:true },
  { id:2, nome:'Checklist Pré-Operação Escavadeira', tipo:'PRE_OPERACAO', itens:10, ativo:true },
  { id:3, nome:'Checklist Segurança Diária', tipo:'SEGURANCA', itens:8, ativo:true },
  { id:4, nome:'Checklist Manutenção Preventiva', tipo:'MANUTENCAO', itens:15, ativo:true },
  { id:5, nome:'Checklist Abastecimento', tipo:'ABASTECIMENTO', itens:6, ativo:false },
]
const empty = { nome:'', tipo:'PRE_OPERACAO', ativo:true, itens_list:[''] }

export default function ChecklistPage() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))

  const addItem = () => setForm((p:any)=>({...p,itens_list:[...p.itens_list,'']}))
  const removeItem = (i:number) => setForm((p:any)=>({...p,itens_list:p.itens_list.filter((_:any,idx:number)=>idx!==i)}))
  const updateItem = (i:number,v:string) => setForm((p:any)=>({...p,itens_list:p.itens_list.map((it:string,idx:number)=>idx===i?v:it)}))

  const save = () => {
    if (!form.nome) { toast('Nome obrigatório','error'); return }
    const validItems = form.itens_list.filter((i:string)=>i.trim())
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,nome:form.nome,tipo:form.tipo,ativo:form.ativo,itens:validItems.length||r.itens}:r)); toast('Checklist atualizado') }
    else { setData(p=>[...p,{id:Date.now(),nome:form.nome,tipo:form.tipo,ativo:form.ativo,itens:validItems.length}]); toast('Checklist criado') }
    setOpen(false)
  }

  const columns = [
    { key:'nome', label:'Nome', render:(r:any)=><span className="text-brand-400 font-bold">{r.nome}</span> },
    { key:'tipo', label:'Tipo', render:(r:any)=><span className="px-2 py-0.5 rounded text-[10px] bg-brand-600/10 text-brand-400 border border-brand-600/20">{r.tipo}</span> },
    { key:'itens', label:'Itens', render:(r:any)=><span className="font-mono">{r.itens}</span> },
    { key:'ativo', label:'Ativo', render:(r:any)=><div className="flex items-center gap-1.5"><div className={'led led-'+(r.ativo?'ok':'crit')}></div><span className="text-[10px]">{r.ativo?'SIM':'NÃO'}</span></div> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Checklists" status="ok" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({nome:r.nome,tipo:r.tipo,ativo:r.ativo,itens_list:['Verificar nível de óleo','Verificar pneus','Verificar freios']});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Checklist" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Checklist':'Novo Checklist'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Dados"><FormGrid><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required /><Select label="Tipo" value={form.tipo} onChange={v=>set('tipo',v)} options={[{value:'PRE_OPERACAO',label:'Pré-Operação'},{value:'SEGURANCA',label:'Segurança'},{value:'MANUTENCAO',label:'Manutenção'},{value:'ABASTECIMENTO',label:'Abastecimento'}]} /></FormGrid><Toggle label="Ativo" checked={form.ativo} onChange={v=>set('ativo',v)} /></FormSection>
        <FormSection title="Itens">
          <div className="space-y-2">
            {form.itens_list.map((item:string,i:number)=>(
              <div key={i} className="flex items-center gap-2">
                <input value={item} onChange={e=>updateItem(i,e.target.value)} placeholder={'Item '+(i+1)} className="flex-1 px-3 py-2 bg-hud-bg border border-hud-border rounded-md text-sm text-gray-200 font-mono placeholder:text-gray-700 focus:outline-none focus:border-brand-600" />
                <button onClick={()=>removeItem(i)} className="p-1.5 rounded hover:bg-white/5 text-dim hover:text-crit"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            <button onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono text-brand-400 border border-brand-600/40 rounded-md hover:bg-brand-600/20"><Plus className="w-3 h-3" />Adicionar Item</button>
          </div>
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Checklist removido');setDel(null)}} title="Excluir Checklist" message={'Excluir '+(del?.nome||'')+'?'} confirmLabel="Excluir" />
  </>)
}
