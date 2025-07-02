import { DefaultJWT, DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
    } & DefaultSession['user']
  }

  interface JWT extends DefaultJWT {
    id?: string
  }
}
