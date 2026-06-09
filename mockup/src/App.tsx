import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from './components/ui/Toast'
import Layout from './components/layout/Layout'
import Dashboard from './pages/dashboard/Dashboard'
import Mapa from './pages/mapa/Mapa'
import Equipamentos from './pages/frota/Equipamentos'
import FichaEquipamento from './pages/frota/FichaEquipamento'
import Modelos from './pages/frota/Modelos'
import Contratadas from './pages/frota/Contratadas'
import Fabricantes from './pages/frota/Fabricantes'
import GruposEquipamento from './pages/frota/GruposEquipamento'
import Operadores from './pages/operadores/Operadores'
import FichaOperador from './pages/operadores/FichaOperador'
import Atividades from './pages/operacao/Atividades'
import Ciclos from './pages/operacao/Ciclos'
import Dispatch from './pages/operacao/Dispatch'
import Alertas from './pages/operacao/Alertas'
import Turnos from './pages/operacao/Turnos'
import RegimeTurno from './pages/operacao/RegimeTurno'
import RegrasAlerta from './pages/operacao/RegrasAlerta'
import Abastecimento from './pages/abastecimento/Abastecimento'
import PostosAbastecimento from './pages/abastecimento/PostosAbastecimento'
import Combustiveis from './pages/abastecimento/Combustiveis'
import Mensageria from './pages/mensageria/Mensageria'
import Templates from './pages/mensageria/Templates'
import ChecklistPage from './pages/checklist/ChecklistPage'
import Execucoes from './pages/checklist/Execucoes'
import OrdensServico from './pages/manutencao/OrdensServico'
import PlanoPreventivo from './pages/manutencao/PlanoPreventivo'
import Pecas from './pages/manutencao/Pecas'
import Qualidade from './pages/qualidade/Qualidade'
import Relatorios from './pages/relatorios/Relatorios'
import Areas from './pages/areas/Areas'
import Materiais from './pages/areas/Materiais'
import Rotas from './pages/areas/Rotas'
import Usuarios from './pages/admin/Usuarios'
import Perfis from './pages/admin/Perfis'
import ConfigTenant from './pages/admin/ConfigTenant'
import Hardware from './pages/admin/Hardware'
import AuditTrail from './pages/admin/AuditTrail'
import MeuPerfil from './pages/admin/MeuPerfil'
import Apropriacao from './pages/planejamento/Apropriacao'
import Fechamento from './pages/planejamento/Fechamento'
import CentroCusto from './pages/planejamento/CentroCusto'
import Login from './pages/Login'

export default function App() {
  return (
    <>
    <ToastContainer />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="mapa" element={<Mapa />} />
        {/* Frota */}
        <Route path="frota/equipamentos" element={<Equipamentos />} />
        <Route path="frota/equipamentos/:id" element={<FichaEquipamento />} />
        <Route path="frota/modelos" element={<Modelos />} />
        <Route path="frota/contratadas" element={<Contratadas />} />
        <Route path="frota/fabricantes" element={<Fabricantes />} />
        <Route path="frota/grupos" element={<GruposEquipamento />} />
        {/* Operadores */}
        <Route path="operadores" element={<Operadores />} />
        <Route path="operadores/:id" element={<FichaOperador />} />
        {/* Operação */}
        <Route path="operacao/atividades" element={<Atividades />} />
        <Route path="operacao/ciclos" element={<Ciclos />} />
        <Route path="operacao/dispatch" element={<Dispatch />} />
        <Route path="operacao/alertas" element={<Alertas />} />
        <Route path="operacao/turnos" element={<Turnos />} />
        <Route path="operacao/regime-turno" element={<RegimeTurno />} />
        <Route path="operacao/regras-alerta" element={<RegrasAlerta />} />
        {/* Abastecimento */}
        <Route path="abastecimento" element={<Abastecimento />} />
        <Route path="abastecimento/postos" element={<PostosAbastecimento />} />
        <Route path="abastecimento/combustiveis" element={<Combustiveis />} />
        {/* Mensageria */}
        <Route path="mensageria" element={<Mensageria />} />
        <Route path="mensageria/templates" element={<Templates />} />
        {/* Checklist */}
        <Route path="checklist" element={<ChecklistPage />} />
        <Route path="checklist/execucoes" element={<Execucoes />} />
        {/* Manutenção */}
        <Route path="manutencao/ordens" element={<OrdensServico />} />
        <Route path="manutencao/preventiva" element={<PlanoPreventivo />} />
        <Route path="manutencao/pecas" element={<Pecas />} />
        {/* Qualidade */}
        <Route path="qualidade" element={<Qualidade />} />
        {/* Áreas & Rotas */}
        <Route path="areas" element={<Areas />} />
        <Route path="areas/materiais" element={<Materiais />} />
        <Route path="areas/rotas" element={<Rotas />} />
        {/* Planejamento */}
        <Route path="planejamento/apropriacao" element={<Apropriacao />} />
        <Route path="planejamento/fechamento" element={<Fechamento />} />
        <Route path="planejamento/centro-custo" element={<CentroCusto />} />
        {/* Relatórios */}
        <Route path="relatorios" element={<Relatorios />} />
        {/* Admin */}
        <Route path="admin/usuarios" element={<Usuarios />} />
        <Route path="admin/perfis" element={<Perfis />} />
        <Route path="admin/config" element={<ConfigTenant />} />
        <Route path="admin/hardware" element={<Hardware />} />
        <Route path="admin/auditoria" element={<AuditTrail />} />
        <Route path="admin/meu-perfil" element={<MeuPerfil />} />
      </Route>
    </Routes>
    </>
  )
}
