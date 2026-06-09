import { Routes, Route } from 'react-router-dom'
import HUDLayout from './layouts/HUDLayout'
import { ToastContainer } from './components/ui/Toast'
import Dashboard from './modules/dashboard/Dashboard'
import Equipamentos from './modules/fleet/Equipamentos'
import Modelos from './modules/fleet/Modelos'
import GruposEquipamento from './modules/fleet/GruposEquipamento'
import Fabricantes from './modules/fleet/Fabricantes'
import Contratadas from './modules/fleet/Contratadas'
import FichaEquipamento from './modules/fleet/FichaEquipamento'
import Operadores from './modules/fleet/Operadores'
import Atividades from './modules/operations/Atividades'
import Ciclos from './modules/operations/Ciclos'
import Dispatch from './modules/operations/Dispatch'
import Alertas from './modules/operations/Alertas'
import Turnos from './modules/operations/Turnos'
import RegimeTurno from './modules/operations/RegimeTurno'
import RegrasAlerta from './modules/operations/RegrasAlerta'
import Abastecimento from './modules/operations/Abastecimento'
import PostosAbastecimento from './modules/operations/PostosAbastecimento'
import Combustiveis from './modules/operations/Combustiveis'
import ChecklistPage from './modules/checklist/ChecklistPage'
import Execucoes from './modules/checklist/Execucoes'
import OrdensServico from './modules/maintenance/OrdensServico'
import PlanoPreventivo from './modules/maintenance/PlanoPreventivo'
import Pecas from './modules/maintenance/Pecas'
import Mapa from './modules/map/Mapa'
import Mensageria from './modules/messaging/Mensageria'
import Templates from './modules/messaging/Templates'
import Qualidade from './modules/quality/Qualidade'
import AreasPage from './modules/areas/Areas'
import Materiais from './modules/areas/Materiais'
import Rotas from './modules/areas/Rotas'
import Subareas from './modules/areas/Subareas'
import PontosAcesso from './modules/areas/PontosAcesso'
import Apropriacao from './modules/planning/Apropriacao'
import CentroCusto from './modules/planning/CentroCusto'
import Fechamento from './modules/planning/Fechamento'
import Relatorios from './modules/reports/Relatorios'
import Usuarios from './modules/admin/Usuarios'
import Perfis from './modules/admin/Perfis'
import Hardware from './modules/admin/Hardware'
import ConfigTenant from './modules/admin/ConfigTenant'
import MeuPerfil from './modules/admin/MeuPerfil'
import AuditTrail from './modules/admin/AuditTrail'

export default function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route element={<HUDLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="mapa" element={<Mapa />} />
          <Route path="frota" element={<Equipamentos />} />
          <Route path="frota/modelos" element={<Modelos />} />
          <Route path="frota/grupos" element={<GruposEquipamento />} />
          <Route path="frota/fabricantes" element={<Fabricantes />} />
          <Route path="frota/contratadas" element={<Contratadas />} />
          <Route path="frota/:id" element={<FichaEquipamento />} />
          <Route path="operadores" element={<Operadores />} />
          <Route path="operacao" element={<Atividades />} />
          <Route path="operacao/ciclos" element={<Ciclos />} />
          <Route path="operacao/dispatch" element={<Dispatch />} />
          <Route path="operacao/alertas" element={<Alertas />} />
          <Route path="operacao/turnos" element={<Turnos />} />
          <Route path="operacao/regime" element={<RegimeTurno />} />
          <Route path="operacao/regras-alerta" element={<RegrasAlerta />} />
          <Route path="abastecimento" element={<Abastecimento />} />
          <Route path="abastecimento/postos" element={<PostosAbastecimento />} />
          <Route path="abastecimento/combustiveis" element={<Combustiveis />} />
          <Route path="checklist" element={<ChecklistPage />} />
          <Route path="checklist/execucoes" element={<Execucoes />} />
          <Route path="manutencao" element={<OrdensServico />} />
          <Route path="manutencao/preventiva" element={<PlanoPreventivo />} />
          <Route path="manutencao/pecas" element={<Pecas />} />
          <Route path="mensageria" element={<Mensageria />} />
          <Route path="mensageria/templates" element={<Templates />} />
          <Route path="qualidade" element={<Qualidade />} />
          <Route path="areas" element={<AreasPage />} />
          <Route path="areas/materiais" element={<Materiais />} />
          <Route path="areas/rotas" element={<Rotas />} />
          <Route path="areas/subareas" element={<Subareas />} />
          <Route path="areas/pontos-acesso" element={<PontosAcesso />} />
          <Route path="planejamento" element={<Apropriacao />} />
          <Route path="planejamento/centro-custo" element={<CentroCusto />} />
          <Route path="planejamento/fechamento" element={<Fechamento />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="admin" element={<Usuarios />} />
          <Route path="admin/perfis" element={<Perfis />} />
          <Route path="admin/hardware" element={<Hardware />} />
          <Route path="admin/config" element={<ConfigTenant />} />
          <Route path="admin/perfil" element={<MeuPerfil />} />
          <Route path="admin/audit" element={<AuditTrail />} />
        </Route>
      </Routes>
    </>
  )
}