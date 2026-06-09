import { useEffect, useRef, useState, useCallback } from 'react'
import * as Cesium from 'cesium'
import { equipamentos } from '../../mock/data'
import { Layers, Eye, EyeOff } from 'lucide-react'

// Cesium Ion access token (free tier - world terrain + imagery)
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWRiMGY5Yi1kNmRiLTRlZTktYjZiNi0zYTFjNGMxYmNhNzciLCJpZCI6MjU5LCJpYXQiOjE3MzQ1NTIwMDB9.placeholder_token'

const statusColor = (s: string) => s === 'OPERANDO' ? Cesium.Color.fromCssColorString('#22c55e') : s === 'PARADO' ? Cesium.Color.fromCssColorString('#f59e0b') : Cesium.Color.fromCssColorString('#ef4444')

interface Props {
  onSelectEquip: (equip: any) => void
  selectedEquip: any
  flyTarget: { lat: number; lng: number } | null
}

export default function CesiumMap({ onSelectEquip, selectedEquip, flyTarget }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Cesium.Viewer | null>(null)
  const [ready, setReady] = useState(false)
  const [layerPanel, setLayerPanel] = useState(false)
  const [showAreas, setShowAreas] = useState(true)
  const [showLabels, setShowLabels] = useState(true)

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return

    const viewer = new Cesium.Viewer(containerRef.current, {
      terrain: Cesium.Terrain.fromWorldTerrain(),
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      vrButton: false,
      selectionIndicator: false,
      infoBox: false,
      creditContainer: document.createElement('div'),
      // High quality settings
      requestRenderMode: false,
      maximumRenderTimeChange: Infinity,
      msaaSamples: 4,
    })

    // Set high quality terrain
    viewer.scene.globe.enableLighting = true
    viewer.scene.globe.depthTestAgainstTerrain = true
    viewer.scene.fog.enabled = true
    viewer.scene.fog.density = 0.0002

    // Atmosphere
    viewer.scene.skyAtmosphere.hueShift = -0.02
    viewer.scene.skyAtmosphere.saturationShift = 0.1
    viewer.scene.skyAtmosphere.brightnessShift = -0.1

    // Terrain exaggeration for better visualization
    viewer.scene.verticalExaggeration = 1.5

    // Fly to mine area
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-43.971, -20.153, 3000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0
      },
      duration: 0
    })

    // Add equipment entities
    equipamentos.forEach(e => {
      const color = statusColor(e.status)
      viewer.entities.add({
        id: 'equip-' + e.id,
        position: Cesium.Cartesian3.fromDegrees(e.lng, e.lat, 20),
        billboard: {
          image: createEquipBillboard(e),
          width: 36,
          height: 36,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: e.codigo,
          font: '10px JetBrains Mono',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, 20),
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        properties: { equipData: e }
      })
    })

    // Add geofence areas
    const areas = [
      { nome: 'Frente Norte', color: '#ef4444', coords: [[-43.978,-20.146],[-43.973,-20.146],[-43.973,-20.151],[-43.978,-20.151]] },
      { nome: 'Frente Sul', color: '#f97316', coords: [[-43.976,-20.153],[-43.971,-20.153],[-43.971,-20.158],[-43.976,-20.158]] },
      { nome: 'Patio Manutencao', color: '#6b7280', coords: [[-43.972,-20.156],[-43.968,-20.156],[-43.968,-20.159],[-43.972,-20.159]] },
      { nome: 'Britador Primario', color: '#6366f1', coords: [[-43.978,-20.148],[-43.975,-20.148],[-43.975,-20.150],[-43.978,-20.150]] },
      { nome: 'Pilha ROM', color: '#0ea5e9', coords: [[-43.974,-20.149],[-43.971,-20.149],[-43.971,-20.152],[-43.974,-20.152]] },
      { nome: 'Deposito Esteril', color: '#22c55e', coords: [[-43.980,-20.152],[-43.976,-20.152],[-43.976,-20.156],[-43.980,-20.156]] },
    ]

    areas.forEach(a => {
      const positions = a.coords.map(c => Cesium.Cartesian3.fromDegrees(c[0], c[1]))
      positions.push(positions[0]) // close polygon
      viewer.entities.add({
        id: 'area-' + a.nome,
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(positions),
          material: Cesium.Color.fromCssColorString(a.color).withAlpha(0.15),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString(a.color).withAlpha(0.6),
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          classificationType: Cesium.ClassificationType.TERRAIN,
        },
        label: {
          text: a.nome,
          font: '11px JetBrains Mono',
          fillColor: Cesium.Color.fromCssColorString(a.color),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        position: Cesium.Cartesian3.fromDegrees(
          a.coords.reduce((s, c) => s + c[0], 0) / a.coords.length,
          a.coords.reduce((s, c) => s + c[1], 0) / a.coords.length,
          30
        ),
      })
    })

    // Click handler
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction((movement: any) => {
      const picked = viewer.scene.pick(movement.position)
      if (Cesium.defined(picked) && picked.id && picked.id.id?.startsWith('equip-')) {
        const equipData = picked.id.properties?.equipData?.getValue(Cesium.JulianDate.now())
        if (equipData) onSelectEquip(equipData)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    viewerRef.current = viewer
    setReady(true)

    return () => {
      handler.destroy()
      viewer.destroy()
      viewerRef.current = null
    }
  }, [])

  // Fly to selected equipment
  useEffect(() => {
    if (!viewerRef.current || !flyTarget) return
    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(flyTarget.lng, flyTarget.lat, 800),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-35),
        roll: 0
      },
      duration: 1.5
    })
  }, [flyTarget])

  // Highlight selected
  useEffect(() => {
    if (!viewerRef.current) return
    viewerRef.current.entities.values.forEach(entity => {
      if (entity.id?.startsWith('equip-')) {
        const isSelected = entity.id === 'equip-' + selectedEquip?.id
        if (entity.billboard) {
          entity.billboard.width = new Cesium.ConstantProperty(isSelected ? 48 : 36)
          entity.billboard.height = new Cesium.ConstantProperty(isSelected ? 48 : 36)
        }
      }
    })
  }, [selectedEquip])

  // Toggle areas visibility
  useEffect(() => {
    if (!viewerRef.current) return
    viewerRef.current.entities.values.forEach(entity => {
      if (entity.id?.startsWith('area-')) {
        entity.show = showAreas
      }
    })
  }, [showAreas])

  return (
    <div className="h-full w-full relative">
      <div ref={containerRef} className="h-full w-full" />

      {/* Layer control */}
      <button onClick={() => setLayerPanel(!layerPanel)} className="absolute top-3 right-3 z-[400] w-9 h-9 bg-hud-panel/90 backdrop-blur-sm border border-hud-border rounded-lg flex items-center justify-center hover:bg-hud-panel transition-all shadow-lg">
        <Layers className="w-4 h-4 text-gray-300" />
      </button>
      {layerPanel && (
        <div className="absolute top-14 right-3 z-[400] bg-hud-panel/95 backdrop-blur-xl border border-hud-border rounded-xl p-3 min-w-[160px] shadow-2xl">
          <h4 className="text-[9px] uppercase tracking-widest text-dim mb-2 font-display">Camadas 3D</h4>
          <button onClick={() => setShowAreas(!showAreas)} className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-white/[0.03] transition-all">
            {showAreas ? <Eye className="w-3 h-3 text-brand-400" /> : <EyeOff className="w-3 h-3 text-dim" />}
            <span className={`text-[10px] font-mono ${showAreas ? 'text-gray-200' : 'text-dim'}`}>Geofences</span>
          </button>
          <button onClick={() => setShowLabels(!showLabels)} className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-white/[0.03] transition-all">
            {showLabels ? <Eye className="w-3 h-3 text-brand-400" /> : <EyeOff className="w-3 h-3 text-dim" />}
            <span className={`text-[10px] font-mono ${showLabels ? 'text-gray-200' : 'text-dim'}`}>Labels</span>
          </button>
        </div>
      )}

      {/* 3D badge */}
      <div className="absolute bottom-3 left-3 z-[400] px-2 py-1 bg-hud-panel/80 border border-brand-600/30 rounded-md">
        <span className="text-[9px] font-mono text-brand-400">3D TERRAIN • CESIUM ION</span>
      </div>
    </div>
  )
}

