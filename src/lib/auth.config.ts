import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

import { routes } from '@/lib/routes'

// Configuração básica do Auth.js sem adapter (compatível com Edge Runtime)
export default {
  debug: false,
  trustHost: true,
  providers: [
    Google({
      profile(profile) {
        return { ...profile }
      },
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 1 dia
  },
  pages: {
    signIn: routes.frontend.auth.signIn,
    signOut: routes.frontend.auth.signIn,
    newUser: routes.frontend.auth.signIn,
    error: routes.frontend.auth.signIn,
  },
} satisfies NextAuthConfig
