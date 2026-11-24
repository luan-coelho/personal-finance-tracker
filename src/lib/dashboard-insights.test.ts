import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { BudgetWithSpending } from '@/app/db/schemas'

import { formatCurrency } from './currency'
import {
  budgetOverrunDay,
  buildAlerts,
  buildPaceSummary,
  cumulative,
  cumulativeUntil,
  dailyAllowance,
  dailyAverage,
  expectedPaceRatio,
  percentChange,
  projectMonthTotal,
} from './dashboard-insights'
import type {
  DashboardCategory,
  DashboardOverview,
  DashboardPeriod,
  DashboardReserve,
  MonthTotals,
} from './dashboard-types'

function totals(entradas: number, saidas: number, reservas = 0): MonthTotals {
  return { entradas, saidas, reservas, saldo: entradas - saidas - reservas, count: 0 }
}

function budget(category: string, amount: number, spent: number): BudgetWithSpending {
  const percentage = amount > 0 ? (spent / amount) * 100 : 0
  return {
    id: `budget-${category}`,
    spaceId: 'space-1',
    category,
    amount: amount.toFixed(2),
    month: '2026-11',
    createdById: 'user-1',
    createdAt: new Date('2026-11-01T03:00:00.000Z'),
    updatedAt: new Date('2026-11-01T03:00:00.000Z'),
    spent,
    remaining: amount - spent,
    exceededAmount: Math.max(0, spent - amount),
    percentage,
  }
}

function category(name: string, total: number, previousTotal = 0, count = 1): DashboardCategory {
  return { category: name, total, previousTotal, previousToDateTotal: previousTotal, count }
}

function reserve(name: string, currentAmount: number, targetAmount: number | null): DashboardReserve {
  return {
    id: `reserve-${name}`,
    name,
    icon: 'piggy-bank',
    color: '#10b981',
    targetAmount: targetAmount === null ? null : targetAmount.toFixed(2),
    currentAmount: currentAmount.toFixed(2),
    monthContribution: 0,
  }
}

const currentPeriod = (dayOfMonth: number, daysInMonth = 30): DashboardPeriod => ({
  daysInMonth,
  dayOfMonth,
  isCurrentMonth: true,
  isFutureMonth: false,
})

const pastPeriod: DashboardPeriod = { daysInMonth: 31, dayOfMonth: null, isCurrentMonth: false, isFutureMonth: false }

function overview(partial: Partial<DashboardOverview> = {}): DashboardOverview {
  return {
    month: '2026-11',
    previousMonth: '2026-10',
    period: currentPeriod(15),
    totals: { current: totals(0, 0), previous: totals(0, 0), previousToDate: totals(0, 0) },
    monthlySeries: [],
    dailySpending: { current: [], previous: [] },
    categories: [],
    members: [],
    budgets: [],
    reserves: [],
    recentTransactions: [],
    ...partial,
  }
}

describe('cumulative series', () => {
  it('accumulates values', () => {
    assert.deepEqual(cumulative([10, 0, 5, 20]), [10, 10, 15, 35])
    assert.deepEqual(cumulative([]), [])
  })

  it('cuts the current month after today and keeps past months whole', () => {
    assert.deepEqual(cumulativeUntil([10, 20, 30, 40], 2), [10, 30, null, null])
    assert.deepEqual(cumulativeUntil([10, 20, 30, 40], null), [10, 30, 60, 100])
    assert.deepEqual(cumulativeUntil([0, 0, 0], 3), [0, 0, 0])
  })
})

describe('percentChange', () => {
  it('returns the change in percentage points', () => {
    assert.equal(percentChange(110, 100), 10)
    assert.equal(percentChange(92, 100), -8)
    assert.equal(percentChange(0, 100), -100)
  })

  it('is null when there is nothing to compare with', () => {
    assert.equal(percentChange(100, 0), null)
    assert.equal(percentChange(0, 0), null)
    assert.equal(percentChange(100, -5), null)
  })
})

