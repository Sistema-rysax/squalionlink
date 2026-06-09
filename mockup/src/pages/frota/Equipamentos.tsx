import { Link } from 'react-router-dom'
import DataTable from '../../components/ui/DataTable'
import { equipamentos } from '../../mock/data'

const statusColors: Record<string, string> = { OPERANDO: 'bg-green-500', PARADO: 'bg-yellow-500', MANUTENCAO: 'bg-red-500', SEM_OPERADOR: 'bg-gray-500', DESLIGADO: 'bg-gray-700' }

const columns = [
  { key: 'codigo', label: 'Código', render: (r: any) => <Link to={`/frota/equipamentos/${r.id}`} className="text-brand-400 hover:text-brand-300 font-medium">{r.codigo}</Link> },
  { key: 'modelo', label: 'Modelo' },
  { key: 'grupo', label: 'Grupo' },
  { key: 'contratada', label: 'Contratada' },
  { key: 'status', label: 'Status', render: (r: any) => (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${statusColors[r.status] || 'bg-gray-500'}`}></span>
      <span className="text-xs">{r.status}</span>
    </span>
  )},
  { key: 'operador', label: 'Operador', render: (r: any) => r.operador || <span className="text-gray-600">—</span> },
  { key: 'horimetro', label: 'Horímetro', render: (r: any) => `${r.horimetro?.toLocaleString()}h` },
  { key: 'tanque', label: 'Tanque', render: (r: any) => (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-surface-3 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${r.tanque > 30 ? 'bg-green-500' : r.tanque > 15 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${r.tanque}%`}}></div>
      </div>
      <span className="text-xs text-gray-500">{r.tanque}%</span>
    </div>
  )},
]

export default function Equipamentos() {
  return <DataTable columns={columns} data={equipamentos} title="Equipamentos" onAdd={() => {}} addLabel="Novo Equipamento" />
}
