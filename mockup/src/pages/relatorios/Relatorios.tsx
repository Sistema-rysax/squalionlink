import { FileText, Clock, Download } from 'lucide-react'
const relatorios = [
  { nome: 'Produção Diária', tipo: 'OPERACIONAL', frequencia: 'Diário', ultimo: '09/06 06:00' },
  { nome: 'DF% por Equipamento', tipo: 'KPI', frequencia: 'Semanal', ultimo: '08/06 00:00' },
  { nome: 'Consumo de Combustível', tipo: 'ABASTECIMENTO', frequencia: 'Mensal', ultimo: '01/06 00:00' },
  { nome: 'Ciclos por Turno', tipo: 'OPERACIONAL', frequencia: 'Diário', ultimo: '09/06 06:00' },
  { nome: 'Manutenções Realizadas', tipo: 'MANUTENCAO', frequencia: 'Semanal', ultimo: '08/06 00:00' },
]
export default function Relatorios() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="text-sm text-gray-400">Relatórios Disponíveis</h3><button className="px-3 py-1.5 bg-brand-600 rounded-lg text-xs text-white">+ Novo Relatório</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatorios.map((r, i) => (
          <div key={i} className="bg-surface-1 border border-surface-3 rounded-xl p-5 hover:border-brand-600/50 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <FileText className="w-5 h-5 text-brand-400" />
              <span className="px-2 py-0.5 bg-surface-3 rounded text-xs text-gray-400">{r.tipo}</span>
            </div>
            <h4 className="text-sm font-medium text-white mb-2">{r.nome}</h4>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.frequencia}</span>
              <span>Último: {r.ultimo}</span>
            </div>
            <button className="mt-3 flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300"><Download className="w-3 h-3" /> Exportar</button>
          </div>
        ))}
      </div>
    </div>
  )
}