import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { Locale, Translations, translations } from '../i18n'

interface LanguageCtx {
  locale: Locale
  setLocale: (l: Locale) => void
  t: Translations
}

const LanguageContext = createContext<LanguageCtx>({
  locale: 'pt',
  setLocale: () => {},
  t: translations.pt,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem('squalionlink-locale')
    return (stored === 'pt' || stored === 'en' || stored === 'es') ? stored : 'pt'
  })

  useEffect(() => {
    localStorage.setItem('squalionlink-locale', locale)
    document.documentElement.setAttribute('lang', locale)
  }, [locale])

  const setLocale = useCallback((l: Locale) => setLocaleState(l), [])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
export const useT = () => useContext(LanguageContext).t
