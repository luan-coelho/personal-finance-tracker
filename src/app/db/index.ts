import 'dotenv/config'

import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle as drizzleNeonServerless } from 'drizzle-orm/neon-serverless'
import { drizzle as drizzlePostgres } from 'drizzle-orm/node-postgres'
import ws from 'ws'

import * as schema from './schemas'

type DatabaseDriver = 'neon-serverless' | 'node-postgres'

type DatabaseDriverConfig = {
  databaseDriver?: string
  databaseUrl?: string
  nodeEnv?: string
}

function isNeonDatabaseUrl(databaseUrl?: string) {
  if (!databaseUrl) {
    return false
  }

  try {
    return new URL(databaseUrl).hostname.endsWith('.neon.tech')
  } catch {
    return false
  }
}

export function resolveDatabaseDriver({
  databaseDriver = process.env.DATABASE_DRIVER,
  databaseUrl = process.env.DATABASE_URL,
  nodeEnv = process.env.NODE_ENV,
}: DatabaseDriverConfig = {}): DatabaseDriver {
  if (databaseDriver === 'neon-serverless' || databaseDriver === 'node-postgres') {
    return databaseDriver
  }

  if (isNeonDatabaseUrl(databaseUrl)) {
    return 'neon-serverless'
  }

  return nodeEnv === 'production' ? 'neon-serverless' : 'node-postgres'
}

function createDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  if (resolveDatabaseDriver() === 'neon-serverless') {
    // O driver neon-http não suporta db.transaction(), então usamos Pool com WebSocket.
    neonConfig.webSocketConstructor = ws
    const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
    return drizzleNeonServerless(pool, { schema })
  }

  return drizzlePostgres(process.env.DATABASE_URL!, { schema })
}

const db = createDatabase()

export { db, schema }
