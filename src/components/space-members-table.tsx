'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'

import type { MemberRole, SpaceMemberWithUser } from '@/app/db/schemas/space-member-schema'

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
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Button, IconButton } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { Icon } from '@/components/ui/icon'
import { Label } from '@/components/ui/label'
import { PageActions } from '@/components/ui/page-actions'
import { RecordList } from '@/components/ui/record-list'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UserAvatarDisplay } from '@/components/user-avatar-display'

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

const roleLabels: Record<MemberRole, string> = {
  owner: 'Proprietário',
  editor: 'Editor',
  viewer: 'Visualizador',
}

const roleTones: Record<MemberRole, BadgeProps['tone']> = {
  owner: 'primary',
  editor: 'info',
  viewer: 'neutral',
}

const roleHints: Partial<Record<MemberRole, string>> = {
  editor: 'Pode criar, editar e excluir transações.',
  viewer: 'Pode apenas visualizar transações.',
}

function getRoleLabel(role: MemberRole) {
  return roleLabels[role] ?? role
}

function formatMemberCount(count: number) {
  return count === 1 ? '1 membro compartilhado' : `${count} membros compartilhados`
}

/** Metadados do `PageHeader` da página de membros: contagem e o papel de quem está vendo. */
export function SpaceMembersMeta({ spaceId, isOwner }: SpaceMembersTableProps) {
  const { data: members, isLoading } = useSpaceMembers(spaceId)
  const access = isOwner ? 'Você é o proprietário' : 'Somente visualização'

  if (isLoading) {
    return <Skeleton className="h-4 w-56" />
  }

  return (
    <span className="tabular-nums">
      {formatMemberCount(members?.length ?? 0)} · {access}
    </span>
  )
}

export function SpaceMembersTable({ spaceId, isOwner }: SpaceMembersTableProps) {
  const { data: members, isLoading, error, refetch } = useSpaceMembers(spaceId)
  const { data: allUsers } = useUsers()
  const addMemberMutation = useAddSpaceMember(spaceId)
  const updateMemberMutation = useUpdateSpaceMember(spaceId)
  const removeMemberMutation = useRemoveSpaceMember(spaceId)

  const [memberToRemove, setMemberToRemove] = useState<SpaceMemberWithUser | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<MemberRole>('editor')

  if (isLoading) {
    return <SpaceMembersTableSkeleton isOwner={isOwner} />
  }

  if (error) {
    return <QueryErrorCard message="Não foi possível carregar os membros. Tente novamente." onRetry={() => refetch()} />
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
  const userOptions = availableUsers.map(user => ({ value: user.id, label: `${user.name} · ${user.email}` }))

  return (
    <>
      {isOwner && (
        <PageActions
          actions={
            <Button variant="primary" icon="user-plus" onClick={() => setIsAddDialogOpen(true)}>
              Adicionar membro
            </Button>
          }
        />
      )}

      {!members || members.length === 0 ? (
        <EmptyState
          bordered
          icon="users"
          title="Nenhum membro compartilhado"
          description={
            isOwner
              ? 'Adicione pessoas para compartilhar as transações deste espaço.'
              : 'Só o proprietário tem acesso a este espaço por enquanto.'
          }
        />
      ) : (
        <>
          {/* Abaixo de `md` a tabela dá lugar à lista; trocar o papel vira ação da folha. */}
          <RecordList
            className="md:hidden"
            items={members}
            getKey={member => member.id}
            row={member => ({
              avatar: { name: member.user.name, src: member.user.image ?? undefined },
              title: member.user.name,
              meta: member.user.email,
              right: <Badge tone={roleTones[member.role] ?? 'neutral'}>{getRoleLabel(member.role)}</Badge>,
            })}
            actions={member =>
              isOwner
                ? [
                    member.role === 'editor'
                      ? {
                          icon: 'eye',
                          label: 'Tornar visualizador',
                          disabled: updateMemberMutation.isPending,
                          onSelect: () => handleUpdateRole(member.id, 'viewer'),
                        }
                      : {
                          icon: 'pencil',
                          label: 'Tornar editor',
                          disabled: updateMemberMutation.isPending,
                          onSelect: () => handleUpdateRole(member.id, 'editor'),
                        },
                    {
                      icon: 'user-x',
                      label: 'Remover do espaço',
                      tone: 'error',
                      onSelect: () => setMemberToRemove(member),
                    },
                  ]
                : []
            }
          />

          <Table containerClassName="max-md:hidden">
            <TableHeader>
              <TableRow>
                <TableHead>Pessoa</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead numeric>Adicionado em</TableHead>
                {isOwner && (
                  <TableHead className="w-14">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map(member => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatarDisplay user={member.user} showTooltip={false} />
                      <div className="flex min-w-0 flex-col">
                        <span className="font-medium whitespace-nowrap">{member.user.name}</span>
                        <span className="text-muted-foreground truncate text-xs leading-4">{member.user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isOwner ? (
                      <Select
                        value={member.role}
                        onValueChange={value => handleUpdateRole(member.id, value as MemberRole)}
                        disabled={updateMemberMutation.isPending}>
                        <SelectTrigger size="sm" className="w-[160px]" aria-label={`Papel de ${member.user.name}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Visualizador</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge tone={roleTones[member.role] ?? 'neutral'}>{getRoleLabel(member.role)}</Badge>
                    )}
                  </TableCell>
                  <TableCell numeric className="text-muted-foreground">
                    {format(new Date(member.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  {isOwner && (
                    <TableCell className="w-14">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <IconButton
                            icon="more-horizontal"
                            label={`Ações de ${member.user.name}`}
                            className="size-9!"
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem variant="destructive" onClick={() => setMemberToRemove(member)}>
                            <Icon name="user-x" size={18} />
                            Remover do espaço
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {/* Dialog para adicionar membro */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar membro</DialogTitle>
            <DialogDescription>
              Escolha quem vai compartilhar este espaço e o que a pessoa pode fazer.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="space-member-user">Usuário</Label>
              <Combobox
                id="space-member-user"
                options={userOptions}
                value={selectedUserId}
                onChange={setSelectedUserId}
                placeholder="Selecione um usuário"
                searchPlaceholder="Buscar por nome ou e-mail"
                emptyText="Nenhum usuário disponível"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="space-member-role">Papel</Label>
              <Select value={selectedRole} onValueChange={value => setSelectedRole(value as MemberRole)}>
                <SelectTrigger id="space-member-role" aria-describedby="space-member-role-hint">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
              <p id="space-member-role-hint" className="text-muted-foreground text-[13px]/[18px]">
                {roleHints[selectedRole]}
              </p>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleAddMember}
              disabled={!selectedUserId}
              loading={addMemberMutation.isPending}>
              {addMemberMutation.isPending ? 'Adicionando' : 'Adicionar membro'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para remover membro */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent destructive>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove?.user.name} perde o acesso a este espaço e a todas as suas transações. Você pode
              adicioná-lo de novo depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMemberMutation.isPending} />
            <Button variant="destructive" onClick={handleRemoveMember} loading={removeMemberMutation.isPending}>
              {removeMemberMutation.isPending ? 'Removendo' : 'Remover membro'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function SpaceMembersTableSkeleton({ isOwner = false }: { isOwner?: boolean }) {
  return (
    <>
      {isOwner && <PageActions actions={<Skeleton className="h-control-md w-44 rounded-full" />} />}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pessoa</TableHead>
            <TableHead>Papel</TableHead>
            <TableHead numeric>Adicionado em</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 3 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-24 rounded-full" />
              </TableCell>
              <TableCell numeric>
                <Skeleton className="ml-auto h-4 w-20" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
