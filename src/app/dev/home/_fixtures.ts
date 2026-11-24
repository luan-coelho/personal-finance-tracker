import type { BudgetWithSpending, TransactionWithUser } from '@/app/db/schemas'

import type { DashboardOverview, MonthTotals } from '@/lib/dashboard-types'

/**
 * Dados fictícios do painel Início para a vitrine `/dev/home` (só desenvolvimento).
 * Determinísticos: mesmo resultado a cada render, sem depender da data real.
 */

export type DashboardFixtureVariant = 'current' | 'past' | 'empty' | 'tight'

const SPACE_ID = 'space-demo'

const users = {
  ana: { id: 'user-ana', name: 'Ana Souza', email: 'ana@example.com', image: null },
  bruno: { id: 'user-bruno', name: 'Bruno Lima', email: 'bruno@example.com', image: null },
}

/** Gasto diário pseudoaleatório estável (seed simples). */
function dailySeries(days: number, seed: number, base: number, until = days): number[] {
  let state = seed
  return Array.from({ length: days }, (_, index) => {
    if (index >= until) return 0
    state = (state * 9301 + 49297) % 233280
    const noise = state / 233280
    const weekend = index % 7 === 5 || index % 7 === 6 ? 1.6 : 1
    const bill = index === 4 ? 1450 : index === 9 ? 380 : 0
    return Math.round((base * noise * weekend + bill) * 100) / 100
  })
}

const sum = (values: number[]) => Math.round(values.reduce((total, value) => total + value, 0) * 100) / 100

function totals(entradas: number, saidas: number, reservas: number, count: number): MonthTotals {
  return { entradas, saidas, reservas, saldo: Math.round((entradas - saidas - reservas) * 100) / 100, count }
}

function budget(category: string, amount: number, spent: number, month: string): BudgetWithSpending {
  return {
    id: `budget-${category}`,
    spaceId: SPACE_ID,
    category,
    amount: amount.toFixed(2),
    month,
    createdById: users.ana.id,
    createdAt: new Date('2026-10-01T12:00:00Z'),
    updatedAt: new Date('2026-10-01T12:00:00Z'),
    spent,
    remaining: Math.round((amount - spent) * 100) / 100,
    exceededAmount: Math.max(0, Math.round((spent - amount) * 100) / 100),
    percentage: amount > 0 ? Math.round((spent / amount) * 10000) / 100 : 0,
  }
}

function transaction(
  id: number,
  type: TransactionWithUser['type'],
  amount: number,
  date: string,
  description: string,
  category: string | null,
  user: (typeof users)[keyof typeof users],
  tags: string[] | null = null,
): TransactionWithUser {
  return {
    id: `tx-${id}`,
    type,
    amount: amount.toFixed(2),
    date: new Date(date),
    description,
    category,
    reserveId: type === 'reserva' ? 'reserve-emergencia' : null,
    tags,
    spaceId: SPACE_ID,
    userId: user.id,
    createdAt: new Date(date),
    updatedAt: null,
    user,
  }
}

