import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { UserFormValues } from '@/app/db/schemas/user-schema'

import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  toggleUserStatus,
  updateUser,
  userQueryKeys,
} from '@/services/user-service'

// Hook para listar todos os usuários
export function useUsers() {
  return useQuery({
    queryKey: userQueryKeys.lists(),
    queryFn: getAllUsers,
  })
}

// Hook para buscar um usuário por ID
export function useUser(id: string) {
  return useQuery({
    queryKey: userQueryKeys.detail(id),
    queryFn: () => getUserById(id),
    enabled: !!id,
  })
}

// Hook para criar um novo usuário
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidar a lista de usuários para refetch
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.lists(),
      })

      toast.success('Usuário criado com sucesso!')
    },
    onError: error => {
      toast.error(`Erro ao criar usuário: ${error.message}`)
    },
  })
}

// Hook para atualizar um usuário
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserFormValues> }) => updateUser(id, data),
    onSuccess: updatedUser => {
      // Invalidar a lista de usuários
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.lists(),
      })

      // Atualizar o cache do usuário específico
      queryClient.setQueryData(userQueryKeys.detail(updatedUser.id), updatedUser)

      toast.success('Usuário atualizado com sucesso!')
    },
    onError: error => {
      toast.error(`Erro ao atualizar usuário: ${error.message}`)
    },
  })
}

// Hook para excluir (desativar) um usuário
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      // Invalidar a lista de usuários
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.lists(),
      })

      toast.success('Usuário desativado com sucesso!')
    },
    onError: error => {
      toast.error(`Erro ao desativar usuário: ${error.message}`)
    },
  })
}

// Hook para alternar status ativo/inativo do usuário
export function useToggleUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => toggleUserStatus(id, active),
    onSuccess: updatedUser => {
      // Invalidar a lista de usuários
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.lists(),
      })

      // Atualizar o cache do usuário específico
      queryClient.setQueryData(userQueryKeys.detail(updatedUser.id), updatedUser)

      toast.success(updatedUser.active ? 'Usuário ativado com sucesso!' : 'Usuário desativado com sucesso!')
    },
    onError: error => {
      toast.error(`Erro ao alterar status do usuário: ${error.message}`)
    },
  })
}
