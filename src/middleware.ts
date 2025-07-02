import NextAuth from 'next-auth'

import authConfig from '@/lib/auth.config'
import { routes } from '@/lib/routes'

// Usar configuração básica sem adapter para compatibilidade com Edge Runtime
const { auth: middleware } = NextAuth(authConfig)

export default middleware(req => {
  if (!req.auth && req.nextUrl.pathname !== routes.frontend.auth.signIn) {
    const newUrl = new URL(routes.frontend.auth.signIn, req.nextUrl.origin)
    return Response.redirect(newUrl)
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