describe('month projection and pace', () => {
  it('does not project on day 2 of the current month', () => {
    const period = currentPeriod(2)
    assert.equal(projectMonthTotal(400, period), null)
    assert.equal(budgetOverrunDay({ amount: '500', spent: 400 }, period), null)
    assert.equal(expectedPaceRatio(period), 2 / 30)
  })

  it('projects linearly in the middle of the month', () => {
    const period = currentPeriod(15)
    assert.equal(projectMonthTotal(1500, period), 3000)
    assert.equal(expectedPaceRatio(period), 0.5)
  })

  it('projects the spent amount itself on the last day', () => {
    const period = currentPeriod(30)
    assert.equal(projectMonthTotal(2310, period), 2310)
    assert.equal(expectedPaceRatio(period), 1)
  })

  it('does not project nor pace past months', () => {
    assert.equal(projectMonthTotal(2000, pastPeriod), null)
    assert.equal(expectedPaceRatio(pastPeriod), null)
  })
})

describe('budgetOverrunDay', () => {
  it('predicts the first day the budget is exceeded at the current pace', () => {
    // R$ 60 por dia: dia 16 acumula 960, dia 17 acumula 1.020
    assert.equal(budgetOverrunDay({ amount: '1000.00', spent: 600 }, currentPeriod(10)), 17)
    assert.equal(budgetOverrunDay({ amount: 1000, spent: 600 }, currentPeriod(10)), 17)
  })

  it('predicts tomorrow when the budget is exactly used up', () => {
    assert.equal(budgetOverrunDay({ amount: 500, spent: 500 }, currentPeriod(10)), 11)
  })

  it('is null when the pace fits the month, it already overran, or nothing was spent', () => {
    assert.equal(budgetOverrunDay({ amount: 1000, spent: 300 }, currentPeriod(10)), null)
    assert.equal(budgetOverrunDay({ amount: 1000, spent: 1200 }, currentPeriod(10)), null)
    assert.equal(budgetOverrunDay({ amount: 1000, spent: 0 }, currentPeriod(10)), null)
    assert.equal(budgetOverrunDay({ amount: 0, spent: 100 }, currentPeriod(10)), null)
    assert.equal(budgetOverrunDay({ amount: 1000, spent: 900 }, pastPeriod), null)
  })
})

describe('dailyAllowance', () => {
  it('uses the remaining budget when the space has budgets', () => {
    const result = dailyAllowance(
      overview({
        period: currentPeriod(21),
        budgets: [budget('Mercado', 1000, 600), budget('Lazer', 500, 300)],
        totals: { current: totals(5000, 4000), previous: totals(0, 0), previousToDate: totals(0, 0) },
      }),
    )
    // (1.500 - 900) / 10 dias (21 a 30, incluindo hoje)
    assert.deepEqual(result, { amount: 60, basis: 'budget', daysLeft: 10 })
  })

  it('uses income minus reserves and expenses without budgets', () => {
    const result = dailyAllowance(
      overview({
        period: currentPeriod(21),
        totals: { current: totals(5000, 3500, 1000), previous: totals(0, 0), previousToDate: totals(0, 0) },
      }),
    )
    assert.deepEqual(result, { amount: 50, basis: 'income', daysLeft: 10 })
  })

  it('never goes negative', () => {
    const overBudget = dailyAllowance(overview({ period: currentPeriod(10), budgets: [budget('Mercado', 500, 800)] }))
    assert.equal(overBudget?.amount, 0)
    assert.equal(overBudget?.basis, 'budget')

    const overIncome = dailyAllowance(
      overview({
        period: currentPeriod(10),
        totals: { current: totals(1000, 1500), previous: totals(0, 0), previousToDate: totals(0, 0) },
      }),
    )
    assert.equal(overIncome?.amount, 0)
    assert.equal(overIncome?.basis, 'income')
  })

  it('counts today on the last day and is null outside the current month', () => {
    const lastDay = dailyAllowance(
      overview({
        period: currentPeriod(30),
        totals: { current: totals(1000, 400), previous: totals(0, 0), previousToDate: totals(0, 0) },
      }),
    )
    assert.deepEqual(lastDay, { amount: 600, basis: 'income', daysLeft: 1 })
    assert.equal(dailyAllowance(overview({ period: pastPeriod })), null)
  })
})

