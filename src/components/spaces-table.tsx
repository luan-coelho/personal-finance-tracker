'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import type { Space } from '@/app/db/schemas/space-schema'

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { Icon } from '@/components/ui/icon'
import { RecordList, RecordListSkeleton } from '@/components/ui/record-list'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useDeleteSpace, useSpaces } from '@/hooks/use-spaces'

import { useSession } from '@/lib/auth-client'
import { routes } from '@/lib/routes'

export function SpacesTable() {
  const { data: spaces, isLoading, error, refetch } = useSpaces()
  const { data: session } = useSession()
  const deleteSpaceMutation = useDeleteSpace()
  const [spaceToDelete, setSpaceToDelete] = useState<Space | null>(null)
  const router = useRouter()

  if (isLoading) {
    return <SpacesTableSkeleton />
  }

  if (error) {
    return <QueryErrorCard message="Não foi possível carregar os espaços. Tente novamente." onRetry={() => refetch()} />
  }

  if (!spaces || spaces.length === 0) {
    return (
      <EmptyState
        bordered
        icon="building-2"
        title="Nenhum espaço criado"
        description="Crie um espaço para organizar transações, orçamentos e reservas."
        action={
          <Button variant="secondary" icon="plus" asChild>
            <Link href={routes.frontend.admin.spaces.create}>Criar espaço</Link>
          </Button>
        }
      />
    )
  }

  async function handleDelete() {
    if (spaceToDelete) {
      await deleteSpaceMutation.mutateAsync(spaceToDelete.id)
      setSpaceToDelete(null)
    }
  }

  return (
    <>
      {/* Abaixo de `md` a tabela dá lugar à lista; a troca é só por CSS. */}
      <RecordList
        className="md:hidden"
        items={spaces}
        getKey={space => space.id}
        row={space => {
          const isOwner = !!session?.user?.id && space.ownerId === session.user.id
          return {
            icon: 'building-2',
            title: space.name,
            meta: [isOwner ? 'Proprietário' : 'Compartilhado', space.description].filter(Boolean).join(' · '),
          }
        }}
        actions={space => [
          {
            icon: 'users',
            label: 'Membros',
            onSelect: () => router.push(routes.frontend.admin.spaces.members(space.id)),
          },
          { icon: 'pencil', label: 'Editar', onSelect: () => router.push(routes.frontend.admin.spaces.edit(space.id)) },
          { icon: 'trash', label: 'Excluir', tone: 'error', onSelect: () => setSpaceToDelete(space) },
        ]}
      />

      <Table containerClassName="max-md:hidden">
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Papel</TableHead>
            <TableHead numeric>Criado em</TableHead>
            <TableHead className="w-14">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {spaces.map(space => {
            const isOwner = !!session?.user?.id && space.ownerId === session.user.id

            return (
              <TableRow key={space.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="bg-muted text-muted-foreground rounded-control inline-flex size-8 shrink-0 items-center justify-center">
                      <Icon name="building-2" size={16} />
                    </span>
                    <span className="font-medium whitespace-nowrap">{space.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[360px] truncate">
                  {space.description || 'Sem descrição'}
                </TableCell>
                <TableCell>
                  {isOwner ? <Badge tone="primary">Proprietário</Badge> : <Badge>Compartilhado</Badge>}
                </TableCell>
                <TableCell numeric className="text-muted-foreground">
                  {format(new Date(space.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell className="w-14">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <IconButton icon="more-horizontal" label={`Ações de ${space.name}`} className="size-9!" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={routes.frontend.admin.spaces.members(space.id)}>
                          <Icon name="users" size={18} />
                          Membros
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={routes.frontend.admin.spaces.edit(space.id)}>
                          <Icon name="pencil" size={18} />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => setSpaceToDelete(space)}>
                        <Icon name="trash" size={18} />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <AlertDialog open={!!spaceToDelete} onOpenChange={() => setSpaceToDelete(null)}>
        <AlertDialogContent destructive>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir espaço</AlertDialogTitle>
            <AlertDialogDescription>
              O espaço &quot;{spaceToDelete?.name}&quot; deixa de aparecer para você e para os membros. Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSpaceMutation.isPending} />
            <Button variant="destructive" onClick={handleDelete} loading={deleteSpaceMutation.isPending}>
              {deleteSpaceMutation.isPending ? 'Excluindo' : 'Excluir espaço'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function SpacesTableSkeleton() {
  return (
    <>
      <RecordListSkeleton rows={4} className="md:hidden" />
      <Table containerClassName="max-md:hidden">
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Papel</TableHead>
            <TableHead numeric>Criado em</TableHead>
            <TableHead className="w-14">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 4 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="rounded-control size-8" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-24 rounded-full" />
              </TableCell>
              <TableCell numeric>
                <Skeleton className="ml-auto h-4 w-20" />
              </TableCell>
              <TableCell className="w-14" />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
