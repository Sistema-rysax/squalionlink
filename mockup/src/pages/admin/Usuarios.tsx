import DataTable from '../../components/ui/DataTable'
const usuarios = [
  { id: 1, nome: 'Kleyton Miranda', email: 'kleyton@mineradoraabc.com', perfil: 'Administrador', status: 'ATIVO', ultimo_acesso: '09/06 09:30' },
  { id: 2, nome: 'Ricardo Alves', email: 'ricardo@mineradoraabc.com', perfil: 'Supervisor Operação', status: 'ATIVO', ultimo_acesso: '09/06 08:15' },
  { id: 3, nome: 'Camila Torres', email: 'camila@mineradoraabc.com', perfil: 'Analista Manutenção', status: 'ATIVO', ultimo_acesso: '08/06 17:45' },
  { id: 4, nome: 'Diego Souza', email: 'diego@mineradoraabc.com', perfil: 'Operador Sala', status: 'ATIVO', ultimo_acesso: '09/06 06:00' },
  { id: 5, nome: 'Fernanda Lima', email: 'fernanda@mineradoraabc.com', perfil: 'Gestor Qualidade', status: 'INATIVO', ultimo_acesso: '01/06 14:00' },
]
const cols = [
  { key: 'nome', label: 'Nome' },
  { key: 'email', label: 'Email' },
  { key: 'perfil', label: 'Perfil', render: (r: any) => <span className="px-2 py-0.5 bg-brand-900/30 text-brand-400 rounded text-xs">{r.perfil}</span> },
  { key: 'status', label: 'Status', render: (r: any) => <span className={`px-2 py-0.5 rounded text-xs ${r.status === 'ATIVO' ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-500'}`}>{r.status}</span> },
  { key: 'ultimo_acesso', label: 'Último Acesso' },
]
export default function Usuarios() { return <DataTable columns={cols} data={usuarios} title="Usuários" onAdd={() => {}} addLabel="Novo Usuário" /> }