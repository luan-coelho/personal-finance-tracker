import { and, desc, eq, ilike, sql } from 'drizzle-orm'

import { db } from '@/app/db'
import {
  transactionsTable,
  type Transaction,
  type TransactionFormValues,
  type TransactionType,
  type TransactionWithUser,
} from '@/app/db/schemas'
import { usersTable } from '@/app/db/schemas/user-schema'

export interface TransactionFilters {
  spaceId?: string
  userId?: string
  type?: TransactionType
  category?: string
  tags?: string[]
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export interface TransactionSummary {
  totalEntradas: number
  totalSaidas: number
  saldo: number
  count: number
}

export class TransactionService {
  // Criar nova transação
  static async create(data: TransactionFormValues): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactionsTable)
      .values({
        ...data,
        amount: data.amount.toString(),
        createdAt: new Date(),
      })
      .returning()

    return transaction
  }

  // Buscar transação por ID
  static async findById(id: string): Promise<Transaction | null> {
    const [transaction] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, id)).limit(1)

    return transaction || null
  }

  // Listar transações com filtros e paginação
  static async findMany(
    filters: TransactionFilters = {},
    page: number = 1,
    limit: number = 20,
  ): Promise<{ transactions: TransactionWithUser[]; total: number }> {
    const conditions = []

    if (filters.spaceId) {
      conditions.push(eq(transactionsTable.spaceId, filters.spaceId))
    }

    if (filters.userId) {
      conditions.push(eq(transactionsTable.userId, filters.userId))
    }

    if (filters.type) {
      conditions.push(eq(transactionsTable.type, filters.type))
    }

    if (filters.category) {
      conditions.push(eq(transactionsTable.category, filters.category))
    }

    if (filters.tags && filters.tags.length > 0) {
      conditions.push(sql`${transactionsTable.tags} && ${filters.tags}`)
    }

    if (filters.dateFrom) {
      conditions.push(sql`${transactionsTable.date} >= ${filters.dateFrom.toISOString()}`)
    }

    if (filters.dateTo) {
      conditions.push(sql`${transactionsTable.date} <= ${filters.dateTo.toISOString()}`)
    }

    if (filters.search) {
      conditions.push(ilike(transactionsTable.description, `%${filters.search}%`))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Buscar transações com paginação e informações do usuário
    const transactions = await db
      .select({
        transaction: transactionsTable,
        user: {
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          image: usersTable.image,
        },
      })
      .from(transactionsTable)
      .leftJoin(usersTable, eq(transactionsTable.userId, usersTable.id))
      .where(whereClause)
      .orderBy(desc(transactionsTable.date), desc(transactionsTable.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    // Contar total de registros
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactionsTable)
      .where(whereClause)

    // Mapear resultados para incluir informações do usuário
    const transactionsWithUser: TransactionWithUser[] = transactions.map(({ transaction, user }) => ({
      ...transaction,
      user: user || undefined,
    }))

    return {
      transactions: transactionsWithUser,
      total: Number(count),
    }
  }

  // Atualizar transação
  static async update(id: string, data: Partial<TransactionFormValues>): Promise<Transaction | null> {
    const [transaction] = await db
      .update(transactionsTable)
      .set({
        ...data,
        amount: data.amount ? data.amount.toString() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(transactionsTable.id, id))
      .returning()

    return transaction || null
  }

  // Deletar transação
  static async delete(id: string): Promise<boolean> {
    const result = await db.delete(transactionsTable).where(eq(transactionsTable.id, id))

    return (result.rowCount ?? 0) > 0
  }

  // Obter resumo financeiro
  static async getSummary(filters: TransactionFilters = {}): Promise<TransactionSummary> {
    const conditions = []

    if (filters.spaceId) {
      conditions.push(eq(transactionsTable.spaceId, filters.spaceId))
    }

    if (filters.userId) {
      conditions.push(eq(transactionsTable.userId, filters.userId))
    }

    if (filters.dateFrom) {
      conditions.push(sql`${transactionsTable.date} >= ${filters.dateFrom.toISOString()}`)
    }

    if (filters.dateTo) {
      conditions.push(sql`${transactionsTable.date} <= ${filters.dateTo.toISOString()}`)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const [result] = await db
      .select({
        totalEntradas: sql<number>`
          COALESCE(SUM(CASE WHEN type = 'entrada' THEN amount::numeric ELSE 0 END), 0)
        `,
        totalSaidas: sql<number>`
          COALESCE(SUM(CASE WHEN type = 'saida' THEN amount::numeric ELSE 0 END), 0)
        `,
        count: sql<number>`count(*)`,
      })
      .from(transactionsTable)
      .where(whereClause)

    const totalEntradas = Number(result.totalEntradas)
    const totalSaidas = Number(result.totalSaidas)
    const saldo = totalEntradas - totalSaidas

    return {
      totalEntradas,
      totalSaidas,
      saldo,
      count: Number(result.count),
    }
  }

  // Obter categorias únicas por espaço
  static async getCategories(spaceId: string): Promise<string[]> {
    const results = await db
      .selectDistinct({ category: transactionsTable.category })
      .from(transactionsTable)
      .where(and(eq(transactionsTable.spaceId, spaceId), sql`${transactionsTable.category} IS NOT NULL`))
      .orderBy(transactionsTable.category)

    return results.map(r => r.category).filter(Boolean) as string[]
  }

  // Obter tags únicas por espaço
  static async getTags(spaceId: string): Promise<string[]> {
    const results = await db
      .select({ tags: transactionsTable.tags })
      .from(transactionsTable)
      .where(and(eq(transactionsTable.spaceId, spaceId), sql`${transactionsTable.tags} IS NOT NULL`))

    const allTags = new Set<string>()
    results.forEach(result => {
      if (result.tags) {
        result.tags.forEach(tag => allTags.add(tag))
      }
    })

    return Array.from(allTags).sort()
  }

  // Obter dados para gráfico de categorias
  static async getCategoryChart(
    spaceId: string,
    type?: TransactionType,
  ): Promise<Array<{ category: string; total: number }>> {
    const conditions = [eq(transactionsTable.spaceId, spaceId)]

    if (type) {
      conditions.push(eq(transactionsTable.type, type))
    }

    const results = await db
      .select({
        category: transactionsTable.category,
        total: sql<number>`SUM(amount::numeric)`,
      })
      .from(transactionsTable)
      .where(and(...conditions))
      .groupBy(transactionsTable.category)
      .orderBy(sql`SUM(amount::numeric) DESC`)

    return results.map(r => ({
      category: r.category || 'Sem categoria',
      total: Number(r.total),
    }))
  }

  // Obter dados para gráfico mensal
  static async getMonthlyChart(
    spaceId: string,
    year: number,
  ): Promise<Array<{ month: string; entradas: number; saidas: number }>> {
    const results = await db
      .select({
        month: sql<string>`TO_CHAR(date, 'YYYY-MM')`,
        entradas: sql<number>`
          COALESCE(SUM(CASE WHEN type = 'entrada' THEN amount::numeric ELSE 0 END), 0)
        `,
        saidas: sql<number>`
          COALESCE(SUM(CASE WHEN type = 'saida' THEN amount::numeric ELSE 0 END), 0)
        `,
      })
      .from(transactionsTable)
      .where(and(eq(transactionsTable.spaceId, spaceId), sql`EXTRACT(YEAR FROM date) = ${year}`))
      .groupBy(sql`TO_CHAR(date, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(date, 'YYYY-MM')`)

    return results.map(r => ({
      month: r.month,
      entradas: Number(r.entradas),
      saidas: Number(r.saidas),
    }))
  }
}
