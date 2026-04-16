'use client'

import { ArrowDownCircle, ArrowUpCircle, Plus, Search } from 'lucide-react'
import { useState } from 'react'

import { Category, CategoryType } from '@/app/db/schemas/category-schema'

import { CategoriesTable } from '@/components/categories-table'
import { CategoryForm } from '@/components/category-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

import { useCategories } from '@/hooks/use-categories'
import { useSelectedSpace } from '@/hooks/use-selected-space'

export default function CategoriasPage() {
  const { selectedSpace } = useSelectedSpace()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<CategoryType | 'all'>('all')

  // Buscar todas as categorias (filtro aplicado client-side para contadores)
  const { data: allCategories = [], isLoading } = useCategories(
    selectedSpace?.id || '',
    undefined,
    search || undefined,
  )

  const entradaCount = allCategories.filter(c => c.type === 'entrada').length
  const saidaCount = allCategories.filter(c => c.type === 'saida').length
  const filteredCategories =
    typeFilter === 'all' ? allCategories : allCategories.filter(c => c.type === typeFilter)

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
  }

  const handleCreateSuccess = () => {
    setIsCreateOpen(false)
  }

  const handleEditSuccess = () => {
    setEditingCategory(null)
  }

  if (!selectedSpace) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Nenhum espaço selecionado</CardTitle>
            <CardDescription>Selecione um espaço para gerenciar categorias.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div>
        <h1 className="text-3xl font-bold">Categorias</h1>
        <p className="text-muted-foreground">Gerencie as categorias de entradas e saídas</p>
      </div>

      {/* Card único com filtros no header e tabela no body */}
      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 p-4 md:flex-row md:items-center md:justify-between md:gap-4 md:p-6">
          {/* Filtros estilo tabs */}
          <div className="flex items-center gap-1 rounded-lg border p-1">
            <Button
              variant={typeFilter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTypeFilter('all')}
              className="h-8">
              Todas ({allCategories.length})
            </Button>
            <Button
              variant={typeFilter === 'entrada' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTypeFilter('entrada')}
              className="h-8 gap-1">
              <ArrowUpCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
              Entradas ({entradaCount})
            </Button>
            <Button
              variant={typeFilter === 'saida' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTypeFilter('saida')}
              className="h-8 gap-1">
              <ArrowDownCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
              Saídas ({saidaCount})
            </Button>
          </div>

          {/* Busca + botão de criar */}
          <div className="flex w-full min-w-0 items-center gap-2 md:w-auto">
            <div className="relative min-w-0 flex-1 md:w-72 md:flex-none">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Buscar categorias..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="h-10 shrink-0">
                  <Plus className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Nova Categoria</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Categoria</DialogTitle>
                </DialogHeader>
                <CategoryForm onSuccess={handleCreateSuccess} onCancel={() => setIsCreateOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <CategoriesTable categories={filteredCategories} isLoading={isLoading} onEdit={handleEdit} />
        </CardContent>
      </Card>

      {/* Dialog de edição */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
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
    </div>
  )
}
