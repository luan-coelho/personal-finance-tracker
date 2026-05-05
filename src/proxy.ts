import { getSessionCookie } from 'better-auth/cookies'
import { NextResponse, type NextRequest } from 'next/server'

import { routes } from '@/lib/routes'

export function proxy(req: NextRequest) {
  const sessionCookie = getSessionCookie(req)

  if (!sessionCookie && req.nextUrl.pathname !== routes.frontend.auth.signIn) {
    const newUrl = new URL(routes.frontend.auth.signIn, req.url)
    return NextResponse.redirect(newUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|icon-192x192\\.png|icon-512x512\\.png|apple-touch-icon\\.png).*)',
  ],
}
