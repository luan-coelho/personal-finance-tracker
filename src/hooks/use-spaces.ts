import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { SpaceFormValues } from '@/app/db/schemas/space-schema'

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

  return useMutation({
    mutationFn: createSpace,
    onSuccess: () => {
      // Invalidar a lista de espaços para refetch
      queryClient.invalidateQueries({
        queryKey: spaceQueryKeys.lists(),
      })

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

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SpaceFormValues> }) => updateSpace(id, data),
    onSuccess: updatedSpace => {
      // Invalidar a lista de espaços
      queryClient.invalidateQueries({
        queryKey: spaceQueryKeys.lists(),
      })

      // Atualizar o cache do espaço específico
      queryClient.setQueryData(spaceQueryKeys.detail(updatedSpace.id), updatedSpace)

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

  return useMutation({
    mutationFn: deleteSpace,
    onSuccess: () => {
      // Invalidar a lista de espaços
      queryClient.invalidateQueries({
        queryKey: spaceQueryKeys.lists(),
      })

      toast.success('Espaço excluído com sucesso!')
    },
    onError: error => {
      toast.error(`Erro ao excluir espaço: ${error.message}`)
    },
  })
}
