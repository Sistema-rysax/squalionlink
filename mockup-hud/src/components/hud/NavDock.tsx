import { NavLink, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { Monitor, LayoutDashboard, Map, Truck, Users, Radio, Wrench, BarChart3, Settings, Layers, Fuel, ClipboardCheck, FlaskConical, CalendarRange, MessageSquare, GitBranch } from 'lucide-react'

interface ModuleItem {
  icon: any
  label: string
  path: string
  sub?: { label: string; path: string }[]
}

const modules: ModuleItem[] = [
  { icon: Monitor, label: 'Desktop', path: '/' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Map, label: 'Mapa', path: '/mapa' },
  { icon: Truck, label: 'Frota', path: '/frota', sub: [
    { label: 'Equipamentos', path: '/frota' },
    { label: 'Modelos', path: '/frota/modelos' },
    { label: 'Grupos', path: '/frota/grupos' },
    { label: 'Fabricantes', path: '/frota/fabricantes' },
    { label: 'Contratadas', path: '/frota/contratadas' },
  ]},
  { icon: Users, label: 'Operadores', path: '/operadores' },
  { icon: Radio, label: 'Operação', path: '/operacao', sub: [
    { label: 'Atividades', path: '/operacao' },
    { label: 'Alocação', path: '/operacao/alocacao' },
    { label: 'Dispatch', path: '/operacao/dispatch' },
    { label: 'Ciclos', path: '/operacao/ciclos' },
    { label: 'Alertas', path: '/operacao/alertas' },
    { label: 'Turnos', path: '/operacao/turnos' },
    { label: 'Regime Turno', path: '/operacao/regime' },
    { label: 'Regras Alerta', path: '/operacao/regras-alerta' },
    { label: 'Rotograma', path: '/operacao/rotograma' },
  ]},
  { icon: Fuel, label: 'Abastecimento', path: '/abastecimento', sub: [
    { label: 'Registros', path: '/abastecimento' },
    { label: 'Postos', path: '/abastecimento/postos' },
    { label: 'Combustíveis', path: '/abastecimento/combustiveis' },
  ]},
  { icon: ClipboardCheck, label: 'Checklist', path: '/checklist', sub: [
    { label: 'Configuração', path: '/checklist' },
    { label: 'Execuções', path: '/checklist/execucoes' },
  ]},
  { icon: Wrench, label: 'Manutenção', path: '/manutencao', sub: [
    { label: 'Ordens Serviço', path: '/manutencao' },
    { label: 'Preventiva', path: '/manutencao/preventiva' },
    { label: 'Peças', path: '/manutencao/pecas' },
  ]},
  { icon: Layers, label: 'Áreas', path: '/areas', sub: [
    { label: 'Áreas', path: '/areas' },
    { label: 'Subáreas', path: '/areas/subareas' },
    { label: 'Materiais', path: '/areas/materiais' },
    { label: 'Rotas', path: '/areas/rotas' },
    { label: 'Pontos Acesso', path: '/areas/pontos-acesso' },
  ]},
  { icon: FlaskConical, label: 'Qualidade', path: '/qualidade' },
  { icon: CalendarRange, label: 'Planejamento', path: '/planejamento', sub: [
    { label: 'Apropriação', path: '/planejamento' },
    { label: 'Centro Custo', path: '/planejamento/centro-custo' },
    { label: 'Fechamento', path: '/planejamento/fechamento' },
  ]},
  { icon: MessageSquare, label: 'Mensageria', path: '/mensageria', sub: [
    { label: 'Mensagens', path: '/mensageria' },
    { label: 'Templates', path: '/mensageria/templates' },
  ]},
  { icon: BarChart3, label: 'Relatórios', path: '/relatorios' },
  { icon: Settings, label: 'Admin', path: '/admin', sub: [
    { label: 'Usuários', path: '/admin' },
    { label: 'Perfis', path: '/admin/perfis' },
    { label: 'Hardware', path: '/admin/hardware' },
    { label: 'Config', path: '/admin/config' },
    { label: 'Meu Perfil', path: '/admin/perfil' },
    { label: 'Auditoria', path: '/admin/audit' },
  ]},
]

export default function NavDock() {
  const location = useLocation()
  const [openMenu, setOpenMenu] = useState<string|null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close menu on route change
  useEffect(() => { setOpenMenu(null) }, [location.pathname])

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50" ref={menuRef}>
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-hud-panel/95 backdrop-blur-xl border border-hud-border rounded-2xl shadow-panel">
        {modules.map(m => {
          const Icon = m.icon
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
                  title={m.label}
                  className={`group relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-brand-600/20 text-brand-400 shadow-glow-sm' 
                      : 'text-dim hover:text-gray-300 hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  <span className={`text-[8px] font-medium transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`}>{m.label}</span>
                  {isActive && <div className="absolute -bottom-0.5 w-1 h-1 bg-brand-400 rounded-full shadow-glow-sm"></div>}
                </button>
              ) : (
                <NavLink to={m.path} title={m.label}
                  onClick={() => setOpenMenu(null)}
                  className={`group relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-brand-600/20 text-brand-400 shadow-glow-sm' 
                      : 'text-dim hover:text-gray-300 hover:bg-white/[0.03]'
                  }`}>
                  <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  <span className={`text-[8px] font-medium transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`}>{m.label}</span>
                  {isActive && <div className="absolute -bottom-0.5 w-1 h-1 bg-brand-400 rounded-full shadow-glow-sm"></div>}
                </NavLink>
              )}

              {/* Sub-navigation popup - CLICK triggered, stays open */}
              {m.sub && isMenuOpen && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-[9999]">
                  <div className="bg-hud-panel/98 backdrop-blur-xl border border-hud-border rounded-xl shadow-2xl p-2 min-w-[160px]">
                    {m.sub.map(s=>(
                      <NavLink key={s.path} to={s.path} onClick={() => setOpenMenu(null)}
                        className={`block px-3 py-2 text-[11px] font-mono rounded-lg transition-all ${location.pathname===s.path?'text-brand-400 bg-brand-600/15 font-medium':'text-gray-300 hover:text-white hover:bg-white/[0.05]'}`}>
                        {s.label}
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
