import { useState, useMemo, useCallback, useRef, useEffect, createContext, useContext } from 'react'
import { DockviewReact, DockviewReadyEvent, IDockviewPanelProps } from 'dockview-react'
import { MapContainer, TileLayer, CircleMarker, Polygon, Popup, useMap } from 'react-leaflet'
import { equipamentos } from '../../mock/data'
import { Layers, Eye, EyeOff, Search, X, Truck, ChevronRight, Fuel, Clock, Gauge, Activity, MapPin, Radio, Thermometer, Zap, TrendingUp, AlertTriangle, CheckCircle2, BarChart3, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

/* ─── EXTENDED SNAPSHOT DATA ─── */
const snapshots: Record<number, any> = {
  1: { 
    ult_gps:'09/06 10:42:18', ignicao:true, motor_temp:92, rpm:1850, marcha:'D3', pressao_oleo:42,
    odometro:84520, consumo_medio:58.2, consumo_inst:62.1, autonomia_hrs:4.2,
    area_atual:'Frente Norte B3', subarea:'Praça de Carga A', rota:'F-001: Frente Norte → Britador',
    ult_abastecimento:'09/06 06:15', litros_ult:420, ult_checklist:'09/06 06:00',
    turno:'DIURNO A', inicio_turno:'06:00', fim_turno:'18:00',
    viagens_turno:12, tons_turno:960, km_turno:38.4, tempo_fila_min:8, tempo_carga_min:3.2, tempo_manobra_min:1.8, tempo_descarga_min:2.1,
    df_turno:88, prod_hora:120, meta_viagens:16,
    ult_manutencao:'2024-06-01', proxima_prev:'2024-06-15', hrs_para_prev:180,
    alertas_abertos:1, ncs_abertas:0
  },
  2: {
    ult_gps:'09/06 10:42:15', ignicao:true, motor_temp:88, rpm:750, marcha:'N', pressao_oleo:38,
    odometro:72100, consumo_medio:55.8, consumo_inst:12.5, autonomia_hrs:6.8,
    area_atual:'Frente Norte B3', subarea:'Praça de Carga A', rota:'F-001: Frente Norte → Britador',
    ult_abastecimento:'09/06 06:30', litros_ult:380, ult_checklist:'09/06 06:05',
    turno:'DIURNO A', inicio_turno:'06:00', fim_turno:'18:00',
    viagens_turno:10, tons_turno:800, km_turno:32.0, tempo_fila_min:22, tempo_carga_min:3.0, tempo_manobra_min:1.5, tempo_descarga_min:2.0,
    df_turno:72, prod_hora:100, meta_viagens:16,
    ult_manutencao:'2024-05-28', proxima_prev:'2024-06-28', hrs_para_prev:420,
    alertas_abertos:0, ncs_abertas:0
  },
  3: {
    ult_gps:'09/06 08:12:44', ignicao:false, motor_temp:45, rpm:0, marcha:'P', pressao_oleo:0,
    odometro:91200, consumo_medio:61.2, consumo_inst:0, autonomia_hrs:0,
    area_atual:'Oficina Central', subarea:'Box 3', rota:'—',
    ult_abastecimento:'08/06 14:00', litros_ult:450, ult_checklist:'08/06 06:00',
    turno:'—', inicio_turno:'—', fim_turno:'—',
    viagens_turno:0, tons_turno:0, km_turno:0, tempo_fila_min:0, tempo_carga_min:0, tempo_manobra_min:0, tempo_descarga_min:0,
    df_turno:0, prod_hora:0, meta_viagens:0,
    ult_manutencao:'2024-06-09', proxima_prev:'—', hrs_para_prev:0,
    alertas_abertos:2, ncs_abertas:1
  },
  4: {
    ult_gps:'09/06 10:42:12', ignicao:true, motor_temp:86, rpm:2100, marcha:'D4', pressao_oleo:44,
    odometro:63400, consumo_medio:72.5, consumo_inst:78.3, autonomia_hrs:5.1,
    area_atual:'Rota F-002', subarea:'Em trânsito', rota:'F-002: Frente Sul → Pilha Estéril',
    ult_abastecimento:'09/06 06:45', litros_ult:520, ult_checklist:'09/06 06:10',
    turno:'DIURNO A', inicio_turno:'06:00', fim_turno:'18:00',
    viagens_turno:8, tons_turno:880, km_turno:28.8, tempo_fila_min:4, tempo_carga_min:4.5, tempo_manobra_min:2.0, tempo_descarga_min:2.5,
    df_turno:92, prod_hora:110, meta_viagens:12,
    ult_manutencao:'2024-05-20', proxima_prev:'2024-06-20', hrs_para_prev:320,
    alertas_abertos:0, ncs_abertas:0
  },
  5: {
    ult_gps:'09/06 10:42:08', ignicao:true, motor_temp:90, rpm:1200, marcha:'D1', pressao_oleo:40,
    odometro:68200, consumo_medio:70.1, consumo_inst:45.2, autonomia_hrs:3.8,
    area_atual:'Britador Primário', subarea:'Pátio Descarga', rota:'F-001: Frente Norte → Britador',
    ult_abastecimento:'09/06 07:00', litros_ult:490, ult_checklist:'09/06 06:15',
    turno:'DIURNO A', inicio_turno:'06:00', fim_turno:'18:00',
    viagens_turno:11, tons_turno:880, km_turno:35.2, tempo_fila_min:6, tempo_carga_min:3.5, tempo_manobra_min:2.2, tempo_descarga_min:2.8,
    df_turno:85, prod_hora:110, meta_viagens:14,
    ult_manutencao:'2024-06-05', proxima_prev:'2024-07-05', hrs_para_prev:580,
    alertas_abertos:0, ncs_abertas:0
  },
  6: {
    ult_gps:'09/06 10:42:20', ignicao:true, motor_temp:78, rpm:1600, marcha:'—', pressao_oleo:52,
    odometro:12400, consumo_medio:42.0, consumo_inst:48.5, autonomia_hrs:8.2,
    area_atual:'Frente Norte B3', subarea:'Praça de Carga A', rota:'Ponto de carga F-001/F-003',
    ult_abastecimento:'09/06 05:45', litros_ult:280, ult_checklist:'09/06 05:50',
    turno:'DIURNO A', inicio_turno:'06:00', fim_turno:'18:00',
    viagens_turno:0, tons_turno:2400, km_turno:0, tempo_fila_min:0, tempo_carga_min:0, tempo_manobra_min:0, tempo_descarga_min:0,
    df_turno:94, prod_hora:300, meta_viagens:0,
    ult_manutencao:'2024-06-02', proxima_prev:'2024-06-22', hrs_para_prev:240,
    alertas_abertos:0, ncs_abertas:0
  },
  7: {
    ult_gps:'09/06 10:42:19', ignicao:true, motor_temp:82, rpm:1550, marcha:'—', pressao_oleo:50,
    odometro:9800, consumo_medio:38.5, consumo_inst:44.0, autonomia_hrs:9.5,
    area_atual:'Frente Sul A1', subarea:'Praça de Carga B', rota:'Ponto de carga F-002',
    ult_abastecimento:'09/06 06:00', litros_ult:260, ult_checklist:'09/06 05:55',
    turno:'DIURNO A', inicio_turno:'06:00', fim_turno:'18:00',
    viagens_turno:0, tons_turno:1800, km_turno:0, tempo_fila_min:0, tempo_carga_min:0, tempo_manobra_min:0, tempo_descarga_min:0,
    df_turno:90, prod_hora:225, meta_viagens:0,
    ult_manutencao:'2024-05-30', proxima_prev:'2024-06-30', hrs_para_prev:480,
    alertas_abertos:0, ncs_abertas:0
  },
  8: {
    ult_gps:'09/06 10:41:55', ignicao:true, motor_temp:75, rpm:1400, marcha:'D2', pressao_oleo:36,
    odometro:22100, consumo_medio:28.0, consumo_inst:32.5, autonomia_hrs:12.0,
    area_atual:'Pista Principal', subarea:'Trecho Norte', rota:'Manutenção viária',
    ult_abastecimento:'09/06 06:30', litros_ult:180, ult_checklist:'09/06 06:20',
    turno:'DIURNO A', inicio_turno:'06:00', fim_turno:'18:00',
    viagens_turno:0, tons_turno:0, km_turno:14.2, tempo_fila_min:0, tempo_carga_min:0, tempo_manobra_min:0, tempo_descarga_min:0,
    df_turno:78, prod_hora:0, meta_viagens:0,
    ult_manutencao:'2024-06-07', proxima_prev:'2024-07-07', hrs_para_prev:620,
    alertas_abertos:0, ncs_abertas:0
  },
  9: {
    ult_gps:'09/06 10:30:02', ignicao:true, motor_temp:65, rpm:600, marcha:'N', pressao_oleo:32,
    odometro:8400, consumo_medio:22.0, consumo_inst:8.0, autonomia_hrs:18.0,
    area_atual:'Frente Norte B3', subarea:'Bancada N2', rota:'Perfuração programada',
    ult_abastecimento:'08/06 14:30', litros_ult:150, ult_checklist:'09/06 06:00',
    turno:'DIURNO A', inicio_turno:'06:00', fim_turno:'18:00',
    viagens_turno:0, tons_turno:0, km_turno:0.2, tempo_fila_min:0, tempo_carga_min:0, tempo_manobra_min:0, tempo_descarga_min:0,
    df_turno:45, prod_hora:0, meta_viagens:0,
    ult_manutencao:'2024-06-04', proxima_prev:'2024-06-18', hrs_para_prev:120,
    alertas_abertos:0, ncs_abertas:0
  },
  10: {
    ult_gps:'09/06 10:42:05', ignicao:true, motor_temp:88, rpm:1900, marcha:'D2', pressao_oleo:46,
    odometro:38600, consumo_medio:48.0, consumo_inst:55.0, autonomia_hrs:5.5,
    area_atual:'Pilha ROM', subarea:'Setor B', rota:'Empurre Pilha ROM',
    ult_abastecimento:'09/06 06:15', litros_ult:320, ult_checklist:'09/06 06:10',
    turno:'DIURNO A', inicio_turno:'06:00', fim_turno:'18:00',
    viagens_turno:0, tons_turno:0, km_turno:4.8, tempo_fila_min:0, tempo_carga_min:0, tempo_manobra_min:0, tempo_descarga_min:0,
    df_turno:82, prod_hora:0, meta_viagens:0,
    ult_manutencao:'2024-06-06', proxima_prev:'2024-07-06', hrs_para_prev:540,
    alertas_abertos:0, ncs_abertas:0
  },
}

/* ─── MAP CONSTANTS ─── */
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

/* ─── SHARED CONTEXT ─── */
interface MapContextType {
  selectedEquip: any
  selectEquip: (e: any) => void
  baseMap: string
  setBaseMap: (id: string) => void
  layers: { equipamentos: boolean; areas: boolean; pontos: boolean }
  toggleLayer: (k: 'equipamentos' | 'areas' | 'pontos') => void
  flyTarget: { lat: number; lng: number } | null
}

const MapContext = createContext<MapContextType>({
  selectedEquip: null,
  selectEquip: () => {},
  baseMap: 'dark',
  setBaseMap: () => {},
  layers: { equipamentos: true, areas: true, pontos: true },
  toggleLayer: () => {},
  flyTarget: null,
})

/* ─── FLY TO COMPONENT ─── */
function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  map.flyTo([lat, lng], 16, { duration: 0.8 })
  return null
}

