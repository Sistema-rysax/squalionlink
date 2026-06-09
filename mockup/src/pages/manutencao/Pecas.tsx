import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, codigo:'PÇ-001', nome:'Filtro de Óleo Motor', fabricante:'Caterpillar', modelos:'CAT 777G', estoque:12, minimo:5, custo:450, localizacao:'A1-03' },
  { id:2, codigo:'PÇ-002', nome:'Correia Alternador', fabricante:'Gates', modelos:'CAT 777G', estoque:4, minimo:3, custo:280, localizacao:'B2-01' },
  { id:3, codigo:'PÇ-003', nome:'Pino Caçamba', fabricante:'Caterpillar', modelos:'Komatsu PC5500', estoque:8, minimo:4, custo:1200, localizacao:'C1-05' },
  { id:4, codigo:'PÇ-004', nome:'Jogo Vedação Cilindro', fabricante:'Parker', modelos:'Todos', estoque:2, minimo:3, custo:3500, localizacao:'D3-02' },
  { id:5, codigo:'PÇ-005', nome:'Pneu 33.00R51', fabricante:'Bridgestone', modelos:'CAT 777G', estoque:6, minimo:4, custo:45000, localizacao:'Pátio' },
]
const empty = { codigo:'', nome:'', fabricante:'', modelos:'', estoque:'', minimo:'', custo:'', localizacao:'' }

export default function Pecas() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))
  const save = () => {
    if (!form.codigo||!form.nome) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form,estoque:+form.estoque,minimo:+form.minimo,custo:+form.custo}:r)); toast('Peça atualizada') }
    else { setData(p=>[...p,{id:Date.now(),...form,estoque:+form.estoque,minimo:+form.minimo,custo:+form.custo}]); toast('Peça criada') }
    setOpen(false)
  }
  const columns = [
    { key:'codigo', label:'Código', render:(r:any)=><span className="font-mono text-brand-400">{r.codigo}</span> },
    { key:'nome', label:'Nome' },
    { key:'fabricante', label:'Fabricante' },
    { key:'estoque', label:'Estoque', render:(r:any)=><span className={`font-mono ${r.estoque<=r.minimo?'text-red-400':'text-green-400'}`}>{r.estoque}</span> },
    { key:'minimo', label:'Mínimo' },
    { key:'custo', label:'Custo Unit.', render:(r:any)=>'R$ '+(r.custo).toLocaleString('pt-BR') },
    { key:'localizacao', label:'Local' },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Peças & Almoxarifado" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({codigo:r.codigo,nome:r.nome,fabricante:r.fabricante,modelos:r.modelos,estoque:String(r.estoque),minimo:String(r.minimo),custo:String(r.custo),localizacao:r.localizacao});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Nova Peça" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Peça':'Nova Peça'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Identificação">
          <FormGrid><Input label="Código" value={form.codigo} onChange={v=>set('codigo',v)} required placeholder="PÇ-001" /><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Filtro de Óleo" /></FormGrid>
          <FormGrid><Input label="Fabricante" value={form.fabricante} onChange={v=>set('fabricante',v)} /><Input label="Modelos Compatíveis" value={form.modelos} onChange={v=>set('modelos',v)} placeholder="CAT 777G" /></FormGrid>
        </FormSection>
        <FormSection title="Estoque">
          <FormGrid><Input label="Qtd em Estoque" value={form.estoque} onChange={v=>set('estoque',v)} type="number" /><Input label="Estoque Mínimo" value={form.minimo} onChange={v=>set('minimo',v)} type="number" /></FormGrid>
          <FormGrid><Input label="Custo Unitário (R$)" value={form.custo} onChange={v=>set('custo',v)} type="number" /><Input label="Localização" value={form.localizacao} onChange={v=>set('localizacao',v)} placeholder="A1-03" /></FormGrid>
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Peça removida');setDel(null)}} title="Excluir peça?" message={`Excluir ${del?.codigo} — ${del?.nome}?`} confirmLabel="Excluir" />
  </>)
}