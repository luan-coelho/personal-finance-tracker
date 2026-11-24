export function parseAmountFilterParam(value: string | null): number | undefined {
  if (value === null) {
    return undefined
  }

  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return undefined
  }

  const normalizedValue = trimmedValue.includes(',') ? trimmedValue.replace(/\./g, '').replace(',', '.') : trimmedValue

  const amount = Number(normalizedValue)

  if (!Number.isFinite(amount) || amount < 0) {
    return undefined
  }

  return amount
}

export function isActiveTransactionFilterValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0
  }

  return value !== undefined && value !== ''
}

export function getActiveTransactionFiltersCount(filters: object): number {
  return Object.values(filters).filter(isActiveTransactionFilterValue).length
}

/** Filtros de transação que podem chegar pela URL (links do Início para a lista já filtrada). */
export interface TransactionUrlFilters {
  type?: 'entrada' | 'saida' | 'reserva'
  category?: string
  userId?: string
}

const URL_FILTER_TYPES = new Set(['entrada', 'saida', 'reserva'])

/** Lê `?type=`, `?category=` e `?userId=`; ignora valores vazios ou tipos desconhecidos. */
export function parseTransactionUrlFilters(params: Pick<URLSearchParams, 'get'>): TransactionUrlFilters {
  const filters: TransactionUrlFilters = {}

  const type = params.get('type')?.trim()
  if (type && URL_FILTER_TYPES.has(type)) {
    filters.type = type as TransactionUrlFilters['type']
  }

  const category = params.get('category')?.trim()
  if (category) {
    filters.category = category
  }

  const userId = params.get('userId')?.trim()
  if (userId) {
    filters.userId = userId
  }

  return filters
}

/** Monta a query string com os filtros que vivem na URL (só `type`, `category` e `userId`). */
export function buildTransactionUrlQuery(filters: TransactionUrlFilters): string {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.category) params.set('category', filters.category)
  if (filters.userId) params.set('userId', filters.userId)
  const query = params.toString()
  return query ? `?${query}` : ''
}
