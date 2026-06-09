import { useState, useMemo, useCallback, useRef, useEffect, createContext, useContext, lazy, Suspense } from 'react'
import { MapContainer, TileLayer, Marker, Polygon, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import { equipamentos } from '../../mock/data'
import { Layers, Eye, EyeOff, Search, X, ChevronRight, Fuel, Clock, Gauge, Activity, MapPin, Thermometer, Zap, TrendingUp, AlertTriangle, CheckCircle2, BarChart3, ArrowUp, ArrowDown } from 'lucide-react'
import DigitalTwin from '../../components/map/DigitalTwin'
// const CesiumMap = lazy(() => import('../../components/map/CesiumMap')) // Disabled: requires CDN setup
import 'leaflet/dist/leaflet.css'

/* ─── EXTENDED SNAPSHOT DATA ─── */
const snapshots: Record<number, any> = {
  11: { 
    ult_gps:'09/06 10:42:18', ignicao:true, motor_temp:92, rpm:1850, marcha:'D3', pressao_oleo:42,
    odometro:84520, consumo_medio:58.2, consumo_inst:62.1, autonomia_hrs:4.2,
    area_atual:'Frente Norte', subarea:'Praca de Carga A', rota:'F-001: Frente Norte → Britador Primario',
    ult_abastecimento:'09/06 06:15', litros_ult:420, ult_checklist:'09/06 06:00',
    turno:'DIURNO A', inicio_turno:'06:00', fim_turno:'18:00',
    viagens_turno:12, tons_turno:960, km_turno:38.4, tempo_fila_min:8, tempo_carga_min:3.2, tempo_manobra_min:1.8, tempo_descarga_min:2.1,
    df_turno:88, prod_hora:120, meta_viagens:16,
    ult_manutencao:'2024-06-01', proxima_prev:'2024-06-15', hrs_para_prev:180,
    alertas_abertos:1, ncs_abertas:0
  },
  21: {
    ult_gps:'09/06 10:42:15', ignicao:true, motor_temp:88, rpm:750, marcha:'N', pressao_oleo:38,
    odometro:72100, consumo_medio:55.8, consumo_inst:12.5, autonomia_hrs:6.8,
    area_atual:'Frente Norte', subarea:'Praca de Carga A', rota:'F-001: Frente Norte → Britador Primario',
    ult_abastecimento:'09/06 06:30', litros_ult:380, ult_checklist:'09/06 06:05',
    turno:'DIURNO A', inicio_turno:'06:00', fim_turno:'18:00',
    viagens_turno:10, tons_turno:800, km_turno:32.0, tempo_fila_min:22, tempo_carga_min:3.0, tempo_manobra_min:1.5, tempo_descarga_min:2.0,
    df_turno:72, prod_hora:100, meta_viagens:16,
    ult_manutencao:'2024-05-28', proxima_prev:'2024-06-28', hrs_para_prev:420,
    alertas_abertos:0, ncs_abertas:0
  },
  26: {
    ult_gps:'09/06 08:12:44', ignicao:false, motor_temp:45, rpm:0, marcha:'P', pressao_oleo:0,
    odometro:91200, consumo_medio:61.2, consumo_inst:0, autonomia_hrs:0,
    area_atual:'Oficina Central', subarea:'Box 3', rota:'---',
    ult_abastecimento:'08/06 14:00', litros_ult:450, ult_checklist:'08/06 06:00',
    turno:'---', inicio_turno:'---', fim_turno:'---',
    viagens_turno:0, tons_turno:0, km_turno:0, tempo_fila_min:0, tempo_carga_min:0, tempo_manobra_min:0, tempo_descarga_min:0,
    df_turno:0, prod_hora:0, meta_viagens:0,
    ult_manutencao:'2024-06-09', proxima_prev:'---', hrs_para_prev:0,
    alertas_abertos:2, ncs_abertas:1
  },
  27: {
    ult_gps:'09/06 10:42:12', ignicao:true, motor_temp:86, rpm:2100, marcha:'D4', pressao_oleo:44,
    odometro:63400, consumo_medio:72.5, consumo_inst:78.3, autonomia_hrs:5.1,
    area_atual:'Rota F-002', subarea:'Em transito', rota:'F-002: Frente Sul -> Pilha Esteril',
    ult_abastecimento:'09/06 05:45', litros_ult:510, ult_checklist:'09/06 05:30',
    turno:'DIURNO A', inicio_turno:'06:00', fim_turno:'18:00',
    viagens_turno:14, tons_turno:1260, km_turno:52.8, tempo_fila_min:5, tempo_carga_min:2.8, tempo_manobra_min:1.2, tempo_descarga_min:1.8,
    df_turno:94, prod_hora:157, meta_viagens:16,
    ult_manutencao:'2024-05-20', proxima_prev:'2024-06-20', hrs_para_prev:240,
    alertas_abertos:0, ncs_abertas:0
  },
  94: {
    ult_gps:'09/06 10:41:58', ignicao:true, motor_temp:78, rpm:1200, marcha:'D2', pressao_oleo:40,
    odometro:55800, consumo_medio:65.0, consumo_inst:48.2, autonomia_hrs:7.2,
    area_atual:'Pilha Esteril', subarea:'Zona B', rota:'F-002: Frente Sul -> Pilha Esteril',
    ult_abastecimento:'09/06 06:00', litros_ult:480, ult_checklist:'09/06 05:55',
    turno:'DIURNO A', inicio_turno:'06:00', fim_turno:'18:00',
    viagens_turno:8, tons_turno:640, km_turno:28.0, tempo_fila_min:12, tempo_carga_min:3.5, tempo_manobra_min:2.0, tempo_descarga_min:2.5,
    df_turno:78, prod_hora:80, meta_viagens:16,
    ult_manutencao:'2024-06-05', proxima_prev:'2024-07-05', hrs_para_prev:520,
    alertas_abertos:0, ncs_abertas:0
  },
  102: {
    ult_gps:'09/06 10:42:05', ignicao:true, motor_temp:75, rpm:1400, marcha:'D2', pressao_oleo:48,
    odometro:38200, consumo_medio:42.0, consumo_inst:38.5, autonomia_hrs:8.4,
    area_atual:'Frente Norte', subarea:'Face 2', rota:'Carregamento',
    ult_abastecimento:'09/06 06:10', litros_ult:280, ult_checklist:'09/06 06:00',
    turno:'DIURNO A', inicio_turno:'06:00', fim_turno:'18:00',
    viagens_turno:0, tons_turno:0, km_turno:2.1, tempo_fila_min:0, tempo_carga_min:0, tempo_manobra_min:0, tempo_descarga_min:0,
    df_turno:92, prod_hora:0, meta_viagens:0,
    ult_manutencao:'2024-06-02', proxima_prev:'2024-06-30', hrs_para_prev:380,
    alertas_abertos:0, ncs_abertas:0
  },
  105: {
    ult_gps:'09/06 10:41:50', ignicao:true, motor_temp:72, rpm:1100, marcha:'D1', pressao_oleo:46,
    odometro:42100, consumo_medio:38.5, consumo_inst:35.0, autonomia_hrs:9.6,
    area_atual:'Frente Sul', subarea:'Bancada 2', rota:'Carregamento',
    ult_abastecimento:'09/06 06:20', litros_ult:260, ult_checklist:'09/06 06:15',
    turno:'DIURNO A', inicio_turno:'06:00', fim_turno:'18:00',
    viagens_turno:0, tons_turno:0, km_turno:1.8, tempo_fila_min:0, tempo_carga_min:0, tempo_manobra_min:0, tempo_descarga_min:0,
    df_turno:85, prod_hora:0, meta_viagens:0,
    ult_manutencao:'2024-05-25', proxima_prev:'2024-06-25', hrs_para_prev:320,
    alertas_abertos:0, ncs_abertas:0
  },
  15: {
    ult_gps:'09/06 10:42:20', ignicao:true, motor_temp:82, rpm:1600, marcha:'D3', pressao_oleo:41,
    odometro:28900, consumo_medio:35.0, consumo_inst:32.0, autonomia_hrs:11.2,
    area_atual:'Acesso Principal', subarea:'Trecho 3', rota:'Terraplanagem',
    ult_abastecimento:'09/06 06:05', litros_ult:200, ult_checklist:'09/06 06:00',
    turno:'DIURNO A', inicio_turno:'06:00', fim_turno:'18:00',
    viagens_turno:0, tons_turno:0, km_turno:8.5, tempo_fila_min:0, tempo_carga_min:0, tempo_manobra_min:0, tempo_descarga_min:0,
    df_turno:90, prod_hora:0, meta_viagens:0,
    ult_manutencao:'2024-06-07', proxima_prev:'2024-07-07', hrs_para_prev:480,
    alertas_abertos:0, ncs_abertas:0
  },
  18: {
    ult_gps:'09/06 10:40:30', ignicao:true, motor_temp:68, rpm:900, marcha:'D1', pressao_oleo:44,
    odometro:12600, consumo_medio:28.0, consumo_inst:22.0, autonomia_hrs:14.5,
    area_atual:'Pilha ROM', subarea:'Topo', rota:'Espalhamento',
    ult_abastecimento:'09/06 06:00', litros_ult:180, ult_checklist:'09/06 05:55',
    turno:'DIURNO A', inicio_turno:'06:00', fim_turno:'18:00',
    viagens_turno:0, tons_turno:0, km_turno:3.2, tempo_fila_min:0, tempo_carga_min:0, tempo_manobra_min:0, tempo_descarga_min:0,
    df_turno:82, prod_hora:0, meta_viagens:0,
    ult_manutencao:'2024-06-04', proxima_prev:'2024-07-04', hrs_para_prev:450,
    alertas_abertos:0, ncs_abertas:0
  },
  20: {
    ult_gps:'09/06 10:42:08', ignicao:true, motor_temp:80, rpm:1800, marcha:'D3', pressao_oleo:43,
    odometro:19500, consumo_medio:32.0, consumo_inst:30.5, autonomia_hrs:10.8,
    area_atual:'Acesso Sul', subarea:'Curva 2', rota:'Perfuracao',
    ult_abastecimento:'09/06 06:15', litros_ult:150, ult_checklist:'09/06 06:10',
    turno:'DIURNO A', inicio_turno:'06:00', fim_turno:'18:00',
    viagens_turno:0, tons_turno:0, km_turno:5.6, tempo_fila_min:0, tempo_carga_min:0, tempo_manobra_min:0, tempo_descarga_min:0,
    df_turno:88, prod_hora:0, meta_viagens:0,
    ult_manutencao:'2024-06-03', proxima_prev:'2024-07-03', hrs_para_prev:400,
    alertas_abertos:1, ncs_abertas:0
  }
}

/* ─── GEOFENCES / AREAS MOCK ─── */
const areas = [
  { id: 1, nome: 'Frente Norte', tipo: 'CARGA', color: '#ef4444', coords: [[-20.146, -43.978], [-20.146, -43.973], [-20.151, -43.973], [-20.151, -43.978]] },
  { id: 2, nome: 'Frente Sul', tipo: 'CARGA', color: '#f97316', coords: [[-20.153, -43.976], [-20.153, -43.971], [-20.158, -43.971], [-20.158, -43.976]] },
  { id: 3, nome: 'Deposito Esteril', tipo: 'DESCARGA', color: '#22c55e', coords: [[-20.152, -43.980], [-20.152, -43.976], [-20.156, -43.976], [-20.156, -43.980]] },
  { id: 4, nome: 'Britador Primario', tipo: 'DESCARGA', color: '#6366f1', coords: [[-20.148, -43.978], [-20.148, -43.975], [-20.150, -43.975], [-20.150, -43.978]] },
  { id: 5, nome: 'Pilha ROM', tipo: 'DESCARGA', color: '#0ea5e9', coords: [[-20.149, -43.974], [-20.149, -43.971], [-20.152, -43.971], [-20.152, -43.974]] },
  { id: 6, nome: 'Patio Manutencao', tipo: 'APOIO', color: '#6b7280', coords: [[-20.156, -43.972], [-20.156, -43.968], [-20.159, -43.968], [-20.159, -43.972]] },
]

const baseMaps = [
  { id: 'satellite', label: 'Satelite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
]

/* ─── MAP CONTEXT ─── */
const MapContext = createContext<any>({})

const statusColor = (s: string) => s === 'OPERANDO' ? '#22c55e' : s === 'PARADO' ? '#f59e0b' : '#ef4444'
const statusIcon = (s: string) => s === 'OPERANDO' ? 'ok' : s === 'PARADO' ? 'warn' : 'crit'

/* ─── FLY TO COMPONENT ─── */
function FlyTo({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap()
  useEffect(() => { if (target) map.flyTo([target.lat, target.lng], 16, { duration: 1 }) }, [target, map])
  return null
}

/* ─── MAIN EXPORT ─── */
export default function Mapa() {
  const [selectedEquip, setSelectedEquip] = useState<any>(null)
  const [baseMap, setBaseMap] = useState('satellite')
  const [layers, setLayers] = useState({ equipamentos: true, areas: true, pontos: true })
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [layerPanel, setLayerPanel] = useState(false)
  const [twinOpen, setTwinOpen] = useState(false)
  const [mapMode, setMapMode] = useState<'2d' | '3d'>('2d')
  const [infoFields, setInfoFields] = useState({
    codigo: true, status: true, conexao: true, horimetro: true,
    odometro: true, modelo: true, operador: true, atividade: true,
    velocidade: true, tanque: true, placa: false, contratada: false
  })
  const [showFieldConfig, setShowFieldConfig] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  const selectEquip = useCallback((e: any) => {
    setSelectedEquip(e)
    setFlyTarget({ lat: e.lat, lng: e.lng })
  }, [])

  const closeSnapshot = useCallback(() => setSelectedEquip(null), [])

  const filtered = useMemo(() => {
    if (!searchTerm) return equipamentos
    return equipamentos.filter(e => e.codigo.toLowerCase().includes(searchTerm.toLowerCase()) || (e.operador || '').toLowerCase().includes(searchTerm.toLowerCase()))
  }, [searchTerm])

  const currentBase = baseMaps.find(b => b.id === baseMap) || baseMaps[0]

  // Resize observer for map
  useEffect(() => {
    if (!mapContainerRef.current) return
    const observer = new ResizeObserver(() => { mapRef.current?.invalidateSize() })
    observer.observe(mapContainerRef.current)
    return () => observer.disconnect()
  }, [])

  const snap = selectedEquip ? snapshots[selectedEquip.id] : null

  return (
    <div className="h-full flex overflow-hidden">
      {/* LEFT: Equipment List */}
      <div className="w-[300px] flex-shrink-0 border-r border-hud-border/50 flex flex-col bg-hud-panel/50">
        {/* Search */}
        <div className="p-3 border-b border-hud-border/30">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dim" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar equipamento..." className="w-full pl-8 pr-3 py-2 bg-hud-bg border border-hud-border rounded-lg text-xs font-mono text-gray-300 placeholder:text-dim focus:outline-none focus:border-brand-600" />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-dim hover:text-gray-300"><X className="w-3 h-3" /></button>}
          </div>
          {/* Status summary */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-[9px] text-dim font-mono">{equipamentos.length} equipamentos</span>
            <div className="flex items-center gap-2 text-[9px] font-mono">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>{equipamentos.filter(e => e.status === 'OPERANDO').length}</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>{equipamentos.filter(e => e.status === 'PARADO').length}</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>{equipamentos.filter(e => e.status === 'MANUTENCAO').length}</span>
            </div>
          </div>
        </div>

        {/* Equipment List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(e => (
            <button key={e.id} onClick={() => selectEquip(e)} className={`w-full text-left px-3 py-2.5 border-b border-hud-border/20 transition-all hover:bg-white/[0.03] ${selectedEquip?.id === e.id ? 'bg-brand-600/10 border-l-2 border-l-brand-400' : 'border-l-2 border-l-transparent'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${e.status === 'OPERANDO' ? 'bg-green-400 shadow-[0_0_4px_rgba(34,197,94,0.6)]' : e.status === 'PARADO' ? 'bg-amber-400' : 'bg-red-400'}`}></div>
                  <div>
                    <span className="text-xs font-mono font-bold text-gray-200">{e.codigo}</span>
                    <span className="text-[10px] text-dim ml-2">{e.modelo}</span>
                  </div>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-colors ${selectedEquip?.id === e.id ? 'text-brand-400' : 'text-dim/50'}`} />
              </div>
              <div className="flex items-center gap-3 mt-1 pl-4">
                <span className="text-[9px] text-dim">{e.grupo}</span>
                <span className="text-[9px] text-dim">•</span>
                <span className="text-[9px] text-gray-400">{e.atividade || '---'}</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 pl-4">
                {e.operador && <span className="text-[9px] text-dim flex items-center gap-0.5"><Activity className="w-2.5 h-2.5" />{e.operador}</span>}
                <span className="text-[9px] font-mono text-dim">{e.vel} km/h</span>
                <span className={`text-[9px] font-mono ${e.tanque < 30 ? 'text-crit' : e.tanque < 50 ? 'text-warn' : 'text-dim'}`}><Fuel className="w-2.5 h-2.5 inline mr-0.5" />{e.tanque}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CENTER: Map */}
      <div ref={mapContainerRef} className="flex-1 relative">
        {mapMode === '3d' && <div className="h-full w-full flex items-center justify-center bg-hud-bg"><div className="text-center"><span className="text-sm font-mono text-brand-400 block mb-2">3D Terrain</span><span className="text-[10px] text-dim">Cesium Ion configurado. Requer deploy com CDN assets.</span></div></div>}
        {mapMode === '2d' && <MapContainer center={[-20.152, -43.973]} zoom={16} className="h-full w-full" zoomControl={false} style={{ background: '#1a1f2e' }} ref={mapRef}>
          <TileLayer url={currentBase.url} attribution="" />
          <FlyTo target={flyTarget} />

          {/* Geofence polygons */}
          {layers.areas && areas.map(a => (
            <Polygon key={a.id} positions={a.coords as any} pathOptions={{ color: a.color, weight: 2, fillOpacity: 0.15, dashArray: '4 4' }}>
              <Popup><div className="text-xs font-mono"><strong>{a.nome}</strong><br/>{a.tipo}</div></Popup>
            </Polygon>
          ))}

          {/* Equipment markers with icons */}
          {layers.equipamentos && equipamentos.map(e => {
            const color = statusColor(e.status)
            const isSelected = selectedEquip?.id === e.id
            const size = isSelected ? 32 : 22
            const grupo = e.grupo?.toLowerCase() || ''
            // SVG icon based on equipment type
            let svgBody = ''
            if (grupo.includes('caminh')) {
              svgBody = `<rect x="8" y="4" width="16" height="24" rx="2" fill="${color}" opacity="0.85"/><rect x="10" y="4" width="12" height="8" rx="1.5" fill="${color}"/><rect x="9" y="13" width="14" height="14" rx="1" fill="${color}" opacity="0.6"/><rect x="6" y="6" width="3" height="5" rx="1" fill="rgba(0,0,0,0.5)"/><rect x="23" y="6" width="3" height="5" rx="1" fill="rgba(0,0,0,0.5)"/><rect x="6" y="20" width="3" height="5" rx="1" fill="rgba(0,0,0,0.5)"/><rect x="23" y="20" width="3" height="5" rx="1" fill="rgba(0,0,0,0.5)"/><polygon points="16,1 14,4 18,4" fill="white" opacity="0.8"/>`
            } else if (grupo.includes('escav')) {
              svgBody = `<rect x="4" y="10" width="6" height="18" rx="3" fill="rgba(0,0,0,0.4)"/><rect x="22" y="10" width="6" height="18" rx="3" fill="rgba(0,0,0,0.4)"/><ellipse cx="16" cy="18" rx="8" ry="9" fill="${color}" opacity="0.85"/><rect x="12" y="13" width="8" height="7" rx="2" fill="${color}"/><line x1="16" y1="12" x2="16" y2="2" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/><circle cx="16" cy="2" r="2" fill="${color}"/>`
            } else if (grupo.includes('moto')) {
              svgBody = `<rect x="12" y="3" width="8" height="26" rx="2" fill="${color}" opacity="0.85"/><rect x="6" y="16" width="20" height="3" rx="1" fill="${color}" opacity="0.7"/><rect x="13" y="20" width="6" height="6" rx="1" fill="${color}"/><circle cx="11" cy="6" r="2" fill="rgba(0,0,0,0.4)"/><circle cx="21" cy="6" r="2" fill="rgba(0,0,0,0.4)"/><circle cx="11" cy="26" r="2.5" fill="rgba(0,0,0,0.4)"/><circle cx="21" cy="26" r="2.5" fill="rgba(0,0,0,0.4)"/>`
            } else if (grupo.includes('perf')) {
              svgBody = `<rect x="5" y="12" width="5" height="16" rx="2.5" fill="rgba(0,0,0,0.4)"/><rect x="22" y="12" width="5" height="16" rx="2.5" fill="rgba(0,0,0,0.4)"/><rect x="9" y="10" width="14" height="18" rx="2" fill="${color}" opacity="0.85"/><rect x="14" y="1" width="4" height="12" rx="1" fill="${color}" opacity="0.9"/><circle cx="16" cy="2" r="1.5" fill="white" opacity="0.6"/>`
            } else if (grupo.includes('trat')) {
              svgBody = `<rect x="4" y="8" width="6" height="20" rx="3" fill="rgba(0,0,0,0.4)"/><rect x="22" y="8" width="6" height="20" rx="3" fill="rgba(0,0,0,0.4)"/><rect x="9" y="10" width="14" height="16" rx="2" fill="${color}" opacity="0.85"/><rect x="3" y="5" width="26" height="4" rx="1" fill="${color}" opacity="0.7"/>`
            } else {
              svgBody = `<rect x="8" y="4" width="16" height="24" rx="2" fill="${color}" opacity="0.85"/><rect x="10" y="4" width="12" height="8" rx="1.5" fill="${color}"/><polygon points="16,1 14,4 18,4" fill="white" opacity="0.8"/>`
            }
            const svg = `<svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">${isSelected ? '<circle cx="16" cy="16" r="15" fill="none" stroke="' + color + '" stroke-width="2" opacity="0.6"><animate attributeName="r" values="14;16;14" dur="1.5s" repeatCount="indefinite"/></circle>' : ''}${svgBody}</svg>`
            const icon = L.divIcon({
              html: `<div style="position:relative">${svg}${isSelected ? '<div style="position:absolute;bottom:-10px;left:50%;transform:translateX(-50%);font-size:9px;font-family:JetBrains Mono;color:white;text-shadow:0 0 3px black,0 0 3px black;white-space:nowrap;font-weight:bold;background:rgba(0,0,0,0.7);padding:0 3px;border-radius:2px">' + e.codigo + '</div>' : ''}</div>`,
              iconSize: [size, size + (isSelected ? 14 : 0)],
              iconAnchor: [size/2, size/2],
              className: 'equip-marker'
            })
            return (
              <Marker key={e.id} position={[e.lat, e.lng]} icon={icon} eventHandlers={{ click: () => selectEquip(e) }}>
                <Tooltip direction="top" offset={[0, -14]} opacity={0.9}>
                  <div className="text-xs font-mono"><strong>{e.codigo}</strong> - {e.vel} km/h</div>
                </Tooltip>
              </Marker>
            )
          })}
        </MapContainer>}

        {/* 2D/3D toggle */}
        <div className="absolute top-3 left-3 z-[500] flex bg-black/50 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
          <button onClick={() => setMapMode('2d')} className={`px-3 py-1.5 text-[9px] font-mono uppercase font-bold transition-all ${mapMode === '2d' ? 'bg-brand-600/30 text-brand-300' : 'text-gray-500 hover:text-gray-300'}`}>2D</button>
          <button onClick={() => setMapMode('3d')} className={`px-3 py-1.5 text-[9px] font-mono uppercase font-bold transition-all ${mapMode === '3d' ? 'bg-brand-600/30 text-brand-300' : 'text-gray-500 hover:text-gray-300'}`}>3D Terrain</button>
        </div>

        {/* Floating equipment info card */}
        {selectedEquip && (
          <div className="absolute bottom-4 left-4 z-[500] bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-3 min-w-[220px] max-w-[260px] shadow-2xl">
            {/* Header with config toggle */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${selectedEquip.status === 'OPERANDO' ? 'bg-green-400' : selectedEquip.status === 'PARADO' ? 'bg-amber-400' : 'bg-red-400'} animate-pulse`}></div>
                <span className="text-xs font-mono font-bold text-white">{selectedEquip.codigo}</span>
              </div>
              <button onClick={() => setShowFieldConfig(!showFieldConfig)} className="p-1 rounded hover:bg-white/10 transition-colors" title="Configurar campos">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              </button>
            </div>

            {/* Field config dropdown */}
            {showFieldConfig && (
              <div className="mb-2 pb-2 border-b border-white/10">
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(infoFields).map(([k, v]) => (
                    <button key={k} onClick={() => setInfoFields(p => ({ ...p, [k]: !p[k as keyof typeof p] }))} className={`text-[8px] font-mono px-1.5 py-0.5 rounded transition-all ${v ? 'bg-brand-600/30 text-brand-300 border border-brand-500/30' : 'bg-white/5 text-gray-500 border border-transparent'}`}>
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Data fields */}
            <div className="space-y-1">
              {infoFields.status && (
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400">Status</span>
                  <span className={`text-[9px] font-mono font-medium ${selectedEquip.status === 'OPERANDO' ? 'text-green-400' : selectedEquip.status === 'PARADO' ? 'text-amber-400' : 'text-red-400'}`}>{selectedEquip.status}</span>
                </div>
              )}
              {infoFields.conexao && (
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400">Conexao</span>
                  <span className="text-[9px] font-mono text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>Online</span>
                </div>
              )}
              {infoFields.modelo && (
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400">Modelo</span>
                  <span className="text-[9px] font-mono text-gray-200 truncate ml-2">{selectedEquip.modelo}</span>
                </div>
              )}
              {infoFields.operador && (
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400">Operador</span>
                  <span className="text-[9px] font-mono text-gray-200 truncate ml-2">{selectedEquip.operador || '---'}</span>
                </div>
              )}
              {infoFields.atividade && (
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400">Atividade</span>
                  <span className="text-[9px] font-mono text-gray-200 truncate ml-2">{selectedEquip.atividade || '---'}</span>
                </div>
              )}
              {infoFields.horimetro && (
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400">Horimetro</span>
                  <span className="text-[9px] font-mono text-gray-200">{selectedEquip.horimetro?.toLocaleString()} hrs</span>
                </div>
              )}
              {infoFields.odometro && (
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400">Odometro</span>
                  <span className="text-[9px] font-mono text-gray-200">{(selectedEquip.horimetro * 3.2).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} km</span>
                </div>
              )}
              {infoFields.velocidade && (
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400">Velocidade</span>
                  <span className="text-[9px] font-mono text-gray-200">{selectedEquip.vel} km/h</span>
                </div>
              )}
              {infoFields.tanque && (
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400">Tanque</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${selectedEquip.tanque > 40 ? 'bg-green-400' : selectedEquip.tanque > 20 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: selectedEquip.tanque + '%' }}></div>
                    </div>
                    <span className="text-[9px] font-mono text-gray-200">{selectedEquip.tanque}%</span>
                  </div>
                </div>
              )}
              {infoFields.placa && (
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400">Placa</span>
                  <span className="text-[9px] font-mono text-gray-200">{selectedEquip.placa || '---'}</span>
                </div>
              )}
              {infoFields.contratada && (
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400">Contratada</span>
                  <span className="text-[9px] font-mono text-gray-200">{selectedEquip.contratada}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Layer control */}
        <button onClick={() => setLayerPanel(!layerPanel)} className="absolute top-3 right-3 z-[400] w-9 h-9 bg-hud-panel/90 backdrop-blur-sm border border-hud-border rounded-lg flex items-center justify-center hover:bg-hud-panel transition-all shadow-lg">
          <Layers className="w-4 h-4 text-gray-300" />
        </button>
        {layerPanel && (
          <div className="absolute top-14 right-3 z-[400] bg-hud-panel/95 backdrop-blur-xl border border-hud-border rounded-xl p-3 min-w-[160px] shadow-2xl">
            <h4 className="text-[9px] uppercase tracking-widest text-dim mb-2 font-display">Camadas</h4>
            {Object.entries(layers).map(([k, v]) => (
              <button key={k} onClick={() => setLayers(p => ({ ...p, [k]: !p[k as keyof typeof p] }))} className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-white/[0.03] transition-all">
                {v ? <Eye className="w-3 h-3 text-brand-400" /> : <EyeOff className="w-3 h-3 text-dim" />}
                <span className={`text-[10px] font-mono ${v ? 'text-gray-200' : 'text-dim'}`}>{k}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Snapshot Panel (slide-in when equipment selected) */}
      {selectedEquip && snap && (
        <div className="w-[340px] flex-shrink-0 border-l border-hud-border/50 bg-hud-panel/80 overflow-y-auto animate-slideIn">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-hud-panel/95 backdrop-blur-xl border-b border-hud-border/50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${selectedEquip.status === 'OPERANDO' ? 'bg-green-400 animate-pulse' : selectedEquip.status === 'PARADO' ? 'bg-amber-400' : 'bg-red-400'}`}></div>
                <span className="text-base font-display font-bold text-brand-400">{selectedEquip.codigo}</span>
              </div>
              <button onClick={() => setTwinOpen(true)} className="px-2 py-1 rounded-md text-[9px] font-mono text-brand-400 border border-brand-600/30 hover:bg-brand-600/10 transition-colors" title="Digital Twin">3D Twin</button>
              <button onClick={closeSnapshot} className="p-1 rounded hover:bg-white/10 text-dim hover:text-gray-300 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-300">{selectedEquip.modelo}</span>
              <span className="px-1.5 py-0.5 text-[9px] rounded border bg-white/5 border-hud-border text-dim">{selectedEquip.grupo}</span>
              <span className={`px-1.5 py-0.5 text-[9px] rounded border ${selectedEquip.status === 'OPERANDO' ? 'text-ok bg-ok/10 border-ok/20' : selectedEquip.status === 'PARADO' ? 'text-warn bg-warn/10 border-warn/20' : 'text-crit bg-crit/10 border-crit/20'}`}>{selectedEquip.status}</span>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* LOCALIZACAO & ROTA */}
            <section>
              <h4 className="text-[9px] font-display uppercase tracking-widest text-brand-400 mb-2 flex items-center gap-1.5"><MapPin className="w-3 h-3"/>Localizacao & Rota</h4>
              <div className="bg-hud-bg rounded-lg border border-hud-border/50 p-3 space-y-2">
                <div className="flex justify-between"><span className="text-[10px] text-dim">Area</span><span className="text-[10px] text-gray-200 font-medium">{snap.area_atual}</span></div>
                <div className="flex justify-between"><span className="text-[10px] text-dim">Subarea</span><span className="text-[10px] text-gray-300">{snap.subarea}</span></div>
                <div className="flex justify-between"><span className="text-[10px] text-dim">Rota</span><span className="text-[10px] text-brand-400 font-mono">{snap.rota}</span></div>
                <div className="flex justify-between"><span className="text-[10px] text-dim">Ult. GPS</span><span className="text-[10px] font-mono text-dim">{snap.ult_gps}</span></div>
              </div>
            </section>

            {/* MOTOR & TELEMETRIA */}
            <section>
              <h4 className="text-[9px] font-display uppercase tracking-widest text-brand-400 mb-2 flex items-center gap-1.5"><Thermometer className="w-3 h-3"/>Motor & Telemetria</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {label:'Temp.',value:snap.motor_temp+'C',color:snap.motor_temp>95?'text-crit':snap.motor_temp>85?'text-warn':'text-ok'},
                  {label:'RPM',value:snap.rpm.toLocaleString(),color:'text-gray-200'},
                  {label:'Marcha',value:snap.marcha,color:'text-gray-200'},
                  {label:'P.Oleo',value:snap.pressao_oleo+' psi',color:snap.pressao_oleo<30?'text-crit':'text-ok'},
                  {label:'Veloc.',value:selectedEquip.vel+' km/h',color:'text-gray-200'},
                  {label:'Ignicao',value:snap.ignicao?'ON':'OFF',color:snap.ignicao?'text-ok':'text-dim'},
                ].map((m,i)=>(
                  <div key={i} className="bg-hud-bg rounded-lg border border-hud-border/30 p-2 text-center">
                    <div className={`text-sm font-mono font-bold ${m.color}`}>{m.value}</div>
                    <div className="text-[8px] text-dim uppercase mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* COMBUSTIVEL */}
            <section>
              <h4 className="text-[9px] font-display uppercase tracking-widest text-brand-400 mb-2 flex items-center gap-1.5"><Fuel className="w-3 h-3"/>Combustivel</h4>
              <div className="bg-hud-bg rounded-lg border border-hud-border/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-dim">Nivel Tanque</span>
                  <span className={`text-sm font-mono font-bold ${selectedEquip.tanque < 30 ? 'text-crit' : selectedEquip.tanque < 50 ? 'text-warn' : 'text-ok'}`}>{selectedEquip.tanque}%</span>
                </div>
                <div className="w-full h-2 bg-hud-bg rounded-full border border-hud-border/30 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${selectedEquip.tanque < 30 ? 'bg-crit' : selectedEquip.tanque < 50 ? 'bg-warn' : 'bg-ok'}`} style={{ width: selectedEquip.tanque + '%' }}></div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div><span className="text-[9px] text-dim block">Consumo Medio</span><span className="text-[10px] font-mono text-gray-300">{snap.consumo_medio} L/h</span></div>
                  <div><span className="text-[9px] text-dim block">Consumo Inst.</span><span className="text-[10px] font-mono text-gray-300">{snap.consumo_inst} L/h</span></div>
                  <div><span className="text-[9px] text-dim block">Autonomia</span><span className="text-[10px] font-mono text-ok">{snap.autonomia_hrs} hrs</span></div>
                  <div><span className="text-[9px] text-dim block">Ult. Abastec.</span><span className="text-[10px] font-mono text-dim">{snap.ult_abastecimento}</span></div>
                </div>
              </div>
            </section>

            {/* PRODUCAO DO TURNO */}
            <section>
              <h4 className="text-[9px] font-display uppercase tracking-widest text-brand-400 mb-2 flex items-center gap-1.5"><BarChart3 className="w-3 h-3"/>Producao do Turno</h4>
              <div className="bg-hud-bg rounded-lg border border-hud-border/50 p-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[9px] px-2 py-0.5 border border-hud-border rounded font-mono text-dim">{snap.turno}</span>
                  <span className="text-[9px] font-mono text-dim">{snap.inicio_turno} - {snap.fim_turno}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center"><div className="text-sm font-mono font-bold text-gray-200">{snap.viagens_turno}</div><div className="text-[8px] text-dim">Viagens</div></div>
                  <div className="text-center"><div className="text-sm font-mono font-bold text-gray-200">{snap.tons_turno}</div><div className="text-[8px] text-dim">Tons</div></div>
                  <div className="text-center"><div className="text-sm font-mono font-bold text-gray-200">{snap.km_turno}</div><div className="text-[8px] text-dim">Km</div></div>
                </div>
                {/* DF */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-hud-border/30">
                  <span className="text-[9px] text-dim">DF Turno</span>
                  <span className={`text-xs font-mono font-bold ${snap.df_turno >= 85 ? 'text-ok' : snap.df_turno >= 70 ? 'text-warn' : 'text-crit'}`}>{snap.df_turno}%</span>
                </div>
              </div>
            </section>

            {/* TEMPOS DO CICLO */}
            <section>
              <h4 className="text-[9px] font-display uppercase tracking-widest text-brand-400 mb-2 flex items-center gap-1.5"><Clock className="w-3 h-3"/>Tempos do Ciclo</h4>
              <div className="bg-hud-bg rounded-lg border border-hud-border/50 p-3 space-y-1.5">
                {[
                  { label: 'Fila', value: snap.tempo_fila_min, warn: 15 },
                  { label: 'Carga', value: snap.tempo_carga_min, warn: 5 },
                  { label: 'Manobra', value: snap.tempo_manobra_min, warn: 3 },
                  { label: 'Descarga', value: snap.tempo_descarga_min, warn: 4 },
                ].map((t, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[10px] text-dim">{t.label}</span>
                    <span className={`text-[10px] font-mono ${t.value > t.warn ? 'text-warn' : 'text-gray-300'}`}>{t.value} min</span>
                  </div>
                ))}
              </div>
            </section>

            {/* MANUTENCAO */}
            <section>
              <h4 className="text-[9px] font-display uppercase tracking-widest text-brand-400 mb-2 flex items-center gap-1.5"><Zap className="w-3 h-3"/>Manutencao</h4>
              <div className="bg-hud-bg rounded-lg border border-hud-border/50 p-3 grid grid-cols-2 gap-3">
                <div><span className="text-[9px] text-dim block">Ult. Manut.</span><span className="text-[10px] font-mono text-dim">{snap.ult_manutencao}</span></div>
                <div><span className="text-[9px] text-dim block">Prox. Prev.</span><span className="text-[10px] font-mono text-gray-300">{snap.proxima_prev}</span></div>
                <div><span className="text-[9px] text-dim block">Hrs p/ Prev.</span><span className={`text-[10px] font-mono ${snap.hrs_para_prev < 100 ? 'text-warn' : 'text-gray-300'}`}>{snap.hrs_para_prev}h</span></div>
                <div className="flex gap-3">
                  <div className="text-center"><div className={`text-lg font-display ${snap.alertas_abertos > 0 ? 'text-crit' : 'text-dim'}`}>{snap.alertas_abertos}</div><div className="text-[8px] text-dim">Alertas</div></div>
                  <div className="text-center"><div className={`text-lg font-display ${snap.ncs_abertas > 0 ? 'text-warn' : 'text-dim'}`}>{snap.ncs_abertas}</div><div className="text-[8px] text-dim">NCs</div></div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Digital Twin Modal */}
      {twinOpen && selectedEquip && snap && (
        <DigitalTwin equip={selectedEquip} snap={snap} onClose={() => setTwinOpen(false)} />
      )}
    </div>
  )
}
