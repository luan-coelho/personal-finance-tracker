import { eq } from 'drizzle-orm'
import NextAuth from 'next-auth'

import { db } from '@/app/db'
import { usersTable } from '@/app/db/schemas/user-schema'

import authConfig from './auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user?.email) {
        try {
          // Verificar se o usuário já existe
          const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, user.email)).limit(1)

          if (existingUser.length === 0) {
            // Criar novo usuário se não existir
            await db.insert(usersTable).values({
              name: user.name || 'Usuário',
              email: user.email,
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            console.log(`Novo usuário criado: ${user.email}`)
          }
        } catch (error) {
          console.error('Erro ao criar/verificar usuário:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session?.user) {
        return token
      }

      // Buscar ID do usuário no banco baseado no email
      if (user?.email) {
        try {
          const [dbUser] = await db
            .select({ id: usersTable.id })
            .from(usersTable)
            .where(eq(usersTable.email, user.email))
            .limit(1)

          if (dbUser) {
            token.id = dbUser.id
          }
        } catch (error) {
          console.error('❌ Erro ao buscar ID do usuário:', error)
        }
      }

      return token
    },
    async session({ session, token }) {
      // Passa os dados do token para a sessão
      if (token?.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
