import { IDockviewPanelProps } from 'dockview-react'
import WindowManager, { WindowDef } from '../../components/hud/WindowManager'

// Import REAL page components (same as routes)
import Dashboard from '../dashboard/Dashboard'
import Mapa from '../map/Mapa'
import Equipamentos from '../fleet/Equipamentos'
import Modelos from '../fleet/Modelos'
import Operadores from '../fleet/Operadores'
import Atividades from '../operations/Atividades'
import Ciclos from '../operations/Ciclos'
import Dispatch from '../operations/Dispatch'
import Alocacao from '../operations/Alocacao'
import Alertas from '../operations/Alertas'
import Turnos from '../operations/Turnos'
import Rotograma from '../operations/Rotograma'
import Abastecimento from '../operations/Abastecimento'
import ChecklistPage from '../checklist/ChecklistPage'
import OrdensServico from '../maintenance/OrdensServico'
import PlanoPreventivo from '../maintenance/PlanoPreventivo'
import Pecas from '../maintenance/Pecas'
import Mensageria from '../messaging/Mensageria'
import Templates from '../messaging/Templates'
import Qualidade from '../quality/Qualidade'
import AreasPage from '../areas/Areas'
import Relatorios from '../reports/Relatorios'
import Usuarios from '../admin/Usuarios'
import ConfigTenant from '../admin/ConfigTenant'
import Hardware from '../admin/Hardware'

// ===== WINDOW DEFINITIONS (Lucide icon names, no emojis) =====
const windowDefs: WindowDef[] = [
  { id: 'dashboard', title: 'Dashboard', icon: 'LayoutDashboard', component: 'dashboard', defaultWidth: 900, defaultHeight: 600, singleton: true },
  { id: 'mapa', title: 'Mapa', icon: 'Map', component: 'mapa', defaultWidth: 950, defaultHeight: 650, singleton: true },
  { id: 'frota', title: 'Equipamentos', icon: 'Truck', component: 'frota', defaultWidth: 850, defaultHeight: 550, singleton: true },
  { id: 'modelos', title: 'Modelos', icon: 'Boxes', component: 'modelos', defaultWidth: 800, defaultHeight: 500, singleton: true },
  { id: 'operadores', title: 'Operadores', icon: 'Users', component: 'operadores', defaultWidth: 800, defaultHeight: 500, singleton: true },
  { id: 'atividades', title: 'Atividades', icon: 'Radio', component: 'atividades', defaultWidth: 800, defaultHeight: 500, singleton: true },
  { id: 'dispatch', title: 'Dispatch', icon: 'GitBranch', component: 'dispatch', defaultWidth: 850, defaultHeight: 550, singleton: true },
  { id: 'alocacao', title: 'Alocação', icon: 'Route', component: 'alocacao', defaultWidth: 900, defaultHeight: 580, singleton: true },
  { id: 'alertas', title: 'Alertas', icon: 'AlertTriangle', component: 'alertas', defaultWidth: 700, defaultHeight: 500, singleton: true },
  { id: 'ciclos', title: 'Ciclos', icon: 'RefreshCw', component: 'ciclos', defaultWidth: 800, defaultHeight: 500, singleton: true },
  { id: 'turnos', title: 'Turnos', icon: 'Clock', component: 'turnos', defaultWidth: 750, defaultHeight: 480, singleton: true },
  { id: 'rotograma', title: 'Rotograma', icon: 'MapPin', component: 'rotograma', defaultWidth: 800, defaultHeight: 520, singleton: true },
  { id: 'abastecimento', title: 'Abastecimento', icon: 'Fuel', component: 'abastecimento', defaultWidth: 800, defaultHeight: 500, singleton: true },
  { id: 'checklist', title: 'Checklist', icon: 'ClipboardCheck', component: 'checklist', defaultWidth: 850, defaultHeight: 550, singleton: true },
  { id: 'manutencao', title: 'Ordens Serviço', icon: 'Wrench', component: 'manutencao', defaultWidth: 850, defaultHeight: 550, singleton: true },
  { id: 'preventiva', title: 'Plano Preventivo', icon: 'CalendarCheck', component: 'preventiva', defaultWidth: 800, defaultHeight: 500, singleton: true },
  { id: 'pecas', title: 'Peças', icon: 'Package', component: 'pecas', defaultWidth: 780, defaultHeight: 480, singleton: true },
  { id: 'mensageria', title: 'Mensagens', icon: 'MessageSquare', component: 'mensageria', defaultWidth: 700, defaultHeight: 550, singleton: true },
  { id: 'templates', title: 'Templates', icon: 'FileText', component: 'templates', defaultWidth: 750, defaultHeight: 480, singleton: true },
  { id: 'qualidade', title: 'Qualidade', icon: 'FlaskConical', component: 'qualidade', defaultWidth: 800, defaultHeight: 520, singleton: true },
  { id: 'areas', title: 'Áreas', icon: 'Layers', component: 'areas', defaultWidth: 800, defaultHeight: 500, singleton: true },
  { id: 'relatorios', title: 'Relatórios', icon: 'BarChart3', component: 'relatorios', defaultWidth: 800, defaultHeight: 520, singleton: true },
  { id: 'usuarios', title: 'Usuários', icon: 'UserCog', component: 'usuarios', defaultWidth: 780, defaultHeight: 500, singleton: true },
  { id: 'hardware', title: 'Hardware', icon: 'Cpu', component: 'hardware', defaultWidth: 780, defaultHeight: 500, singleton: true },
  { id: 'config', title: 'Configurações', icon: 'Settings', component: 'config', defaultWidth: 700, defaultHeight: 600, singleton: true },
]

// ===== WRAPPER: Renders real component inside dockview panel =====
function wrapComponent(Component: React.ComponentType<any>) {
  return function WrappedPanel(_props: IDockviewPanelProps) {
    return (
      <div className="h-full overflow-auto desktop-panel-content">
        <Component />
      </div>
    )
  }
}

// ===== COMPONENTS MAP (real pages wrapped) =====
const components: Record<string, React.FunctionComponent<IDockviewPanelProps>> = {
  dashboard: wrapComponent(Dashboard),
  mapa: wrapComponent(Mapa),
  frota: wrapComponent(Equipamentos),
  modelos: wrapComponent(Modelos),
  operadores: wrapComponent(Operadores),
  atividades: wrapComponent(Atividades),
  dispatch: wrapComponent(Dispatch),
  alocacao: wrapComponent(Alocacao),
  alertas: wrapComponent(Alertas),
  ciclos: wrapComponent(Ciclos),
  turnos: wrapComponent(Turnos),
  rotograma: wrapComponent(Rotograma),
  abastecimento: wrapComponent(Abastecimento),
  checklist: wrapComponent(ChecklistPage),
  manutencao: wrapComponent(OrdensServico),
  preventiva: wrapComponent(PlanoPreventivo),
  pecas: wrapComponent(Pecas),
  mensageria: wrapComponent(Mensageria),
  templates: wrapComponent(Templates),
  qualidade: wrapComponent(Qualidade),
  areas: wrapComponent(AreasPage),
  relatorios: wrapComponent(Relatorios),
  usuarios: wrapComponent(Usuarios),
  hardware: wrapComponent(Hardware),
  config: wrapComponent(ConfigTenant),
}

export default function Desktop() {
  return (
    <div className="h-full">
      <WindowManager
        windows={windowDefs}
        components={components}
        defaultOpen={['dashboard', 'mapa', 'alertas']}
      />
    </div>
  )
}
