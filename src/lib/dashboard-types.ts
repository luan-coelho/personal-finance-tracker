import type { BudgetWithSpending, Reserve, TransactionWithUser } from '@/app/db/schemas'

/** Totais de um mês, em reais (number). `saldo = entradas - saidas - reservas`. */
export interface MonthTotals {
  entradas: number
  saidas: number
  reservas: number
  saldo: number
  count: number
}

export interface DashboardPeriod {
  /** Dias do mês selecionado (28–31). */
  daysInMonth: number
  /** Dia de hoje (1-based, horário de Brasília) quando o mês selecionado é o atual; `null` em outros meses. */
  dayOfMonth: number | null
  isCurrentMonth: boolean
  /** Mês selecionado está no futuro (sem dados esperados). */
  isFutureMonth: boolean
}

export interface DashboardMonthPoint {
  /** 'YYYY-MM' */
  month: string
  entradas: number
  saidas: number
  reservas: number
}

export interface DashboardCategory {
  category: string
  /** Saídas da categoria no mês selecionado. */
  total: number
  /** Saídas da categoria no mês anterior inteiro. */
  previousTotal: number
  /** Saídas da categoria no mês anterior até o mesmo dia (igual a `previousTotal` fora do mês atual). */
  previousToDateTotal: number
  count: number
}

export interface DashboardMember {
  user: { id: string; name: string | null; email: string; image: string | null }
  /** Saídas lançadas pela pessoa no mês. */
  total: number
  count: number
}

export type DashboardReserve = Pick<Reserve, 'id' | 'name' | 'icon' | 'color' | 'targetAmount' | 'currentAmount'> & {
  /** Soma das transações `reserva` para esta reserva no mês selecionado. */
  monthContribution: number
}

/**
 * Payload de `GET /api/dashboard?spaceId&month=YYYY-MM`.
 * Dias e meses sem movimento vêm zerados (séries completas).
 * Datas de `recentTransactions` chegam como string ISO via JSON.
 */
export interface DashboardOverview {
  /** 'YYYY-MM' selecionado */
  month: string
  /** 'YYYY-MM' anterior */
  previousMonth: string
  period: DashboardPeriod
  totals: {
    current: MonthTotals
    previous: MonthTotals
    /** Mês anterior até o mesmo dia de hoje; igual a `previous` fora do mês atual. */
    previousToDate: MonthTotals
  }
  /** 6 meses terminando no selecionado, do mais antigo ao mais novo. */
  monthlySeries: DashboardMonthPoint[]
  /** Saídas por dia; índice 0 = dia 1. `current` tem `daysInMonth` itens, `previous` os dias do mês anterior. */
  dailySpending: { current: number[]; previous: number[] }
  /** Categorias de saída com movimento no mês atual ou anterior, maior `total` primeiro. Sem categoria vira "Sem categoria". */
  categories: DashboardCategory[]
  /** Pessoas com saídas no mês, maior total primeiro. */
  members: DashboardMember[]
  budgets: BudgetWithSpending[]
  /** Reservas ativas. */
  reserves: DashboardReserve[]
  /** Até 6 transações mais recentes do mês selecionado. */
  recentTransactions: TransactionWithUser[]
}
