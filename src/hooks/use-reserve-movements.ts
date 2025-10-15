import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ReserveMovementFormValues } from '@/app/db/schemas/reserve-movement-schema'

import {
  createReserveMovement,
  deleteReserveMovement,
  getReserveMovements,
  reserveMovementQueryKeys,
} from '@/services/reserve-movement-service'
import { reserveQueryKeys } from '@/services/reserve-service'

// Hook para listar movimentações de uma reserva
export function useReserveMovements(reserveId: string) {
  return useQuery({
    queryKey: reserveMovementQueryKeys.list(reserveId),
    queryFn: () => getReserveMovements(reserveId),
    enabled: !!reserveId,
  })
}

// Hook para criar movimentação
export function useCreateReserveMovement(spaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ReserveMovementFormValues) => createReserveMovement(data),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: reserveMovementQueryKeys.list(data.reserveId) })
      queryClient.invalidateQueries({ queryKey: reserveQueryKeys.list(spaceId) })
      queryClient.invalidateQueries({ queryKey: reserveQueryKeys.detail(data.reserveId) })
      toast.success('Movimentação registrada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao registrar movimentação: ${error.message}`)
    },
  })
}

// Hook para excluir movimentação
export function useDeleteReserveMovement(reserveId: string, spaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (movementId: string) => deleteReserveMovement(reserveId, movementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reserveMovementQueryKeys.list(reserveId) })
      queryClient.invalidateQueries({ queryKey: reserveQueryKeys.list(spaceId) })
      queryClient.invalidateQueries({ queryKey: reserveQueryKeys.detail(reserveId) })
      toast.success('Movimentação excluída com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir movimentação: ${error.message}`)
    },
  })
}
