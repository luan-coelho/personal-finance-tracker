'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { DashboardOverview } from '@/lib/dashboard-types'
import { routes } from '@/lib/routes'

// Prefixo 'transactions' para que toda mutação de transação invalide o painel
export const dashboardKeys = {
  all: ['transactions', 'dashboard'] as const,
  overview: (spaceId: string, month: string) => [...dashboardKeys.all, spaceId, month] as const,
}

// Hook do painel Início: visão geral do mês selecionado
export function useDashboard(spaceId: string | undefined, month: string | undefined) {
  return useQuery({
    queryKey: dashboardKeys.overview(spaceId ?? '', month ?? ''),
    queryFn: async () => {
      const params = new URLSearchParams({ spaceId: spaceId ?? '', month: month ?? '' })

      const response = await fetch(`${routes.api.dashboard}?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar o painel do mês')
      }

      return response.json() as Promise<DashboardOverview>
    },
    enabled: !!spaceId && !!month,
    staleTime: 60 * 1000, // 1 minuto
    placeholderData: keepPreviousData,
  })
}
