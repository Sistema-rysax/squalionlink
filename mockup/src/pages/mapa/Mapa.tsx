import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polygon, CircleMarker } from 'react-leaflet'
import { equipamentos } from '../../mock/data'
import { Layers, Truck, MapPin, Hexagon, Eye, EyeOff } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'

const baseMaps = [
  { id:'dark', name:'Escuro', url:'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
  { id:'satellite', name:'Satélite', url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
  { id:'terrain', name:'Terreno', url:'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' },
  { id:'light', name:'Claro', url:'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' },
]

const areaPolygons = [
  { nome:'Frente Norte B3', cor:'#f97316', coords:[[-20.122,-43.988],[-20.124,-43.988],[-20.124,-43.985],[-20.122,-43.985]] as [number,number][] },
  { nome:'Frente Sul A1', cor:'#22c55e', coords:[[-20.128,-43.984],[-20.130,-43.984],[-20.130,-43.981],[-20.128,-43.981]] as [number,number][] },
  { nome:'Britador', cor:'#ef4444', coords:[[-20.118,-43.992],[-20.120,-43.992],[-20.120,-43.990],[-20.118,-43.990]] as [number,number][] },
  { nome:'Pilha Estéril', cor:'#6b7280', coords:[[-20.126,-43.992],[-20.128,-43.992],[-20.128,-43.989],[-20.126,-43.989]] as [number,number][] },
]

const pontosAcesso = [
  { nome:'Portaria Principal', lat:-20.1180, lng:-43.9950, cor:'#3b82f6' },
  { nome:'Balança 01', lat:-20.1200, lng:-43.9920, cor:'#22c55e' },
  { nome:'Oficina Central', lat:-20.1220, lng:-43.9890, cor:'#f97316' },
  { nome:'Refeitório', lat:-20.1195, lng:-43.9880, cor:'#a855f7' },
  { nome:'Posto Combustível', lat:-20.1210, lng:-43.9860, cor:'#eab308' },
]

export default function Mapa() {
  const [baseMap, setBaseMap] = useState('dark')
  const [layers, setLayers] = useState({ equipamentos:true, areas:true, pontos:true })
  const [layerPanel, setLayerPanel] = useState(false)
  const [selectedEquip, setSelectedEquip] = useState<any>(null)

  const toggleLayer = (k: keyof typeof layers) => setLayers(p=>({...p,[k]:!p[k]}))
  const currentBase = baseMaps.find(b=>b.id===baseMap) || baseMaps[0]

  return (
    <div className="h-[calc(100vh-8rem)] relative rounded-xl overflow-hidden border border-surface-3">
      <MapContainer center={[-20.124, -43.987]} zoom={14} className="h-full w-full" zoomControl={false}>
        <TileLayer url={currentBase.url} attribution="" />

        {/* Áreas (polígonos) */}
        {layers.areas && areaPolygons.map((a,i) => (
          <Polygon key={i} positions={a.coords} pathOptions={{color:a.cor,fillColor:a.cor,fillOpacity:0.15,weight:2}}>
            <Popup><div className="text-xs font-medium">{a.nome}</div></Popup>
          </Polygon>
        ))}

        {/* Equipamentos */}
        {layers.equipamentos && equipamentos.map(e => (
          <CircleMarker key={e.id} center={[e.lat, e.lng]} radius={8}
            pathOptions={{color:e.cor,fillColor:e.cor,fillOpacity:0.9,weight:2}}
            eventHandlers={{click:()=>setSelectedEquip(e)}}>
            <Popup>
              <div className="text-xs min-w-[150px]">
                <p className="font-bold">{e.codigo}</p>
                <p>{e.modelo}</p>
                <p>{e.operador || 'Sem operador'}</p>
                <p>{e.atividade || 'Parado'} — {e.vel} km/h</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Pontos de Acesso */}
        {layers.pontos && pontosAcesso.map((p,i) => (
          <CircleMarker key={i} center={[p.lat, p.lng]} radius={6}
            pathOptions={{color:p.cor,fillColor:p.cor,fillOpacity:1,weight:3}}>
            <Popup><div className="text-xs font-medium">{p.nome}</div></Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Layer controls panel */}
      <div className="absolute top-4 right-4 z-[1000]">
        <button onClick={()=>setLayerPanel(!layerPanel)} className="p-2.5 bg-surface-1 border border-surface-3 rounded-lg shadow-lg hover:bg-surface-2 transition-colors">
          <Layers className="w-5 h-5 text-gray-300" />
        </button>
        {layerPanel && (
          <div className="absolute right-0 top-12 w-56 bg-surface-1 border border-surface-3 rounded-xl shadow-2xl p-4 space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">Mapa Base</p>
              <div className="grid grid-cols-2 gap-1.5">
                {baseMaps.map(b=>(
                  <button key={b.id} onClick={()=>setBaseMap(b.id)} className={`px-2 py-1.5 rounded text-xs transition-colors ${baseMap===b.id?'bg-brand-600 text-white':'bg-surface-2 text-gray-400 hover:bg-surface-3'}`}>{b.name}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">Camadas</p>
              <div className="space-y-2">
                <button onClick={()=>toggleLayer('equipamentos')} className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-2">
                  {layers.equipamentos?<Eye className="w-4 h-4 text-green-400"/>:<EyeOff className="w-4 h-4 text-gray-600"/>}
                  <Truck className="w-4 h-4 text-gray-400"/>
                  <span className="text-xs text-gray-300">Equipamentos</span>
                </button>
                <button onClick={()=>toggleLayer('areas')} className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-2">
                  {layers.areas?<Eye className="w-4 h-4 text-green-400"/>:<EyeOff className="w-4 h-4 text-gray-600"/>}
                  <Hexagon className="w-4 h-4 text-gray-400"/>
                  <span className="text-xs text-gray-300">Áreas / Polígonos</span>
                </button>
                <button onClick={()=>toggleLayer('pontos')} className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-2">
                  {layers.pontos?<Eye className="w-4 h-4 text-green-400"/>:<EyeOff className="w-4 h-4 text-gray-600"/>}
                  <MapPin className="w-4 h-4 text-gray-400"/>
                  <span className="text-xs text-gray-300">Pontos de Acesso</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected equipment panel */}
      {selectedEquip && (
        <div className="absolute bottom-4 left-4 z-[1000] w-72 bg-surface-1 border border-surface-3 rounded-xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-200">{selectedEquip.codigo}</span>
            <button onClick={()=>setSelectedEquip(null)} className="text-gray-500 hover:text-gray-300 text-xs">✕</button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Modelo</span><span className="text-gray-300">{selectedEquip.modelo}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Operador</span><span className="text-gray-300">{selectedEquip.operador||'—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Atividade</span><span className="text-gray-300">{selectedEquip.atividade||'—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Velocidade</span><span className="text-gray-300">{selectedEquip.vel} km/h</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tanque</span><span className={`${selectedEquip.tanque<30?'text-red-400':'text-green-400'}`}>{selectedEquip.tanque}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge status={selectedEquip.status} /></div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-surface-1/90 border border-surface-3 rounded-lg p-3">
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>Operando</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>Parado</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>Manutenção</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span>Sem Operador</span>
        </div>
      </div>
    </div>
  )
}