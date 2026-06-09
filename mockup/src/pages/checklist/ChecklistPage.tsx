import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, Switch } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import { Plus, Trash2, GripVertical } from 'lucide-react'

const init = [
  { id:1, nome:'Pré-Operação Caminhão', tipo:'PRE_OPERACAO', itens:22, modelos:'CAT 777G, CAT 785D', execucoes:145 },
  { id:2, nome:'Pré-Operação Escavadeira', tipo:'PRE_OPERACAO', itens:18, modelos:'Komatsu PC5500, CAT 6060', execucoes:48 },
  { id:3, nome:'Fim de Turno', tipo:'FIM_TURNO', itens:12, modelos:'Todos', execucoes:320 },
  { id:4, nome:'Inspeção Semanal Pneus', tipo:'INSPECAO', itens:8, modelos:'CAT 777G', execucoes:22 },
]

export default function ChecklistPage() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState({ nome:'', tipo:'PRE_OPERACAO' })
  const [itens, setItens] = useState<{desc:string;obrigatorio:boolean}[]>([{desc:'',obrigatorio:true}])

  const addItem = () => setItens(p=>[...p,{desc:'',obrigatorio:true}])
  const removeItem = (i:number) => setItens(p=>p.filter((_,idx)=>idx!==i))
  const setItem = (i:number,k:string,v:any) => setItens(p=>p.map((it,idx)=>idx===i?{...it,[k]:v}:it))

  const save = () => {
    if (!form.nome) { toast('Nome obrigatório','error'); return }
    const validItens = itens.filter(i=>i.desc.trim())
    if (!validItens.length) { toast('Adicione pelo menos 1 item','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form,itens:validItens.length}:r)); toast('Checklist atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,itens:validItens.length,modelos:'—',execucoes:0}]); toast('Checklist criado') }
    setOpen(false)
  }

  const columns = [
    { key:'nome', label:'Nome' },
    { key:'tipo', label:'Tipo', render:(r:any)=><span className="px-2 py-0.5 bg-surface-3 rounded text-xs">{r.tipo}</span> },
    { key:'itens', label:'Itens' },
    { key:'modelos', label:'Modelos Vinculados' },
    { key:'execucoes', label:'Execuções (mês)' },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Grupos de Checklist" onAdd={()=>{setForm({nome:'',tipo:'PRE_OPERACAO'});setItens([{desc:'',obrigatorio:true}]);setEditing(null);setOpen(true)}}
      onEdit={(r)=>{setForm({nome:r.nome,tipo:r.tipo});setItens(Array.from({length:r.itens},(_,i)=>({desc:`Item ${i+1} do checklist`,obrigatorio:true})));setEditing(r);setOpen(true)}}
      onDelete={setDel} addLabel="Novo Grupo" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Checklist':'Novo Checklist'} width="w-[640px]"
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Grupo">
          <Input label="Nome do Grupo" value={form.nome} onChange={v=>setForm(p=>({...p,nome:v}))} required placeholder="Pré-Operação Caminhão" />
          <Select label="Tipo" value={form.tipo} onChange={v=>setForm(p=>({...p,tipo:v}))} required options={[{value:'PRE_OPERACAO',label:'Pré-Operação'},{value:'FIM_TURNO',label:'Fim de Turno'},{value:'INSPECAO',label:'Inspeção'}]} />
        </FormSection>
        <FormSection title={`Itens (${itens.length})`}>
          <div className="space-y-2">
            {itens.map((it,i) => (
              <div key={i} className="flex items-center gap-2 group">
                <GripVertical className="w-4 h-4 text-gray-700 cursor-grab" />
                <span className="text-xs text-gray-600 w-6">{i+1}.</span>
                <input value={it.desc} onChange={e=>setItem(i,'desc',e.target.value)} placeholder="Descrição do item..." className="flex-1 px-3 py-1.5 bg-surface-2 border border-surface-4 rounded text-sm text-gray-200 focus:outline-none focus:border-brand-500" />
                <button onClick={()=>setItem(i,'obrigatorio',!it.obrigatorio)} className={`px-2 py-1 rounded text-xs ${it.obrigatorio ? 'bg-brand-900/30 text-brand-400' : 'bg-surface-3 text-gray-600'}`}>{it.obrigatorio ? 'Obrig.' : 'Opcional'}</button>
                <button onClick={()=>removeItem(i)} className="p-1 rounded hover:bg-surface-3 opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
              </div>
            ))}
          </div>
          <button onClick={addItem} className="flex items-center gap-2 text-xs text-brand-400 hover:text-brand-300 mt-2"><Plus className="w-3.5 h-3.5" /> Adicionar Item</button>
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Checklist removido');setDel(null)}} title="Excluir checklist?" message={`Excluir ${del?.nome}?`} confirmLabel="Excluir" />
  </>)
}