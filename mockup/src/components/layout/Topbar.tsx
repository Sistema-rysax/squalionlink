import { useState } from 'react'
import { Bell, Sun, Moon, Globe, ChevronDown } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useI18n, Locale } from '../../contexts/I18nContext'

export default function Topbar() {
  const { theme, toggle } = useTheme()
  const { locale, setLocale, t, localeNames } = useI18n()
  const [langOpen, setLangOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const notifs = [
    { id:1, title:'Tanque baixo — CAT-05', time:'5 min', read:false },
    { id:2, title:'OS concluída — OS-2024-0340', time:'1h', read:false },
    { id:3, title:'Checklist NC — CAT-03', time:'3h', read:true },
  ]

  return (
    <header className="h-16 bg-surface-1 border-b border-surface-3 flex items-center justify-between px-6">
      <div></div>
      <div className="flex items-center gap-2">
        {/* Language */}
        <div className="relative">
          <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-2 text-gray-400 text-sm transition-colors">
            <Globe className="w-4 h-4" />
            <span className="text-xs">{locale.toUpperCase()}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-1 bg-surface-1 border border-surface-3 rounded-lg shadow-xl py-1 z-50 min-w-[140px]" onMouseLeave={() => setLangOpen(false)}>
              {(Object.entries(localeNames) as [Locale, string][]).map(([code, name]) => (
                <button key={code} onClick={() => { setLocale(code); setLangOpen(false) }}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-surface-2 transition-colors ${code===locale?'text-brand-400 font-medium':'text-gray-400'}`}>
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button onClick={toggle} className="p-2 rounded-lg hover:bg-surface-2 text-gray-400 transition-colors" title={theme==='dark'?t('light_mode'):t('dark_mode')}>
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 rounded-lg hover:bg-surface-2 text-gray-400 relative transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-surface-1 border border-surface-3 rounded-xl shadow-xl z-50 overflow-hidden" onMouseLeave={() => setNotifOpen(false)}>
              <div className="p-3 border-b border-surface-3"><span className="text-sm font-medium text-gray-200">Notificações</span></div>
              <div className="max-h-64 overflow-y-auto">
                {notifs.map(n => (
                  <div key={n.id} className={`px-3 py-2.5 border-b border-surface-3 hover:bg-surface-2 cursor-pointer ${!n.read?'bg-brand-900/5':''}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${!n.read?'text-gray-200 font-medium':'text-gray-400'}`}>{n.title}</span>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-brand-500"></span>}
                    </div>
                    <span className="text-xs text-gray-600">{n.time} atrás</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
