import { equipamentos, abastecimentos } from '../../mock/data'
import DataTable from '../../components/ui/DataTable'
import { Fuel } from 'lucide-react'

export default function Abastecimento() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-4"><p className="text-xs text-gray-500">Litros hoje</p><p className="text-xl font-bold text-white">4.230 L</p></div>
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-4"><p className="text-xs text-gray-500">Consumo médio</p><p className="text-xl font-bold text-white">62.4 L/h</p></div>
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-4"><p className="text-xs text-gray-500">L/ton média</p><p className="text-xl font-bold text-white">2.1</p></div>
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-4"><p className="text-xs text-gray-500">Alerta (&lt; 20%)</p><p className="text-xl font-bold text-yellow-400">3</p></div>
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-4"><p className="text-xs text-gray-500">Crítico (&lt; 10%)</p><p className="text-xl font-bold text-red-400">1</p></div>
      </div>

      <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2"><Fuel className="w-4 h-4" /> Nível do Tanque — Frota</h3>
        <div className="space-y-3">
          {equipamentos.map(e => (
            <div key={e.id} className="flex items-center gap-3">
              <span className="w-14 text-xs text-gray-400 font-medium">{e.codigo}</span>
              <div className="flex-1 h-4 bg-surface-3 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${e.tanque > 30 ? 'bg-green-500' : e.tanque > 15 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${e.tanque}%`}}></div>
              </div>
              <span className={`w-10 text-xs text-right font-medium ${e.tanque > 30 ? 'text-green-400' : e.tanque > 15 ? 'text-yellow-400' : 'text-red-400'}`}>{e.tanque}%</span>
              <span className="w-16 text-xs text-gray-600">~{(e.tanque * 0.08).toFixed(1)}h</span>
            </div>
          ))}
        </div>
      </div>

      <DataTable columns={[
        { key: 'dt', label: 'Data/Hora', render: (r: any) => new Date(r.dt).toLocaleString('pt-BR', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) },
        { key: 'equip', label: 'Equipamento' },
        { key: 'litros', label: 'Litros', render: (r: any) => <span className="font-medium">{r.litros} L</span> },
        { key: 'operador', label: 'Operador' },
        { key: 'posto', label: 'Posto' },
        { key: 'combustivel', label: 'Combustível' },
        { key: 'horimetro', label: 'Horímetro', render: (r: any) => `${r.horimetro}h` },
      ]} data={abastecimentos} title="Últimos Abastecimentos" onAdd={() => {}} addLabel="Registrar" />
    </div>
  )
}
