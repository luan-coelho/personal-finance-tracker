'use client'

import { useState } from 'react'

import type { User } from '@/app/db/schemas/user-schema'

import { QueryErrorCard } from '@/components/query-error-card'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button, IconButton } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { FilterBarSearch } from '@/components/ui/filter-bar'
import { Icon } from '@/components/ui/icon'
import { PageActions } from '@/components/ui/page-actions'
import { PageHeader } from '@/components/ui/page-header'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UserAvatarDisplay } from '@/components/user-avatar-display'
import { UserForm } from '@/components/user-form'

import { useDeleteUser, useToggleUserStatus, useUsers } from '@/hooks/use-users'

import { useSession } from '@/lib/auth-client'

const PAGE_TITLE = 'Usuários'
const PAGE_DESCRIPTION = 'Pessoas com acesso ao sistema e aos espaços compartilhados'

export default function UsuariosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>()
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [togglingUser, setTogglingUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchFilter, setSearchFilter] = useState('')
  const itemsPerPage = 10

  const { data: session } = useSession()
  const { data: users, isLoading, error, refetch } = useUsers()
  const deleteMutation = useDeleteUser()
  const toggleStatusMutation = useToggleUserStatus()

  // Filtrar usuários por nome ou email
  const filteredUsers =
    users?.filter(user => {
      // Aplicar filtro de pesquisa
      return (
        user.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        user.email.toLowerCase().includes(searchFilter.toLowerCase())
      )
    }) || []

  // Calcular paginação dos usuários filtrados
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  // Gerar páginas para navegação
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (deletingUser) {
      try {
        await deleteMutation.mutateAsync(deletingUser.id)
        setDeletingUser(null)

        // Ajustar página atual se necessário
        const newTotalItems = filteredUsers.length - 1
        const newTotalPages = Math.ceil(newTotalItems / itemsPerPage)
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages)
        }
      } catch (error) {
        console.error('Erro ao desativar usuário:', error)
      }
    }
  }

  const handleToggleStatus = async () => {
    if (togglingUser) {
      try {
        await toggleStatusMutation.mutateAsync({
          id: togglingUser.id,
          active: !togglingUser.active,
        })
        setTogglingUser(null)
      } catch (error) {
        console.error('Erro ao alterar status do usuário:', error)
      }
    }
  }

  const handleNewUser = () => {
    setEditingUser(undefined)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingUser(undefined)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (value: string) => {
    setSearchFilter(value)
    setCurrentPage(1) // Resetar para primeira página ao filtrar
  }

  const clearSearch = () => {
    setSearchFilter('')
    setCurrentPage(1)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  if (error) {
    return (
      <>
        <PageHeader title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
        <QueryErrorCard message={error.message} onRetry={() => refetch()} />
      </>
    )
  }

  const rangeStart = filteredUsers.length === 0 ? 0 : startIndex + 1
  const rangeEnd = Math.min(endIndex, filteredUsers.length)

  return (
    <>
      <PageHeader title={PAGE_TITLE} description={PAGE_DESCRIPTION} />

      <PageActions
        actions={
          <Button variant="primary" icon="plus" onClick={handleNewUser}>
            Novo usuário
          </Button>
        }>
        <FilterBarSearch
          placeholder="Buscar por nome ou e-mail"
          value={searchFilter}
          onValueChange={handleSearchChange}
        />
        {searchFilter && (
          <Button variant="ghost" icon="x" onClick={clearSearch}>
            Limpar busca
          </Button>
        )}
      </PageActions>

      {isLoading ? (
        <UsersTableSkeleton />
      ) : paginatedUsers.length === 0 ? (
        searchFilter ? (
          <EmptyState
            bordered
            icon="search"
            title="Nenhum usuário encontrado"
            description="Nenhum nome ou e-mail corresponde à busca. Revise o termo ou limpe a busca."
            action={
              <Button variant="outline" onClick={clearSearch}>
                Limpar busca
              </Button>
            }
          />
        ) : (
          <EmptyState
            bordered
            icon="users"
            title="Nenhum usuário cadastrado"
            description="Use Novo usuário para dar acesso a outra pessoa."
          />
        )
      ) : (
        <div className="flex flex-col gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead numeric>Criado em</TableHead>
                <TableHead numeric>Atualizado em</TableHead>
                <TableHead className="w-14">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map(user => {
                const isCurrentUser = session?.user?.email === user.email
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatarDisplay user={user} showTooltip={false} />
                        <span className="font-medium whitespace-nowrap">{user.name}</span>
                        {isCurrentUser && <Badge tone="primary">Você</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      {user.active ? (
                        <Badge tone="success" dot>
                          Ativo
                        </Badge>
                      ) : (
                        <Badge tone="neutral" dot>
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell numeric className="text-muted-foreground whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell numeric className="text-muted-foreground whitespace-nowrap">
                      {user.updatedAt ? formatDate(user.updatedAt) : '—'}
                    </TableCell>
                    <TableCell className="w-14">
                      {!isCurrentUser && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <IconButton icon="more-horizontal" label={`Ações de ${user.name}`} className="size-9!" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                              <Icon name="pencil" size={18} />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTogglingUser(user)}>
                              <Icon name={user.active ? 'user-x' : 'user-check'} size={18} />
                              {user.active ? 'Desativar' : 'Ativar'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => setDeletingUser(user)}>
                              <Icon name="lock" size={18} />
                              Revogar acesso
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <p className="text-muted-foreground text-[13px] tabular-nums">
                {rangeStart}–{rangeEnd} de {filteredUsers.length}
              </p>
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      aria-disabled={currentPage === 1 || undefined}
                      className="cursor-pointer"
                    />
                  </PaginationItem>

                  {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => handlePageChange(page as number)}
                          isActive={currentPage === page}
                          className="cursor-pointer">
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      aria-disabled={currentPage === totalPages || undefined}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}

      {/* Modal de Criação/Edição */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar usuário' : 'Novo usuário'}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Altere os dados de acesso desta pessoa.'
                : 'Informe os dados da pessoa que vai usar o sistema.'}
            </DialogDescription>
          </DialogHeader>

          <UserForm user={editingUser} onSuccess={handleModalClose} onCancel={handleModalClose} />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de revogação de acesso (DELETE desativa o usuário) */}
      <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <AlertDialogContent destructive>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar acesso</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingUser?.name} não conseguirá mais entrar no sistema. A conta fica inativa e pode ser reativada
              depois pelo menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending} />
            <Button variant="destructive" onClick={handleDelete} loading={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Revogando' : 'Revogar acesso'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Confirmação de Alteração de Status */}
      <AlertDialog open={!!togglingUser} onOpenChange={() => setTogglingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{togglingUser?.active ? 'Desativar usuário' : 'Ativar usuário'}</AlertDialogTitle>
            <AlertDialogDescription>
              {togglingUser?.active
                ? `${togglingUser?.name} não conseguirá mais entrar no sistema até ser ativado de novo.`
                : `${togglingUser?.name} volta a conseguir entrar no sistema.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={toggleStatusMutation.isPending} />
            <Button variant="primary" onClick={handleToggleStatus} loading={toggleStatusMutation.isPending}>
              {toggleStatusMutation.isPending
                ? togglingUser?.active
                  ? 'Desativando'
                  : 'Ativando'
                : togglingUser?.active
                  ? 'Desativar usuário'
                  : 'Ativar usuário'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function UsersTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Status</TableHead>
          <TableHead numeric>Criado em</TableHead>
          <TableHead numeric>Atualizado em</TableHead>
          <TableHead className="w-14">
            <span className="sr-only">Ações</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-44" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-16 rounded-full" />
            </TableCell>
            <TableCell numeric>
              <Skeleton className="ml-auto h-4 w-28" />
            </TableCell>
            <TableCell numeric>
              <Skeleton className="ml-auto h-4 w-28" />
            </TableCell>
            <TableCell className="w-14" />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
