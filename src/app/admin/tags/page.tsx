'use client'

import { useState } from 'react'

import type { Tag } from '@/app/db/schemas/tag-schema'

import { TagForm } from '@/components/tag-form'
import { TagsTable } from '@/components/tags-table'
import { Button, IconButton } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { PageActions } from '@/components/ui/page-actions'
import { PageHeader } from '@/components/ui/page-header'

import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useTags } from '@/hooks/use-tags'

const PAGE_TITLE = 'Tags'
const PAGE_DESCRIPTION = 'Marcadores para agrupar transações'

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
      <>
        <PageHeader title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
        <EmptyState
          bordered
          icon="building-2"
          title="Nenhum espaço selecionado"
          description="Selecione um espaço para gerenciar tags."
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
        meta={isLoading ? undefined : `${tags.length} ${tags.length === 1 ? 'tag cadastrada' : 'tags cadastradas'}`}
      />

      <PageActions
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="primary" icon="plus">
                Nova tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova tag</DialogTitle>
              </DialogHeader>
              <TagForm onSuccess={handleCreateSuccess} onCancel={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        }>
        <Input
          icon="search"
          placeholder="Buscar tags"
          aria-label="Buscar tags"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-72"
          action={
            search ? <IconButton icon="x" label="Limpar busca" size="sm" onClick={() => setSearch('')} /> : undefined
          }
        />
      </PageActions>

      <TagsTable tags={tags} isLoading={isLoading} isFiltered={!!search} onEdit={handleEdit} />

      {/* Dialog de edição */}
      <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar tag</DialogTitle>
          </DialogHeader>
          {editingTag && (
            <TagForm tag={editingTag} onSuccess={handleEditSuccess} onCancel={() => setEditingTag(null)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
