'use client'

import { useState } from 'react'

import type { Category, CategoryType } from '@/app/db/schemas/category-schema'

import { CategoriesTable, CategoriesTableSkeleton } from '@/components/categories-table'
import { CategoryForm } from '@/components/category-form'
import { Button, IconButton } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { PageActions } from '@/components/ui/page-actions'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { useCategories } from '@/hooks/use-categories'
import { useSelectedSpace } from '@/hooks/use-selected-space'

const PAGE_TITLE = 'Categorias'
const PAGE_DESCRIPTION = 'Categorias de entradas e saídas do espaço'

function CategoriesPageSkeleton() {
  return (
    <>
      <PageHeader title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
      <PageActions actions={<Skeleton className="h-control-md rounded-control w-40" />}>
        <Skeleton className="h-10 w-72 max-w-full rounded-full" />
        <Skeleton className="h-control-lg rounded-control w-72 max-w-full" />
      </PageActions>
      <CategoriesTableSkeleton />
    </>
  )
}

function FilterCount({ value }: { value: number }) {
  return <span className="text-muted-foreground tabular-nums">{value}</span>
}

export default function CategoriasPage() {
  const { selectedSpace, isLoading: isSpaceLoading } = useSelectedSpace()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<CategoryType | 'all'>('all')

  // Buscar todas as categorias (filtro aplicado client-side para contadores)
  const { data: allCategories = [], isLoading } = useCategories(selectedSpace?.id || '', undefined, search || undefined)

  const entradaCount = allCategories.filter(c => c.type === 'entrada').length
  const saidaCount = allCategories.filter(c => c.type === 'saida').length
  const filteredCategories = typeFilter === 'all' ? allCategories : allCategories.filter(c => c.type === typeFilter)

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
  }

  const handleCreateSuccess = () => {
    setIsCreateOpen(false)
  }

  const handleEditSuccess = () => {
    setEditingCategory(null)
  }

  if (isSpaceLoading && !selectedSpace) {
    return <CategoriesPageSkeleton />
  }

  if (!selectedSpace) {
    return (
      <>
        <PageHeader title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
        <EmptyState
          bordered
          icon="building-2"
          title="Nenhum espaço selecionado"
          description="Selecione um espaço para gerenciar categorias."
        />
      </>
    )
  }

  return (
    <>
      <PageHeader title={PAGE_TITLE} description={PAGE_DESCRIPTION} />

      <PageActions
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="primary" icon="plus">
                Nova categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova categoria</DialogTitle>
              </DialogHeader>
              <CategoryForm onSuccess={handleCreateSuccess} onCancel={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        }>
        <ToggleGroup
          type="single"
          value={typeFilter}
          onValueChange={value => setTypeFilter(value as CategoryType | 'all')}
          aria-label="Filtrar por tipo">
          <ToggleGroupItem value="all">
            Todas <FilterCount value={allCategories.length} />
          </ToggleGroupItem>
          <ToggleGroupItem value="entrada">
            Entradas <FilterCount value={entradaCount} />
          </ToggleGroupItem>
          <ToggleGroupItem value="saida">
            Saídas <FilterCount value={saidaCount} />
          </ToggleGroupItem>
        </ToggleGroup>

        <Input
          icon="search"
          placeholder="Buscar categorias"
          aria-label="Buscar categorias"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-72"
          action={
            search ? <IconButton icon="x" label="Limpar busca" size="sm" onClick={() => setSearch('')} /> : undefined
          }
        />
      </PageActions>

      <CategoriesTable
        categories={filteredCategories}
        isLoading={isLoading}
        isFiltered={!!search || typeFilter !== 'all'}
        onEdit={handleEdit}
      />

      {/* Dialog de edição */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar categoria</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <CategoryForm
              category={editingCategory}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingCategory(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
