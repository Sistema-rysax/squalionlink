import DataTable from '../../components/ui/DataTable'
import { ordensServico } from '../../mock/data'
const statusColors: Record<string,string> = { ABERTA: 'bg-blue-900/30 text-blue-400', EM_ANDAMENTO: 'bg-yellow-900/30 text-yellow-400', PROGRAMADA: 'bg-purple-900/30 text-purple-400', CONCLUIDA: 'bg-green-900/30 text-green-400' }
const cols = [
  { key: 'numero', label: 'Número', render: (r: any) => <span className="font-mono text-brand-400">{r.numero}</span> },
  { key: 'equip', label: 'Equipamento' },
  { key: 'tipo', label: 'Tipo', render: (r: any) => <span className={`px-2 py-0.5 rounded text-xs ${r.tipo === 'CORRETIVA' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'}`}>{r.tipo}</span> },
  { key: 'prioridade', label: 'Prioridade' },
  { key: 'status', label: 'Status', render: (r: any) => <span className={`px-2 py-0.5 rounded text-xs ${statusColors[r.status]}`}>{r.status}</span> },
  { key: 'descricao', label: 'Descrição' },
  { key: 'dt_abertura', label: 'Abertura', render: (r: any) => new Date(r.dt_abertura).toLocaleDateString('pt-BR') },
]
export default function OrdensServico() { return <DataTable columns={cols} data={ordensServico} title="Ordens de Serviço" onAdd={() => {}} addLabel="Nova OS" /> }