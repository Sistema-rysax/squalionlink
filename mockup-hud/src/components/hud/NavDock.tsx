import { NavLink, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { Monitor, LayoutDashboard, Map, Truck, Users, Radio, Wrench, BarChart3, Settings, Layers, Fuel, ClipboardCheck, FlaskConical, CalendarRange, MessageSquare } from 'lucide-react'
import { useT } from '../../contexts/LanguageContext'

interface ModuleItem {
  icon: any
  labelKey: string
  path: string
  sub?: { labelKey: string; path: string }[]
}

const modules: ModuleItem[] = [
  { icon: Monitor, labelKey: 'nav.desktop', path: '/' },
  { icon: LayoutDashboard, labelKey: 'nav.dashboard', path: '/dashboard' },
  { icon: Map, labelKey: 'nav.map', path: '/mapa' },
  { icon: Truck, labelKey: 'nav.fleet', path: '/frota', sub: [
    { labelKey: 'navSub.equipment', path: '/frota' },
    { labelKey: 'navSub.models', path: '/frota/modelos' },
    { labelKey: 'navSub.groups', path: '/frota/grupos' },
    { labelKey: 'navSub.manufacturers', path: '/frota/fabricantes' },
    { labelKey: 'navSub.contractors', path: '/frota/contratadas' },
  ]},
  { icon: Users, labelKey: 'nav.operators', path: '/operadores' },
  { icon: Radio, labelKey: 'nav.operations', path: '/operacao', sub: [
    { labelKey: 'navSub.activities', path: '/operacao' },
    { labelKey: 'navSub.allocation', path: '/operacao/alocacao' },
    { labelKey: 'navSub.dispatch', path: '/operacao/dispatch' },
    { labelKey: 'navSub.cycles', path: '/operacao/ciclos' },
    { labelKey: 'navSub.alerts', path: '/operacao/alertas' },
    { labelKey: 'navSub.shifts', path: '/operacao/turnos' },
    { labelKey: 'navSub.shiftRegime', path: '/operacao/regime' },
    { labelKey: 'navSub.alertRules', path: '/operacao/regras-alerta' },
    { labelKey: 'navSub.routeogram', path: '/operacao/rotograma' },
  ]},
  { icon: Fuel, labelKey: 'nav.fueling', path: '/abastecimento', sub: [
    { labelKey: 'navSub.records', path: '/abastecimento' },
    { labelKey: 'navSub.stations', path: '/abastecimento/postos' },
    { labelKey: 'navSub.fuels', path: '/abastecimento/combustiveis' },
  ]},
  { icon: ClipboardCheck, labelKey: 'nav.checklist', path: '/checklist', sub: [
    { labelKey: 'navSub.config', path: '/checklist' },
    { labelKey: 'navSub.executions', path: '/checklist/execucoes' },
  ]},
  { icon: Wrench, labelKey: 'nav.maintenance', path: '/manutencao', sub: [
    { labelKey: 'navSub.workOrders', path: '/manutencao' },
    { labelKey: 'navSub.preventive', path: '/manutencao/preventiva' },
    { labelKey: 'navSub.parts', path: '/manutencao/pecas' },
  ]},
  { icon: Layers, labelKey: 'nav.areas', path: '/areas', sub: [
    { labelKey: 'navSub.subareas', path: '/areas' },
    { labelKey: 'navSub.subareas', path: '/areas/subareas' },
    { labelKey: 'navSub.materials', path: '/areas/materiais' },
    { labelKey: 'navSub.routes', path: '/areas/rotas' },
    { labelKey: 'navSub.accessPoints', path: '/areas/pontos-acesso' },
  ]},
  { icon: FlaskConical, labelKey: 'nav.quality', path: '/qualidade' },
  { icon: CalendarRange, labelKey: 'nav.planning', path: '/planejamento', sub: [
    { labelKey: 'navSub.appropriation', path: '/planejamento' },
    { labelKey: 'navSub.costCenter', path: '/planejamento/centro-custo' },
    { labelKey: 'navSub.closing', path: '/planejamento/fechamento' },
  ]},
  { icon: MessageSquare, labelKey: 'nav.messaging', path: '/mensageria', sub: [
    { labelKey: 'navSub.messages', path: '/mensageria' },
    { labelKey: 'navSub.templates', path: '/mensageria/templates' },
  ]},
  { icon: BarChart3, labelKey: 'nav.reports', path: '/relatorios' },
  { icon: Settings, labelKey: 'nav.admin', path: '/admin', sub: [
    { labelKey: 'navSub.users', path: '/admin' },
    { labelKey: 'navSub.profiles', path: '/admin/perfis' },
    { labelKey: 'navSub.hardware', path: '/admin/hardware' },
    { labelKey: 'navSub.settings', path: '/admin/config' },
    { labelKey: 'navSub.myProfile', path: '/admin/perfil' },
    { labelKey: 'navSub.audit', path: '/admin/audit' },
  ]},
]

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, key) => acc?.[key], obj) || path
}

export default function NavDock() {
  const location = useLocation()
  const [openMenu, setOpenMenu] = useState<string|null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const t = useT()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => { setOpenMenu(null) }, [location.pathname])

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999]" ref={menuRef}>
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-hud-panel/95 backdrop-blur-xl border border-hud-border rounded-2xl shadow-panel">
        {modules.map(m => {
          const Icon = m.icon
          const label = getNestedValue(t, m.labelKey)
          const isActive = m.path === '/' ? location.pathname === '/' : location.pathname.startsWith(m.path)
          const isMenuOpen = openMenu === m.path

          const handleClick = (e: React.MouseEvent) => {
            if (m.sub && m.sub.length > 0) {
              e.preventDefault()
              setOpenMenu(isMenuOpen ? null : m.path)
            } else {
              setOpenMenu(null)
            }
          }

          return (
            <div key={m.path} className="relative">
              {m.sub ? (
                <button
                  onClick={handleClick}
                  title={label}
                  className={`group relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 ${
                    isActive ? 'bg-brand-600/20 text-brand-400 shadow-glow-sm' : 'text-dim hover:text-gray-300 hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  <span className={`text-[8px] font-medium transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`}>{label}</span>
                  {isActive && <div className="absolute -bottom-0.5 w-1 h-1 bg-brand-400 rounded-full shadow-glow-sm"></div>}
                </button>
              ) : (
                <NavLink to={m.path} title={label}
                  onClick={() => setOpenMenu(null)}
                  className={`group relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 ${
                    isActive ? 'bg-brand-600/20 text-brand-400 shadow-glow-sm' : 'text-dim hover:text-gray-300 hover:bg-white/[0.03]'
                  }`}>
                  <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  <span className={`text-[8px] font-medium transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`}>{label}</span>
                  {isActive && <div className="absolute -bottom-0.5 w-1 h-1 bg-brand-400 rounded-full shadow-glow-sm"></div>}
                </NavLink>
              )}

              {m.sub && isMenuOpen && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-[9999]">
                  <div className="bg-hud-panel/98 backdrop-blur-xl border border-hud-border rounded-xl shadow-2xl p-2 min-w-[160px]">
                    {m.sub.map(s=>(
                      <NavLink key={s.path} to={s.path} onClick={() => setOpenMenu(null)}
                        className={`block px-3 py-2 text-[11px] font-mono rounded-lg transition-all ${location.pathname===s.path?'text-brand-400 bg-brand-600/15 font-medium':'text-gray-300 hover:text-white hover:bg-white/[0.05]'}`}>
                        {getNestedValue(t, s.labelKey)}
                      </NavLink>
                    ))}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-hud-panel/98 border-r border-b border-hud-border rotate-45"></div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