export function buildDashboardFixture(variant: DashboardFixtureVariant): DashboardOverview {
  const isCurrent = variant === 'current' || variant === 'tight'
  const month = variant === 'past' ? '2026-10' : '2026-11'
  const previousMonth = variant === 'past' ? '2026-09' : '2026-10'
  const daysInMonth = variant === 'past' ? 31 : 30
  const previousDays = variant === 'past' ? 30 : 31
  const today = isCurrent ? 24 : null

  if (variant === 'empty') {
    const previousDaily = dailySeries(previousDays, 7, 90)
    const previousSaidas = sum(previousDaily)
    const previous = totals(7800, previousSaidas, 600, 61)
    return {
      month,
      previousMonth,
      period: { daysInMonth, dayOfMonth: 3, isCurrentMonth: true, isFutureMonth: false },
      totals: { current: totals(0, 0, 0, 0), previous, previousToDate: totals(0, sum(previousDaily.slice(0, 3)), 0, 4) },
      monthlySeries: [
        { month: '2026-06', entradas: 7600, saidas: 5980, reservas: 500 },
        { month: '2026-07', entradas: 7600, saidas: 6420, reservas: 500 },
        { month: '2026-08', entradas: 8100, saidas: 6105, reservas: 800 },
        { month: '2026-09', entradas: 7600, saidas: 5720, reservas: 600 },
        { month: '2026-10', entradas: 7800, saidas: previousSaidas, reservas: 600 },
        { month: '2026-11', entradas: 0, saidas: 0, reservas: 0 },
      ],
      dailySpending: { current: Array.from({ length: daysInMonth }, () => 0), previous: previousDaily },
      categories: [],
      members: [],
      budgets: [],
      reserves: [
        {
          id: 'reserve-emergencia',
          name: 'Reserva de emergência',
          icon: 'shield',
          color: '#1570ef',
          targetAmount: '30000.00',
          currentAmount: '18400.00',
          monthContribution: 0,
        },
      ],
      recentTransactions: [],
    }
  }

  const spendBase = variant === 'tight' ? 150 : 95
  const currentDaily = dailySeries(daysInMonth, 11, spendBase, today ?? daysInMonth)
  const previousDaily = dailySeries(previousDays, 7, 90)
  const saidas = sum(currentDaily)
  const previousSaidas = sum(previousDaily)
  const previousToDateSaidas = today ? sum(previousDaily.slice(0, today)) : previousSaidas

  const entradas = variant === 'tight' ? 7600 : 8350
  const reservas = variant === 'tight' ? 300 : 900
  const current = totals(entradas, saidas, reservas, 74)
  const previous = totals(7800, previousSaidas, 600, 61)
  const previousToDate = today ? totals(7800, previousToDateSaidas, 600, 48) : previous

  // Distribui o total de saídas entre categorias com pesos fixos
  const weights: Array<[string, number, number]> = [
    ['Moradia', 0.31, 0.33],
    ['Alimentação', 0.24, 0.19],
    ['Transporte', 0.12, 0.13],
    ['Saúde', 0.09, 0.04],
    ['Lazer', 0.08, 0.11],
    ['Assinaturas', 0.05, 0.05],
    ['Educação', 0.04, 0.06],
    ['Presentes', 0.03, 0.02],
    ['Energia elétrica', 0.04, 0.07],
  ]
  const categories = weights.map(([category, weight, previousWeight], index) => ({
    category,
    total: Math.round(saidas * weight * 100) / 100,
    previousTotal: Math.round(previousSaidas * previousWeight * 100) / 100,
    previousToDateTotal: Math.round(previousToDateSaidas * previousWeight * 100) / 100,
    count: 12 - index,
  }))
  const categoryTotal = (name: string) => categories.find(item => item.category === name)?.total ?? 0

  const budgets = [
    budget('Alimentação', variant === 'tight' ? 1100 : 1400, categoryTotal('Alimentação'), month),
    budget('Lazer', variant === 'tight' ? 280 : 400, categoryTotal('Lazer'), month),
    budget('Transporte', 700, categoryTotal('Transporte'), month),
    budget('Moradia', 2200, categoryTotal('Moradia'), month),
    budget('Saúde', 450, categoryTotal('Saúde'), month),
  ]

  const dayIso = (day: number, hour = 15) =>
    `${month}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00.000Z`
  const lastDay = today ?? daysInMonth

  return {
    month,
    previousMonth,
    period: { daysInMonth, dayOfMonth: today, isCurrentMonth: isCurrent, isFutureMonth: false },
    totals: { current, previous, previousToDate },
    monthlySeries: [
      { month: variant === 'past' ? '2026-05' : '2026-06', entradas: 7600, saidas: 5980, reservas: 500 },
      { month: variant === 'past' ? '2026-06' : '2026-07', entradas: 7600, saidas: 6420, reservas: 500 },
      { month: variant === 'past' ? '2026-07' : '2026-08', entradas: 8100, saidas: 6105, reservas: 800 },
      { month: variant === 'past' ? '2026-08' : '2026-09', entradas: 7600, saidas: 5720, reservas: 600 },
      { month: previousMonth, entradas: 7800, saidas: previousSaidas, reservas: 600 },
      { month, entradas, saidas, reservas },
    ],
    dailySpending: { current: currentDaily, previous: previousDaily },
    categories,
    members: [
      { user: users.ana, total: Math.round(saidas * 0.58 * 100) / 100, count: 41 },
      { user: users.bruno, total: Math.round(saidas * 0.42 * 100) / 100, count: 29 },
    ],
    budgets,
    reserves: [
      {
        id: 'reserve-emergencia',
        name: 'Reserva de emergência',
        icon: 'shield',
        color: '#1570ef',
        targetAmount: '30000.00',
        currentAmount: '18400.00',
        monthContribution: 600,
      },
      {
        id: 'reserve-viagem',
        name: 'Viagem de férias',
        icon: 'plane',
        color: '#0ba5ec',
        targetAmount: '8000.00',
        currentAmount: '8000.00',
        monthContribution: 300,
      },
      {
        id: 'reserve-carro',
        name: 'Troca do carro',
        icon: 'car',
        color: '#7a5af8',
        targetAmount: '45000.00',
        currentAmount: '6250.00',
        monthContribution: 0,
      },
    ],
    recentTransactions: [
      transaction(1, 'saida', 214.37, dayIso(lastDay, 22), 'Supermercado da semana', 'Alimentação', users.ana, ['casa']),
      transaction(2, 'saida', 38.9, dayIso(lastDay, 13), 'Corrida até o centro', 'Transporte', users.bruno),
      transaction(3, 'reserva', 300, dayIso(lastDay - 1), 'Aporte viagem', null, users.ana),
      transaction(4, 'saida', 129.9, dayIso(lastDay - 2), 'Farmácia', 'Saúde', users.ana),
      transaction(5, 'entrada', 850, dayIso(lastDay - 3), 'Projeto freelance', 'Freelance', users.bruno),
      transaction(6, 'saida', 59.9, dayIso(lastDay - 4), 'Streaming', 'Assinaturas', users.bruno),
    ],
  }
}
