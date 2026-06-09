import { Bell, Search, Moon, Sun } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/mapa': 'Mapa Operacional',
  '/frota/equipamentos': 'Equipamentos',
  '/frota/modelos': 'Modelos',
  '/frota/contratadas': 'Contratadas',
  '/operadores': 'Operadores',
  '/operacao/atividades': 'Atividades',
  '/operacao/ciclos': 'Ciclos Operacionais',
  '/operacao/dispatch': 'Dispatch',
  '/operacao/alertas': 'Alertas',
  '/abastecimento': 'Abastecimento',
  '/mensageria': 'Mensageria',
  '/checklist': 'Checklist',
  '/manutencao/ordens': 'Ordens de Serviço',
  '/manutencao/preventiva': 'Planos Preventivos',
  '/qualidade': 'Qualidade & Pilhas',
  '/areas': 'Áreas & Rotas',
  '/relatorios': 'Relatórios',
  '/admin/usuarios': 'Usuários',
  '/admin/perfis': 'Perfis & Permissões',
  '/admin/config': 'Configurações',
  '/planejamento/apropriacao': 'Apropriação de Rota',
  '/planejamento/fechamento': 'Fechamento de Período',
}

export default function Topbar() {
  const location = useLocation()
  const title = titles[location.pathname] || 'SqualionLink'

  return (
    <header className="h-16 bg-surface-1 border-b border-surface-3 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Buscar..." className="pl-9 pr-4 py-2 bg-surface-2 border border-surface-4 rounded-lg text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-brand-500 w-64" />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-surface-2 transition-colors">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-2 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-400">Turno A — 06:00 às 18:00</span>
        </div>
      </div>
    </header>
  )
}
