import NextAuth from 'next-auth'

import authConfig from './auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    async signIn({ account }) {
      if (account?.provider === 'google') {
        // Implementar lógica
        return true
      }
      return false
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session?.user) {
        return token
      }

      // Passa as informações do usuário para o token durante o login
      if (user) {
        token.id = user.id
      }

      return token
    },
    async session({ session, token }) {
      // Passa os dados do token para a sessão
      if (token) {
        if (token.id) session.user.id = token.id as string
      }
      return session
    },
  },
})
