/**
 * Cálculos do painel Início: ritmo do mês, projeção, alertas e frases.
 * Funções puras, sem acesso a banco, testadas em dashboard-insights.test.ts.
 */

import { getBudgetStatus } from '@/lib/budget-status'
import { formatCurrency } from '@/lib/currency'
import type { DashboardOverview, DashboardPeriod } from '@/lib/dashboard-types'
import { getMonthLabel } from '@/lib/date-utils'

/** Projeção e previsão de estouro só a partir deste dia, para não extrapolar um ou dois dias de dados. */
const MIN_DAY_FOR_PROJECTION = 3
const MAX_ALERTS = 6
const MAX_RESERVE_GOAL_ALERTS = 2
/** Categoria acima do mês anterior: diferença mínima relativa e absoluta. */
const CATEGORY_ABOVE_PREVIOUS_MIN_RATIO = 0.2
const CATEGORY_ABOVE_PREVIOUS_MIN_AMOUNT = 100
const UNBUDGETED_MIN_AMOUNT = 100

/** Soma acumulada: [1, 2, 3] vira [1, 3, 6]. */
export function cumulative(values: number[]): number[] {
  let sum = 0
  return values.map(value => {
    sum += value
    return sum
  })
}

/** Série acumulada do mês atual cortada em hoje: dias depois de `dayOfMonth` viram null. */
export function cumulativeUntil(values: number[], dayOfMonth: number | null): Array<number | null> {
  const series = cumulative(values)
  if (dayOfMonth === null) return series
  return series.map((value, index) => (index < dayOfMonth ? value : null))
}

/** Variação percentual em pontos (ex.: -8 para 8% a menos). `null` se `previous <= 0`. */
export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null
  return ((current - previous) / previous) * 100
}

function canProject(period: DashboardPeriod): period is DashboardPeriod & { dayOfMonth: number } {
  return period.isCurrentMonth && period.dayOfMonth !== null && period.dayOfMonth >= MIN_DAY_FOR_PROJECTION
}

/** Projeção linear do total do mês. null fora do mês atual ou antes do dia 3. */
export function projectMonthTotal(spentSoFar: number, period: DashboardPeriod): number | null {
  if (!canProject(period)) return null
  return (spentSoFar / period.dayOfMonth) * period.daysInMonth
}

/**
 * Quanto ainda cabe por dia até o fim do mês (inclui hoje). null fora do mês atual. Nunca negativo.
 * Com orçamentos: (soma dos orçamentos - gasto nas categorias orçadas) / dias restantes.
 * Sem orçamentos: (entradas - reservas - saídas) / dias restantes.
 */
export function dailyAllowance(
  overview: DashboardOverview,
): { amount: number; basis: 'budget' | 'income'; daysLeft: number } | null {
  const { period, budgets, totals } = overview
  if (!period.isCurrentMonth || period.dayOfMonth === null) return null

  const daysLeft = Math.max(1, period.daysInMonth - period.dayOfMonth + 1)

  if (budgets.length > 0) {
    const budgeted = budgets.reduce((sum, budget) => sum + Number(budget.amount), 0)
    const spent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
    return { amount: Math.max(0, (budgeted - spent) / daysLeft), basis: 'budget', daysLeft }
  }

  const { entradas, reservas, saidas } = totals.current
  return { amount: Math.max(0, (entradas - reservas - saidas) / daysLeft), basis: 'income', daysLeft }
}

/** Média diária de saídas (mês passado: total/daysInMonth; atual: total/dayOfMonth). */
export function dailyAverage(overview: DashboardOverview): number {
  const { period, totals } = overview
  const days = period.dayOfMonth ?? period.daysInMonth
  return days > 0 ? totals.current.saidas / days : 0
}

/** Dia (1-based) em que o orçamento estoura no ritmo atual; null se não estoura no mês, já estourou, ou fora do mês atual/antes do dia 3. */
export function budgetOverrunDay(
  budget: { amount: string | number; spent: number },
  period: DashboardPeriod,
): number | null {
  if (!canProject(period)) return null

  const amount = Number(budget.amount)
  const { spent } = budget
  if (!(amount > 0) || spent <= 0 || spent > amount) return null

  // Primeiro dia em que o acumulado (spent / dayOfMonth * dia) passa do orçamento
  const day = Math.floor((amount * period.dayOfMonth) / spent) + 1
  return day <= period.daysInMonth ? day : null
}

/** Fração esperada de gasto hoje (dayOfMonth/daysInMonth), null fora do mês atual. */
export function expectedPaceRatio(period: DashboardPeriod): number | null {
  if (!period.isCurrentMonth || period.dayOfMonth === null) return null
  return period.dayOfMonth / period.daysInMonth
}