// Generate equipment billboard canvas
function createEquipBillboard(equip: any): HTMLCanvasElement {
  const size = 36
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const color = equip.status === 'OPERANDO' ? '#22c55e' : equip.status === 'PARADO' ? '#f59e0b' : '#ef4444'
  const grupo = (equip.grupo || '').toLowerCase()

  ctx.save()
  ctx.translate(size/2, size/2)

  // Background circle
  ctx.beginPath()
  ctx.arc(0, 0, size/2 - 2, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.6)'
  ctx.fill()
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.stroke()

  // Simple icon based on type
  ctx.fillStyle = color
  if (grupo.includes('caminh')) {
    // Truck shape
    ctx.fillRect(-8, -10, 16, 20)
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fillRect(-6, -10, 12, 7)
  } else if (grupo.includes('escav')) {
    // Excavator
    ctx.beginPath()
    ctx.ellipse(0, 2, 8, 10, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = color
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(0, -5)
    ctx.lineTo(0, -14)
    ctx.stroke()
  } else if (grupo.includes('moto')) {
    // Grader
    ctx.fillRect(-4, -12, 8, 24)
    ctx.fillStyle = color + '99'
    ctx.fillRect(-10, 0, 20, 3)
  } else if (grupo.includes('perf')) {
    // Drill
    ctx.fillRect(-7, -4, 14, 16)
    ctx.fillRect(-2, -14, 4, 12)
  } else if (grupo.includes('trat')) {
    // Dozer
    ctx.fillRect(-8, -6, 16, 14)
    ctx.fillStyle = color + '99'
    ctx.fillRect(-11, -10, 22, 4)
  } else {
    ctx.fillRect(-8, -10, 16, 20)
  }

  // Direction indicator
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.moveTo(0, -size/2 + 4)
  ctx.lineTo(-3, -size/2 + 8)
  ctx.lineTo(3, -size/2 + 8)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
  return canvas
}