describe('dailyAverage', () => {
  it('divides by days elapsed in the current month and by month length otherwise', () => {
    const spending = { current: totals(0, 3100), previous: totals(0, 0), previousToDate: totals(0, 0) }
    assert.equal(dailyAverage(overview({ period: currentPeriod(10), totals: spending })), 310)
    assert.equal(dailyAverage(overview({ period: pastPeriod, totals: spending })), 100)
  })

  it('is zero for an empty month', () => {
    assert.equal(dailyAverage(overview({ period: pastPeriod })), 0)
  })
})

describe('buildAlerts', () => {
  it('returns nothing for an empty month', () => {
    assert.deepEqual(buildAlerts(overview()), [])
  })

  it('orders by tone, then severity, then impact, and caps at 6', () => {
    const alerts = buildAlerts(
      overview({
        period: currentPeriod(10),
        budgets: [
          budget('Lazer', 200, 260), // estourado em 60
          budget('Mercado', 1000, 1240), // estourado em 240
          budget('Farmácia', 100, 90), // perto do limite, estoura no dia 12
          budget('Transporte', 1000, 600), // estoura no dia 17
          budget('Casa', 1000, 100), // dentro
        ],
        categories: [
          category('Mercado', 1240, 900),
          category('Restaurantes', 800, 500), // fora do orçamento, acima do mês anterior
          category('Farmácia', 90, 10),
          category('Transporte', 600, 100),
          category('Casa', 100, 100),
        ],
        totals: { current: totals(2000, 2830, 500), previous: totals(0, 0), previousToDate: totals(0, 0) },
        reserves: [reserve('Férias', 3000, 3000)],
      }),
    )

    assert.deepEqual(
      alerts.map(alert => alert.id),
      [
        'budget-exceeded:budget-Mercado',
        'budget-exceeded:budget-Lazer',
        'budget-forecast:budget-Farmácia',
        'budget-forecast:budget-Transporte',
        'category-above-previous:Restaurantes',
        'negative-balance',
      ],
    )
    assert.equal(alerts[0].tone, 'error')
    assert.equal(alerts[0].title, 'Mercado estourou o orçamento')
    assert.equal(alerts[0].description, `${formatCurrency(1240)} de ${formatCurrency(1000)} · 124%`)
    assert.equal(alerts[0].budgetId, 'budget-Mercado')
    assert.equal(alerts[0].category, 'Mercado')
    assert.equal(alerts[2].title, 'Farmácia deve estourar no dia 12')
    assert.equal(alerts[4].title, 'Restaurantes já passou o total de outubro')
    assert.equal(alerts[5].tone, 'warning')
  })

  it('flags near-limit budgets when the pace does not predict an overrun', () => {
    // Dia 2: sem previsão, então 90% fica como "perto do limite"
    const alerts = buildAlerts(overview({ period: currentPeriod(2), budgets: [budget('Mercado', 1000, 900)] }))
    assert.equal(alerts.length, 1)
    assert.equal(alerts[0].kind, 'budget-near')
    assert.equal(alerts[0].tone, 'warning')
    assert.equal(alerts[0].progress, 90)
  })

  it('keeps budget alerts in past months but never forecasts there', () => {
    const alerts = buildAlerts(
      overview({ period: pastPeriod, budgets: [budget('Mercado', 1000, 850), budget('Lazer', 1000, 500)] }),
    )
    assert.deepEqual(
      alerts.map(alert => alert.kind),
      ['budget-near'],
    )
  })

  it('compares categories with the whole previous month using both thresholds', () => {
    const alerts = buildAlerts(
      overview({
        period: pastPeriod,
        categories: [
          category('Mercado', 1300, 1000), // +30%, +300
          category('Uber', 150, 60), // +150%, mas só +90
          category('Aluguel', 3500, 3000), // +16%
          category('Novo', 500, 0), // sem mês anterior
        ],
      }),
    )
    assert.deepEqual(
      alerts.map(alert => alert.id),
      ['category-above-previous:Mercado'],
    )
    assert.equal(alerts[0].description, `${formatCurrency(1300)} contra ${formatCurrency(1000)} · +30%`)
  })

  it('points out the largest unbudgeted category only when budgets exist', () => {
    const categories = [category('Mercado', 900), category('Restaurantes', 400, 0, 3), category('Uber', 300)]

    const withBudgets = buildAlerts(overview({ categories, budgets: [budget('Mercado', 2000, 900)] }))
    assert.deepEqual(
      withBudgets.map(alert => alert.id),
      ['unbudgeted-spending:Restaurantes'],
    )
    assert.equal(withBudgets[0].tone, 'info')

    assert.deepEqual(buildAlerts(overview({ categories })), [])
  })

  it('warns when expenses and reserves pass income', () => {
    const alerts = buildAlerts(
      overview({ totals: { current: totals(3000, 2800, 400), previous: totals(0, 0), previousToDate: totals(0, 0) } }),
    )
    assert.equal(alerts.length, 1)
    assert.equal(alerts[0].kind, 'negative-balance')
    assert.equal(alerts[0].progress, (3200 / 3000) * 100)

    const noIncome = buildAlerts(
      overview({ totals: { current: totals(0, 100), previous: totals(0, 0), previousToDate: totals(0, 0) } }),
    )
    assert.equal(noIncome[0]?.kind, 'negative-balance')

    const onlyReserves = buildAlerts(
      overview({ totals: { current: totals(0, 0, 100), previous: totals(0, 0), previousToDate: totals(0, 0) } }),
    )
    assert.deepEqual(onlyReserves, [])
  })

  it('celebrates at most two reached reserve goals, biggest first, after everything else', () => {
    const alerts = buildAlerts(
      overview({
        categories: [category('Mercado', 900), category('Uber', 300)],
        budgets: [budget('Mercado', 1000, 1100)],
        reserves: [
          reserve('Viagem', 2000, 2000),
          reserve('Emergência', 12000, 10000),
          reserve('Carro', 6000, 5000),
          reserve('Sem meta', 500, null),
          reserve('Faltando', 100, 1000),
        ],
      }),
    )
    assert.deepEqual(
      alerts.map(alert => alert.id),
      [
        'budget-exceeded:budget-Mercado',
        'unbudgeted-spending:Uber',
        'reserve-goal-reached:reserve-Emergência',
        'reserve-goal-reached:reserve-Carro',
      ],
    )
    assert.equal(alerts[2].tone, 'success')
    assert.equal(alerts[2].reserveId, 'reserve-Emergência')
  })
})

