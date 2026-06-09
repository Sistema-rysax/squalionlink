import DataTable from '../../components/ui/DataTable'
const data = [
  { id: 1, origem: 'Frente Norte B3', destino: 'Britador', material: 'ROM', centro_custo: 'CC-MIN-001', dmt: 3.2, ciclos_hora: 5.0, status: 'ATIVA' },
  { id: 2, origem: 'Frente Norte B3', destino: 'Pilha Estéril', material: 'Estéril', centro_custo: 'CC-EST-001', dmt: 2.8, ciclos_hora: 5.5, status: 'ATIVA' },
  { id: 3, origem: 'Frente Sul A1', destino: 'Britador', material: 'ROM', centro_custo: 'CC-MIN-002', dmt: 4.5, ciclos_hora: 4.2, status: 'ATIVA' },
]
const cols = [
  { key: 'origem', label: 'Origem' },
  { key: 'destino', label: 'Destino' },
  { key: 'material', label: 'Material' },
  { key: 'centro_custo', label: 'Centro Custo', render: (r: any) => <span className="font-mono text-xs">{r.centro_custo}</span> },
  { key: 'dmt', label: 'DMT (km)', render: (r: any) => r.dmt + ' km' },
  { key: 'ciclos_hora', label: 'Ciclos/h' },
  { key: 'status', label: 'Status', render: () => <span className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded text-xs">ATIVA</span> },
]
export default function Apropriacao() { return <DataTable columns={cols} data={data} title="Apropriação de Rota" onAdd={() => {}} addLabel="Nova Apropriação" /> }