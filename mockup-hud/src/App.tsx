import { Routes, Route } from 'react-router-dom'
import HUDLayout from './layouts/HUDLayout'
import { ToastContainer } from './components/ui/Toast'
import Dashboard from './modules/dashboard/Dashboard'
import Equipamentos from './modules/fleet/Equipamentos'
import Operadores from './modules/fleet/Operadores'
import Atividades from './modules/operations/Atividades'
import Alertas from './modules/operations/Alertas'
import Abastecimento from './modules/operations/Abastecimento'
import OrdensServico from './modules/maintenance/OrdensServico'
import AreasPage from './modules/areas/Areas'
import Usuarios from './modules/admin/Usuarios'

function Placeholder({ name }: { name: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-xl bg-hud-panel border border-hud-border flex items-center justify-center">
          <span className="font-display text-lg text-dim">{name[0]}</span>
        </div>
        <span className="font-display text-sm text-gray-600 tracking-widest block">{name}</span>
        <p className="text-[10px] text-dim font-mono">MÓDULO EM CONSTRUÇÃO</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route element={<HUDLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="mapa" element={<Placeholder name="MAPA" />} />
          <Route path="frota" element={<Equipamentos />} />
          <Route path="operadores" element={<Operadores />} />
          <Route path="operacao" element={<Atividades />} />
          <Route path="operacao/alertas" element={<Alertas />} />
          <Route path="abastecimento" element={<Abastecimento />} />
          <Route path="checklist" element={<Placeholder name="CHECKLIST" />} />
          <Route path="manutencao" element={<OrdensServico />} />
          <Route path="areas" element={<AreasPage />} />
          <Route path="relatorios" element={<Placeholder name="RELATÓRIOS" />} />
          <Route path="admin" element={<Usuarios />} />
        </Route>
      </Routes>
    </>
  )
}