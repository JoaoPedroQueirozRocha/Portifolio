import { NextResponse, type NextRequest } from 'next/server'
import { locales, defaultLocale, isValidLocale } from '@/lib/i18n'

function getLocaleFromRequest(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') ?? ''

  // Pega os locales preferidos do browser na ordem de prioridade
  const preferred = acceptLanguage
    .split(',')
    .map((part) => part.split(';')[0].trim())

  for (const lang of preferred) {
    // Match exato (ex: pt-BR)
    if (isValidLocale(lang)) return lang
    // Match parcial (ex: pt → pt-BR)
    const partial = locales.find((l) => l.startsWith(lang.split('-')[0]))
    if (partial) return partial
  }

  return defaultLocale
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignora arquivos estáticos, rotas internas do Next e admin
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Verifica se a URL já tem um locale válido
  const pathnameLocale = pathname.split('/')[1]
  if (isValidLocale(pathnameLocale)) return NextResponse.next()

  // Redireciona para /<locale><pathname>
  const locale = getLocaleFromRequest(request)
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: ['/((?!_next|api|admin|.*\\..*).*)'],
}
