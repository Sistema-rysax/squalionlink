import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Map, Truck, Activity, Wrench, Fuel, FlaskConical, ClipboardCheck, BarChart3, Settings, Users, MapPin, Calendar, MessageSquare, ChevronDown, ChevronRight, Bell, User } from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mapa', href: '/mapa', icon: Map },
  { name: 'Frota', icon: Truck, children: [
    { name: 'Equipamentos', href: '/frota/equipamentos' },
    { name: 'Modelos', href: '/frota/modelos' },
    { name: 'Grupos', href: '/frota/grupos' },
    { name: 'Fabricantes', href: '/frota/fabricantes' },
    { name: 'Contratadas', href: '/frota/contratadas' },
  ]},
  { name: 'Operadores', href: '/operadores', icon: Users },
  { name: 'Operação', icon: Activity, children: [
    { name: 'Atividades', href: '/operacao/atividades' },
    { name: 'Ciclos', href: '/operacao/ciclos' },
    { name: 'Dispatch', href: '/operacao/dispatch' },
    { name: 'Alertas', href: '/operacao/alertas' },
    { name: 'Turnos', href: '/operacao/turnos' },
    { name: 'Regimes de Turno', href: '/operacao/regime-turno' },
    { name: 'Regras de Alerta', href: '/operacao/regras-alerta' },
  ]},
  { name: 'Abastecimento', icon: Fuel, children: [
    { name: 'Registros', href: '/abastecimento' },
    { name: 'Postos', href: '/abastecimento/postos' },
    { name: 'Combustíveis', href: '/abastecimento/combustiveis' },
  ]},
  { name: 'Mensageria', icon: MessageSquare, children: [
    { name: 'Chat', href: '/mensageria' },
    { name: 'Templates', href: '/mensageria/templates' },
  ]},
  { name: 'Checklist', icon: ClipboardCheck, children: [
    { name: 'Grupos', href: '/checklist' },
    { name: 'Execuções', href: '/checklist/execucoes' },
  ]},
  { name: 'Manutenção', icon: Wrench, children: [
    { name: 'Ordens de Serviço', href: '/manutencao/ordens' },
    { name: 'Preventiva', href: '/manutencao/preventiva' },
    { name: 'Peças & Estoque', href: '/manutencao/pecas' },
  ]},
  { name: 'Qualidade', href: '/qualidade', icon: FlaskConical },
  { name: 'Áreas & Rotas', icon: MapPin, children: [
    { name: 'Áreas', href: '/areas' },
    { name: 'Materiais', href: '/areas/materiais' },
    { name: 'Rotas', href: '/areas/rotas' },
  ]},
  { name: 'Planejamento', icon: Calendar, children: [
    { name: 'Apropriação', href: '/planejamento/apropriacao' },
    { name: 'Centro de Custo', href: '/planejamento/centro-custo' },
    { name: 'Fechamento', href: '/planejamento/fechamento' },
  ]},
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  { name: 'Admin', icon: Settings, children: [
    { name: 'Usuários', href: '/admin/usuarios' },
    { name: 'Perfis & Permissões', href: '/admin/perfis' },
    { name: 'Hardware', href: '/admin/hardware' },
    { name: 'Auditoria', href: '/admin/auditoria' },
    { name: 'Configurações', href: '/admin/config' },
  ]},
]

export default function Sidebar() {
  const location = useLocation()
  const [expanded, setExpanded] = useState<string[]>(['Frota', 'Operação'])

  const toggle = (name: string) => {
    setExpanded(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }

  return (
    <aside className="w-64 bg-surface-1 border-r border-surface-3 flex flex-col">
      <div className="h-16 flex items-center px-5 border-b border-surface-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">SL</div>
          <span className="text-lg font-semibold text-white">SqualionLink</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => {
          if (item.children) {
            const isOpen = expanded.includes(item.name)
            const isActive = item.children.some(c => location.pathname === c.href || location.pathname.startsWith(c.href + '/'))
            return (
              <div key={item.name}>
                <button onClick={() => toggle(item.name)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-brand-400 bg-surface-3' : 'text-gray-400 hover:text-gray-200 hover:bg-surface-2'}`}>
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {isOpen && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map(child => (
                      <NavLink key={child.href} to={child.href} className={({isActive}) => `block px-3 py-1.5 rounded text-sm transition-colors ${isActive ? 'text-brand-400 bg-surface-3' : 'text-gray-500 hover:text-gray-300'}`}>
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          }
          return (
            <NavLink key={item.href} to={item.href!} className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-brand-400 bg-surface-3' : 'text-gray-400 hover:text-gray-200 hover:bg-surface-2'}`}>
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          )
        })}
      </nav>
      <div className="p-4 border-t border-surface-3">
        <NavLink to="/admin/meu-perfil" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 transition-colors">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">KM</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">Kleyton Miranda</p>
            <p className="text-xs text-gray-500 truncate">Administrador</p>
          </div>
        </NavLink>
      </div>
    </aside>
  )
}