/* ─── EQUIP LIST PANEL ─── */
const EquipListPanel = (_props: IDockviewPanelProps) => {
  const { selectedEquip, selectEquip } = useContext(MapContext)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => equipamentos.filter(e =>
    e.codigo.toLowerCase().includes(search.toLowerCase()) ||
    e.modelo.toLowerCase().includes(search.toLowerCase()) ||
    e.grupo.toLowerCase().includes(search.toLowerCase()) ||
    (e.operador || '').toLowerCase().includes(search.toLowerCase())
  ), [search])

  const statusIcon = (s: string) => s === 'OPERANDO' ? 'ok' : s === 'PARADO' ? 'warn' : 'crit'

  return (
    <div className="h-full flex flex-col bg-hud-panel/95">
      {/* Search */}
      <div className="p-3 border-b border-hud-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dim" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar equipamento..." className="w-full pl-9 pr-8 py-2 bg-hud-bg border border-hud-border rounded-lg text-xs text-gray-200 placeholder-dim/60 focus:border-brand-600/50 focus:outline-none transition-colors" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-gray-300"><X className="w-3.5 h-3.5" /></button>}
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-[9px] font-mono text-dim">{filtered.length} equipamentos</span>
          <div className="flex items-center gap-2 text-[9px] font-mono">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-ok"></span>{equipamentos.filter(e => e.status === 'OPERANDO').length}</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-warn"></span>{equipamentos.filter(e => e.status === 'PARADO').length}</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-crit"></span>{equipamentos.filter(e => e.status === 'MANUTENCAO').length}</span>
          </div>
        </div>
      </div>

      {/* Equipment List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filtered.map(e => (
          <button key={e.id} onClick={() => selectEquip(e)} className={`w-full text-left px-3 py-2.5 border-b border-hud-border/20 transition-all hover:bg-white/[0.03] ${selectedEquip?.id === e.id ? 'bg-brand-600/10 border-l-2 border-l-brand-400' : 'border-l-2 border-l-transparent'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`led led-${statusIcon(e.status)}`}></div>
                <div>
                  <span className="text-xs font-mono font-bold text-gray-200">{e.codigo}</span>
                  <span className="text-[10px] text-dim ml-2">{e.modelo}</span>
                </div>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 transition-colors ${selectedEquip?.id === e.id ? 'text-brand-400' : 'text-dim'}`} />
            </div>
            <div className="flex items-center gap-3 mt-1 pl-5">
              <span className="text-[9px] text-dim">{e.grupo}</span>
              <span className="text-[9px] text-dim">•</span>
              <span className="text-[9px] text-gray-400">{e.atividade || '—'}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 pl-5">
              {e.operador && <span className="text-[9px] text-dim">👤 {e.operador}</span>}
              <span className="text-[9px] font-mono text-dim">{e.vel} km/h</span>
              <span className={`text-[9px] font-mono ${e.tanque < 30 ? 'text-crit' : e.tanque < 50 ? 'text-warn' : 'text-dim'}`}>⛽ {e.tanque}%</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── MAP PANEL ─── */
const MapPanel = (_props: IDockviewPanelProps) => {
  const { selectedEquip, selectEquip, baseMap, setBaseMap, layers, toggleLayer, flyTarget } = useContext(MapContext)
  const [layerPanel, setLayerPanel] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  const currentBase = baseMaps.find(b => b.id === baseMap) || baseMaps[0]

  // ResizeObserver to invalidateSize on Leaflet map
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="h-full w-full relative">
      <MapContainer
        center={[-20.124, -43.987]}
        zoom={14}
        className="h-full w-full"
        zoomControl={false}
        style={{ background: '#0a0c12' }}
        ref={mapRef}
      >
        <TileLayer url={currentBase.url} attribution="" />
        {flyTarget && <FlyTo lat={flyTarget.lat} lng={flyTarget.lng} />}

        {layers.areas && areaPolygons.map((a, i) => (
          <Polygon key={i} positions={a.coords} pathOptions={{ color: a.cor, fillColor: a.cor, fillOpacity: 0.15, weight: 2 }}>
            <Popup><div className="text-xs font-medium">{a.nome}</div></Popup>
          </Polygon>
        ))}

        {layers.equipamentos && equipamentos.map(e => (
          <CircleMarker key={e.id} center={[e.lat, e.lng]} radius={selectedEquip?.id === e.id ? 12 : 8}
            pathOptions={{ color: selectedEquip?.id === e.id ? '#7c3aed' : e.cor, fillColor: selectedEquip?.id === e.id ? '#7c3aed' : e.cor, fillOpacity: 0.85, weight: selectedEquip?.id === e.id ? 3 : 2 }}
            eventHandlers={{ click: () => selectEquip(e) }}>
            <Popup><div className="text-xs"><strong>{e.codigo}</strong><br />{e.atividade || e.status}</div></Popup>
          </CircleMarker>
        ))}

        {layers.pontos && pontosAcesso.map((p, i) => (
          <CircleMarker key={i} center={[p.lat, p.lng]} radius={5}
            pathOptions={{ color: p.cor, fillColor: p.cor, fillOpacity: 0.6, weight: 2 }}>
            <Popup><div className="text-xs font-medium">{p.nome}</div></Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Layer Control */}
      <div className="absolute top-4 right-4 z-[1000]">
        <button onClick={() => setLayerPanel(!layerPanel)} className="p-2.5 bg-hud-panel/95 backdrop-blur-md border border-hud-border rounded-lg shadow-panel text-dim hover:text-brand-400 transition-colors">
          <Layers className="w-5 h-5" />
        </button>
        {layerPanel && (
          <div className="absolute top-12 right-0 bg-hud-panel/95 backdrop-blur-md border border-hud-border rounded-xl shadow-panel p-4 w-56 space-y-4 animate-slideIn">
            <div className="space-y-2">
              <h4 className="text-[10px] font-display uppercase tracking-widest text-brand-400">Mapa Base</h4>
              {baseMaps.map(b => (
                <button key={b.id} onClick={() => setBaseMap(b.id)} className={'w-full text-left px-3 py-1.5 rounded text-xs transition-colors ' + (baseMap === b.id ? 'bg-brand-600/20 text-brand-400' : 'text-dim hover:text-gray-300 hover:bg-white/5')}>{b.name}</button>
              ))}
            </div>
            <div className="space-y-2">
              <h4 className="text-[10px] font-display uppercase tracking-widest text-brand-400">Camadas</h4>
              {Object.entries(layers).map(([k, v]) => (
                <button key={k} onClick={() => toggleLayer(k as 'equipamentos' | 'areas' | 'pontos')} className="w-full flex items-center justify-between px-3 py-1.5 rounded text-xs text-gray-300 hover:bg-white/5">
                  <span className="capitalize">{k}</span>
                  {v ? <Eye className="w-3.5 h-3.5 text-ok" /> : <EyeOff className="w-3.5 h-3.5 text-dim" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── SNAPSHOT PANEL (FLOATING) ─── */
const SnapshotPanel = (props: IDockviewPanelProps<{ equipId: number }>) => {
  const equipId = props.params.equipId
  const selectedEquip = equipamentos.find(e => e.id === equipId)
  const snap = selectedEquip ? snapshots[selectedEquip.id] : null

  if (!selectedEquip || !snap) return <div className="p-4 text-dim text-xs">Nenhum equipamento selecionado</div>

  const statusIcon = (s: string) => s === 'OPERANDO' ? 'ok' : s === 'PARADO' ? 'warn' : 'crit'

  return (
    <div className="h-full overflow-y-auto scrollbar-thin bg-hud-panel">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-hud-panel/95 backdrop-blur-xl border-b border-hud-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full animate-pulse bg-${statusIcon(selectedEquip.status)}`}></div>
          <span className="text-base font-display font-bold text-brand-400">{selectedEquip.codigo}</span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-300">{selectedEquip.modelo}</span>
          <span className="px-1.5 py-0.5 text-[9px] rounded border bg-white/5 border-hud-border text-dim">{selectedEquip.grupo}</span>
          <span className={`px-1.5 py-0.5 text-[9px] rounded border ${selectedEquip.status === 'OPERANDO' ? 'text-ok bg-ok/10 border-ok/20' : selectedEquip.status === 'PARADO' ? 'text-warn bg-warn/10 border-warn/20' : 'text-crit bg-crit/10 border-crit/20'}`}>{selectedEquip.status}</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* LOCALIZAÇÃO & ROTA */}
        <section>
          <h4 className="text-[9px] font-display uppercase tracking-widest text-brand-400 mb-2 flex items-center gap-1.5"><MapPin className="w-3 h-3"/>Localização & Rota</h4>
          <div className="bg-hud-bg rounded-lg border border-hud-border/50 p-3 space-y-2">
            <div className="flex justify-between"><span className="text-[10px] text-dim">Área</span><span className="text-[10px] text-gray-200 font-medium">{snap.area_atual}</span></div>
            <div className="flex justify-between"><span className="text-[10px] text-dim">Subárea</span><span className="text-[10px] text-gray-300">{snap.subarea}</span></div>
            <div className="flex justify-between"><span className="text-[10px] text-dim">Rota</span><span className="text-[10px] text-brand-400 font-mono">{snap.rota}</span></div>
            <div className="flex justify-between"><span className="text-[10px] text-dim">Últ. GPS</span><span className="text-[10px] font-mono text-dim">{snap.ult_gps}</span></div>
          </div>
        </section>

        {/* MOTOR & TELEMETRIA */}
        <section>
          <h4 className="text-[9px] font-display uppercase tracking-widest text-brand-400 mb-2 flex items-center gap-1.5"><Thermometer className="w-3 h-3"/>Motor & Telemetria</h4>
          <div className="grid grid-cols-3 gap-2">
            {[
              {label:'Temp.',value:snap.motor_temp+'°C',color:snap.motor_temp>95?'crit':snap.motor_temp>85?'warn':'ok'},
              {label:'RPM',value:snap.rpm.toLocaleString(),color:'gray-200'},
              {label:'Marcha',value:snap.marcha,color:'gray-200'},
              {label:'P.Óleo',value:snap.pressao_oleo+' psi',color:snap.pressao_oleo<30?'crit':'ok'},
              {label:'Veloc.',value:selectedEquip.vel+' km/h',color:'gray-200'},
              {label:'Ignição',value:snap.ignicao?'ON':'OFF',color:snap.ignicao?'ok':'dim'},
            ].map((m,i)=>(
              <div key={i} className="bg-hud-bg rounded-lg border border-hud-border/30 p-2 text-center">
                <div className={`text-sm font-mono font-bold text-${m.color}`}>{m.value}</div>
                <div className="text-[8px] text-dim uppercase mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* COMBUSTÍVEL */}
        <section>
          <h4 className="text-[9px] font-display uppercase tracking-widest text-brand-400 mb-2 flex items-center gap-1.5"><Fuel className="w-3 h-3"/>Combustível</h4>
          <div className="bg-hud-bg rounded-lg border border-hud-border/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-dim">Nível Tanque</span>
              <span className={`text-sm font-mono font-bold ${selectedEquip.tanque < 30 ? 'text-crit' : selectedEquip.tanque < 50 ? 'text-warn' : 'text-ok'}`}>{selectedEquip.tanque}%</span>
            </div>
            <div className="w-full h-2 bg-hud-bg rounded-full border border-hud-border/30 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${selectedEquip.tanque < 30 ? 'bg-crit' : selectedEquip.tanque < 50 ? 'bg-warn' : 'bg-ok'}`} style={{ width: selectedEquip.tanque + '%' }}></div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div><span className="text-[9px] text-dim block">Consumo Médio</span><span className="text-xs font-mono text-gray-200">{snap.consumo_medio} L/h</span></div>
              <div><span className="text-[9px] text-dim block">Consumo Inst.</span><span className="text-xs font-mono text-gray-200">{snap.consumo_inst} L/h</span></div>
              <div><span className="text-[9px] text-dim block">Autonomia</span><span className={`text-xs font-mono ${snap.autonomia_hrs < 3 ? 'text-crit' : snap.autonomia_hrs < 5 ? 'text-warn' : 'text-ok'}`}>{snap.autonomia_hrs} hrs</span></div>
              <div><span className="text-[9px] text-dim block">Últ. Abastec.</span><span className="text-xs font-mono text-dim">{snap.ult_abastecimento}</span></div>
            </div>
          </div>
        </section>

        {/* PRODUÇÃO DO TURNO */}
        <section>
          <h4 className="text-[9px] font-display uppercase tracking-widest text-brand-400 mb-2 flex items-center gap-1.5"><BarChart3 className="w-3 h-3"/>Produção do Turno</h4>
          <div className="bg-hud-bg rounded-lg border border-hud-border/50 p-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 text-[9px] rounded bg-brand-600/10 border border-brand-600/20 text-brand-400 font-mono">{snap.turno}</span>
              <span className="text-[10px] text-dim font-mono">{snap.inicio_turno} — {snap.fim_turno}</span>
            </div>
            {selectedEquip.grupo === 'Caminhão' ? (
              <>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 rounded-lg bg-brand-600/5 border border-brand-600/10">
                    <div className="text-lg font-display text-brand-400">{snap.viagens_turno}</div>
                    <div className="text-[8px] text-dim uppercase">Viagens</div>
                    {snap.meta_viagens > 0 && <div className="text-[8px] text-dim">Meta: {snap.meta_viagens}</div>}
                  </div>
                  <div className="text-center p-2 rounded-lg bg-ok/5 border border-ok/10">
                    <div className="text-lg font-display text-ok">{snap.tons_turno.toLocaleString()}</div>
                    <div className="text-[8px] text-dim uppercase">Tons</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/[0.02] border border-hud-border/30">
                    <div className="text-lg font-display text-gray-200">{snap.km_turno}</div>
                    <div className="text-[8px] text-dim uppercase">km</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[9px] font-display uppercase tracking-wider text-dim mb-1">Tempos Médios</div>
                  {[
                    {label:'Fila de Carga',value:snap.tempo_fila_min,max:15,color:snap.tempo_fila_min>12?'crit':snap.tempo_fila_min>8?'warn':'ok'},
                    {label:'Carregamento',value:snap.tempo_carga_min,max:8,color:'brand-400'},
                    {label:'Manobra',value:snap.tempo_manobra_min,max:5,color:'brand-400'},
                    {label:'Descarga',value:snap.tempo_descarga_min,max:5,color:'brand-400'},
                  ].map((t,i)=>(
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[9px] text-dim w-24">{t.label}</span>
                      <div className="flex-1 h-1.5 bg-hud-bg rounded-full border border-hud-border/20 overflow-hidden">
                        <div className={`h-full rounded-full bg-${t.color}`} style={{ width: Math.min(100, (t.value / t.max) * 100) + '%' }}></div>
                      </div>
                      <span className="text-[9px] font-mono text-gray-300 w-12 text-right">{t.value} min</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 rounded-lg bg-ok/5 border border-ok/10">
                  <div className="text-lg font-display text-ok">{snap.tons_turno.toLocaleString()}</div>
                  <div className="text-[8px] text-dim uppercase">Tons Produzidas</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-brand-600/5 border border-brand-600/10">
                  <div className="text-lg font-display text-brand-400">{snap.prod_hora}</div>
                  <div className="text-[8px] text-dim uppercase">Ton/h</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* DISPONIBILIDADE */}
        <section>
          <h4 className="text-[9px] font-display uppercase tracking-widest text-brand-400 mb-2 flex items-center gap-1.5"><Activity className="w-3 h-3"/>Disponibilidade</h4>
          <div className="bg-hud-bg rounded-lg border border-hud-border/50 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-dim">DF% Turno</span>
              <span className={`text-sm font-mono font-bold ${snap.df_turno >= 85 ? 'text-ok' : snap.df_turno >= 70 ? 'text-warn' : 'text-crit'}`}>{snap.df_turno}%</span>
            </div>
            <div className="w-full h-3 bg-hud-bg rounded-full border border-hud-border/30 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${snap.df_turno >= 85 ? 'bg-ok' : snap.df_turno >= 70 ? 'bg-warn' : 'bg-crit'}`} style={{ width: snap.df_turno + '%' }}></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[8px] text-dim">0%</span>
              <span className="text-[8px] text-dim">Meta 85%</span>
              <span className="text-[8px] text-dim">100%</span>
            </div>
          </div>
        </section>

        {/* OPERADOR */}
        <section>
          <h4 className="text-[9px] font-display uppercase tracking-widest text-brand-400 mb-2 flex items-center gap-1.5"><Radio className="w-3 h-3"/>Operador & Turno</h4>
          <div className="bg-hud-bg rounded-lg border border-hud-border/50 p-3 space-y-2">
            <div className="flex justify-between"><span className="text-[10px] text-dim">Operador</span><span className="text-[10px] text-gray-200 font-medium">{selectedEquip.operador || 'Sem operador'}</span></div>
            <div className="flex justify-between"><span className="text-[10px] text-dim">Atividade</span><span className="text-[10px] text-gray-300">{selectedEquip.atividade || '—'}</span></div>
            <div className="flex justify-between"><span className="text-[10px] text-dim">Turno</span><span className="text-[10px] text-gray-300">{snap.turno} ({snap.inicio_turno}-{snap.fim_turno})</span></div>
          </div>
        </section>

        {/* HORÍMETRO & ODÔMETRO */}
        <section>
          <h4 className="text-[9px] font-display uppercase tracking-widest text-brand-400 mb-2 flex items-center gap-1.5"><Clock className="w-3 h-3"/>Horímetro & Odômetro</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-hud-bg rounded-lg border border-hud-border/50 p-3 text-center">
              <div className="text-lg font-mono font-bold text-gray-200">{selectedEquip.horimetro.toLocaleString()}</div>
              <div className="text-[8px] text-dim uppercase">Horímetro (h)</div>
            </div>
            <div className="bg-hud-bg rounded-lg border border-hud-border/50 p-3 text-center">
              <div className="text-lg font-mono font-bold text-gray-200">{snap.odometro.toLocaleString()}</div>
              <div className="text-[8px] text-dim uppercase">Odômetro (km)</div>
            </div>
          </div>
        </section>

        {/* MANUTENÇÃO */}
        <section>
          <h4 className="text-[9px] font-display uppercase tracking-widest text-brand-400 mb-2 flex items-center gap-1.5"><Zap className="w-3 h-3"/>Manutenção</h4>
          <div className="bg-hud-bg rounded-lg border border-hud-border/50 p-3 space-y-2">
            <div className="flex justify-between"><span className="text-[10px] text-dim">Última Manutenção</span><span className="text-[10px] font-mono text-gray-300">{snap.ult_manutencao}</span></div>
            <div className="flex justify-between"><span className="text-[10px] text-dim">Próxima Preventiva</span><span className="text-[10px] font-mono text-gray-300">{snap.proxima_prev}</span></div>
            <div className="flex justify-between"><span className="text-[10px] text-dim">Hrs p/ Preventiva</span><span className={`text-[10px] font-mono font-bold ${snap.hrs_para_prev < 200 ? 'text-warn' : snap.hrs_para_prev < 100 ? 'text-crit' : 'text-ok'}`}>{snap.hrs_para_prev}h</span></div>
            <div className="flex justify-between"><span className="text-[10px] text-dim">Últ. Checklist</span><span className="text-[10px] font-mono text-dim">{snap.ult_checklist}</span></div>
          </div>
        </section>

        {/* ALERTAS */}
        <section>
          <h4 className="text-[9px] font-display uppercase tracking-widest text-brand-400 mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3"/>Alertas & NCs</h4>
          <div className="flex gap-2">
            <div className={`flex-1 rounded-lg border p-3 text-center ${snap.alertas_abertos > 0 ? 'bg-crit/5 border-crit/20' : 'bg-hud-bg border-hud-border/50'}`}>
              <div className={`text-lg font-display ${snap.alertas_abertos > 0 ? 'text-crit' : 'text-dim'}`}>{snap.alertas_abertos}</div>
              <div className="text-[8px] text-dim uppercase">Alertas</div>
            </div>
            <div className={`flex-1 rounded-lg border p-3 text-center ${snap.ncs_abertas > 0 ? 'bg-warn/5 border-warn/20' : 'bg-hud-bg border-hud-border/50'}`}>
              <div className={`text-lg font-display ${snap.ncs_abertas > 0 ? 'text-warn' : 'text-dim'}`}>{snap.ncs_abertas}</div>
              <div className="text-[8px] text-dim uppercase">NCs</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

/* ─── MAIN MAPA COMPONENT ─── */
const components = {
  equiplist: EquipListPanel,
  map: MapPanel,
  snapshot: SnapshotPanel,
}

export default function Mapa() {
  const [selectedEquip, setSelectedEquip] = useState<any>(null)
  const [baseMap, setBaseMap] = useState('dark')
  const [layers, setLayers] = useState({ equipamentos: true, areas: true, pontos: true })
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null)
  const apiRef = useRef<any>(null)

  const toggleLayer = useCallback((k: 'equipamentos' | 'areas' | 'pontos') => {
    setLayers(p => ({ ...p, [k]: !p[k] }))
  }, [])

  const selectEquip = useCallback((e: any) => {
    setSelectedEquip(e)
    setFlyTarget({ lat: e.lat, lng: e.lng })

    // Open snapshot as right-side panel (drawer-style)
    if (apiRef.current) {
      const api = apiRef.current
      const existing = api.getPanel('snapshot')
      if (existing) {
        // Remove and re-add with new data
        api.removePanel(existing)
      }
      setTimeout(() => {
        api.addPanel({
          id: 'snapshot',
          component: 'snapshot',
          title: `${e.codigo}`,
          params: { equipId: e.id },
          position: { referencePanel: 'map', direction: 'right' },
        })
        // Resize snapshot to be narrower
        const snapPanel = api.getPanel('snapshot')
        if (snapPanel?.group) {
          try { snapPanel.group.api.setSize({ width: 350 }) } catch(_) {}
        }
      }, 50)
    }
  }, [])

  const contextValue = useMemo(() => ({
    selectedEquip, selectEquip, baseMap, setBaseMap, layers, toggleLayer, flyTarget
  }), [selectedEquip, selectEquip, baseMap, layers, toggleLayer, flyTarget])

  const onReady = useCallback((event: DockviewReadyEvent) => {
    apiRef.current = event.api
    event.api.addPanel({ id: 'equiplist', component: 'equiplist', title: 'Equipamentos' })
    event.api.addPanel({ id: 'map', component: 'map', title: 'Mapa', position: { referencePanel: 'equiplist', direction: 'right' } })

    // Set initial sizing: equiplist smaller, map larger
    const equipGroup = event.api.getPanel('equiplist')?.group
    if (equipGroup) {
      try { equipGroup.api.setSize({ width: 320 }) } catch(_) {}
    }
  }, [])

  const resetLayout = useCallback(() => {
    if (!apiRef.current) return
    const api = apiRef.current
    const panels = api.panels
    panels.forEach((p: any) => p.api.close())
    api.addPanel({ id: 'equiplist', component: 'equiplist', title: 'Equipamentos' })
    api.addPanel({ id: 'map', component: 'map', title: 'Mapa', position: { referencePanel: 'equiplist', direction: 'right' } })
    const equipGroup = api.getPanel('equiplist')?.group
    if (equipGroup) {
      try { equipGroup.api.setSize({ width: 320 }) } catch(_) {}
    }
  }, [])

  return (
    <MapContext.Provider value={contextValue}>
      <div className="h-full relative">
        <button
          onClick={resetLayout}
          className="absolute top-2 right-2 z-50 flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase text-dim hover:text-brand-400 bg-hud-panel/90 border border-hud-border rounded-md hover:shadow-glow-sm transition-all backdrop-blur-sm"
          title="Resetar Layout"
        >
          <RotateCcw className="w-3 h-3" />Reset
        </button>
        <DockviewReact
          onReady={onReady}
          components={components}
          className="dockview-theme-dark dv-locked h-full"
          locked={true}
          watermarkComponent={() => null}
        />
      </div>
    </MapContext.Provider>
  )
}
