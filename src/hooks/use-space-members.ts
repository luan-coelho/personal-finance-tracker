import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { MemberRole, SpaceMemberFormValues } from '@/app/db/schemas/space-member-schema'

import {
  addSpaceMember,
  getSpaceMembers,
  removeSpaceMember,
  spaceMemberQueryKeys,
  updateSpaceMember,
} from '@/services/space-member-service'

// Hook para listar membros de um espaço
export function useSpaceMembers(spaceId: string) {
  return useQuery({
    queryKey: spaceMemberQueryKeys.list(spaceId),
    queryFn: () => getSpaceMembers(spaceId),
    enabled: !!spaceId,
  })
}

// Hook para adicionar membro
export function useAddSpaceMember(spaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<SpaceMemberFormValues, 'spaceId'>) => addSpaceMember(spaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spaceMemberQueryKeys.list(spaceId) })
      toast.success('Membro adicionado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar membro: ${error.message}`)
    },
  })
}

// Hook para atualizar papel do membro
export function useUpdateSpaceMember(spaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: MemberRole }) =>
      updateSpaceMember(spaceId, memberId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spaceMemberQueryKeys.list(spaceId) })
      toast.success('Papel do membro atualizado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar membro: ${error.message}`)
    },
  })
}

// Hook para remover membro
export function useRemoveSpaceMember(spaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (memberId: string) => removeSpaceMember(spaceId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spaceMemberQueryKeys.list(spaceId) })
      toast.success('Membro removido com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover membro: ${error.message}`)
    },
  })
}
