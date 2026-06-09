import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/dashboard/Dashboard'
import Mapa from './pages/mapa/Mapa'
import Equipamentos from './pages/frota/Equipamentos'
import FichaEquipamento from './pages/frota/FichaEquipamento'
import Modelos from './pages/frota/Modelos'
import Contratadas from './pages/frota/Contratadas'
import Operadores from './pages/operadores/Operadores'
import Atividades from './pages/operacao/Atividades'
import Ciclos from './pages/operacao/Ciclos'
import Dispatch from './pages/operacao/Dispatch'
import Alertas from './pages/operacao/Alertas'
import Abastecimento from './pages/abastecimento/Abastecimento'
import Mensageria from './pages/mensageria/Mensageria'
import ChecklistPage from './pages/checklist/ChecklistPage'
import OrdensServico from './pages/manutencao/OrdensServico'
import PlanoPreventivo from './pages/manutencao/PlanoPreventivo'
import Qualidade from './pages/qualidade/Qualidade'
import Relatorios from './pages/relatorios/Relatorios'
import Areas from './pages/areas/Areas'
import Usuarios from './pages/admin/Usuarios'
import Perfis from './pages/admin/Perfis'
import ConfigTenant from './pages/admin/ConfigTenant'
import Apropriacao from './pages/planejamento/Apropriacao'
import Fechamento from './pages/planejamento/Fechamento'
import Login from './pages/Login'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="mapa" element={<Mapa />} />
        <Route path="frota/equipamentos" element={<Equipamentos />} />
        <Route path="frota/equipamentos/:id" element={<FichaEquipamento />} />
        <Route path="frota/modelos" element={<Modelos />} />
        <Route path="frota/contratadas" element={<Contratadas />} />
        <Route path="operadores" element={<Operadores />} />
        <Route path="operacao/atividades" element={<Atividades />} />
        <Route path="operacao/ciclos" element={<Ciclos />} />
        <Route path="operacao/dispatch" element={<Dispatch />} />
        <Route path="operacao/alertas" element={<Alertas />} />
        <Route path="abastecimento" element={<Abastecimento />} />
        <Route path="mensageria" element={<Mensageria />} />
        <Route path="checklist" element={<ChecklistPage />} />
        <Route path="manutencao/ordens" element={<OrdensServico />} />
        <Route path="manutencao/preventiva" element={<PlanoPreventivo />} />
        <Route path="qualidade" element={<Qualidade />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="areas" element={<Areas />} />
        <Route path="admin/usuarios" element={<Usuarios />} />
        <Route path="admin/perfis" element={<Perfis />} />
        <Route path="admin/config" element={<ConfigTenant />} />
        <Route path="planejamento/apropriacao" element={<Apropriacao />} />
        <Route path="planejamento/fechamento" element={<Fechamento />} />
      </Route>
    </Routes>
  )
}
