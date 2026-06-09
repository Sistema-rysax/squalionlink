import { useEffect, useRef, useState } from 'react'
import { equipamentos } from '../../mock/data'
import { Maximize2, Layers, Filter } from 'lucide-react'

export default function Mapa() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<typeof equipamentos[0] | null>(null)

  useEffect(() => {
    if (!mapRef.current || (mapRef.current as any)._leaflet_id) return
    const L = (window as any).L
    if (!L) { console.warn('Leaflet not loaded'); return }

    const map = L.map(mapRef.current, { zoomControl: false }).setView([-20.124, -43.985], 14)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB'
    }).addTo(map)

    equipamentos.forEach(e => {
      const marker = L.circleMarker([e.lat, e.lng], {
        radius: 8,
        fillColor: e.cor,
        color: '#fff',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.9
      }).addTo(map)

      marker.bindTooltip(`<b>${e.codigo}</b><br/>${e.atividade || 'Sem atividade'}<br/>${e.vel} km/h`, { direction: 'top', className: 'custom-tooltip' })
    })
  }, [])

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-4">
      <div className="flex-1 relative rounded-xl overflow-hidden border border-surface-3">
        <div ref={mapRef} className="w-full h-full" />
        <div className="absolute top-4 left-4 flex gap-2">
          <button className="px-3 py-1.5 bg-surface-1/90 backdrop-blur border border-surface-3 rounded-lg text-xs text-gray-300 flex items-center gap-1.5 hover:bg-surface-2">
            <Layers className="w-3.5 h-3.5" /> Camadas
          </button>
          <button className="px-3 py-1.5 bg-surface-1/90 backdrop-blur border border-surface-3 rounded-lg text-xs text-gray-300 flex items-center gap-1.5 hover:bg-surface-2">
            <Filter className="w-3.5 h-3.5" /> Filtros
          </button>
        </div>
      </div>
      <div className="w-80 bg-surface-1 border border-surface-3 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-surface-3">
          <h3 className="text-sm font-medium text-gray-300">Equipamentos ({equipamentos.length})</h3>
        </div>
        <div className="overflow-y-auto h-[calc(100%-3.5rem)]">
          {equipamentos.map(e => (
            <div key={e.id} className="p-3 border-b border-surface-3 hover:bg-surface-2 cursor-pointer transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{background: e.cor}}></div>
                <span className="text-sm font-medium text-gray-200">{e.codigo}</span>
                <span className="text-xs text-gray-500 ml-auto">{e.vel} km/h</span>
              </div>
              <p className="text-xs text-gray-400 ml-5">{e.atividade || 'Sem atividade'}</p>
              <p className="text-xs text-gray-600 ml-5">{e.operador || 'Sem operador'}</p>
              <div className="flex items-center gap-3 mt-1.5 ml-5">
                <span className="text-xs text-gray-600">⛽ {e.tanque}%</span>
                <span className="text-xs text-gray-600">⏱ {e.horimetro?.toFixed(0)}h</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
