import DataTable from '../../components/ui/DataTable'

const contratadas = [
  { id: 1, nome: 'Mineradora ABC', cnpj: '12.345.678/0001-90', tipo: 'PROPRIA', equipamentos: 7, operadores: 6, contato: 'contato@mineradoraabc.com' },
  { id: 2, nome: 'TransLog Ltda', cnpj: '98.765.432/0001-10', tipo: 'TERCEIRIZADA', equipamentos: 3, operadores: 2, contato: 'ops@translog.com' },
]

const columns = [
  { key: 'nome', label: 'Nome Fantasia' },
  { key: 'cnpj', label: 'CNPJ' },
  { key: 'tipo', label: 'Tipo', render: (r: any) => <span className={`px-2 py-0.5 rounded text-xs ${r.tipo === 'PROPRIA' ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'}`}>{r.tipo}</span> },
  { key: 'equipamentos', label: 'Equipamentos' },
  { key: 'operadores', label: 'Operadores' },
  { key: 'contato', label: 'Contato' },
]

export default function Contratadas() {
  return <DataTable columns={columns} data={contratadas} title="Contratadas" onAdd={() => {}} addLabel="Nova Contratada" />
}
