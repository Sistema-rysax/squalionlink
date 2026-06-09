import { useParams, Link } from 'react-router-dom'
import { equipamentos } from '../../mock/data'
import { ArrowLeft, MapPin, Gauge, Fuel, Clock, Wrench, ClipboardCheck, Zap, Radio } from 'lucide-react'

export default function FichaEquipamento() {
  const { id } = useParams()
  const equip = equipamentos.find(e => e.id === Number(id)) || equipamentos[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/frota/equipamentos" className="p-2 rounded-lg hover:bg-surface-2"><ArrowLeft className="w-5 h-5 text-gray-400" /></Link>
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            {equip.codigo} — {equip.modelo}
            <span className="px-2 py-0.5 rounded text-xs font-medium" style={{background: equip.cor + '20', color: equip.cor}}>{equip.status}</span>
          </h2>
          <p className="text-sm text-gray-500">{equip.grupo} • {equip.contratada}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Operação Atual */}
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Operação Atual</h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-sm text-gray-400">Atividade</span><span className="text-sm text-white font-medium">{equip.atividade || '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-400">Operador</span><span className="text-sm text-white">{equip.operador || '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-400">Matrícula</span><span className="text-sm text-gray-300">{equip.matricula || '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-400">Turno</span><span className="text-sm text-gray-300">{equip.turno || '—'} (06:00–18:00)</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-400">Velocidade</span><span className="text-sm text-white">{equip.vel} km/h</span></div>
          </div>
        </div>

        {/* Contadores */}
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-3 flex items-center gap-2"><Gauge className="w-4 h-4" /> Contadores</h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-sm text-gray-400">Horímetro</span><span className="text-sm text-white font-medium">{equip.horimetro?.toLocaleString()} h</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-400">Odômetro</span><span className="text-sm text-white">{equip.odometro?.toLocaleString()} km</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-400">Atualizado</span><span className="text-xs text-green-400">3s atrás</span></div>
          </div>
          <div className="mt-4 pt-3 border-t border-surface-3">
            <h4 className="text-xs text-gray-500 mb-2">Produção Turno</h4>
            <div className="flex justify-between"><span className="text-sm text-gray-400">Ciclos</span><span className="text-sm text-white">18</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-400">Produção</span><span className="text-sm text-white">1.620 ton</span></div>
          </div>
        </div>

        {/* Tanque */}
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-3 flex items-center gap-2"><Fuel className="w-4 h-4" /> Combustível</h3>
          <div className="mb-3">
            <div className="flex justify-between mb-1"><span className="text-sm text-gray-400">Nível</span><span className="text-sm text-white font-bold">{equip.tanque}%</span></div>
            <div className="w-full h-3 bg-surface-3 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${equip.tanque > 30 ? 'bg-green-500' : equip.tanque > 15 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${equip.tanque}%`}}></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-sm text-gray-400">Consumo médio</span><span className="text-sm text-white">62 L/h</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-400">Autonomia</span><span className="text-sm text-white">~5.4h</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-400">Último abast.</span><span className="text-sm text-gray-300">08/06 18:30 (420L)</span></div>
          </div>
        </div>

        {/* GPS */}
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> GPS / Posição</h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-sm text-gray-400">Latitude</span><span className="text-sm text-gray-300 font-mono">{equip.lat}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-400">Longitude</span><span className="text-sm text-gray-300 font-mono">{equip.lng}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-400">Área atual</span><span className="text-sm text-white">Rota Principal</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-400">Ignição</span><span className="text-sm text-green-400">✓ ON</span></div>
          </div>
        </div>

        {/* Manutenção */}
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-3 flex items-center gap-2"><Wrench className="w-4 h-4" /> Manutenção</h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-sm text-gray-400">OS Aberta</span><span className="text-sm text-green-400">Nenhuma ✓</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-400">Próx. Preventiva</span><span className="text-sm text-white">Troca filtros 500h</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-400">Restante</span><span className="text-sm text-yellow-400">48h</span></div>
          </div>
        </div>

        {/* Hardware */}
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-3 flex items-center gap-2"><Radio className="w-4 h-4" /> Hardware</h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-sm text-gray-400">GPS</span><span className="text-sm text-green-400">🟢 Online (3s)</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-400">Tablet</span><span className="text-sm text-green-400">🟢 Online (8s)</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-400">Câmera</span><span className="text-sm text-green-400">🟢 Online</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
