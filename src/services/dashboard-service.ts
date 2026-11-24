import { and, desc, eq, sql } from 'drizzle-orm'

import { db } from '@/app/db'
import { reservesTable } from '@/app/db/schemas/reserve-schema'
import { transactionsTable } from '@/app/db/schemas/transaction-schema'
import { usersTable } from '@/app/db/schemas/user-schema'

import type {
  DashboardCategory,
  DashboardMember,
  DashboardMonthPoint,
  DashboardOverview,
  DashboardPeriod,
  DashboardReserve,
  MonthTotals,
} from '@/lib/dashboard-types'
import {
  addMonths,
  getBrazilNow,
  getDaysInMonth,
  getMonthRangeBrazil,
  parseMonthString,
  toMonthString,
} from '@/lib/date-utils'

import { BudgetService } from '@/services/budget-service'
import { TransactionService } from '@/services/transaction-service'

/** Quantidade de meses da série histórica, terminando no mês selecionado. */
const SERIES_LENGTH = 6
const RECENT_TRANSACTIONS_LIMIT = 6
const UNCATEGORIZED = 'Sem categoria'

// Agrupamentos no horário de Brasília (UTC-3), mesma convenção de getMonthRangeBrazil
const brazilMonth = sql<string>`to_char(${transactionsTable.date} - interval '3 hours', 'YYYY-MM')`
const brazilDay = sql<number>`extract(day from ${transactionsTable.date} - interval '3 hours')::int`

/** Filtro de intervalo de datas no mesmo formato usado pelo TransactionService. */
function dateBetween(start: Date, end: Date) {
  return and(
    sql`${transactionsTable.date} >= ${start.toISOString()}`,
    sql`${transactionsTable.date} <= ${end.toISOString()}`,
  )
}

function monthRange(month: string) {
  const { year, month0 } = parseMonthString(month)
  return getMonthRangeBrazil(year, month0)
}

function toMonthTotals(entradas: number, saidas: number, reservas: number, count: number): MonthTotals {
  return { entradas, saidas, reservas, saldo: entradas - saidas - reservas, count }
}

function emptyTotals(): MonthTotals {
  return toMonthTotals(0, 0, 0, 0)
}

