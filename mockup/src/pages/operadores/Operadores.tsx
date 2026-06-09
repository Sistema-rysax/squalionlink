import { operadores } from '../../mock/data'
import DataTable from '../../components/ui/DataTable'
const cols = [
  { key: 'matricula', label: 'Matrícula', render: (r: any) => <span className="font-mono text-brand-400">{r.matricula}</span> },
  { key: 'nome', label: 'Nome' },
  { key: 'cpf', label: 'CPF' },
  { key: 'contratada', label: 'Contratada' },
  { key: 'cargo', label: 'Cargo' },
  { key: 'habilitacoes', label: 'Habilitações', render: (r: any) => <span className="text-xs text-gray-400">{r.habilitacoes.join(', ')}</span> },
  { key: 'status', label: 'Status', render: () => <span className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded text-xs">ATIVO</span> },
]
export default function Operadores() { return <DataTable columns={cols} data={operadores} title="Operadores" onAdd={() => {}} addLabel="Novo Operador" /> }