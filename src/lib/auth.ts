import { eq } from 'drizzle-orm'
import NextAuth from 'next-auth'

import { db } from '@/app/db'
import { usersTable } from '@/app/db/schemas/user-schema'

import authConfig from './auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && user?.email) {
        try {
          const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, user.email)).limit(1)

          if (existingUser.length === 0) {
            // Criar novo usuário se não existir
            await db.insert(usersTable).values({
              name: user.name || 'Usuário',
              email: user.email,
              image: profile?.picture || null,
              active: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            console.log(`Novo usuário criado: ${user.email}`)
          } else {
            await db
              .update(usersTable)
              .set({
                name: user.name || existingUser[0].name,
                image: profile?.picture || existingUser[0].image,
                updatedAt: new Date(),
              })
              .where(eq(usersTable.email, user.email))
            console.log(`Usuário existente atualizado: ${user.email}`)
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
