'use client'

import { Activity, Loader2, MoreHorizontal, Pencil, Plus, Search, UserCheck, UserX, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

import { User } from '@/app/db/schemas/user-schema'

import { ActivityLogsViewer } from '@/components/activity-logs-viewer'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UserForm } from '@/components/user-form'

import { useDeleteUser, useToggleUserStatus, useUsers } from '@/hooks/use-users'

export default function UsuariosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>()
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [togglingUser, setTogglingUser] = useState<User | null>(null)
  const [viewingLogsUser, setViewingLogsUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchFilter, setSearchFilter] = useState('')
  const itemsPerPage = 10

  const { data: session } = useSession()
  const { data: users, isLoading, error } = useUsers()
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

  const handleViewLogs = (user: User) => {
    setViewingLogsUser(user)
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-destructive text-center">Erro ao carregar usuários: {error.message}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
        </div>

        <Button onClick={handleNewUser}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center space-x-2">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Buscar por nome..."
                value={searchFilter}
                onChange={e => handleSearchChange(e.target.value)}
                className="pr-10 pl-10"
              />
              {searchFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="hover:bg-muted absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 transform p-0">
                  <X className="h-3 w-3" />
                  <span className="sr-only">Limpar busca</span>
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando usuários...</span>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              {searchFilter ? 'Nenhum usuário encontrado com os critérios de busca.' : 'Nenhum usuário cadastrado.'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Atualizado em</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map(user => {
                    const isCurrentUser = session?.user?.email === user.email
                    return (
                      <TableRow key={user.id} className={isCurrentUser ? 'bg-muted/30' : ''}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {user.name}
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-xs">
                                Você
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.active ? 'default' : 'secondary'}>
                            {user.active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>{user.updatedAt ? formatDate(user.updatedAt) : ''}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {isCurrentUser ? (
                                <DropdownMenuItem onClick={() => handleViewLogs(user)}>
                                  <Activity className="mr-2 h-4 w-4" />
                                  Ver Logs
                                </DropdownMenuItem>
                              ) : (
                                <>
                                  <DropdownMenuItem onClick={() => handleEdit(user)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleViewLogs(user)}>
                                    <Activity className="mr-2 h-4 w-4" />
                                    Ver Logs
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setTogglingUser(user)}>
                                    {user.active ? (
                                      <>
                                        <UserX className="mr-2 h-4 w-4" />
                                        Desativar
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Ativar
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setDeletingUser(user)}
                                    className="text-destructive focus:text-destructive">
                                    <UserX className="mr-2 h-4 w-4" />
                                    Desativar permanentemente
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Criação/Edição */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Faça as alterações necessárias no usuário.'
                : 'Preencha os dados para criar um novo usuário.'}
            </DialogDescription>
          </DialogHeader>

          <UserForm user={editingUser} onSuccess={handleModalClose} onCancel={handleModalClose} />
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Desativação */}
      <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar o usuário &quot;{deletingUser?.name}?&quot; O usuário não conseguirá mais
              fazer login no sistema. Esta ação pode ser revertida posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Confirmação de Alteração de Status */}
      <AlertDialog open={!!togglingUser} onOpenChange={() => setTogglingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{togglingUser?.active ? 'Desativar' : 'Ativar'} usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja {togglingUser?.active ? 'desativar' : 'ativar'} o usuário &quot;
              {togglingUser?.name}?&quot;
              {togglingUser?.active && ' O usuário não conseguirá mais fazer login no sistema.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={toggleStatusMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus} disabled={toggleStatusMutation.isPending}>
              {toggleStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {togglingUser?.active ? 'Desativar' : 'Ativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Logs de Atividades */}
      <Dialog open={!!viewingLogsUser} onOpenChange={() => setViewingLogsUser(null)}>
        <DialogContent className="max-h-[80vh] min-w-[60vw] overflow-y-auto">
          <DialogTitle className="sr-only">Logs de Atividades - {viewingLogsUser?.name}</DialogTitle>
          {viewingLogsUser && <ActivityLogsViewer userId={viewingLogsUser.id} userName={viewingLogsUser.name} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
