'use client'

import { useState } from 'react'

import type { Category } from '@/app/db/schemas/category-schema'

import { CategoryIconTile } from '@/components/category-icon'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useDeleteCategory } from '@/hooks/use-categories'

interface CategoriesTableProps {
  categories: Category[]
  isLoading?: boolean
  /** Há busca ou filtro de tipo ativo (muda o texto do estado vazio). */
  isFiltered?: boolean
  onEdit: (category: Category) => void
}

const SKELETON_ROWS = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5']

function CategoriesTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Nome</TableHead>
        <TableHead>Tipo</TableHead>
        <TableHead numeric>Criada em</TableHead>
        <TableHead className="w-14">
          <span className="sr-only">Ações</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}

export function CategoriesTableSkeleton() {
  return (
    <Table aria-busy="true">
      <CategoriesTableHeader />
      <TableBody>
        {SKELETON_ROWS.map(row => (
          <TableRow key={row}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-sm" />
                <Skeleton className="h-4 w-36" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-20 rounded-full" />
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

export function CategoriesTable({ categories, isLoading, isFiltered = false, onEdit }: CategoriesTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const deleteMutation = useDeleteCategory()
  const categoryToDelete = categories.find(category => category.id === deleteId)

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await deleteMutation.mutateAsync(deleteId)
      setDeleteId(null)
    } catch (error) {
      console.error('Erro ao deletar categoria:', error)
    }
  }

  if (isLoading) {
    return <CategoriesTableSkeleton />
  }

  if (categories.length === 0) {
    return isFiltered ? (
      <EmptyState
        bordered
        icon="search"
        title="Nenhuma categoria encontrada"
        description="Ajuste a busca ou o filtro de tipo para ver outras categorias."
      />
    ) : (
      <EmptyState
        bordered
        icon="folder-open"
        title="Nenhuma categoria cadastrada"
        description="Crie categorias para organizar as entradas e saídas do espaço."
      />
    )
  }

  return (
    <>
      <Table>
        <CategoriesTableHeader />
        <TableBody>
          {categories.map(category => (
            <TableRow key={category.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <CategoryIconTile name={category.name} />
                  <span className="font-medium whitespace-nowrap">{category.name}</span>
                </div>
              </TableCell>
              <TableCell>
                {category.type === 'entrada' ? (
                  <Badge tone="success" icon="arrow-up-circle">
                    Entrada
                  </Badge>
                ) : (
                  <Badge tone="error" icon="arrow-down-circle">
                    Saída
                  </Badge>
                )}
              </TableCell>
              <TableCell numeric className="text-muted-foreground">
                {new Date(category.createdAt).toLocaleDateString('pt-BR')}
              </TableCell>
              <TableCell className="w-14">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <IconButton icon="more-horizontal" label={`Ações de ${category.name}`} className="size-9!" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(category)}>
                      <Icon name="pencil" size={18} />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => setDeleteId(category.id)}>
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
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToDelete ? `"${categoryToDelete.name}" será excluída` : 'A categoria será excluída'}{' '}
              permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending} />
            <Button variant="destructive" loading={deleteMutation.isPending} onClick={handleDelete}>
              {deleteMutation.isPending ? 'Excluindo' : 'Excluir categoria'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
