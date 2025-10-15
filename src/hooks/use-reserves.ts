import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ReserveFormValues } from '@/app/db/schemas/reserve-schema'

import {
  createReserve,
  deleteReserve,
  getReserveById,
  getReservesBySpace,
  reserveQueryKeys,
  toggleReserveStatus,
  updateReserve,
} from '@/services/reserve-service'

// Hook para listar reservas de um espaço
export function useReserves(spaceId: string) {
  return useQuery({
    queryKey: reserveQueryKeys.list(spaceId),
    queryFn: () => getReservesBySpace(spaceId),
    enabled: !!spaceId,
  })
}

// Hook para buscar reserva por ID
export function useReserve(id: string) {
  return useQuery({
    queryKey: reserveQueryKeys.detail(id),
    queryFn: () => getReserveById(id),
    enabled: !!id,
  })
}

// Hook para criar reserva
export function useCreateReserve() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ReserveFormValues) => createReserve(data),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: reserveQueryKeys.list(data.spaceId) })
      toast.success('Reserva criada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar reserva: ${error.message}`)
    },
  })
}

// Hook para atualizar reserva
export function useUpdateReserve(id: string, spaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<ReserveFormValues>) => updateReserve(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reserveQueryKeys.list(spaceId) })
      queryClient.invalidateQueries({ queryKey: reserveQueryKeys.detail(id) })
      toast.success('Reserva atualizada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar reserva: ${error.message}`)
    },
  })
}

// Hook para excluir reserva
export function useDeleteReserve(spaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteReserve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reserveQueryKeys.list(spaceId) })
      toast.success('Reserva excluída com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir reserva: ${error.message}`)
    },
  })
}

// Hook para alternar status da reserva
export function useToggleReserveStatus(spaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => toggleReserveStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reserveQueryKeys.list(spaceId) })
      toast.success('Status da reserva alterado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao alterar status: ${error.message}`)
    },
  })
}
