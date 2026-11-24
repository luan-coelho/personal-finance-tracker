'use client'

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { MutationCache, QueryClient, useQueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider, removeOldestQuery } from '@tanstack/react-query-persist-client'
import { useEffect, useState } from 'react'

import { useSession } from '@/lib/auth-client'
import {
  describeNetworkError,
  QUERY_CACHE_BUSTER,
  QUERY_CACHE_KEY,
  QUERY_CACHE_MAX_AGE,
  QUERY_CACHE_OWNER_KEY,
} from '@/lib/query-cache'

function getStorage() {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    // Armazenamento bloqueado (modo privado restrito): o app funciona sem cache persistente.
    return undefined
  }
}

/**
 * O cache guardado no aparelho pertence a quem estava logado. Se outra pessoa entrar no mesmo
 * aparelho, tudo é descartado antes de ela ver qualquer dado.
 */
function QueryCacheOwnerGuard() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userId = session?.user?.id

  useEffect(() => {
    const storage = getStorage()
    if (!userId || !storage) return

    const owner = storage.getItem(QUERY_CACHE_OWNER_KEY)
    if (owner && owner !== userId) {
      queryClient.clear()
      storage.removeItem(QUERY_CACHE_KEY)
    }
    storage.setItem(QUERY_CACHE_OWNER_KEY, userId)
  }, [userId, queryClient])

  return null
}

/**
 * React Query com o cache guardado no aparelho: ao abrir o app os últimos dados aparecem na hora
 * (inclusive sem conexão) e são atualizados em seguida. Criar e editar exigem conexão e falham
 * na hora, com mensagem clara, em vez de ficarem pendentes.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({ onError: describeNetworkError }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
            retry: 1,
            // Precisa cobrir o `maxAge` do cache persistido, senão o dado é descartado antes de ser restaurado.
            gcTime: QUERY_CACHE_MAX_AGE,
          },
          mutations: {
            networkMode: 'always',
          },
        },
      }),
  )

  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage: getStorage(),
      key: QUERY_CACHE_KEY,
      // Sem espaço no armazenamento: descarta as consultas mais antigas e tenta de novo.
      retry: removeOldestQuery,
    }),
  )

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: QUERY_CACHE_MAX_AGE, buster: QUERY_CACHE_BUSTER }}>
      <QueryCacheOwnerGuard />
      {children}
    </PersistQueryClientProvider>
  )
}
