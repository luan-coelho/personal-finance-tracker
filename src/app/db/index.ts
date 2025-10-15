import 'dotenv/config'

import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
// Imports condicionais baseados no ambiente
import { drizzle as drizzlePostgres } from 'drizzle-orm/node-postgres'

import * as schema from './schemas'

// Detecta se está em ambiente de desenvolvimento
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined

function createDatabase() {
  if (isDevelopment) {
    // Configuração para desenvolvimento local (PostgreSQL com Docker)
    return drizzlePostgres(process.env.DATABASE_URL!, { schema })
  } else {
    // Configuração para produção (Neon na Vercel)
    const sql = neon(process.env.DATABASE_URL!)
    return drizzleNeon(sql, { schema })
  }
}

const db = createDatabase()

export { db, schema }
