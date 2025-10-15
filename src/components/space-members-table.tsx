'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MoreHorizontal, Trash2, UserPlus } from 'lucide-react'
import { useState } from 'react'

import { MemberRole, SpaceMemberWithUser } from '@/app/db/schemas/space-member-schema'

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import {
  useAddSpaceMember,
  useRemoveSpaceMember,
  useSpaceMembers,
  useUpdateSpaceMember,
} from '@/hooks/use-space-members'
import { useUsers } from '@/hooks/use-users'

interface SpaceMembersTableProps {
  spaceId: string
  isOwner: boolean
}

export function SpaceMembersTable({ spaceId, isOwner }: SpaceMembersTableProps) {
  const { data: members, isLoading, error } = useSpaceMembers(spaceId)
  const { data: allUsers } = useUsers()
  const addMemberMutation = useAddSpaceMember(spaceId)
  const updateMemberMutation = useUpdateSpaceMember(spaceId)
  const removeMemberMutation = useRemoveSpaceMember(spaceId)

  const [memberToRemove, setMemberToRemove] = useState<SpaceMemberWithUser | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<MemberRole>('editor')

  if (isLoading) {
    return <div className="py-4 text-center">Carregando membros...</div>
  }

  if (error) {
    return <div className="text-destructive py-4 text-center">Erro ao carregar membros</div>
  }

  const getRoleBadgeVariant = (role: MemberRole) => {
    switch (role) {
      case 'owner':
        return 'default'
      case 'editor':
        return 'secondary'
      case 'viewer':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getRoleLabel = (role: MemberRole) => {
    switch (role) {
      case 'owner':
        return 'Proprietário'
      case 'editor':
        return 'Editor'
      case 'viewer':
        return 'Visualizador'
      default:
        return role
    }
  }

  async function handleRemoveMember() {
    if (memberToRemove) {
      await removeMemberMutation.mutateAsync(memberToRemove.id)
      setMemberToRemove(null)
    }
  }

  async function handleAddMember() {
    if (selectedUserId) {
      await addMemberMutation.mutateAsync({
        userId: selectedUserId,
        role: selectedRole,
      })
      setIsAddDialogOpen(false)
      setSelectedUserId('')
      setSelectedRole('editor')
    }
  }

  async function handleUpdateRole(memberId: string, newRole: MemberRole) {
    await updateMemberMutation.mutateAsync({ memberId, role: newRole })
  }

  // Filtrar usuários que ainda não são membros
  const availableUsers = allUsers?.filter(user => !members?.some(member => member.userId === user.id)) || []

  return (
    <>
      <div className="space-y-4">
        {isOwner && (
          <div className="flex justify-end">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Membro
            </Button>
          </div>
        )}

        {!members || members.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">Nenhum membro compartilhado</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Adicionado em</TableHead>
                {isOwner && <TableHead className="w-[70px]">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map(member => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{member.user.email}</TableCell>
                  <TableCell>
                    {isOwner ? (
                      <Select
                        value={member.role}
                        onValueChange={value => handleUpdateRole(member.id, value as MemberRole)}
                        disabled={updateMemberMutation.isPending}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Visualizador</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={getRoleBadgeVariant(member.role)}>{getRoleLabel(member.role)}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(member.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  {isOwner && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem className="text-destructive" onClick={() => setMemberToRemove(member)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialog para adicionar membro */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Membro</DialogTitle>
            <DialogDescription>Convide um usuário para compartilhar este espaço</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user">Usuário</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user">
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Papel</Label>
              <Select value={selectedRole} onValueChange={value => setSelectedRole(value as MemberRole)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">
                    <div>
                      <div className="font-medium">Editor</div>
                      <div className="text-muted-foreground text-sm">Pode criar, editar e excluir transações</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div>
                      <div className="font-medium">Visualizador</div>
                      <div className="text-muted-foreground text-sm">Pode apenas visualizar transações</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddMember} disabled={!selectedUserId || addMemberMutation.isPending}>
              {addMemberMutation.isPending ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para remover membro */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja remover {memberToRemove?.user.name} deste espaço? Eles perderão o acesso a todas
              as transações.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={removeMemberMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {removeMemberMutation.isPending ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
