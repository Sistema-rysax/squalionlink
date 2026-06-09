import { useRef, useState, useCallback, useEffect } from 'react'
import { DockviewReact, DockviewReadyEvent, DockviewApi, IDockviewPanelProps } from 'dockview-react'
import 'dockview-core/dist/styles/dockview.css'

// === WINDOW REGISTRY ===
// All available "apps" the user can open from the dock
export interface WindowDef {
  id: string
  title: string
  icon: string // emoji or lucide icon name
  component: string
  defaultWidth?: number
  defaultHeight?: number
  singleton?: boolean // only one instance allowed
}

interface WindowManagerProps {
  windows: WindowDef[]
  components: Record<string, React.FunctionComponent<IDockviewPanelProps>>
  defaultOpen?: string[] // windows open by default on load
}

export default function WindowManager({ windows, components, defaultOpen = [] }: WindowManagerProps) {
  const apiRef = useRef<DockviewApi | null>(null)
  const [openWindows, setOpenWindows] = useState<Set<string>>(new Set())
  const [minimized, setMinimized] = useState<Set<string>>(new Set())

  const onReady = useCallback((event: DockviewReadyEvent) => {
    apiRef.current = event.api
    
    // Open default windows with staggered positions
    defaultOpen.forEach((id, i) => {
      const def = windows.find(w => w.id === id)
      if (!def) return
      const xOffset = 40 + (i % 4) * 60
      const yOffset = 30 + (i % 3) * 50
      event.api.addPanel({
        id: def.id,
        component: def.component,
        title: def.title,
        floating: {
          width: def.defaultWidth || 700,
          height: def.defaultHeight || 500,
          x: xOffset,
          y: yOffset,
        }
      })
      setOpenWindows(prev => new Set([...prev, def.id]))
    })

    // Listen for panel close
    event.api.onDidRemovePanel((e) => {
      setOpenWindows(prev => {
        const next = new Set(prev)
        next.delete(e.id)
        return next
      })
      setMinimized(prev => {
        const next = new Set(prev)
        next.delete(e.id)
        return next
      })
    })
  }, [windows, defaultOpen])

  const openWindow = useCallback((def: WindowDef) => {
    if (!apiRef.current) return
    
    // If singleton and already open, focus it
    if (def.singleton && openWindows.has(def.id)) {
      const panel = apiRef.current.getPanel(def.id)
      if (panel) {
        panel.api.setActive()
        // If minimized, restore
        if (minimized.has(def.id)) {
          setMinimized(prev => {
            const next = new Set(prev)
            next.delete(def.id)
            return next
          })
        }
      }
      return
    }

    const id = def.singleton ? def.id : `${def.id}-${Date.now()}`
    const count = [...openWindows].filter(w => w.startsWith(def.id)).length
    const xOffset = 80 + (count % 5) * 40
    const yOffset = 60 + (count % 4) * 35

    apiRef.current.addPanel({
      id,
      component: def.component,
      title: def.title,
      floating: {
        width: def.defaultWidth || 700,
        height: def.defaultHeight || 500,
        x: xOffset,
        y: yOffset,
      }
    })
    setOpenWindows(prev => new Set([...prev, id]))
  }, [openWindows, minimized])

  const closeWindow = useCallback((id: string) => {
    if (!apiRef.current) return
    const panel = apiRef.current.getPanel(id)
    if (panel) apiRef.current.removePanel(panel)
  }, [])

  const closeAll = useCallback(() => {
    if (!apiRef.current) return
    apiRef.current.panels.forEach(p => apiRef.current!.removePanel(p))
  }, [])

  const tileAll = useCallback(() => {
    if (!apiRef.current) return
    const api = apiRef.current
    const panels = api.panels
    if (panels.length === 0) return
    
    // Remove all and re-add as docked grid
    const panelDefs = panels.map(p => ({ id: p.id, component: (p as any)._component, title: p.title }))
    panels.forEach(p => api.removePanel(p))
    
    panelDefs.forEach((def, i) => {
      if (i === 0) {
        api.addPanel({ id: def.id, component: def.component, title: def.title })
      } else {
        api.addPanel({
          id: def.id,
          component: def.component,
          title: def.title,
          position: { referencePanel: panelDefs[0].id, direction: i % 2 === 0 ? 'below' : 'right' }
        })
      }
    })
    setOpenWindows(new Set(panelDefs.map(p => p.id)))
  }, [])

  const cascadeAll = useCallback(() => {
    if (!apiRef.current) return
    const api = apiRef.current
    const panels = api.panels
    if (panels.length === 0) return
    
    const defs = panels.map(p => ({ id: p.id, component: (p as any)._component, title: p.title }))
    panels.forEach(p => api.removePanel(p))
    
    defs.forEach((def, i) => {
      api.addPanel({
        id: def.id,
        component: def.component,
        title: def.title,
        floating: {
          width: 700,
          height: 500,
          x: 50 + i * 35,
          y: 40 + i * 30,
        }
      })
    })
    setOpenWindows(new Set(defs.map(p => p.id)))
  }, [])

  return (
    <div className="h-full flex flex-col relative">
      {/* Desktop Area */}
      <div className="flex-1 relative overflow-hidden">
        <DockviewReact
          onReady={onReady}
          components={components}
          className="dockview-theme-dark h-full"
          watermarkComponent={DesktopWatermark}
        />
      </div>

      {/* Taskbar */}
      <div className="h-10 bg-hud-panel/95 backdrop-blur-md border-t border-hud-border flex items-center gap-1 px-2 z-50">
        {/* App launcher */}
        <div className="relative group">
          <button className="px-3 py-1.5 text-[10px] font-mono uppercase text-brand-400 bg-brand-600/10 border border-brand-600/30 rounded hover:bg-brand-600/20 transition-all">
            ▣ Apps
          </button>
          {/* Popup menu */}
          <div className="absolute bottom-full left-0 mb-1 hidden group-hover:flex flex-col bg-hud-panel border border-hud-border rounded-lg shadow-2xl py-1 min-w-[200px] max-h-[400px] overflow-y-auto z-[999]">
            {windows.map(w => (
              <button
                key={w.id}
                onClick={() => openWindow(w)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-brand-600/10 text-hud-text transition-colors"
              >
                <span className="text-base">{w.icon}</span>
                <span className="font-mono">{w.title}</span>
                {openWindows.has(w.id) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400"></span>}
              </button>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-hud-border mx-1"></div>

        {/* Open windows in taskbar */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto">
          {[...openWindows].map(id => {
            const def = windows.find(w => w.id === id) || windows.find(w => id.startsWith(w.id))
            if (!def) return null
            return (
              <button
                key={id}
                onClick={() => {
                  const panel = apiRef.current?.getPanel(id)
                  if (panel) panel.api.setActive()
                }}
                className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono text-hud-text bg-white/5 border border-hud-border rounded hover:bg-brand-600/10 hover:border-brand-600/30 transition-all max-w-[140px]"
              >
                <span>{def.icon}</span>
                <span className="truncate">{def.title}</span>
                <span
                  onClick={(e) => { e.stopPropagation(); closeWindow(id) }}
                  className="ml-auto text-dim hover:text-red-400 text-[8px] cursor-pointer"
                >✕</span>
              </button>
            )
          })}
        </div>

        {/* Window management buttons */}
        <div className="flex items-center gap-1">
          <button onClick={cascadeAll} className="px-2 py-1 text-[9px] font-mono text-dim hover:text-brand-400 border border-transparent hover:border-hud-border rounded transition-all" title="Cascata">⧉</button>
          <button onClick={tileAll} className="px-2 py-1 text-[9px] font-mono text-dim hover:text-brand-400 border border-transparent hover:border-hud-border rounded transition-all" title="Tile">▦</button>
          <button onClick={closeAll} className="px-2 py-1 text-[9px] font-mono text-dim hover:text-red-400 border border-transparent hover:border-hud-border rounded transition-all" title="Fechar Todas">✕</button>
        </div>
      </div>
    </div>
  )
}

// Watermark shown when no windows are open
function DesktopWatermark() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center opacity-30">
        <div className="text-6xl mb-4">⬡</div>
        <div className="text-sm font-display tracking-widest uppercase text-dim">SqualionLink</div>
        <div className="text-[10px] font-mono text-dim/50 mt-2">Abra aplicações pelo menu Apps ou pelo dock</div>
      </div>
    </div>
  )
}
