import { atividades, equipamentos } from '../../mock/data'
import DataTable from '../../components/ui/DataTable'

const columns = [
  { key: 'codigo', label: 'Código', render: (r: any) => <span className="font-mono text-xs bg-surface-3 px-2 py-0.5 rounded">{r.codigo}</span> },
  { key: 'nome', label: 'Nome' },
  { key: 'classificacao', label: 'Classificação', render: (r: any) => <span className={`px-2 py-0.5 rounded text-xs ${r.classificacao === 'PRODUTIVA' ? 'bg-green-900/30 text-green-400' : r.classificacao === 'MANUTENCAO' ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'}`}>{r.classificacao}</span> },
  { key: 'cor', label: 'Cor', render: (r: any) => <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{background: r.cor}}></div><span className="text-xs text-gray-500 font-mono">{r.cor}</span></div> },
  { key: 'equips', label: 'Em Uso', render: (_: any) => <span className="text-xs text-gray-400">{Math.floor(Math.random()*4)} equip.</span> },
]

export default function Atividades() {
  return (
    <div className="space-y-6">
      <DataTable columns={columns} data={atividades} title="Configuração de Atividades" onAdd={() => {}} addLabel="Nova Atividade" />
      <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Timeline — Atividades em Tempo Real</h3>
        <div className="space-y-2">
          {equipamentos.slice(0, 6).map(e => (
            <div key={e.id} className="flex items-center gap-3">
              <span className="w-14 text-xs text-gray-500 font-medium">{e.codigo}</span>
              <div className="flex-1 h-6 bg-surface-2 rounded relative overflow-hidden">
                {Array.from({length: 8}, (_, i) => {
                  const a = atividades[Math.floor(Math.random() * atividades.length)]
                  const w = 8 + Math.random() * 15
                  return <div key={i} className="absolute h-full rounded" style={{background: a.cor, left: `${i * 12.5}%`, width: `${w}%`, opacity: 0.8}} title={a.nome}></div>
                })}
              </div>
              <span className="text-xs text-gray-500 w-24">{e.atividade}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 flex-wrap">
          {atividades.slice(0,6).map(a => (
            <div key={a.id} className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{background: a.cor}}></div><span className="text-xs text-gray-500">{a.nome}</span></div>
          ))}
        </div>
      </div>
    </div>
  )
}
