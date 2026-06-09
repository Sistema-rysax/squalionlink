import { useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Polygon, Popup } from 'react-leaflet'
import { equipamentos } from '../../mock/data'
import { Layers, Eye, EyeOff } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

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
    <div className="h-full relative rounded-xl overflow-hidden border border-hud-border">
      <MapContainer center={[-20.124, -43.987]} zoom={14} className="h-full w-full" zoomControl={false} style={{background:'#0a0c12'}}>
        <TileLayer url={currentBase.url} attribution="" />

        {layers.areas && areaPolygons.map((a,i) => (
          <Polygon key={i} positions={a.coords} pathOptions={{color:a.cor,fillColor:a.cor,fillOpacity:0.15,weight:2}}>
            <Popup><div className="text-xs font-medium">{a.nome}</div></Popup>
          </Polygon>
        ))}

        {layers.equipamentos && equipamentos.map(e => (
          <CircleMarker key={e.id} center={[e.lat,e.lng]} radius={8}
            pathOptions={{color:e.cor,fillColor:e.cor,fillOpacity:0.8,weight:2}}
            eventHandlers={{click:()=>setSelectedEquip(e)}}>
            <Popup><div className="text-xs"><strong>{e.codigo}</strong><br/>{e.atividade||e.status}</div></Popup>
          </CircleMarker>
        ))}

        {layers.pontos && pontosAcesso.map((p,i) => (
          <CircleMarker key={i} center={[p.lat,p.lng]} radius={6}
            pathOptions={{color:p.cor,fillColor:p.cor,fillOpacity:0.6,weight:2}}>
            <Popup><div className="text-xs font-medium">{p.nome}</div></Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Layer Control */}
      <div className="absolute top-4 right-4 z-[1000]">
        <button onClick={()=>setLayerPanel(!layerPanel)} className="p-2.5 bg-hud-panel/95 backdrop-blur-md border border-hud-border rounded-lg shadow-panel text-dim hover:text-brand-400 transition-colors">
          <Layers className="w-5 h-5" />
        </button>
        {layerPanel && (
          <div className="absolute top-12 right-0 bg-hud-panel/95 backdrop-blur-md border border-hud-border rounded-xl shadow-panel p-4 w-56 space-y-4">
            <div className="space-y-2">
              <h4 className="text-[10px] font-display uppercase tracking-widest text-brand-400">Mapa Base</h4>
              {baseMaps.map(b=>(
                <button key={b.id} onClick={()=>setBaseMap(b.id)} className={'w-full text-left px-3 py-1.5 rounded text-xs transition-colors '+(baseMap===b.id?'bg-brand-600/20 text-brand-400':'text-dim hover:text-gray-300 hover:bg-white/5')}>{b.name}</button>
              ))}
            </div>
            <div className="space-y-2">
              <h4 className="text-[10px] font-display uppercase tracking-widest text-brand-400">Camadas</h4>
              {Object.entries(layers).map(([k,v])=>(
                <button key={k} onClick={()=>toggleLayer(k as keyof typeof layers)} className="w-full flex items-center justify-between px-3 py-1.5 rounded text-xs text-gray-300 hover:bg-white/5">
                  <span className="capitalize">{k}</span>
                  {v ? <Eye className="w-3.5 h-3.5 text-ok" /> : <EyeOff className="w-3.5 h-3.5 text-dim" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Equipment Panel */}
      {selectedEquip && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-hud-panel/95 backdrop-blur-md border border-hud-border rounded-xl shadow-panel p-4 w-72">
          <div className="flex items-center justify-between mb-3">
            <span className="text-brand-400 font-mono font-bold">{selectedEquip.codigo}</span>
            <button onClick={()=>setSelectedEquip(null)} className="text-dim hover:text-gray-300 text-xs">✕</button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-dim">Modelo</span><span className="text-gray-300">{selectedEquip.modelo}</span></div>
            <div className="flex justify-between"><span className="text-dim">Status</span><div className="flex items-center gap-1.5"><div className={'led led-'+(selectedEquip.status==='OPERANDO'?'ok':selectedEquip.status==='PARADO'?'warn':'crit')}></div><span>{selectedEquip.status}</span></div></div>
            <div className="flex justify-between"><span className="text-dim">Operador</span><span className="text-gray-300">{selectedEquip.operador||'—'}</span></div>
            <div className="flex justify-between"><span className="text-dim">Velocidade</span><span className="font-mono">{selectedEquip.vel} km/h</span></div>
            <div className="flex justify-between"><span className="text-dim">Tanque</span><span className={'font-mono '+(selectedEquip.tanque<30?'text-crit':selectedEquip.tanque<50?'text-warn':'text-ok')}>{selectedEquip.tanque}%</span></div>
          </div>
        </div>
      )}
    </div>
  )
}