export type DashboardAlertKind =
  | 'budget-exceeded'
  | 'budget-near'
  | 'budget-forecast'
  | 'category-above-previous'
  | 'unbudgeted-spending'
  | 'negative-balance'
  | 'reserve-goal-reached'

export type DashboardAlertTone = 'error' | 'warning' | 'success' | 'info'

export interface DashboardAlert {
  id: string
  kind: DashboardAlertKind
  tone: DashboardAlertTone
  /** Ex.: "Mercado estourou o orçamento" */
  title: string
  /** Ex.: "R$ 1.240,00 de R$ 1.000,00 · 124%" */
  description: string
  category?: string
  budgetId?: string
  reserveId?: string
  /** 0–100+ quando faz sentido */
  progress?: number
}

const TONE_ORDER: Record<DashboardAlertTone, number> = { error: 0, warning: 1, info: 2, success: 3 }

/** Ordem entre tipos de mesmo tom (gravidade do plano). */
const KIND_ORDER: Record<DashboardAlertKind, number> = {
  'budget-exceeded': 0,
  'budget-near': 1,
  'budget-forecast': 2,
  'category-above-previous': 3,
  'negative-balance': 4,
  'unbudgeted-spending': 5,
  'reserve-goal-reached': 6,
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

/**
 * Alertas ordenados: error, warning, info, success.
 * Dentro do tom, pela ordem de gravidade do tipo e, no mesmo tipo, maior impacto primeiro. Máx 6.
 *
 * - Orçamento: um alerta por orçamento. Estourado (erro); senão, previsão de estouro no ritmo atual (aviso);
 *   senão, perto do limite, 80% a 100% (aviso).
 * - Categoria acima do mês anterior inteiro (≥ 20% e ≥ R$ 100), exceto categorias com alerta de orçamento.
 * - Maior gasto fora de orçamento (≥ R$ 100), só quando o espaço usa orçamentos.
 * - Saídas + reservas acima das entradas.
 * - Reservas que atingiram a meta (até 2).
 */
export function buildAlerts(overview: DashboardOverview): DashboardAlert[] {
  const { budgets, categories, totals, reserves, period, previousMonth } = overview
  const candidates: Array<{ alert: DashboardAlert; impact: number }> = []
  const categoriesWithBudgetAlert = new Set<string>()

  for (const budget of budgets) {
    const amount = Number(budget.amount)
    const status = getBudgetStatus(budget.percentage)
    const base = {
      category: budget.category,
      budgetId: budget.id,
      progress: budget.percentage,
      description: `${formatCurrency(budget.spent)} de ${formatCurrency(amount)} · ${formatPercent(budget.percentage)}`,
    }

    if (status === 'exceeded') {
      categoriesWithBudgetAlert.add(budget.category)
      candidates.push({
        alert: {
          ...base,
          id: `budget-exceeded:${budget.id}`,
          kind: 'budget-exceeded',
          tone: 'error',
          title: `${budget.category} estourou o orçamento`,
        },
        impact: budget.spent - amount,
      })
      continue
    }

    const overrunDay = budgetOverrunDay(budget, period)
    if (overrunDay !== null) {
      categoriesWithBudgetAlert.add(budget.category)
      candidates.push({
        alert: {
          ...base,
          id: `budget-forecast:${budget.id}`,
          kind: 'budget-forecast',
          tone: 'warning',
          title: `${budget.category} deve estourar no dia ${overrunDay}`,
        },
        // Estouro mais cedo primeiro
        impact: -overrunDay,
      })
      continue
    }

    if (status === 'near') {
      categoriesWithBudgetAlert.add(budget.category)
      candidates.push({
        alert: {
          ...base,
          id: `budget-near:${budget.id}`,
          kind: 'budget-near',
          tone: 'warning',
          title: `${budget.category} está perto do limite`,
        },
        impact: budget.percentage,
      })
    }
  }

  const previousLabel = getMonthLabel(previousMonth, 'long')
  for (const category of categories) {
    if (categoriesWithBudgetAlert.has(category.category)) continue
    const difference = category.total - category.previousTotal
    if (
      category.previousTotal > 0 &&
      difference >= CATEGORY_ABOVE_PREVIOUS_MIN_AMOUNT &&
      difference / category.previousTotal >= CATEGORY_ABOVE_PREVIOUS_MIN_RATIO
    ) {
      candidates.push({
        alert: {
          id: `category-above-previous:${category.category}`,
          kind: 'category-above-previous',
          tone: 'warning',
          title: `${category.category} já passou o total de ${previousLabel}`,
          description: `${formatCurrency(category.total)} contra ${formatCurrency(category.previousTotal)} · +${formatPercent((difference / category.previousTotal) * 100)}`,
          category: category.category,
          progress: (category.total / category.previousTotal) * 100,
        },
        impact: difference,
      })
    }
  }

  if (budgets.length > 0) {
    const budgetedCategories = new Set(budgets.map(budget => budget.category))
    const unbudgeted = [...categories]
      .sort((a, b) => b.total - a.total)
      .find(category => !budgetedCategories.has(category.category) && category.total >= UNBUDGETED_MIN_AMOUNT)
    if (unbudgeted) {
      candidates.push({
        alert: {
          id: `unbudgeted-spending:${unbudgeted.category}`,
          kind: 'unbudgeted-spending',
          tone: 'info',
          title: `${unbudgeted.category} está fora do orçamento`,
          description: `${formatCurrency(unbudgeted.total)} no mês em ${unbudgeted.count === 1 ? '1 saída' : `${unbudgeted.count} saídas`} sem orçamento`,
          category: unbudgeted.category,
        },
        impact: unbudgeted.total,
      })
    }
  }

  const { entradas, saidas, reservas } = totals.current
  const outflow = saidas + reservas
  if (outflow > entradas && (entradas > 0 || saidas > 0)) {
    candidates.push({
      alert: {
        id: 'negative-balance',
        kind: 'negative-balance',
        tone: 'warning',
        title: 'Saídas e reservas passaram das entradas',
        description: `${formatCurrency(outflow)} de ${formatCurrency(entradas)} em entradas · ${formatCurrency(outflow - entradas)} a mais`,
        progress: entradas > 0 ? (outflow / entradas) * 100 : undefined,
      },
      impact: outflow - entradas,
    })
  }

  reserves
    .map(reserve => ({ reserve, target: Number(reserve.targetAmount ?? 0), current: Number(reserve.currentAmount) }))
    .filter(({ target, current }) => target > 0 && current >= target)
    .sort((a, b) => b.target - a.target)
    .slice(0, MAX_RESERVE_GOAL_ALERTS)
    .forEach(({ reserve, target, current }) => {
      candidates.push({
        alert: {
          id: `reserve-goal-reached:${reserve.id}`,
          kind: 'reserve-goal-reached',
          tone: 'success',
          title: `${reserve.name} atingiu a meta`,
          description: `${formatCurrency(current)} de ${formatCurrency(target)} · ${formatPercent((current / target) * 100)}`,
          reserveId: reserve.id,
          progress: (current / target) * 100,
        },
        impact: target,
      })
    })

  return candidates
    .sort(
      (a, b) =>
        TONE_ORDER[a.alert.tone] - TONE_ORDER[b.alert.tone] ||
        KIND_ORDER[a.alert.kind] - KIND_ORDER[b.alert.kind] ||
        b.impact - a.impact,
    )
    .slice(0, MAX_ALERTS)
    .map(({ alert }) => alert)
}

/**
 * Frase do card de ritmo.
 * Mês atual: "Você gastou R$ 2.310,00 até o dia 12, 8% a menos que no mesmo ponto de outubro."
 * e, se houver projeção, "No ritmo atual, o mês fecha em R$ 5.770,00."
 * Outros meses: "Você gastou R$ 4.100,00 em outubro, 12% a mais que em setembro."
 */
export function buildPaceSummary(overview: DashboardOverview): { headline: string; projection: string | null } {
  const { period, totals, month, previousMonth } = overview
  const monthLabel = getMonthLabel(month, 'long')
  const previousLabel = getMonthLabel(previousMonth, 'long')
  const spent = totals.current.saidas

  if (period.isCurrentMonth && period.dayOfMonth !== null) {
    const day = period.dayOfMonth
    if (spent <= 0) {
      return { headline: `Nenhuma saída até o dia ${day}.`, projection: null }
    }

    const change = percentChange(spent, totals.previousToDate.saidas)
    const comparison = change === null ? '' : `, ${describeChange(change)} no mesmo ponto de ${previousLabel}`
    const projected = projectMonthTotal(spent, period)

    return {
      headline: `Você gastou ${formatCurrency(spent)} até o dia ${day}${comparison}.`,
      projection: projected === null ? null : `No ritmo atual, o mês fecha em ${formatCurrency(projected)}.`,
    }
  }

  if (spent <= 0) {
    return { headline: `Nenhuma saída em ${monthLabel}.`, projection: null }
  }

  const change = percentChange(spent, totals.previous.saidas)
  const comparison = change === null ? '' : `, ${describeChange(change)} em ${previousLabel}`
  return { headline: `Você gastou ${formatCurrency(spent)} em ${monthLabel}${comparison}.`, projection: null }
}

/** "8% a menos que", "12% a mais que" ou "o mesmo que". */
function describeChange(change: number): string {
  const rounded = Math.round(Math.abs(change))
  if (rounded === 0) return 'o mesmo que'
  return `${rounded}% a ${change > 0 ? 'mais' : 'menos'} que`
}
