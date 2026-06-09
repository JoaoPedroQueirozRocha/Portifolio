import 'server-only'
import { type Locale, isValidLocale } from '@/lib/i18n'
import type ptBR from '@/dictionaries/pt-BR.json'

export type Dictionary = typeof ptBR

export { isValidLocale }

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  'pt-BR': () =>
    import('@/dictionaries/pt-BR.json').then((m) => m.default as Dictionary),
  'en': () =>
    import('@/dictionaries/en.json').then((m) => m.default as Dictionary),
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]()
}