export class DashboardService {
  /**
   * Visão geral do mês para o painel Início.
   * @param spaceId Espaço
   * @param month Mês selecionado 'YYYY-MM'
   * @param now "Agora" no horário de Brasília (componentes locais), injetável para testes
   */
  static async getOverview(spaceId: string, month: string, now: Date = getBrazilNow()): Promise<DashboardOverview> {
    const { year, month0 } = parseMonthString(month)
    const previousMonth = addMonths(month, -1)
    const previous = parseMonthString(previousMonth)
    const oldestMonth = addMonths(month, -(SERIES_LENGTH - 1))

    const todayMonth = toMonthString(now.getFullYear(), now.getMonth())
    const isCurrentMonth = month === todayMonth
    const daysInMonth = getDaysInMonth(year, month0)
    const previousDaysInMonth = getDaysInMonth(previous.year, previous.month0)

    const period: DashboardPeriod = {
      daysInMonth,
      dayOfMonth: isCurrentMonth ? now.getDate() : null,
      isCurrentMonth,
      isFutureMonth: month > todayMonth,
    }

    const selectedRange = getMonthRangeBrazil(year, month0)
    const previousRange = getMonthRangeBrazil(previous.year, previous.month0)
    const seriesStart = monthRange(oldestMonth).start

    // Mês anterior até o mesmo dia de hoje (limitado ao tamanho do mês anterior), fim do dia em Brasília
    const previousToDateEnd = isCurrentMonth
      ? new Date(
          Date.UTC(previous.year, previous.month0, Math.min(now.getDate(), previousDaysInMonth) + 1, 2, 59, 59, 999),
        )
      : previousRange.end

    const spaceFilter = eq(transactionsTable.spaceId, spaceId)
    const isSaida = eq(transactionsTable.type, 'saida')

    const [monthlyRows, previousToDateRow, dailyRows, categoryRows, memberRows, budgets, reserveRows, recent] =
      await Promise.all([
        // Totais por mês e tipo nos últimos 6 meses
        db
          .select({
            month: brazilMonth,
            type: transactionsTable.type,
            total: sql<string>`coalesce(sum(${transactionsTable.amount}), 0)`,
            count: sql<string>`count(*)`,
          })
          .from(transactionsTable)
          .where(and(spaceFilter, dateBetween(seriesStart, selectedRange.end)))
          .groupBy(brazilMonth, transactionsTable.type),

        // Mês anterior até o mesmo dia (só no mês atual; fora dele vale o mês anterior inteiro)
        isCurrentMonth
          ? db
              .select({
                entradas: sql<string>`coalesce(sum(${transactionsTable.amount}) filter (where ${transactionsTable.type} = 'entrada'), 0)`,
                saidas: sql<string>`coalesce(sum(${transactionsTable.amount}) filter (where ${transactionsTable.type} = 'saida'), 0)`,
                reservas: sql<string>`coalesce(sum(${transactionsTable.amount}) filter (where ${transactionsTable.type} = 'reserva'), 0)`,
                count: sql<string>`count(*)`,
              })
              .from(transactionsTable)
              .where(and(spaceFilter, dateBetween(previousRange.start, previousToDateEnd)))
              .then(rows => rows[0] ?? null)
          : Promise.resolve(null),

        // Saídas por dia, mês selecionado e anterior
        db
          .select({
            month: brazilMonth,
            day: brazilDay,
            total: sql<string>`coalesce(sum(${transactionsTable.amount}), 0)`,
          })
          .from(transactionsTable)
          .where(and(spaceFilter, isSaida, dateBetween(previousRange.start, selectedRange.end)))
          .groupBy(brazilMonth, brazilDay),

        // Saídas por categoria: mês selecionado, anterior inteiro e anterior até o mesmo dia
        db
          .select({
            category: transactionsTable.category,
            total: sql<string>`coalesce(sum(${transactionsTable.amount}) filter (where ${transactionsTable.date} >= ${selectedRange.start.toISOString()}), 0)`,
            count: sql<string>`count(*) filter (where ${transactionsTable.date} >= ${selectedRange.start.toISOString()})`,
            previousTotal: sql<string>`coalesce(sum(${transactionsTable.amount}) filter (where ${transactionsTable.date} <= ${previousRange.end.toISOString()}), 0)`,
            previousToDateTotal: sql<string>`coalesce(sum(${transactionsTable.amount}) filter (where ${transactionsTable.date} <= ${previousToDateEnd.toISOString()}), 0)`,
          })
          .from(transactionsTable)
          .where(and(spaceFilter, isSaida, dateBetween(previousRange.start, selectedRange.end)))
          .groupBy(transactionsTable.category),

        // Saídas por pessoa no mês selecionado
        db
          .select({
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
            image: usersTable.image,
            total: sql<string>`coalesce(sum(${transactionsTable.amount}), 0)`,
            count: sql<string>`count(*)`,
          })
          .from(transactionsTable)
          .innerJoin(usersTable, eq(transactionsTable.userId, usersTable.id))
          .where(and(spaceFilter, isSaida, dateBetween(selectedRange.start, selectedRange.end)))
          .groupBy(usersTable.id, usersTable.name, usersTable.email, usersTable.image)
          .orderBy(desc(sql`sum(${transactionsTable.amount})`)),

        BudgetService.findManyWithSpending(spaceId, month),

        // Reservas ativas com o aporte do mês selecionado
        db
          .select({
            id: reservesTable.id,
            name: reservesTable.name,
            icon: reservesTable.icon,
            color: reservesTable.color,
            targetAmount: reservesTable.targetAmount,
            currentAmount: reservesTable.currentAmount,
            monthContribution: sql<string>`coalesce(sum(${transactionsTable.amount}), 0)`,
          })
          .from(reservesTable)
          .leftJoin(
            transactionsTable,
            and(
              eq(transactionsTable.reserveId, reservesTable.id),
              eq(transactionsTable.spaceId, spaceId),
              eq(transactionsTable.type, 'reserva'),
              dateBetween(selectedRange.start, selectedRange.end),
            ),
          )
          .where(and(eq(reservesTable.spaceId, spaceId), eq(reservesTable.active, true)))
          .groupBy(reservesTable.id)
          .orderBy(reservesTable.createdAt),

        TransactionService.findMany(
          { spaceId, dateFrom: selectedRange.start, dateTo: selectedRange.end },
          1,
          RECENT_TRANSACTIONS_LIMIT,
        ),
      ])

    // Série mensal com meses sem movimento zerados
    const totalsByMonth = new Map<string, MonthTotals>()
    for (const row of monthlyRows) {
      const totals = totalsByMonth.get(row.month) ?? emptyTotals()
      const amount = Number(row.total)
      if (row.type === 'entrada') totals.entradas += amount
      else if (row.type === 'saida') totals.saidas += amount
      else if (row.type === 'reserva') totals.reservas += amount
      totals.count += Number(row.count)
      totalsByMonth.set(row.month, totals)
    }

    const monthlySeries: DashboardMonthPoint[] = []
    for (let offset = -(SERIES_LENGTH - 1); offset <= 0; offset++) {
      const seriesMonth = addMonths(month, offset)
      const totals = totalsByMonth.get(seriesMonth) ?? emptyTotals()
      monthlySeries.push({
        month: seriesMonth,
        entradas: totals.entradas,
        saidas: totals.saidas,
        reservas: totals.reservas,
      })
    }

    const withSaldo = (totals: MonthTotals | undefined): MonthTotals =>
      totals ? toMonthTotals(totals.entradas, totals.saidas, totals.reservas, totals.count) : emptyTotals()

    const currentTotals = withSaldo(totalsByMonth.get(month))
    const previousTotals = withSaldo(totalsByMonth.get(previousMonth))
    const previousToDateTotals = previousToDateRow
      ? toMonthTotals(
          Number(previousToDateRow.entradas),
          Number(previousToDateRow.saidas),
          Number(previousToDateRow.reservas),
          Number(previousToDateRow.count),
        )
      : previousTotals

    // Saídas por dia (índice 0 = dia 1)
    const dailyCurrent = Array.from({ length: daysInMonth }, () => 0)
    const dailyPrevious = Array.from({ length: previousDaysInMonth }, () => 0)
    for (const row of dailyRows) {
      const target = row.month === month ? dailyCurrent : row.month === previousMonth ? dailyPrevious : null
      const index = Number(row.day) - 1
      if (target && index >= 0 && index < target.length) {
        target[index] += Number(row.total)
      }
    }

    // Categorias (sem categoria e "Sem categoria" se juntam)
    const categoriesByName = new Map<string, DashboardCategory>()
    for (const row of categoryRows) {
      const name = row.category || UNCATEGORIZED
      const category = categoriesByName.get(name) ?? {
        category: name,
        total: 0,
        previousTotal: 0,
        previousToDateTotal: 0,
        count: 0,
      }
      category.total += Number(row.total)
      category.previousTotal += Number(row.previousTotal)
      category.previousToDateTotal += Number(row.previousToDateTotal)
      category.count += Number(row.count)
      categoriesByName.set(name, category)
    }
    const categories = [...categoriesByName.values()].sort(
      (a, b) => b.total - a.total || b.previousTotal - a.previousTotal || a.category.localeCompare(b.category, 'pt-BR'),
    )

    const members: DashboardMember[] = memberRows.map(row => ({
      user: { id: row.id, name: row.name, email: row.email, image: row.image },
      total: Number(row.total),
      count: Number(row.count),
    }))

    const reserves: DashboardReserve[] = reserveRows.map(row => ({
      id: row.id,
      name: row.name,
      icon: row.icon,
      color: row.color,
      targetAmount: row.targetAmount,
      currentAmount: row.currentAmount,
      monthContribution: Number(row.monthContribution),
    }))

    return {
      month,
      previousMonth,
      period,
      totals: {
        current: currentTotals,
        previous: previousTotals,
        previousToDate: previousToDateTotals,
      },
      monthlySeries,
      dailySpending: { current: dailyCurrent, previous: dailyPrevious },
      categories,
      members,
      budgets,
      reserves,
      recentTransactions: recent.transactions,
    }
  }
}
