import { areas } from '../../mock/data'
import DataTable from '../../components/ui/DataTable'
const cols = [
  { key: 'nome', label: 'Nome' },
  { key: 'tipo', label: 'Tipo', render: (r: any) => <span className="px-2 py-0.5 bg-surface-3 rounded text-xs">{r.tipo}</span> },
  { key: 'cor', label: 'Cor', render: (r: any) => <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{background: r.cor}}></div><span className="text-xs font-mono text-gray-500">{r.cor}</span></div> },
]
export default function Areas() { return <DataTable columns={cols} data={areas} title="Áreas & Geofences" onAdd={() => {}} addLabel="Nova Área" /> }