describe('buildPaceSummary', () => {
  it('compares the current month with the same point of the previous month and projects', () => {
    const summary = buildPaceSummary(
      overview({
        period: currentPeriod(12),
        totals: { current: totals(0, 2300), previous: totals(0, 6000), previousToDate: totals(0, 2500) },
      }),
    )
    assert.equal(
      summary.headline,
      `Você gastou ${formatCurrency(2300)} até o dia 12, 8% a menos que no mesmo ponto de outubro.`,
    )
    assert.equal(summary.projection, `No ritmo atual, o mês fecha em ${formatCurrency(5750)}.`)
  })

  it('has no projection on day 2 nor comparison without previous spending', () => {
    const summary = buildPaceSummary(
      overview({
        period: currentPeriod(2),
        totals: { current: totals(0, 150), previous: totals(0, 0), previousToDate: totals(0, 0) },
      }),
    )
    assert.equal(summary.headline, `Você gastou ${formatCurrency(150)} até o dia 2.`)
    assert.equal(summary.projection, null)
  })

  it('compares whole months in the past', () => {
    const summary = buildPaceSummary(
      overview({
        month: '2026-10',
        previousMonth: '2026-09',
        period: pastPeriod,
        totals: { current: totals(0, 4480), previous: totals(0, 4000), previousToDate: totals(0, 4000) },
      }),
    )
    assert.equal(summary.headline, `Você gastou ${formatCurrency(4480)} em outubro, 12% a mais que em setembro.`)
    assert.equal(summary.projection, null)
  })

  it('handles months without expenses', () => {
    assert.deepEqual(buildPaceSummary(overview({ period: currentPeriod(5) })), {
      headline: 'Nenhuma saída até o dia 5.',
      projection: null,
    })
    assert.deepEqual(buildPaceSummary(overview({ month: '2026-10', previousMonth: '2026-09', period: pastPeriod })), {
      headline: 'Nenhuma saída em outubro.',
      projection: null,
    })
  })
})
