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
