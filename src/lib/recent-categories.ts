/** Quantas categorias recentes guardar por espaço e tipo. */
export const RECENT_CATEGORIES_LIMIT = 12

export function recentCategoriesKey(spaceId: string, type: string) {
  return `recent-categories:${spaceId}:${type}`
}

/** Põe `category` na frente da lista, sem repetir, respeitando o limite. */
export function pushRecentCategory(recent: readonly string[], category: string, limit = RECENT_CATEGORIES_LIMIT) {
  return [category, ...recent.filter(item => item !== category)].slice(0, limit)
}

/**
 * Ordena as categorias com as usadas recentemente primeiro (da mais recente para a mais antiga);
 * as demais mantêm a ordem original. Recentes que já não existem são ignoradas.
 */
export function sortCategoriesByRecency(categories: readonly string[], recent: readonly string[]) {
  const available = new Set(categories)
  const first = recent.filter(category => available.has(category))
  const seen = new Set(first)
  return [...first, ...categories.filter(category => !seen.has(category))]
}

export function readRecentCategories(spaceId: string, type: string): string[] {
  if (typeof window === 'undefined' || !spaceId) return []
  try {
    const stored = JSON.parse(window.localStorage.getItem(recentCategoriesKey(spaceId, type)) ?? '[]')
    return Array.isArray(stored) ? stored.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function rememberRecentCategory(spaceId: string, type: string, category: string) {
  if (typeof window === 'undefined' || !spaceId || !category) return
  try {
    const next = pushRecentCategory(readRecentCategories(spaceId, type), category)
    window.localStorage.setItem(recentCategoriesKey(spaceId, type), JSON.stringify(next))
  } catch {
    // Sem armazenamento (modo privado, cota): a ordem só deixa de ser lembrada.
  }
}
