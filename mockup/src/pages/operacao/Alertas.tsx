import { alertas } from '../../mock/data'
import { AlertTriangle, AlertCircle, Info, Check } from 'lucide-react'

const icons: Record<string, any> = { CRITICAL: AlertCircle, WARNING: AlertTriangle, INFO: Info }
const colors: Record<string, string> = { CRITICAL: 'text-red-400 bg-red-900/20 border-red-800', WARNING: 'text-yellow-400 bg-yellow-900/20 border-yellow-800', INFO: 'text-blue-400 bg-blue-900/20 border-blue-800' }

export default function Alertas() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <span className="px-3 py-1 rounded-lg bg-surface-2 text-xs text-gray-300 border border-surface-4">Todos ({alertas.length})</span>
        <span className="px-3 py-1 rounded-lg text-xs text-red-400 border border-red-800/50">Críticos (1)</span>
        <span className="px-3 py-1 rounded-lg text-xs text-yellow-400 border border-yellow-800/50">Warnings (3)</span>
        <span className="px-3 py-1 rounded-lg text-xs text-green-400 border border-green-800/50">Tratados (1)</span>
      </div>
      {alertas.map(a => {
        const Icon = icons[a.severidade] || Info
        return (
          <div key={a.id} className={`flex items-start gap-4 p-4 rounded-xl border ${colors[a.severidade]} ${a.tratado ? 'opacity-50' : ''}`}>
            <Icon className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white">{a.equipamento}</span>
                {a.operador && <span className="text-xs text-gray-400">• {a.operador}</span>}
                <span className="text-xs text-gray-600 ml-auto">{new Date(a.dt).toLocaleString('pt-BR', {hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'})}</span>
              </div>
              <p className="text-sm text-gray-300">{a.descricao}</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-surface-3 text-gray-400">{a.tipo.replace(/_/g, ' ')}</span>
            </div>
            {!a.tratado && <button className="px-3 py-1.5 rounded-lg bg-surface-3 hover:bg-surface-4 text-xs text-gray-300 flex items-center gap-1"><Check className="w-3 h-3" /> Tratar</button>}
          </div>
        )
      })}
    </div>
  )
}
