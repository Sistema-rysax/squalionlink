import DataTable from '../../components/ui/DataTable'

const init = [
  { id:1, usuario:'Kleyton Miranda', tabela:'equipamento', acao:'UPDATE', registro:'CAT-01', campos:'status', dt:'2024-06-09T09:30:00' },
  { id:2, usuario:'Ricardo Alves', tabela:'ordem_servico', acao:'INSERT', registro:'OS-2024-0342', campos:'—', dt:'2024-06-09T09:15:00' },
  { id:3, usuario:'Kleyton Miranda', tabela:'usuario', acao:'UPDATE', registro:'diego@mineradoraabc.com', campos:'perfil', dt:'2024-06-09T08:45:00' },
  { id:4, usuario:'Camila Torres', tabela:'plano_manutencao', acao:'UPDATE', registro:'Revisão 500h', campos:'intervalo', dt:'2024-06-08T17:20:00' },
  { id:5, usuario:'Sistema', tabela:'periodo_fechamento', acao:'UPDATE', registro:'Maio 2024', campos:'status → FECHADO', dt:'2024-06-05T10:00:00' },
  { id:6, usuario:'Kleyton Miranda', tabela:'perfil', acao:'UPDATE', registro:'Supervisor Operação', campos:'permissoes', dt:'2024-06-05T09:30:00' },
]

export default function AuditTrail() {
  const columns = [
    { key:'dt', label:'Data/Hora', render:(r:any)=>new Date(r.dt).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) },
    { key:'usuario', label:'Usuário' },
    { key:'acao', label:'Ação', render:(r:any)=><span className={`px-2 py-0.5 rounded text-xs font-mono ${r.acao==='INSERT'?'bg-green-900/30 text-green-400':r.acao==='UPDATE'?'bg-blue-900/30 text-blue-400':'bg-red-900/30 text-red-400'}`}>{r.acao}</span> },
    { key:'tabela', label:'Entidade', render:(r:any)=><span className="text-xs font-mono text-gray-400">{r.tabela}</span> },
    { key:'registro', label:'Registro' },
    { key:'campos', label:'Campos Alterados', render:(r:any)=><span className="text-xs text-gray-500">{r.campos}</span> },
  ]
  return <DataTable columns={columns} data={init} title="Audit Trail — Histórico de Alterações" actions={false} />
}