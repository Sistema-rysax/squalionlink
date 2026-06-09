import { useEffect, useRef, useState } from 'react'
import { equipamentos } from '../../mock/data'
import { Layers, Eye, EyeOff } from 'lucide-react'

// Access Cesium from global (loaded via CDN in index.html)
declare const Cesium: any

const ION_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3YjhlM2E3MC04NDg1LTQxZGMtOTc3Ni1kNmZhMDQ5MzE1Y2UiLCJpZCI6NDQwMDgzLCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3ODA1Mjk5MjV9._6cgcIYzSisgM2LtsyrsjfHVx-DK2hnJaGBKnMv609Y'

const statusColor = (s: string) => s === 'OPERANDO' ? '#22c55e' : s === 'PARADO' ? '#f59e0b' : '#ef4444'

interface Props {
  onSelectEquip: (equip: any) => void
  selectedEquip: any
  flyTarget: { lat: number; lng: number } | null
}

export default function CesiumMap({ onSelectEquip, selectedEquip, flyTarget }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return
    if (typeof Cesium === 'undefined') {
      setError('Cesium nao carregou. Verifique conexao.')
      return
    }

    try {
      Cesium.Ion.defaultAccessToken = ION_TOKEN

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
        msaaSamples: 4,
      })

      // High quality settings
      viewer.scene.globe.enableLighting = true
      viewer.scene.globe.depthTestAgainstTerrain = true
      viewer.scene.fog.enabled = true
      viewer.scene.fog.density = 0.0002
      viewer.scene.verticalExaggeration = 1.5

      // Fly to mine area
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-43.973, -20.152, 2500),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-40),
          roll: 0
        },
        duration: 0
      })

      // Add equipment entities
      equipamentos.forEach((e: any) => {
        const color = Cesium.Color.fromCssColorString(statusColor(e.status))
        viewer.entities.add({
          id: 'equip-' + e.id,
          position: Cesium.Cartesian3.fromDegrees(e.lng, e.lat, 15),
          billboard: {
            image: createEquipCanvas(e),
            width: 28,
            height: 28,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          label: {
            text: e.codigo,
            font: '9px JetBrains Mono',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.TOP,
            pixelOffset: new Cesium.Cartesian2(0, 16),
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            scale: 0.9,
          },
          properties: { equipData: e }
        })
      })

      // Add geofence areas
      const areas = [
        { nome: 'Frente Norte', color: '#ef4444', coords: [[-43.978,-20.146],[-43.973,-20.146],[-43.973,-20.151],[-43.978,-20.151]] },
        { nome: 'Frente Sul', color: '#f97316', coords: [[-43.976,-20.153],[-43.971,-20.153],[-43.971,-20.158],[-43.976,-20.158]] },
        { nome: 'Patio Manutencao', color: '#6b7280', coords: [[-43.972,-20.156],[-43.968,-20.156],[-43.968,-20.159],[-43.972,-20.159]] },
        { nome: 'Britador', color: '#6366f1', coords: [[-43.978,-20.148],[-43.975,-20.148],[-43.975,-20.150],[-43.978,-20.150]] },
        { nome: 'Pilha ROM', color: '#0ea5e9', coords: [[-43.974,-20.149],[-43.971,-20.149],[-43.971,-20.152],[-43.974,-20.152]] },
      ]

      areas.forEach(a => {
        const positions = a.coords.map(c => Cesium.Cartesian3.fromDegrees(c[0], c[1]))
        positions.push(positions[0])
        viewer.entities.add({
          polygon: {
            hierarchy: new Cesium.PolygonHierarchy(positions),
            material: Cesium.Color.fromCssColorString(a.color).withAlpha(0.15),
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString(a.color).withAlpha(0.6),
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            classificationType: Cesium.ClassificationType.TERRAIN,
          },
          position: Cesium.Cartesian3.fromDegrees(
            a.coords.reduce((s: number, c: number[]) => s + c[0], 0) / a.coords.length,
            a.coords.reduce((s: number, c: number[]) => s + c[1], 0) / a.coords.length, 30
          ),
          label: {
            text: a.nome,
            font: '10px JetBrains Mono',
            fillColor: Cesium.Color.fromCssColorString(a.color),
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        })
      })

      // Click handler
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      handler.setInputAction((movement: any) => {
        const picked = viewer.scene.pick(movement.position)
        if (Cesium.defined(picked) && picked.id && picked.id.id?.startsWith('equip-')) {
          const eqData = picked.id.properties?.equipData?.getValue(Cesium.JulianDate.now())
          if (eqData) onSelectEquip(eqData)
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      viewerRef.current = viewer
      setReady(true)

      return () => {
        handler.destroy()
        viewer.destroy()
        viewerRef.current = null
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao inicializar Cesium')
    }
  }, [])

  // Fly to selected
  useEffect(() => {
    if (!viewerRef.current || !flyTarget) return
    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(flyTarget.lng, flyTarget.lat, 600),
      orientation: { heading: 0, pitch: Cesium.Math.toRadians(-35), roll: 0 },
      duration: 1.2
    })
  }, [flyTarget])

  if (error) return (
    <div className="h-full w-full flex items-center justify-center bg-hud-bg">
      <div className="text-center">
        <span className="text-xs font-mono text-red-400 block mb-1">Erro 3D</span>
        <span className="text-[10px] text-dim">{error}</span>
      </div>
    </div>
  )

  return (
    <div className="h-full w-full relative">
      <div ref={containerRef} className="h-full w-full" />
      <div className="absolute bottom-3 left-3 z-[400] px-2 py-1 bg-black/50 backdrop-blur-sm border border-brand-600/30 rounded-md">
        <span className="text-[9px] font-mono text-brand-400">3D TERRAIN • CESIUM ION</span>
      </div>
    </div>
  )
}

function createEquipCanvas(equip: any): HTMLCanvasElement {
  const size = 28
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const color = statusColor(equip.status)
  const grupo = (equip.grupo || '').toLowerCase()

  ctx.save()
  ctx.translate(size/2, size/2)

  ctx.beginPath()
  ctx.arc(0, 0, size/2 - 2, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.6)'
  ctx.fill()
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = color
  if (grupo.includes('caminh')) {
    ctx.fillRect(-6, -8, 12, 16)
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fillRect(-5, -8, 10, 5)
  } else if (grupo.includes('escav')) {
    ctx.beginPath()
    ctx.ellipse(0, 1, 6, 8, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, -4)
    ctx.lineTo(0, -11)
    ctx.stroke()
  } else if (grupo.includes('carreg')) {
    ctx.fillRect(-6, -6, 12, 14)
    ctx.fillStyle = color + '99'
    ctx.fillRect(-7, -9, 14, 4)
  } else if (grupo.includes('moto')) {
    ctx.fillRect(-3, -10, 6, 20)
    ctx.fillStyle = color + '99'
    ctx.fillRect(-8, 0, 16, 2)
  } else if (grupo.includes('trat')) {
    ctx.fillRect(-6, -5, 12, 12)
    ctx.fillStyle = color + '99'
    ctx.fillRect(-9, -8, 18, 3)
  } else {
    ctx.fillRect(-6, -8, 12, 16)
  }

  ctx.restore()
  return canvas
}
