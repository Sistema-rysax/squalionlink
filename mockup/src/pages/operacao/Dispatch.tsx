import { equipamentos } from '../../mock/data'
import { ArrowRight } from 'lucide-react'

export default function Dispatch() {
  const caminhoes = equipamentos.filter(e => e.grupo === 'Caminhão')
  const escavadeiras = equipamentos.filter(e => e.grupo === 'Escavadeira')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-4"><p className="text-xs text-gray-500">Modo</p><p className="text-lg font-bold text-brand-400">AUTOMÁTICO</p><p className="text-xs text-gray-500">Algoritmo: Menor Fila</p></div>
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-4"><p className="text-xs text-gray-500">Ciclos/Hora (média)</p><p className="text-lg font-bold text-white">4.2 c/h</p><p className="text-xs text-green-400">↑ 5% vs ontem</p></div>
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-4"><p className="text-xs text-gray-500">Fila Média</p><p className="text-lg font-bold text-yellow-400">3.5 min</p><p className="text-xs text-gray-500">Meta: &lt; 5 min</p></div>
      </div>

      <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Alocação Atual</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {escavadeiras.map(esc => (
            <div key={esc.id} className="bg-surface-2 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{background: esc.cor}}></div>
                <span className="font-medium text-white">{esc.codigo}</span>
                <span className="text-xs text-gray-500">{esc.operador}</span>
              </div>
              <div className="space-y-2">
                {caminhoes.slice(0, 3).map(cam => (
                  <div key={cam.id} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 w-16">{cam.codigo}</span>
                    <ArrowRight className="w-3 h-3 text-gray-600" />
                    <span className="text-gray-300 flex-1">{cam.atividade}</span>
                    <span className="text-xs text-gray-500">{cam.vel} km/h</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
