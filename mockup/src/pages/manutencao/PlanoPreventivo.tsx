import DataTable from '../../components/ui/DataTable'
const data = [
  { id: 1, nome: 'Troca Filtros 500h', modelo: 'CAT 777G', gatilho: '500h', prox: 'CAT-01 (em 48h)', status: 'ATIVO' },
  { id: 2, nome: 'Revisão Geral 2000h', modelo: 'CAT 777G', gatilho: '2000h', prox: 'CAT-04 (em 130h)', status: 'ATIVO' },
  { id: 3, nome: 'Troca Óleo Motor 250h', modelo: 'Komatsu PC5500', gatilho: '250h', prox: 'ESC-01 (em 50h)', status: 'ATIVO' },
]
const cols = [
  { key: 'nome', label: 'Plano' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'gatilho', label: 'Gatilho' },
  { key: 'prox', label: 'Próximo' },
  { key: 'status', label: 'Status', render: (r: any) => <span className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded text-xs">ATIVO</span> },
]
export default function PlanoPreventivo() { return <DataTable columns={cols} data={data} title="Planos de Manutenção Preventiva" onAdd={() => {}} addLabel="Novo Plano" /> }