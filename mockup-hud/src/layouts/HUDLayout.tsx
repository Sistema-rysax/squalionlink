import { Outlet } from 'react-router-dom'
import StatusBar from '../components/hud/StatusBar'
import NavDock from '../components/hud/NavDock'
import GridBackground from '../components/effects/GridBackground'

export default function HUDLayout() {
  return (
    <div className="h-screen w-screen overflow-hidden relative noise">
      <GridBackground />
      <StatusBar />
      <main className="absolute inset-0 pt-12 pb-20 px-4 overflow-y-auto">
        <Outlet />
      </main>
      <NavDock />
    </div>
  )
}