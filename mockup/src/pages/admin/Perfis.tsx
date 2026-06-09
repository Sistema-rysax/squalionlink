import { useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Drawer from '../../components/ui/Drawer'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { Input, FormSection, Switch } from '../../components/ui/FormFields'
import { toast } from '../../components/ui/Toast'
import { Shield } from 'lucide-react'

const funcs = [
  { grupo:'Frota', items:['FROTA_EQUIPAMENTO','FROTA_MODELO','FROTA_CONTRATADA','FROTA_FABRICANTE'] },
  { grupo:'Operação', items:['OPERACAO_ATIVIDADE','OPERACAO_CICLO','OPERACAO_ABASTECIMENTO','OPERACAO_DISPATCH'] },
  { grupo:'Manutenção', items:['MANUTENCAO_OS','MANUTENCAO_PREVENTIVA','MANUTENCAO_PECAS'] },
  { grupo:'Área & Rota', items:['AREA_CADASTRO','AREA_ROTA','AREA_MATERIAL'] },
  { grupo:'Qualidade', items:['QUALIDADE_PILHA','QUALIDADE_ELEMENTO'] },
  { grupo:'Admin', items:['ADMIN_USUARIO','ADMIN_PERFIL','ADMIN_CONFIG'] },
]
const acoes = ['VER','CRIAR','EDITAR','DELETAR','EXPORTAR']
const init = [
  { id:1, nome:'Administrador', descricao:'Acesso total', is_admin:true, usuarios:2 },
  { id:2, nome:'Supervisor Operação', descricao:'Gestão operacional', is_admin:false, usuarios:3 },
  { id:3, nome:'Operador Sala', descricao:'Visualização e dispatch', is_admin:false, usuarios:2 },
  { id:4, nome:'Analista Manutenção', descricao:'OS e planos preventivos', is_admin:false, usuarios:1 },
  { id:5, nome:'Gestor Qualidade', descricao:'Pilhas e análises', is_admin:false, usuarios:1 },
]
const empty = { nome:'', descricao:'', is_admin:false }

export default function Perfis() {
  const [data, setData] = useState(init)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const [form, setForm] = useState<any>(empty)
  const [perms, setPerms] = useState<Record<string,string[]>>({})
  const set = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}))

  const togglePerm = (func:string, acao:string) => {
    setPerms(p => {
      const curr = p[func] || []
      return {...p, [func]: curr.includes(acao) ? curr.filter(a=>a!==acao) : [...curr, acao]}
    })
  }

  const save = () => {
    if (!form.nome) { toast('Nome obrigatório','error'); return }
    if (editing) { setData(p=>p.map(r=>r.id===editing.id?{...r,...form}:r)); toast('Perfil atualizado') }
    else { setData(p=>[...p,{id:Date.now(),...form,usuarios:0}]); toast('Perfil criado') }
    setOpen(false)
  }

  const columns = [
    { key:'nome', label:'Nome', render:(r:any)=><span className="flex items-center gap-2"><Shield className={`w-4 h-4 ${r.is_admin?'text-yellow-400':'text-gray-500'}`}/>{r.nome}</span> },
    { key:'descricao', label:'Descrição' },
    { key:'is_admin', label:'Admin', render:(r:any)=>r.is_admin?<span className="text-yellow-400 text-xs">★ Full</span>:<span className="text-gray-600 text-xs">Limitado</span> },
    { key:'usuarios', label:'Usuários' },
  ]

  return (<>
    <DataTable columns={columns} data={data} title="Perfis & Permissões" onAdd={()=>{setForm(empty);setPerms({});setEditing(null);setOpen(true)}} onEdit={(r)=>{setForm({nome:r.nome,descricao:r.descricao,is_admin:r.is_admin});setPerms({});setEditing(r);setOpen(true)}} onDelete={setDel} addLabel="Novo Perfil" />
    <Drawer open={open} onClose={()=>setOpen(false)} title={editing?'Editar Perfil':'Novo Perfil'} width="w-[720px]"
      footer={<><button onClick={()=>setOpen(false)} className="px-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300">Cancelar</button><button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg">Salvar</button></>}>
      <div className="space-y-6">
        <FormSection title="Dados do Perfil">
          <Input label="Nome" value={form.nome} onChange={v=>set('nome',v)} required placeholder="Supervisor Operação" />
          <Input label="Descrição" value={form.descricao} onChange={v=>set('descricao',v)} placeholder="Gestão operacional" />
          <Switch label="Acesso Administrativo Total" checked={form.is_admin} onChange={v=>set('is_admin',v)} description="Ignora matrix de permissões (acesso irrestrito)" />
        </FormSection>
        {!form.is_admin && <FormSection title="Matrix de Permissões">
          <div className="border border-surface-4 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="bg-surface-3"><th className="px-3 py-2 text-left text-gray-500">Funcionalidade</th>{acoes.map(a=><th key={a} className="px-2 py-2 text-center text-gray-500 w-16">{a}</th>)}</tr></thead>
              <tbody>
                {funcs.map(g=><>
                  <tr key={g.grupo} className="bg-surface-2"><td colSpan={6} className="px-3 py-1.5 text-gray-400 font-medium">{g.grupo}</td></tr>
                  {g.items.map(f=><tr key={f} className="border-t border-surface-4 hover:bg-surface-2">
                    <td className="px-3 py-1.5 text-gray-300">{f}</td>
                    {acoes.map(a=><td key={a} className="px-2 py-1.5 text-center"><input type="checkbox" checked={perms[f]?.includes(a)||false} onChange={()=>togglePerm(f,a)} className="w-3.5 h-3.5 rounded border-gray-600 bg-surface-3 text-brand-500 focus:ring-brand-500" /></td>)}
                  </tr>)}
                </>)}
              </tbody>
            </table>
          </div>
        </FormSection>}
      </div>
    </Drawer>
    <ConfirmDialog open={!!del} onClose={()=>setDel(null)} onConfirm={()=>{setData(p=>p.filter(r=>r.id!==del.id));toast('Perfil removido');setDel(null)}} title="Excluir perfil?" message={`Excluir ${del?.nome}? Usuários vinculados perderão acesso.`} confirmLabel="Excluir" />
  </>)
}