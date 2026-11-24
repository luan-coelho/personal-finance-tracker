/** Chave do cache do React Query no `localStorage`. */
export const QUERY_CACHE_KEY = 'financas:query-cache'
/** Id do usuário dono do cache guardado. */
export const QUERY_CACHE_OWNER_KEY = 'financas:query-cache-owner'
/** Mude ao alterar o formato das respostas da API: invalida o cache guardado nos aparelhos. */
export const QUERY_CACHE_BUSTER = 'v1'
/** Por quanto tempo o cache guardado ainda é mostrado ao abrir o app. */
export const QUERY_CACHE_MAX_AGE = 24 * 60 * 60 * 1000

export const NETWORK_ERROR_MESSAGE = 'Sem conexão. Verifique a internet e tente novamente.'

/**
 * O `fetch` rejeita com `TypeError` quando a requisição nem chega ao servidor (offline, queda de
 * rede). Troca a mensagem técnica ("Failed to fetch") pela do app, que os toasts de erro exibem.
 */
export function describeNetworkError(error: unknown) {
  if (error instanceof TypeError) {
    error.message = NETWORK_ERROR_MESSAGE
  }
}

/** Apaga o cache guardado no aparelho (ao sair da conta). */
export function clearPersistedQueryCache() {
  try {
    window.localStorage.removeItem(QUERY_CACHE_KEY)
    window.localStorage.removeItem(QUERY_CACHE_OWNER_KEY)
  } catch {
    // Sem acesso ao armazenamento não há cache para apagar.
  }
}
