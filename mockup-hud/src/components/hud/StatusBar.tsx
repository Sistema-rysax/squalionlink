import { useState, useEffect, useRef } from 'react'
import { Activity, AlertTriangle, Wifi, Clock, Truck, Zap, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { Locale, localeFlags } from '../../i18n'
import { equipamentos, alertas } from '../../mock/data'

export default function StatusBar() {
  const [time, setTime] = useState(new Date())
  const { theme, toggle } = useTheme()
  const { locale, setLocale, t } = useLanguage()
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => { const i = setInterval(()=>setTime(new Date()), 1000); return ()=>clearInterval(i) }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const locales: Locale[] = ['pt', 'en', 'es']

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
          <span className="text-[10px] font-mono text-dim uppercase">{t.statusBar.systemOnline}</span>
        </div>
      </div>

      {/* Center - Live KPIs */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-ok" />
          <span className="font-mono text-xs text-gray-300">{equipamentos.filter(e => e.status === 'OPERANDO').length}<span className="text-dim">/{equipamentos.length}</span></span>
          <span className="text-[9px] text-dim uppercase">{t.statusBar.operating}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-brand-400" />
          <span className="font-mono text-xs text-gray-300">42.6k</span>
          <span className="text-[9px] text-dim uppercase">{t.statusBar.tonShift}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-warn" />
          <span className="font-mono text-xs text-gray-300">82.4<span className="text-dim">%</span></span>
          <span className="text-[9px] text-dim uppercase">DF</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-crit animate-breathe" />
          <span className="font-mono text-xs text-crit">{alertas.filter(a => !a.tratado).length}</span>
          <span className="text-[9px] text-dim uppercase">{t.statusBar.alerts}</span>
        </div>
      </div>

      {/* Right - Language + Theme + Clock */}
      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-hud-border bg-hud-bg hover:border-brand-600/40 transition-all"
            title="Language"
          >
            <span className="text-base leading-none">{localeFlags[locale]}</span>
            <svg className={`w-2.5 h-2.5 text-dim transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>

          {langOpen && (
            <div className="absolute top-full right-0 mt-2 z-[9999] bg-hud-panel/98 backdrop-blur-xl border border-hud-border rounded-xl shadow-2xl overflow-hidden min-w-[140px]">
              {locales.map(l => (
                <button
                  key={l}
                  onClick={() => { setLocale(l); setLangOpen(false) }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 text-left transition-all ${locale === l ? 'bg-brand-600/15 text-brand-400' : 'text-gray-300 hover:bg-white/[0.03]'}`}
                >
                  <span className="text-lg leading-none">{localeFlags[l]}</span>
                  <span className="text-[11px] font-mono">{l === 'pt' ? 'Português' : l === 'en' ? 'English' : 'Español'}</span>
                  {locale === l && <svg className="w-3.5 h-3.5 ml-auto text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button onClick={toggle} className="relative flex items-center w-12 h-6 rounded-full border border-hud-border bg-hud-bg transition-all duration-300 hover:border-brand-600/40 group" title={theme==='dark'? t.statusBar.dayMode : t.statusBar.nightMode}>
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
            {time.toLocaleTimeString(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'pt-BR', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
          </span>
        </div>
        <div className="text-[10px] font-mono text-dim">
          {t.statusBar.shift} A — {t.statusBar.day}
        </div>
      </div>
    </header>
  )
}
