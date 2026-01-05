import 'dotenv/config'

import { Pool } from '@neondatabase/serverless'
import { drizzle as drizzleNeonServerless } from 'drizzle-orm/neon-serverless'
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
    // Configuração para produção (Neon na Vercel - usando WebSocket para suportar transações)
    // O driver neon-http não suporta db.transaction(), então usamos Pool com WebSocket
    const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
    return drizzleNeonServerless(pool, { schema })
  }
}

const db = createDatabase()

export { db, schema }
