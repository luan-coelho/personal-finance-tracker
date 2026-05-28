import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('resolveDatabaseDriver', () => {
  it('uses Neon serverless for Neon URLs even in development', async () => {
    const dbModule = await import('./index')

    assert.equal(typeof (dbModule as any).resolveDatabaseDriver, 'function')
    assert.equal(
      (dbModule as any).resolveDatabaseDriver({
        databaseUrl: 'postgresql://user:password@ep-test-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
        nodeEnv: 'development',
      }),
      'neon-serverless',
    )
  })

  it('uses node-postgres for local development URLs', async () => {
    const dbModule = await import('./index')

    assert.equal(
      (dbModule as any).resolveDatabaseDriver({
        databaseUrl: 'postgresql://postgres:postgres@localhost:5432/personal_finance',
        nodeEnv: 'development',
      }),
      'node-postgres',
    )
  })
})
