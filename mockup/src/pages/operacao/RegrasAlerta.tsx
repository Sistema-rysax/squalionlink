import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, FormSection, FormGrid, Switch } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, nome:'Excesso Velocidade', tipo:'VELOCIDADE', condicao:'> 60 km/h', severidade:'WARNING', ativa:true, alertas_mes:12 },
  { id:2, nome:'Tanque Baixo Crítico', tipo:'TANQUE', condicao:'< 15%', severidade:'CRITICAL', ativa:true, alertas_mes:5 },
  { id:3, nome:'Tanque Baixo', tipo:'TANQUE', condicao:'< 30%', severidade:'WARNING', ativa:true, alertas_mes:18 },
  { id:4, nome:'Parada Longa (Fila)', tipo:'TEMPO_PARADA', condicao:'> 20 min em fila', severidade:'WARNING', ativa:true, alertas_mes:24 },
  { id:5, nome:'Device Offline', tipo:'COMUNICACAO', condicao:'> 30 min sem sinal', severidade:'INFO', ativa:true, alertas_mes:8 },
  { id:6, nome:'Saída de Geofence', tipo:'GEOFENCE', condicao:'Fora da área permitida', severidade:'CRITICAL', ativa:false, alertas_mes:0 },
]
const empty = { nome:'', tipo:'VELOCIDADE', valor:'', severidade:'WARNING', ativa:true }

export default function RegrasAlerta() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))
  const save = () => {
    if (!form.nome||!form.tipo) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,nome:form.nome,tipo:form.tipo,severidade:form.severidade,ativa:form.ativa}:r)); toast('Regra atualizada') }
    else { setData(p=>[...p,{id:Date.now(),nome:form.nome,tipo:form.tipo,condicao:form.valor,severidade:form.severidade,ativa:form.ativa,alertas_mes:0}]); toast('Regra criada') }
    setOpen(false)
  }
  const columns = [
    { key:'nome', label:'Nome' },
    { key:'tipo', label:'Tipo', render:(r:any)=><span className="px-2 py-0.5 bg-surface-3 rounded text-xs">{r.tipo}</span> },
    { key:'condicao', label:'Condição' },
    { key:'severidade', label:'Severidade', render:(r:any)=><span className={`px-2 py-0.5 rounded text-xs ${r.severidade==='CRITICAL'?'bg-red-900/30 text-red-400':r.severidade==='WARNING'?'bg-yellow-900/30 text-yellow-400':'bg-blue-900/30 text-blue-400'}`}>{r.severidade}</span> },
    { key:'ativa', label:'Ativa', render:(r:any)=>r.ativa?<span className="text-green-400 text-xs">✓</span>:<span className="text-gray-600 text-xs">✗</span> },
    { key:'alertas_mes', label:'Alertas/mês' },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Regras de Alerta" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({nome:r.nome,tipo:r.tipo,valor:r.condicao,severidade:r.severidade,ativa:r.ativa});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Nova Regra" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Regra':'Nova Regra de Alerta'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Configuração">
          <Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Excesso Velocidade" />
          <Select label="Tipo" value={form.tipo} onChange={v=>set('tipo',v)} required options={[{value:'VELOCIDADE',label:'Velocidade'},{value:'TANQUE',label:'Nível de Tanque'},{value:'TEMPO_PARADA',label:'Tempo de Parada'},{value:'COMUNICACAO',label:'Comunicação/Offline'},{value:'GEOFENCE',label:'Geofence'}]} />
          <Input label="Condição / Valor" value={form.valor} onChange={v=>set('valor',v)} placeholder="> 60 km/h" />
          <Select label="Severidade" value={form.severidade} onChange={v=>set('severidade',v)} options={[{value:'INFO',label:'Info'},{value:'WARNING',label:'Warning'},{value:'CRITICAL',label:'Critical'}]} />
          <Switch label="Regra Ativa" checked={form.ativa} onChange={v=>set('ativa',v)} />
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Regra removida');setDel(null)}} title="Excluir regra?" message={`Excluir "${del?.nome}"?`} confirmLabel="Excluir" />
  </>)
}