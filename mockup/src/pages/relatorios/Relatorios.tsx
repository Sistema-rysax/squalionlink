import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, Select, Textarea, FormSection, FormGrid, Switch } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import { FileText, Play, Download } from 'lucide-react'

const init = [
  { id:1, nome:'Produção Diária', tipo:'PLATAFORMA', modulo:'Operação', formato:'PDF', ultima_exec:'09/06 06:00', agendado:true },
  { id:2, nome:'Disponibilidade Física', tipo:'PLATAFORMA', modulo:'KPI', formato:'Excel', ultima_exec:'09/06 08:00', agendado:true },
  { id:3, nome:'Consumo de Combustível', tipo:'TENANT', modulo:'Abastecimento', formato:'PDF', ultima_exec:'08/06 18:00', agendado:false },
  { id:4, nome:'Histórico de OS', tipo:'TENANT', modulo:'Manutenção', formato:'Excel', ultima_exec:'05/06 14:00', agendado:false },
  { id:5, nome:'Ciclos por Operador', tipo:'PESSOAL', modulo:'Operação', formato:'PDF', ultima_exec:'09/06 07:30', agendado:true },
  { id:6, nome:'Checklist NCs', tipo:'PESSOAL', modulo:'Checklist', formato:'PDF', ultima_exec:'—', agendado:false },
]
const empty = { nome:'', modulo:'', formato:'PDF', descricao:'', agendamento:'', filtro_periodo:'ULTIMO_MES' }

export default function Relatorios() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))

  const save = () => {
    if (!form.nome||!form.modulo) { toast('Campos obrigatórios','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,nome:form.nome,modulo:form.modulo,formato:form.formato}:r)); toast('Relatório atualizado') }
    else { setData(p=>[...p,{id:Date.now(),nome:form.nome,tipo:'PESSOAL',modulo:form.modulo,formato:form.formato,ultima_exec:'—',agendado:!!form.agendamento}]); toast('Relatório criado') }
    setOpen(false)
  }

  const executar = (r:any) => {
    toast(`Gerando ${r.nome}... (download em 3s)`, 'info')
    setData(p=>p.map(x=>x.id===r.id?{...x,ultima_exec:new Date().toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}:x))
  }

  const columns = [
    { key:'nome', label:'Nome', render:(r:any)=><span className="flex items-center gap-2"><FileText className="w-4 h-4 text-gray-500"/>{r.nome}</span> },
    { key:'tipo', label:'Tipo', render:(r:any)=><span className={`px-2 py-0.5 rounded text-xs ${r.tipo==='PLATAFORMA'?'bg-purple-900/30 text-purple-400':r.tipo==='TENANT'?'bg-blue-900/30 text-blue-400':'bg-surface-3 text-gray-400'}`}>{r.tipo}</span> },
    { key:'modulo', label:'Módulo' },
    { key:'formato', label:'Formato' },
    { key:'agendado', label:'Agendado', render:(r:any)=>r.agendado?<span className="text-green-400 text-xs">✓ Ativo</span>:<span className="text-gray-600 text-xs">Manual</span> },
    { key:'ultima_exec', label:'Última Exec.' },
    { key:'actions', label:'', render:(r:any)=><div className="flex gap-1"><button onClick={(e)=>{e.stopPropagation();executar(r)}} className="p-1.5 rounded hover:bg-surface-3" title="Executar"><Play className="w-3.5 h-3.5 text-green-400"/></button><button className="p-1.5 rounded hover:bg-surface-3" title="Download"><Download className="w-3.5 h-3.5 text-gray-400"/></button></div> },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Report Builder" onAdd={()=>{setForm(empty);setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({nome:r.nome,modulo:r.modulo,formato:r.formato,descricao:'',agendamento:'',filtro_periodo:'ULTIMO_MES'});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Relatório" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Relatório':'Novo Relatório'} width="w-[600px]"
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Identificação">
          <Input label="Nome do Relatório" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Produção Diária" />
          <FormGrid>
            <Select label="Módulo" value={form.modulo} onChange={v=>set('modulo',v)} required options={[{value:'Operação',label:'Operação'},{value:'KPI',label:'KPI'},{value:'Abastecimento',label:'Abastecimento'},{value:'Manutenção',label:'Manutenção'},{value:'Checklist',label:'Checklist'},{value:'Qualidade',label:'Qualidade'}]} />
            <Select label="Formato" value={form.formato} onChange={v=>set('formato',v)} options={[{value:'PDF',label:'PDF'},{value:'Excel',label:'Excel (XLSX)'},{value:'CSV',label:'CSV'}]} />
          </FormGrid>
          <Textarea label="Descrição" value={form.descricao} onChange={v=>set('descricao',v)} rows={2} placeholder="O que este relatório apresenta..." />
        </FormSection>
        <FormSection title="Filtros">
          <Select label="Período" value={form.filtro_periodo} onChange={v=>set('filtro_periodo',v)} options={[{value:'HOJE',label:'Hoje'},{value:'ONTEM',label:'Ontem'},{value:'ULTIMA_SEMANA',label:'Última Semana'},{value:'ULTIMO_MES',label:'Último Mês'},{value:'CUSTOMIZADO',label:'Período Customizado'}]} />
        </FormSection>
        <FormSection title="Agendamento">
          <Select label="Frequência" value={form.agendamento} onChange={v=>set('agendamento',v)} options={[{value:'',label:'Sem agendamento (manual)'},{value:'DIARIO',label:'Diário (06:00)'},{value:'SEMANAL',label:'Semanal (segunda)'},{value:'MENSAL',label:'Mensal (dia 1)'}]} />
        </FormSection>
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Relatório removido');setDel(null)}} title="Excluir relatório?" message={`Excluir "${del?.nome}"?`} confirmLabel="Excluir" />
  </>)
}