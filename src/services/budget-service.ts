import { and, desc, eq, sql } from 'drizzle-orm'

import { db } from '@/app/db'
import {
  budgetsTable,
  type Budget,
  type BudgetFormValues,
  type BudgetWithSpending,
  type BudgetWithSpendingAndUser,
} from '@/app/db/schemas/budget-schema'
import { transactionsTable } from '@/app/db/schemas/transaction-schema'
import { usersTable } from '@/app/db/schemas/user-schema'

export interface BudgetFilters {
  spaceId?: string
  category?: string
  month?: string
}

export class BudgetService {
  // Criar novo orçamento
  static async create(data: BudgetFormValues): Promise<Budget> {
    const [budget] = await db
      .insert(budgetsTable)
      .values({
        ...data,
        amount: data.amount.toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return budget
  }

  // Buscar orçamento por ID
  static async findById(id: string): Promise<Budget | null> {
    const [budget] = await db.select().from(budgetsTable).where(eq(budgetsTable.id, id)).limit(1)

    return budget || null
  }

  // Listar orçamentos com filtros
  static async findMany(filters: BudgetFilters = {}): Promise<Budget[]> {
    const conditions = []

    if (filters.spaceId) {
      conditions.push(eq(budgetsTable.spaceId, filters.spaceId))
    }

    if (filters.category) {
      conditions.push(eq(budgetsTable.category, filters.category))
    }

    if (filters.month) {
      conditions.push(eq(budgetsTable.month, filters.month))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const budgets = await db.select().from(budgetsTable).where(whereClause).orderBy(desc(budgetsTable.createdAt))

    return budgets
  }

  // Buscar orçamentos com informações de gastos
  static async findManyWithSpending(spaceId: string, month: string): Promise<BudgetWithSpendingAndUser[]> {
    // Buscar orçamentos do mês com informações do criador
    const budgetsWithCreator = await db
      .select({
        budget: budgetsTable,
        createdBy: {
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          image: usersTable.image,
        },
      })
      .from(budgetsTable)
      .leftJoin(usersTable, eq(budgetsTable.createdById, usersTable.id))
      .where(and(eq(budgetsTable.spaceId, spaceId), eq(budgetsTable.month, month)))
      .orderBy(budgetsTable.category)

    // Se não há orçamentos, retornar array vazio
    if (budgetsWithCreator.length === 0) {
      return []
    }

    // Calcular primeiro e último dia do mês
    const [year, monthNum] = month.split('-').map(Number)
    const startDate = new Date(year, monthNum - 1, 1)
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999)

    // Buscar gastos por categoria no período
    const spentByCategory = await db
      .select({
        category: transactionsTable.category,
        total: sql<number>`COALESCE(SUM(amount::numeric), 0)`,
      })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.spaceId, spaceId),
          eq(transactionsTable.type, 'saida'),
          sql`${transactionsTable.date} >= ${startDate.toISOString()}`,
          sql`${transactionsTable.date} <= ${endDate.toISOString()}`,
        ),
      )
      .groupBy(transactionsTable.category)

    // Criar mapa de gastos por categoria
    const spentMap = new Map<string, number>()
    spentByCategory.forEach(item => {
      if (item.category) {
        spentMap.set(item.category, Number(item.total))
      }
    })

    // Combinar orçamentos com gastos e informações do criador
    return budgetsWithCreator.map(({ budget, createdBy }) => {
      const budgetAmount = Number(budget.amount)
      const spent = spentMap.get(budget.category) || 0
      const remaining = Math.max(0, budgetAmount - spent)
      const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0

      return {
        ...budget,
        spent,
        remaining,
        percentage,
        createdBy: createdBy || undefined,
      }
    })
  }

  // Buscar orçamento específico por espaço, categoria e mês
  static async findByCategoryAndMonth(spaceId: string, category: string, month: string): Promise<Budget | null> {
    const [budget] = await db
      .select()
      .from(budgetsTable)
      .where(and(eq(budgetsTable.spaceId, spaceId), eq(budgetsTable.category, category), eq(budgetsTable.month, month)))
      .limit(1)

    return budget || null
  }

  // Atualizar orçamento
  static async update(id: string, data: Partial<BudgetFormValues>): Promise<Budget | null> {
    const [budget] = await db
      .update(budgetsTable)
      .set({
        ...data,
        amount: data.amount ? data.amount.toString() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(budgetsTable.id, id))
      .returning()

    return budget || null
  }

  // Deletar orçamento
  static async delete(id: string): Promise<boolean> {
    const result = await db.delete(budgetsTable).where(eq(budgetsTable.id, id))

    return (result.rowCount ?? 0) > 0
  }

  // Obter resumo de orçamentos por espaço e mês
  static async getSummary(spaceId: string, month: string) {
    const budgetsWithSpending = await this.findManyWithSpending(spaceId, month)

    const totalBudget = budgetsWithSpending.reduce((sum, b) => sum + Number(b.amount), 0)
    const totalSpent = budgetsWithSpending.reduce((sum, b) => sum + b.spent, 0)
    const totalRemaining = budgetsWithSpending.reduce((sum, b) => sum + b.remaining, 0)
    const averagePercentage =
      budgetsWithSpending.length > 0
        ? budgetsWithSpending.reduce((sum, b) => sum + b.percentage, 0) / budgetsWithSpending.length
        : 0

    const categoriesOverBudget = budgetsWithSpending.filter(b => b.percentage > 100).length
    const categoriesNearLimit = budgetsWithSpending.filter(b => b.percentage >= 80 && b.percentage <= 100).length

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      averagePercentage,
      categoriesCount: budgetsWithSpending.length,
      categoriesOverBudget,
      categoriesNearLimit,
      budgets: budgetsWithSpending,
    }
  }

  // Obter categorias com orçamento definido para um espaço
  static async getBudgetCategories(spaceId: string, month: string): Promise<string[]> {
    const results = await db
      .selectDistinct({ category: budgetsTable.category })
      .from(budgetsTable)
      .where(and(eq(budgetsTable.spaceId, spaceId), eq(budgetsTable.month, month)))
      .orderBy(budgetsTable.category)

    return results.map(r => r.category)
  }
}
