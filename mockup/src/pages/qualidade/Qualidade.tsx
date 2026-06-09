import DataTable from '../../components/ui/DataTable'
const pilhas = [
  { id: 1, nome: 'Pilha ROM 01', material: 'ROM', estoque: 45200, fe: 64.2, sio2: 3.8, al2o3: 1.2, status: 'ATIVA' },
  { id: 2, nome: 'Pilha ROM 02', material: 'ROM', estoque: 32100, fe: 62.8, sio2: 4.1, al2o3: 1.5, status: 'ATIVA' },
  { id: 3, nome: 'Pilha Estéril', material: 'Estéril', estoque: 120000, fe: null, sio2: null, al2o3: null, status: 'ATIVA' },
]
const cols = [
  { key: 'nome', label: 'Pilha' },
  { key: 'material', label: 'Material' },
  { key: 'estoque', label: 'Estoque (ton)', render: (r: any) => r.estoque?.toLocaleString() + ' t' },
  { key: 'fe', label: 'Fe%', render: (r: any) => r.fe ? <span className={r.fe > 63 ? 'text-green-400' : 'text-yellow-400'}>{r.fe}%</span> : '—' },
  { key: 'sio2', label: 'SiO₂%', render: (r: any) => r.sio2 ? <span className={r.sio2 < 4 ? 'text-green-400' : 'text-red-400'}>{r.sio2}%</span> : '—' },
  { key: 'al2o3', label: 'Al₂O₃%', render: (r: any) => r.al2o3 || '—' },
  { key: 'status', label: 'Status', render: () => <span className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded text-xs">ATIVA</span> },
]
export default function Qualidade() { return <DataTable columns={cols} data={pilhas} title="Pilhas / Estoque de Material" onAdd={() => {}} addLabel="Nova Pilha" /> }