import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

import { SpaceFormValues } from '@/app/db/schemas/space-schema'

import { activityLogger } from '@/lib/activity-logger'

import {
  createSpace,
  deleteSpace,
  getAllSpaces,
  getSpaceById,
  spaceQueryKeys,
  updateSpace,
} from '@/services/space-service'

// Hook para listar todos os espaços do usuário
export function useSpaces() {
  return useQuery({
    queryKey: spaceQueryKeys.lists(),
    queryFn: getAllSpaces,
  })
}

// Hook para buscar um espaço por ID
export function useSpace(id: string) {
  return useQuery({
    queryKey: spaceQueryKeys.detail(id),
    queryFn: () => getSpaceById(id),
    enabled: !!id,
  })
}

// Hook para criar um novo espaço
export function useCreateSpace() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation({
    mutationFn: createSpace,
    onSuccess: async newSpace => {
      // Invalidar a lista de espaços para refetch
      queryClient.invalidateQueries({
        queryKey: spaceQueryKeys.lists(),
      })

      // Registrar log de atividade
      if (session?.user?.id) {
        await activityLogger.logSpaceCreated(session.user.id, newSpace.name)
      }

      toast.success('Espaço criado com sucesso!')
    },
    onError: error => {
      toast.error(`Erro ao criar espaço: ${error.message}`)
    },
  })
}

// Hook para atualizar um espaço
export function useUpdateSpace() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SpaceFormValues> }) => updateSpace(id, data),
    onSuccess: async updatedSpace => {
      // Invalidar a lista de espaços
      queryClient.invalidateQueries({
        queryKey: spaceQueryKeys.lists(),
      })

      // Atualizar o cache do espaço específico
      queryClient.setQueryData(spaceQueryKeys.detail(updatedSpace.id), updatedSpace)

      // Registrar log de atividade
      if (session?.user?.id) {
        await activityLogger.logSpaceUpdated(session.user.id, updatedSpace.name)
      }

      toast.success('Espaço atualizado com sucesso!')
    },
    onError: error => {
      toast.error(`Erro ao atualizar espaço: ${error.message}`)
    },
  })
}

// Hook para excluir (desativar) um espaço
export function useDeleteSpace() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation({
    mutationFn: async (spaceId: string) => {
      // Buscar dados do espaço antes de desativar para registrar log
      const space = await getSpaceById(spaceId)
      await deleteSpace(spaceId)
      return space
    },
    onSuccess: async deletedSpace => {
      // Invalidar a lista de espaços
      queryClient.invalidateQueries({
        queryKey: spaceQueryKeys.lists(),
      })

      // Registrar log de atividade
      if (session?.user?.id) {
        await activityLogger.logSpaceDeleted(session.user.id, deletedSpace.name)
      }

      toast.success('Espaço excluído com sucesso!')
    },
    onError: error => {
      toast.error(`Erro ao excluir espaço: ${error.message}`)
    },
  })
}
