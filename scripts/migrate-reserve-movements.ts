import 'dotenv/config'

import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { reserveMovementsTable } from '../src/app/db/schemas/reserve-movement-schema'
import { reservesTable } from '../src/app/db/schemas/reserve-schema'
import { transactionsTable } from '../src/app/db/schemas/transaction-schema'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const db = drizzle(pool)

async function main() {
  console.log('Iniciando migração de movimentações de reserva para transações...')

  // 1. Buscar todas as movimentações
  const movements = await db.select().from(reserveMovementsTable)
  console.log(`Encontradas ${movements.length} movimentações para migrar.`)

  for (const movement of movements) {
    // 2. Buscar a reserva para obter o spaceId
    const [reserve] = await db.select().from(reservesTable).where(eq(reservesTable.id, movement.reserveId))

    if (!reserve) {
      console.warn(`Reserva não encontrada para movimentação ${movement.id}. Ignorando.`)
      continue
    }

    // 3. Determinar o valor (positivo para depósito, negativo para retirada)
    const amount = Number(movement.amount)
    const finalAmount = movement.type === 'withdraw' ? -amount : amount

    console.log(`Migrando movimentação ${movement.id}: ${movement.type} de ${amount} (R$)`)

    // 4. Inserir na tabela de transações
    await db.insert(transactionsTable).values({
      type: 'reserva',
      amount: finalAmount.toString(),
      date: movement.date,
      description: movement.description || 'Movimentação importada',
      reserveId: movement.reserveId,
      spaceId: reserve.spaceId,
      userId: movement.userId,
      createdAt: movement.createdAt,
      updatedAt: movement.updatedAt,
    })
  }

  // 5. Opcional: Limpar a tabela de movimentações antiga?
  // Por segurança, vou comentar essa parte, mas o ideal seria dropar a tabela ou limpar depois.
  // await db.delete(reserveMovementsTable)

  console.log('Migração concluída com sucesso!')
  process.exit(0)
}

main().catch(err => {
  console.error('Erro na migração:', err)
  process.exit(1)
})
