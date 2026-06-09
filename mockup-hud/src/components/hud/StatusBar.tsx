import { useState, useEffect } from 'react'
import { Activity, AlertTriangle, Wifi, Clock, Truck, Zap, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export default function StatusBar() {
  const [time, setTime] = useState(new Date())
  const { theme, toggle } = useTheme()
  useEffect(() => { const t = setInterval(()=>setTime(new Date()), 1000); return ()=>clearInterval(t) }, [])

  return (
    <header className="fixed top-0 left-0 right-0 h-12 z-50 flex items-center justify-between px-6 bg-hud-panel/95 backdrop-blur-md border-b border-hud-border transition-colors duration-300">
      {/* Left - System ID */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-brand-600 flex items-center justify-center">
            <span className="text-[10px] font-display font-bold" style={{color:'#fff'}}>SL</span>
          </div>
          <span className="font-display text-xs tracking-widest text-brand-400">SQUALIONLINK</span>
        </div>
        <div className="w-px h-5 bg-hud-border" />
        <div className="flex items-center gap-1.5">
          <div className="led led-ok" />
          <span className="text-[10px] font-mono text-dim uppercase">System Online</span>
        </div>
      </div>

      {/* Center - Live KPIs */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-ok" />
          <span className="font-mono text-xs text-gray-300">7<span className="text-dim">/10</span></span>
          <span className="text-[9px] text-dim uppercase">operando</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-brand-400" />
          <span className="font-mono text-xs text-gray-300">14.8k</span>
          <span className="text-[9px] text-dim uppercase">ton/turno</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-warn" />
          <span className="font-mono text-xs text-gray-300">82.4<span className="text-dim">%</span></span>
          <span className="text-[9px] text-dim uppercase">DF</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-crit animate-breathe" />
          <span className="font-mono text-xs text-crit">4</span>
          <span className="text-[9px] text-dim uppercase">alertas</span>
        </div>
      </div>

      {/* Right - Theme Toggle + Clock + Connection */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button onClick={toggle} className="relative flex items-center w-12 h-6 rounded-full border border-hud-border bg-hud-bg transition-all duration-300 hover:border-brand-600/40 group" title={theme==='dark'?'Modo Dia':'Modo Noite'}>
          <div className={`absolute w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${theme==='light'?'translate-x-6 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]':'translate-x-0.5 bg-slate-600 shadow-[0_0_8px_rgba(100,116,139,0.3)]'}`}>
            {theme==='light' ? <Sun className="w-3 h-3 text-white" /> : <Moon className="w-3 h-3 text-slate-300" />}
          </div>
        </button>

        <div className="w-px h-5 bg-hud-border" />
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-ok" />
          <span className="text-[10px] font-mono text-dim">48ms</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-dim" />
          <span className="font-mono text-sm text-gray-300 tabular-nums">
            {time.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
          </span>
        </div>
        <div className="text-[10px] font-mono text-dim">
          TURNO A — DIURNO
        </div>
      </div>
    </header>
  )
}