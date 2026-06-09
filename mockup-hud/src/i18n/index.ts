import pt from './pt'
import en from './en'
import es from './es'

export type Locale = 'pt' | 'en' | 'es'
export type Translations = typeof pt

export const translations: Record<Locale, Translations> = { pt, en, es }

export const localeNames: Record<Locale, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
}

export const localeFlags: Record<Locale, string> = {
  pt: '🇧🇷',
  en: '🇺🇸',
  es: '🇪🇸',
}

export { pt, en, es }
