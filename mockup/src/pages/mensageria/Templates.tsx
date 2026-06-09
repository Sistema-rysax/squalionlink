import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, Textarea, FormSection, FormGrid, Switch } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'

const init = [
  { id:1, titulo:'Trocar Rota', categoria:'DISPATCH', prioridade:'NORMAL', requer_confirmacao:false, conteudo:'Dirija-se para {destino}. Troque rota imediatamente.' },
  { id:2, titulo:'Área Interditada', categoria:'SEGURANCA', prioridade:'EMERGENCIA', requer_confirmacao:true, conteudo:'ATENÇÃO: Área {area} INTERDITADA. NÃO se aproxime. Aguarde instrução.' },
  { id:3, titulo:'Ir para Abastecimento', categoria:'DISPATCH', prioridade:'NORMAL', requer_confirmacao:false, conteudo:'Dirija-se ao posto {posto} para abastecimento.' },
  { id:4, titulo:'Manutenção Programada', categoria:'MANUTENCAO', prioridade:'NORMAL', requer_confirmacao:true, conteudo:'Equipamento será retirado para manutenção às {hora}. Finalize operação.' },
]
const empty = { titulo:'', categoria:'DISPATCH', prioridade:'NORMAL', requer_confirmacao:false, conteudo:'' }

export default function Templates() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))
  const save = () => {
    if (!form.titulo||!form.conteudo) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Template atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form}]); toast('Template criado') }
    setOpen(false)
  }
  const columns = [
    { key:'titulo', label:'Título' },
    { key:'categoria', label:'Categoria', render:(r:any)=><span className="px-2 py-0.5 bg-surface-3 rounded text-xs">{r.categoria}</span> },
    { key:'prioridade', label:'Prioridade', render:(r:any)=><span className={`text-xs ${r.prioridade==='EMERGENCIA'?'text-red-400':r.prioridade==='URGENTE'?'text-yellow-400':'text-gray-400'}`}>{r.prioridade}</span> },
    { key:'requer_confirmacao', label:'Confirmação', render:(r:any)=>r.requer_confirmacao?<span className="text-brand-400 text-xs">✓ Sim</span>:<span className="text-gray-600 text-xs">Não</span> },
    { key:'conteudo', label:'Preview', render:(r:any)=><span className="text-xs text-gray-500 truncate max-w-[200px] block">{r.conteudo}</span> },
  ]
  return (<>
    <DataTable columns={columns} data={data} title="Templates de Mensagem" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({titulo:r.titulo,categoria:r.categoria,prioridade:r.prioridade,requer_confirmacao:r.requer_confirmacao,conteudo:r.conteudo});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Template" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Template':'Novo Template'}
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Dados">
          <Input label="Título" value={form.titulo} onChange={v=>set('titulo',v)} required placeholder="Trocar Rota" />
          <FormGrid><Select label="Categoria" value={form.categoria} onChange={v=>set('categoria',v)} required options={[{value:'DISPATCH',label:'Dispatch'},{value:'SEGURANCA',label:'Segurança'},{value:'MANUTENCAO',label:'Manutenção'},{value:'GERAL',label:'Geral'}]} /><Select label="Prioridade" value={form.prioridade} onChange={v=>set('prioridade',v)} options={[{value:'NORMAL',label:'Normal'},{value:'URGENTE',label:'Urgente'},{value:'EMERGENCIA',label:'Emergência'}]} /></FormGrid>
          <Textarea label="Conteúdo" value={form.conteudo} onChange={v=>set('conteudo',v)} required rows={4} placeholder="Use {variavel} para campos dinâmicos" />
          <Switch label="Requer Confirmação" checked={form.requer_confirmacao} onChange={v=>set('requer_confirmacao',v)} description="Operador deve confirmar recebimento" />
        </FormSection>
        <div className="p-3 bg-surface-2 rounded-lg"><p className="text-xs text-gray-500 mb-1">Variáveis disponíveis:</p><p className="text-xs text-brand-400 font-mono">{'{destino} {area} {posto} {hora} {equip} {operador}'}</p></div>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Template removido');setDel(null)}} title="Excluir template?" message={`Excluir "${del?.titulo}"?`} confirmLabel="Excluir" />
  </>)
}