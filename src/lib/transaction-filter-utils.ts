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

/** Filtros de transação que vivem na URL: sobrevivem a recarregar, voltar e reabrir o app. */
export interface TransactionUrlFilters {
  type?: 'entrada' | 'saida' | 'reserva'
  category?: string
  userId?: string
  search?: string
  tags?: string[]
  /** Início do dia (00:00:00.000, horário local). */
  dateFrom?: Date
  /** Fim do dia (23:59:59.999, horário local). */
  dateTo?: Date
  amountFrom?: number
  amountTo?: number
}

const URL_FILTER_TYPES = new Set(['entrada', 'saida', 'reserva'])
const URL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

/** `yyyy-MM-dd` no horário local (o `toISOString` mudaria o dia perto da meia-noite). */
function formatUrlDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function parseUrlDate(value: string | null, endOfDay: boolean): Date | undefined {
  const match = value?.trim().match(URL_DATE_PATTERN)
  if (!match) return undefined
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = endOfDay ? new Date(year, month - 1, day, 23, 59, 59, 999) : new Date(year, month - 1, day)
  // Rejeita datas que o construtor "arredonda" (31/02 viraria 03/03).
  return date.getMonth() === month - 1 && date.getDate() === day ? date : undefined
}

/**
 * Lê os filtros da URL (`type`, `category`, `userId`, `search`, `tag` repetido, `from`, `to`,
 * `min`, `max`); ignora valores vazios, tipos desconhecidos e datas ou valores inválidos.
 */
export function parseTransactionUrlFilters(params: Pick<URLSearchParams, 'get' | 'getAll'>): TransactionUrlFilters {
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

  const search = params.get('search')?.trim()
  if (search) {
    filters.search = search
  }

  const tags = params
    .getAll('tag')
    .map(tag => tag.trim())
    .filter(Boolean)
  if (tags.length > 0) {
    filters.tags = tags
  }

  const dateFrom = parseUrlDate(params.get('from'), false)
  if (dateFrom) {
    filters.dateFrom = dateFrom
  }

  const dateTo = parseUrlDate(params.get('to'), true)
  if (dateTo) {
    filters.dateTo = dateTo
  }

  const amountFrom = parseAmountFilterParam(params.get('min'))
  if (amountFrom !== undefined) {
    filters.amountFrom = amountFrom
  }

  const amountTo = parseAmountFilterParam(params.get('max'))
  if (amountTo !== undefined) {
    filters.amountTo = amountTo
  }

  return filters
}

/** Monta a query string com os filtros ativos, na mesma forma lida por `parseTransactionUrlFilters`. */
export function buildTransactionUrlQuery(filters: TransactionUrlFilters): string {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.category) params.set('category', filters.category)
  if (filters.userId) params.set('userId', filters.userId)
  if (filters.search?.trim()) params.set('search', filters.search.trim())
  for (const tag of filters.tags ?? []) params.append('tag', tag)
  if (filters.dateFrom) params.set('from', formatUrlDate(filters.dateFrom))
  if (filters.dateTo) params.set('to', formatUrlDate(filters.dateTo))
  if (filters.amountFrom !== undefined) params.set('min', String(filters.amountFrom))
  if (filters.amountTo !== undefined) params.set('max', String(filters.amountTo))
  const query = params.toString()
  return query ? `?${query}` : ''
}
