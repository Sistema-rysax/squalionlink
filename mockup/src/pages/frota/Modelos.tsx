import DataTable from '../../components/ui/DataTable'

const modelos = [
  { id: 1, nome: 'Caterpillar 777G', fabricante: 'Caterpillar', grupo: 'Caminhão', capacidade: 98, tanque: 800, potencia: 938, equips: 5 },
  { id: 2, nome: 'Komatsu PC5500', fabricante: 'Komatsu', grupo: 'Escavadeira', capacidade: null, tanque: 3200, potencia: 2000, equips: 1 },
  { id: 3, nome: 'CAT 6060', fabricante: 'Caterpillar', grupo: 'Escavadeira', capacidade: null, tanque: 2800, potencia: 1715, equips: 1 },
  { id: 4, nome: 'CAT 16M', fabricante: 'Caterpillar', grupo: 'Motoniveladora', capacidade: null, tanque: 450, potencia: 269, equips: 1 },
  { id: 5, nome: 'CAT D10T', fabricante: 'Caterpillar', grupo: 'Trator Esteira', capacidade: null, tanque: 1050, potencia: 580, equips: 1 },
  { id: 6, nome: 'Atlas Copco D65', fabricante: 'Atlas Copco', grupo: 'Perfuratriz', capacidade: null, tanque: 400, potencia: 420, equips: 1 },
]

const columns = [
  { key: 'nome', label: 'Modelo' },
  { key: 'fabricante', label: 'Fabricante' },
  { key: 'grupo', label: 'Grupo' },
  { key: 'capacidade', label: 'Capacidade (ton)', render: (r: any) => r.capacidade ? `${r.capacidade} ton` : '—' },
  { key: 'tanque', label: 'Tanque (L)', render: (r: any) => `${r.tanque} L` },
  { key: 'potencia', label: 'Potência', render: (r: any) => `${r.potencia} hp` },
  { key: 'equips', label: 'Equipamentos', render: (r: any) => <span className="px-2 py-0.5 bg-brand-900/30 text-brand-400 rounded text-xs">{r.equips}</span> },
]

export default function Modelos() {
  return <DataTable columns={columns} data={modelos} title="Modelos de Equipamento" onAdd={() => {}} addLabel="Novo Modelo" />
}
