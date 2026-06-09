import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Map, Truck, Users, Radio, Wrench, BarChart3, Settings, Layers, Fuel, ClipboardCheck } from 'lucide-react'

const modules = [
  { icon: LayoutDashboard, label: 'Painel', path: '/' },
  { icon: Map, label: 'Mapa', path: '/mapa' },
  { icon: Truck, label: 'Frota', path: '/frota' },
  { icon: Users, label: 'Operadores', path: '/operadores' },
  { icon: Radio, label: 'Operação', path: '/operacao' },
  { icon: Fuel, label: 'Abastecimento', path: '/abastecimento' },
  { icon: ClipboardCheck, label: 'Checklist', path: '/checklist' },
  { icon: Wrench, label: 'Manutenção', path: '/manutencao' },
  { icon: Layers, label: 'Áreas', path: '/areas' },
  { icon: BarChart3, label: 'Relatórios', path: '/relatorios' },
  { icon: Settings, label: 'Admin', path: '/admin' },
]

export default function NavDock() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 px-3 py-2 bg-hud-panel/90 backdrop-blur-xl border border-hud-border rounded-2xl shadow-panel">
        {modules.map(m => {
          const Icon = m.icon
          const isActive = m.path === '/' ? location.pathname === '/' : location.pathname.startsWith(m.path)
          return (
            <NavLink key={m.path} to={m.path} title={m.label}
              className={`group relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-brand-600/20 text-brand-400 shadow-glow-sm' 
                  : 'text-dim hover:text-gray-300 hover:bg-white/[0.03]'
              }`}>
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[9px] font-medium transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`}>{m.label}</span>
              {isActive && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-400 shadow-glow-sm" />}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}