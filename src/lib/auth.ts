import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { customSession } from 'better-auth/plugins'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

import { db } from '@/app/db'
import { usersTable } from '@/app/db/schemas/user-schema'

const SESSION_MAX_AGE = 60 * 60 * 24 * 7

type AuthUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export type AppSession = {
  user: AuthUser
  expires?: string
}

async function ensureAppUser(user: AuthUser): Promise<AuthUser | null> {
  if (!user.email) {
    return null
  }

  const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, user.email)).limit(1)

  if (!existingUser) {
    const [createdUser] = await db
      .insert(usersTable)
      .values({
        name: user.name || 'Usuário',
        email: user.email,
        image: user.image || null,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      image: createdUser.image,
    }
  }

  const name = user.name || existingUser.name
  const image = user.image || existingUser.image

  if (name !== existingUser.name || image !== existingUser.image) {
    await db
      .update(usersTable)
      .set({
        name,
        image,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.email, user.email))
  }

  return {
    id: existingUser.id,
    name,
    email: existingUser.email,
    image,
  }
}

export const auth = betterAuth({
  appName: 'Personal Finance Tracker',
  baseURL: process.env.BETTER_AUTH_URL || process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: (process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID) as string,
      clientSecret: (process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET) as string,
      prompt: 'select_account',
    },
  },
  session: {
    expiresIn: SESSION_MAX_AGE,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: SESSION_MAX_AGE,
      strategy: 'jwe',
      refreshCache: true,
    },
  },
  account: {
    storeStateStrategy: 'cookie',
    storeAccountCookie: true,
  },
  plugins: [
    customSession(async ({ user, session }) => {
      const appUser = await ensureAppUser(user)

      return {
        user: appUser || user,
        session,
      }
    }),
    nextCookies(),
  ],
})

export async function getCurrentSession(): Promise<AppSession | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return null
  }

  const appUser = await ensureAppUser(session.user)

  if (!appUser) {
    return null
  }

  return {
    user: appUser,
    expires: session.session.expiresAt.toISOString(),
  }
}
