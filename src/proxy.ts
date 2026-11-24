import { getSessionCookie } from 'better-auth/cookies'
import { type NextRequest, NextResponse } from 'next/server'

import { routes } from '@/lib/routes'

// Vitrine de componentes (`/dev/*`): aberta sem sessão apenas em desenvolvimento.
function isDevRoute(pathname: string) {
  return process.env.NODE_ENV === 'development' && (pathname === '/dev' || pathname.startsWith('/dev/'))
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (isDevRoute(pathname)) {
    return NextResponse.next()
  }

  const sessionCookie = getSessionCookie(req)

  if (!sessionCookie && pathname !== routes.frontend.auth.signIn) {
    const newUrl = new URL(routes.frontend.auth.signIn, req.url)
    return NextResponse.redirect(newUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|~offline|sw\\.js|manifest\\.webmanifest|icon-192x192\\.png|icon-512x512\\.png|apple-touch-icon\\.png).*)',
  ],
}
