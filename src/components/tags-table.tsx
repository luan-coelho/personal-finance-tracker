'use client'

import { useState } from 'react'

import type { Tag } from '@/app/db/schemas/tag-schema'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useDeleteTag } from '@/hooks/use-tags'

interface TagsTableProps {
  tags: Tag[]
  isLoading?: boolean
  /** Há busca ativa (muda o texto do estado vazio). */
  isFiltered?: boolean
  onEdit: (tag: Tag) => void
}

const SKELETON_ROWS = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5']

function TagsTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Nome</TableHead>
        <TableHead numeric>Criada em</TableHead>
        <TableHead className="w-14">
          <span className="sr-only">Ações</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}

export function TagsTableSkeleton() {
  return (
    <Table aria-busy="true">
      <TagsTableHeader />
      <TableBody>
        {SKELETON_ROWS.map(row => (
          <TableRow key={row}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-sm" />
                <Skeleton className="h-4 w-32" />
              </div>
            </TableCell>
            <TableCell numeric>
              <Skeleton className="ml-auto h-4 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="rounded-control size-9" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function TagsTable({ tags, isLoading, isFiltered = false, onEdit }: TagsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const deleteMutation = useDeleteTag()
  const tagToDelete = tags.find(tag => tag.id === deleteId)

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await deleteMutation.mutateAsync(deleteId)
      setDeleteId(null)
    } catch (error) {
      console.error('Erro ao deletar tag:', error)
    }
  }

  if (isLoading) {
    return <TagsTableSkeleton />
  }

  if (tags.length === 0) {
    return isFiltered ? (
      <EmptyState
        bordered
        icon="search"
        title="Nenhuma tag encontrada"
        description="Ajuste a busca para ver outras tags."
      />
    ) : (
      <EmptyState
        bordered
        icon="tag"
        title="Nenhuma tag cadastrada"
        description="Crie tags para marcar e agrupar transações."
      />
    )
  }

  return (
    <>
      <Table>
        <TagsTableHeader />
        <TableBody>
          {tags.map(tag => (
            <TableRow key={tag.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="bg-muted text-muted-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-sm">
                    <Icon name="tag" size={16} />
                  </span>
                  <span className="font-medium whitespace-nowrap">{tag.name}</span>
                </div>
              </TableCell>
              <TableCell numeric className="text-muted-foreground">
                {new Date(tag.createdAt).toLocaleDateString('pt-BR')}
              </TableCell>
              <TableCell className="w-14">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <IconButton icon="more-horizontal" label={`Ações de ${tag.name}`} className="size-9!" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(tag)}>
                      <Icon name="pencil" size={18} />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(tag.id)}>
                      <Icon name="trash" size={18} />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent destructive>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tag?</AlertDialogTitle>
            <AlertDialogDescription>
              {tagToDelete ? `"${tagToDelete.name}" será excluída` : 'A tag será excluída'} permanentemente. Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending} />
            <Button variant="destructive" loading={deleteMutation.isPending} onClick={handleDelete}>
              {deleteMutation.isPending ? 'Excluindo' : 'Excluir tag'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
