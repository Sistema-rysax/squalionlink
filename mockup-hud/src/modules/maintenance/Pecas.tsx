import { useState } from 'react'
import DataTable from '../../components/panels/DataTable'
import Drawer from '../../components/panels/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, FormSection, FormGrid } from '../../components/controls/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, codigo:'FLT-OLE-001', nome:'Filtro Óleo Motor', estoque_atual:24, estoque_minimo:10, custo:185.00, localizacao:'Almox A-01' },
  { id:2, codigo:'FLT-CMS-002', nome:'Filtro Combustível', estoque_atual:18, estoque_minimo:8, custo:220.00, localizacao:'Almox A-01' },
  { id:3, codigo:'COR-FAN-003', nome:'Correia Ventilador', estoque_atual:4, estoque_minimo:6, custo:890.00, localizacao:'Almox B-02' },
  { id:4, codigo:'PAS-FRE-004', nome:'Pastilha Freio', estoque_atual:32, estoque_minimo:12, custo:1250.00, localizacao:'Almox B-03' },
  { id:5, codigo:'OLE-HID-005', nome:'Selo Hidráulico', estoque_atual:8, estoque_minimo:10, custo:450.00, localizacao:'Almox C-01' },
  { id:6, codigo:'RLM-GIR-006', nome:'Rolamento Giro', estoque_atual:2, estoque_minimo:2, custo:12800.00, localizacao:'Almox D-01' },
]
const empty = { codigo:'', nome:'', estoque_atual:'', estoque_minimo:'', custo:'', localizacao:'' }

export default function Pecas() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))

  const save = () => {
    if (!form.codigo||!form.nome) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form,estoque_atual:+form.estoque_atual||0,estoque_minimo:+form.estoque_minimo||0,custo:+form.custo||0}:r)); toast('Peça atualizada') }
    else { setData(p=>[...p,{id:Date.now(),...form,estoque_atual:+form.estoque_atual||0,estoque_minimo:+form.estoque_minimo||0,custo:+form.custo||0}]); toast('Peça criada') }
    setOpen(false)
  }

  const columns = [
    { key:'codigo', label:'Código', render:(r:any)=><span className="text-brand-400 font-bold font-mono">{r.codigo}</span> },
    { key:'nome', label:'Nome' },
    { key:'estoque_atual', label:'Estoque', render:(r:any)=><span className={'font-mono '+(r.estoque_atual<r.estoque_minimo?'text-crit':'text-ok')}>{r.estoque_atual}</span> },
    { key:'estoque_minimo', label:'Mín.', render:(r:any)=><span className="font-mono text-dim">{r.estoque_minimo}</span> },
    { key:'custo', label:'Custo (R$)', render:(r:any)=><span className="font-mono">R$ {r.custo.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span> },
    { key:'localizacao', label:'Local', render:(r:any)=><span className="text-dim">{r.localizacao}</span> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Peças e Componentes" status="ok" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={r=>{setForm({codigo:r.codigo,nome:r.nome,estoque_atual:String(r.estoque_atual),estoque_minimo:String(r.estoque_minimo),custo:String(r.custo),localizacao:r.localizacao});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Nova Peça" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Peça':'Nova Peça'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 text-xs font-mono uppercase text-dim border border-hud-border rounded-md hover:text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 text-xs font-mono uppercase text-brand-400 bg-brand-600/20 border border-brand-600/40 rounded-md hover:bg-brand-600/30 hover:shadow-glow-sm transition-all">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Identificação"><FormGrid><Input label="Código" value={form.codigo} onChange={v=>set('codigo',v)} required placeholder="FLT-OLE-001" /><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Filtro Óleo Motor" /></FormGrid></FormSection>
        <FormSection title="Estoque"><FormGrid><Input label="Estoque Atual" value={form.estoque_atual} onChange={v=>set('estoque_atual',v)} type="number" /><Input label="Estoque Mínimo" value={form.estoque_minimo} onChange={v=>set('estoque_minimo',v)} type="number" /></FormGrid><FormGrid><Input label="Custo (R$)" value={form.custo} onChange={v=>set('custo',v)} type="number" placeholder="185.00" /><Input label="Localização" value={form.localizacao} onChange={v=>set('localizacao',v)} placeholder="Almox A-01" /></FormGrid></FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Peça removida');setDel(null)}} title="Excluir Peça" message={'Excluir '+(del?.nome||'')+'?'} confirmLabel="Excluir" />
  </>)
}
