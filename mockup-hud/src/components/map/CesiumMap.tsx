import { useEffect, useRef, useState } from 'react'
import { equipamentos } from '../../mock/data'

const ION_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3YjhlM2E3MC04NDg1LTQxZGMtOTc3Ni1kNmZhMDQ5MzE1Y2UiLCJpZCI6NDQwMDgzLCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3ODA1Mjk5MjV9._6cgcIYzSisgM2LtsyrsjfHVx-DK2hnJaGBKnMv609Y'
const CESIUM_CDN = 'https://cesium.com/downloads/cesiumjs/releases/1.122/Build/Cesium'

const statusColor = (s: string) => s === 'OPERANDO' ? '#22c55e' : s === 'PARADO' ? '#f59e0b' : '#ef4444'

interface Props {
  onSelectEquip: (equip: any) => void
  selectedEquip: any
  flyTarget: { lat: number; lng: number } | null
}

function loadCesiumCDN(): Promise<any> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).Cesium) { resolve((window as any).Cesium); return }

    // Load CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = CESIUM_CDN + '/Widgets/widgets.css'
    document.head.appendChild(link)

    // Load JS
    const script = document.createElement('script')
    script.src = CESIUM_CDN + '/Cesium.js'
    script.onload = () => {
      const C = (window as any).Cesium
      if (C) resolve(C)
      else reject(new Error('Cesium failed to initialize'))
    }
    script.onerror = () => reject(new Error('Failed to load Cesium CDN'))
    document.head.appendChild(script)
  })
}

export default function CesiumMap({ onSelectEquip, selectedEquip, flyTarget }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const Cesium = await loadCesiumCDN()
        if (cancelled || !containerRef.current) return

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

        viewer.scene.globe.enableLighting = true
        viewer.scene.globe.depthTestAgainstTerrain = true
        viewer.scene.fog.enabled = true
        viewer.scene.fog.density = 0.0002
        viewer.scene.verticalExaggeration = 1.5

        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(-43.973, -20.152, 2500),
          orientation: { heading: 0, pitch: Cesium.Math.toRadians(-40), roll: 0 },
          duration: 0
        })

        // Equipment markers
        equipamentos.forEach((e: any) => {
          viewer.entities.add({
            id: 'equip-' + e.id,
            position: Cesium.Cartesian3.fromDegrees(e.lng, e.lat, 15),
            billboard: {
              image: createCanvas(e),
              width: 28, height: 28,
              verticalOrigin: Cesium.VerticalOrigin.CENTER,
              heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
              text: e.codigo,
              font: '9px monospace',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.TOP,
              pixelOffset: new Cesium.Cartesian2(0, 16),
              heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            properties: { equipData: e }
          })
        })

        // Click
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
        handler.setInputAction((m: any) => {
          const picked = viewer.scene.pick(m.position)
          if (Cesium.defined(picked) && picked.id?.id?.startsWith('equip-')) {
            const d = picked.id.properties?.equipData?.getValue(Cesium.JulianDate.now())
            if (d) onSelectEquip(d)
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

        viewerRef.current = viewer
        setLoading(false)
      } catch (err: any) {
        if (!cancelled) setError(err.message)
      }
    }

    init()
    return () => { cancelled = true; viewerRef.current?.destroy() }
  }, [])

  useEffect(() => {
    if (!viewerRef.current || !flyTarget) return
    const Cesium = (window as any).Cesium
    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(flyTarget.lng, flyTarget.lat, 600),
      orientation: { heading: 0, pitch: Cesium.Math.toRadians(-35), roll: 0 },
      duration: 1.2
    })
  }, [flyTarget])

  if (error) return (
    <div className="h-full w-full flex items-center justify-center bg-hud-bg">
      <div className="text-center"><span className="text-xs font-mono text-red-400 block mb-1">Erro 3D</span><span className="text-[10px] text-dim">{error}</span></div>
    </div>
  )

  return (
    <div className="h-full w-full relative">
      <div ref={containerRef} className="h-full w-full" />
      {loading && <div className="absolute inset-0 flex items-center justify-center bg-hud-bg/80"><span className="text-xs font-mono text-brand-400 animate-pulse">Carregando Cesium 3D...</span></div>}
      {!loading && <div className="absolute bottom-3 left-3 z-10 px-2 py-1 bg-black/50 backdrop-blur-sm border border-brand-600/30 rounded-md"><span className="text-[9px] font-mono text-brand-400">3D TERRAIN • CESIUM ION</span></div>}
    </div>
  )
}

function createCanvas(equip: any): HTMLCanvasElement {
  const s = 28, c = document.createElement('canvas')
  c.width = s; c.height = s
  const x = c.getContext('2d')!
  const col = statusColor(equip.status)
  x.translate(s/2, s/2)
  x.beginPath(); x.arc(0, 0, s/2-2, 0, Math.PI*2); x.fillStyle = 'rgba(0,0,0,0.6)'; x.fill()
  x.strokeStyle = col; x.lineWidth = 2; x.stroke()
  x.fillStyle = col; x.fillRect(-5, -7, 10, 14)
  x.restore()
  return c
}
