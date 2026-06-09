import { useRef, useState, useCallback } from 'react'
import { DockviewReact, DockviewReadyEvent, DockviewApi, IDockviewPanelProps } from 'dockview-react'
import { useTheme } from '../../contexts/ThemeContext'

export interface WindowDef {
  id: string
  title: string
  icon: string
  component: string
  defaultWidth?: number
  defaultHeight?: number
  singleton?: boolean
}

interface WindowManagerProps {
  windows: WindowDef[]
  components: Record<string, React.FunctionComponent<IDockviewPanelProps>>
  defaultOpen?: string[]
}

export default function WindowManager({ windows, components, defaultOpen = [] }: WindowManagerProps) {
  const apiRef = useRef<DockviewApi | null>(null)
  const [openWindows, setOpenWindows] = useState<Set<string>>(new Set())
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme } = useTheme()

  const onReady = useCallback((event: DockviewReadyEvent) => {
    apiRef.current = event.api
    defaultOpen.forEach((id, i) => {
      const def = windows.find(w => w.id === id)
      if (!def) return
      event.api.addPanel({
        id: def.id,
        component: def.component,
        title: def.title,
        floating: {
          width: def.defaultWidth || 700,
          height: def.defaultHeight || 500,
          x: 60 + (i % 4) * 50,
          y: 40 + (i % 3) * 40,
        }
      })
      setOpenWindows(prev => new Set([...prev, def.id]))
    })
    event.api.onDidRemovePanel((e) => {
      setOpenWindows(prev => { const n = new Set(prev); n.delete(e.id); return n })
    })
  }, [windows, defaultOpen])

  const openWindow = useCallback((def: WindowDef) => {
    if (!apiRef.current) return
    if (def.singleton && openWindows.has(def.id)) {
      const panel = apiRef.current.getPanel(def.id)
      if (panel) panel.api.setActive()
      setMenuOpen(false)
      return
    }
    const id = def.singleton ? def.id : `${def.id}-${Date.now()}`
    const count = [...openWindows].filter(w => w.startsWith(def.id)).length
    apiRef.current.addPanel({
      id,
      component: def.component,
      title: def.title,
      floating: {
        width: def.defaultWidth || 700,
        height: def.defaultHeight || 500,
        x: 80 + (count % 5) * 40,
        y: 60 + (count % 4) * 35,
      }
    })
    setOpenWindows(prev => new Set([...prev, id]))
    setMenuOpen(false)
  }, [openWindows])

  const closeWindow = useCallback((id: string) => {
    if (!apiRef.current) return
    const panel = apiRef.current.getPanel(id)
    if (panel) apiRef.current.removePanel(panel)
  }, [])

  const tileAll = useCallback(() => {
    if (!apiRef.current) return
    const api = apiRef.current
    const panels = api.panels
    if (panels.length === 0) return
    const defs = panels.map(p => ({ id: p.id, component: (p as any)._component || p.id.split('-')[0], title: p.title }))
    panels.forEach(p => api.removePanel(p))
    defs.forEach((def, i) => {
      if (i === 0) {
        api.addPanel({ id: def.id, component: def.component, title: def.title })
      } else {
        api.addPanel({
          id: def.id, component: def.component, title: def.title,
          position: { referencePanel: defs[i-1].id, direction: i % 2 === 0 ? 'below' : 'right' }
        })
      }
    })
    setOpenWindows(new Set(defs.map(p => p.id)))
  }, [])

  const cascadeAll = useCallback(() => {
    if (!apiRef.current) return
    const api = apiRef.current
    const panels = api.panels
    if (panels.length === 0) return
    const defs = panels.map(p => ({ id: p.id, component: (p as any)._component || p.id.split('-')[0], title: p.title }))
    panels.forEach(p => api.removePanel(p))
    defs.forEach((def, i) => {
      api.addPanel({ id: def.id, component: def.component, title: def.title, floating: { width: 700, height: 500, x: 50 + i * 30, y: 40 + i * 25 }})
    })
    setOpenWindows(new Set(defs.map(p => p.id)))
  }, [])

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 relative overflow-hidden">
        <DockviewReact
          key={'dv-' + theme}
          onReady={onReady}
          components={components}
          className="dockview-theme-dark h-full"
          watermarkComponent={DesktopWatermark}
        />
      </div>

      {/* Taskbar */}
      <div className="taskbar h-11 flex items-center gap-1.5 px-3 z-50 relative">
        {/* App Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="app-menu-btn px-3 py-1.5 text-[10px] font-display uppercase tracking-wider rounded-md transition-all duration-200"
          >
            <span className="mr-1.5">⬡</span>Apps
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-[998]" onClick={() => setMenuOpen(false)}></div>
              <div className="app-menu absolute bottom-full left-0 mb-2 rounded-xl shadow-2xl py-2 min-w-[240px] max-h-[450px] overflow-y-auto z-[999]">
                <div className="px-3 py-1.5 text-[9px] font-display uppercase tracking-widest text-dim border-b border-hud-border/50 mb-1">Aplicações</div>
                {windows.map(w => (
                  <button
                    key={w.id}
                    onClick={() => openWindow(w)}
                    className="app-menu-item flex items-center gap-3 w-full px-3 py-2.5 text-left transition-all duration-150"
                  >
                    <span className="text-lg w-7 text-center">{w.icon}</span>
                    <span className="text-[11px] font-mono flex-1">{w.title}</span>
                    {openWindows.has(w.id) && <span className="w-2 h-2 rounded-full bg-brand-400 shadow-glow-sm animate-pulse"></span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="w-px h-6 bg-hud-border/50 mx-1"></div>

        {/* Open windows */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto py-1">
          {[...openWindows].map(id => {
            const def = windows.find(w => w.id === id) || windows.find(w => id.startsWith(w.id))
            if (!def) return null
            return (
              <button
                key={id}
                onClick={() => { const p = apiRef.current?.getPanel(id); if (p) p.api.setActive() }}
                className="taskbar-item flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-150 max-w-[150px]"
              >
                <span className="text-sm">{def.icon}</span>
                <span className="truncate text-[10px] font-mono">{def.title}</span>
                <span
                  onClick={(e) => { e.stopPropagation(); closeWindow(id) }}
                  className="taskbar-close ml-1 w-4 h-4 flex items-center justify-center rounded-full text-[9px] transition-all"
                >✕</span>
              </button>
            )
          })}
        </div>

        {/* Window management */}
        <div className="flex items-center gap-0.5">
          <button onClick={cascadeAll} className="wm-btn px-2 py-1.5 text-sm rounded transition-all" title="Cascata">⧉</button>
          <button onClick={tileAll} className="wm-btn px-2 py-1.5 text-sm rounded transition-all" title="Tile">▦</button>
          <button onClick={() => { apiRef.current?.panels.forEach(p => apiRef.current!.removePanel(p)) }} className="wm-btn wm-close px-2 py-1.5 text-sm rounded transition-all" title="Fechar Todas">✕</button>
        </div>
      </div>
    </div>
  )
}

function DesktopWatermark() {
  return (
    <div className="h-full flex items-center justify-center select-none">
      <div className="text-center opacity-30 animate-pulse">
        <div className="text-7xl mb-4 drop-shadow-lg">⬡</div>
        <div className="text-sm font-display tracking-[0.3em] uppercase">SqualionLink</div>
        <div className="text-[10px] font-mono mt-3 opacity-60">Clique em Apps para abrir janelas</div>
      </div>
    </div>
  )
}
