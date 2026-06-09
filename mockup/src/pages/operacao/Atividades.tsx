import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import StatusBadge from '../../components/ui/StatusBadge'
import { Input, Select, FormSection, FormGrid, ColorPicker, Switch } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import { atividades as init, equipamentos } from '../../mock/data'

const empty = { nome:'', codigo:'', classificacao:'PRODUTIVA', tipo:'OPERACIONAL', cor:'#22c55e', conta_como_df:true }
export default function Atividades() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))
  const save = () => { if (!form.nome||!form.codigo) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Atividade atualizada') }
    else { setData(p=>[...p,{id:Date.now(),...form}]); toast('Atividade criada') } setOpen(false) }
  const columns = [
    { key:'codigo', label:'Código', render:(r:any)=><span className="font-mono text-xs bg-surface-3 px-2 py-0.5 rounded">{r.codigo}</span> },
    { key:'nome', label:'Nome' },
    { key:'classificacao', label:'Classificação', render:(r:any)=><StatusBadge status={r.classificacao} /> },
    { key:'cor', label:'Cor', render:(r:any)=><div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{background:r.cor}}></div></div> },
  ]
  return (<>
    <div className="space-y-6">
      <DataTable columns={columns} data={data} title="Configuração de Atividades" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({nome:r.nome,codigo:r.codigo,classificacao:r.classificacao,tipo:'OPERACIONAL',cor:r.cor,conta_como_df:true});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Nova Atividade" />
      <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Timeline — Tempo Real</h3>
        <div className="space-y-2">
          {equipamentos.slice(0,6).map(e => (
            <div key={e.id} className="flex items-center gap-3">
              <span className="w-14 text-xs text-gray-500 font-medium">{e.codigo}</span>
              <div className="flex-1 h-6 bg-surface-2 rounded relative overflow-hidden">
                {Array.from({length:8},(_,i)=>{const a=data[Math.floor(Math.random()*data.length)];return <div key={i} className="absolute h-full rounded" style={{background:a.cor,left:`${i*12.5}%`,width:`${8+Math.random()*12}%`,opacity:0.8}} title={a.nome}></div>})}
              </div>
              <span className="text-xs text-gray-500 w-28 truncate">{e.atividade}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Atividade':'Nova Atividade'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Identificação">
          <FormGrid><Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required /><Input label="Código" value={form.codigo} onChange={v=>set('codigo',v)} required placeholder="TC" /></FormGrid>
          <FormGrid>
            <Select label="Classificação" value={form.classificacao} onChange={v=>set('classificacao',v)} required options={[{value:'PRODUTIVA',label:'Produtiva'},{value:'IMPRODUTIVA',label:'Improdutiva'},{value:'MANUTENCAO',label:'Manutenção'}]} />
            <Select label="Tipo" value={form.tipo} onChange={v=>set('tipo',v)} options={[{value:'OPERACIONAL',label:'Operacional'},{value:'FILA',label:'Fila'},{value:'MANOBRA',label:'Manobra'},{value:'DESLOCAMENTO',label:'Deslocamento'}]} />
          </FormGrid>
          <ColorPicker label="Cor" value={form.cor} onChange={v=>set('cor',v)} />
        </FormSection>
        <FormSection title="Comportamento">
          <Switch label="Conta como Disponibilidade Física" checked={form.conta_como_df} onChange={v=>set('conta_como_df',v)} description="Se ativo, tempo nesta atividade conta para DF%" />
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Atividade removida');setDel(null)}} title="Excluir atividade?" message={`Excluir ${del?.nome}?`} confirmLabel="Excluir" />
  </>)
}