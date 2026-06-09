import DataTable from '../../components/ui/DataTable'
const data = [
  { id: 1, nome: 'Pré-Operação Caminhão', tipo: 'PRE_OPERACAO', itens: 22, modelos: 'CAT 777G, CAT 785D', execucoes: 145 },
  { id: 2, nome: 'Pré-Operação Escavadeira', tipo: 'PRE_OPERACAO', itens: 18, modelos: 'Komatsu PC5500, CAT 6060', execucoes: 48 },
  { id: 3, nome: 'Fim de Turno', tipo: 'FIM_TURNO', itens: 12, modelos: 'Todos', execucoes: 320 },
  { id: 4, nome: 'Inspeção Semanal Pneus', tipo: 'INSPECAO', itens: 8, modelos: 'CAT 777G', execucoes: 22 },
]
const cols = [
  { key: 'nome', label: 'Nome' },
  { key: 'tipo', label: 'Tipo', render: (r: any) => <span className="px-2 py-0.5 bg-surface-3 rounded text-xs">{r.tipo}</span> },
  { key: 'itens', label: 'Itens' },
  { key: 'modelos', label: 'Modelos Vinculados' },
  { key: 'execucoes', label: 'Execuções (mês)' },
]
export default function ChecklistPage() { return <DataTable columns={cols} data={data} title="Grupos de Checklist" onAdd={() => {}} addLabel="Novo Grupo" /> }