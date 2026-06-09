import { Lock, Unlock, AlertCircle } from 'lucide-react'
const periodos = [
  { mes: 'Junho 2024', status: 'ABERTO', editados: 45, dt_fechamento: null },
  { mes: 'Maio 2024', status: 'FECHADO', editados: 0, dt_fechamento: '01/06 08:00' },
  { mes: 'Abril 2024', status: 'FECHADO', editados: 0, dt_fechamento: '01/05 07:30' },
]
export default function Fechamento() {
  return (
    <div className="space-y-4">
      {periodos.map((p, i) => (
        <div key={i} className={`bg-surface-1 border rounded-xl p-5 flex items-center gap-4 ${p.status === 'ABERTO' ? 'border-brand-600/50' : 'border-surface-3'}`}>
          {p.status === 'ABERTO' ? <Unlock className="w-6 h-6 text-brand-400" /> : <Lock className="w-6 h-6 text-gray-600" />}
          <div className="flex-1">
            <h4 className="text-sm font-medium text-white">{p.mes}</h4>
            <p className="text-xs text-gray-500">{p.status === 'ABERTO' ? `${p.editados} registros editados este mês` : `Fechado em ${p.dt_fechamento}`}</p>
          </div>
          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${p.status === 'ABERTO' ? 'bg-brand-900/30 text-brand-400' : 'bg-surface-3 text-gray-500'}`}>{p.status}</span>
          {p.status === 'ABERTO' && <button className="px-4 py-2 bg-red-600/20 border border-red-700 text-red-400 text-xs rounded-lg hover:bg-red-600/30">Fechar Período</button>}
        </div>
      ))}
    </div>
  )
}