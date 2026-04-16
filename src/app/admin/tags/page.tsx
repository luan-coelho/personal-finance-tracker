'use client'

import { Plus, Search } from 'lucide-react'
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
      {/* Header da página */}
      <div>
        <h1 className="text-3xl font-bold">Tags</h1>
        <p className="text-muted-foreground">Gerencie as tags para suas transações</p>
      </div>

      {/* Card único com busca e criar no header, tabela no body */}
      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 p-4 md:flex-row md:items-center md:justify-between md:gap-4 md:p-6">
          <CardTitle className="shrink-0">
            Tags Cadastradas ({tags.length})
          </CardTitle>

          <div className="flex w-full min-w-0 items-center gap-2 md:w-auto">
            <div className="relative min-w-0 flex-1 md:w-72 md:flex-none">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Buscar tags..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="h-10 shrink-0">
                  <Plus className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Nova Tag</span>
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
        </CardHeader>
        <CardContent className="p-0">
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
