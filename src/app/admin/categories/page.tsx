'use client'

import { Filter, Plus, Search, X } from 'lucide-react'
import { useState } from 'react'

import { Category, CategoryType } from '@/app/db/schemas/category-schema'

import { CategoriesTable } from '@/components/categories-table'
import { CategoryForm } from '@/components/category-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useCategories } from '@/hooks/use-categories'
import { useSelectedSpace } from '@/hooks/use-selected-space'

export default function CategoriasPage() {
  const { selectedSpace } = useSelectedSpace()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<CategoryType | 'all'>('all')

  // Buscar categorias
  const { data: allCategories = [], isLoading } = useCategories(
    selectedSpace?.id || '',
    typeFilter === 'all' ? undefined : typeFilter,
    search || undefined,
  )

  // Separar categorias por tipo
  const entradaCategories = allCategories.filter(c => c.type === 'entrada')
  const saidaCategories = allCategories.filter(c => c.type === 'saida')

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
      {/* Header */}
      <div className="flex flex-col items-center justify-between md:flex-row">
        <div>
          <h1 className="text-3xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">Gerencie as categorias de entradas e saídas</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
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

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Buscar categorias..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                  onClick={() => setSearch('')}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Filtro de tipo */}
            <Select value={typeFilter} onValueChange={value => setTypeFilter(value as CategoryType | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="entrada">💰 Entradas</SelectItem>
                <SelectItem value="saida">💸 Saídas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs com categorias */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas ({allCategories.length})</TabsTrigger>
          <TabsTrigger value="entrada">💰 Entradas ({entradaCategories.length})</TabsTrigger>
          <TabsTrigger value="saida">💸 Saídas ({saidaCategories.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Categorias</CardTitle>
              <CardDescription>Lista completa de categorias cadastradas</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoriesTable categories={allCategories} isLoading={isLoading} onEdit={handleEdit} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entrada" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categorias de Entrada</CardTitle>
              <CardDescription>Categorias para receitas e ganhos</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoriesTable categories={entradaCategories} isLoading={isLoading} onEdit={handleEdit} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saida" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categorias de Saída</CardTitle>
              <CardDescription>Categorias para despesas e gastos</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoriesTable categories={saidaCategories} isLoading={isLoading} onEdit={handleEdit} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
