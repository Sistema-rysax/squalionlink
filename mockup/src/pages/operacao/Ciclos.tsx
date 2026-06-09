import DataTable from '../../components/ui/DataTable'
import { ciclos } from '../../mock/data'

const columns = [
  { key: 'equip', label: 'Equipamento' },
  { key: 'operador', label: 'Operador' },
  { key: 'origem', label: 'Origem' },
  { key: 'destino', label: 'Destino' },
  { key: 'material', label: 'Material' },
  { key: 'carga', label: 'Carga (ton)', render: (r: any) => <span className="font-medium">{r.carga}t</span> },
  { key: 'duracao', label: 'Duração', render: (r: any) => <span>{r.duracao} min</span> },
  { key: 'fila_carga', label: 'Fila', render: (r: any) => <span className={r.fila_carga > 4 ? 'text-yellow-400' : 'text-gray-400'}>{r.fila_carga} min</span> },
  { key: 'dt', label: 'Hora', render: (r: any) => new Date(r.dt).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}) },
]

export default function Ciclos() {
  return <DataTable columns={columns} data={ciclos} title="Ciclos Operacionais — Turno Atual" />
}
