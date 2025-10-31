'use client'

import { Plus, Search, X } from 'lucide-react'
import { useState } from 'react'

import { Tag } from '@/app/db/schemas/tag-schema'

import { TagForm } from '@/components/tag-form'
import { TagsTable } from '@/components/tags-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useTags } from '@/hooks/use-tags'

export default function TagsPage() {
  const { selectedSpace } = useSelectedSpace()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [search, setSearch] = useState('')

  // Buscar tags
  const { data: tags = [], isLoading } = useTags(selectedSpace?.id || '', search || undefined)

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag)
  }

  const handleCreateSuccess = () => {
    setIsCreateOpen(false)
  }

  const handleEditSuccess = () => {
    setEditingTag(null)
  }

  if (!selectedSpace) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Nenhum espaço selecionado</CardTitle>
            <CardDescription>Selecione um espaço para gerenciar tags.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tags</h1>
          <p className="text-muted-foreground">Gerencie as tags para suas transações</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Tag</DialogTitle>
            </DialogHeader>
            <TagForm onSuccess={handleCreateSuccess} onCancel={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Buscar tags..."
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
        </CardContent>
      </Card>

      {/* Tabela de tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags Cadastradas</CardTitle>
          <CardDescription>
            Total de {tags.length} {tags.length === 1 ? 'tag' : 'tags'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TagsTable tags={tags} isLoading={isLoading} onEdit={handleEdit} />
        </CardContent>
      </Card>

      {/* Dialog de edição */}
      <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tag</DialogTitle>
          </DialogHeader>
          {editingTag && (
            <TagForm tag={editingTag} onSuccess={handleEditSuccess} onCancel={() => setEditingTag(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
