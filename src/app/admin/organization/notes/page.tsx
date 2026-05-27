'use client'

import { Archive, Edit, FileText, MoreVertical, Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import type { OrganizationNote } from '@/app/db/schemas/organization-note-schema'

import { OrganizationEmptyState } from '@/components/organization/organization-empty-state'
import { OrganizationNoteForm } from '@/components/organization/organization-note-form'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

import { useArchiveOrganizationNote, useOrganizationNotes } from '@/hooks/use-organization-notes'
import { useOrganizationProjects } from '@/hooks/use-organization-projects'
import { useOrganizationTasks } from '@/hooks/use-organization-tasks'
import { useSelectedSpace } from '@/hooks/use-selected-space'

function NotesPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-3 h-9 w-28" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-10 flex-1 md:w-80 md:flex-none" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

function formatDate(date: Date | string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

function getContentPreview(content: string) {
  const preview = content.replace(/\s+/g, ' ').trim()
  if (!preview) return 'Sem conteúdo.'
  return preview.length > 180 ? `${preview.slice(0, 177)}...` : preview
}

export default function OrganizationNotesPage() {
  const { selectedSpace, isLoading: isSpaceLoading } = useSelectedSpace()
  const spaceId = selectedSpace?.id || ''
  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<OrganizationNote | null>(null)
  const [noteToArchive, setNoteToArchive] = useState<OrganizationNote | null>(null)

  const trimmedSearch = search.trim()
  const { data: notes = [], isLoading: isNotesLoading } = useOrganizationNotes({
    spaceId,
    search: trimmedSearch || undefined,
  })
  const { data: projects = [] } = useOrganizationProjects(spaceId)
  const { data: tasks = [] } = useOrganizationTasks({ spaceId })
  const archiveNote = useArchiveOrganizationNote()

  const projectsById = useMemo(() => new Map(projects.map(project => [project.id, project])), [projects])
  const tasksById = useMemo(() => new Map(tasks.map(task => [task.id, task])), [tasks])

  useEffect(() => {
    setIsCreateOpen(false)
    setEditingNote(null)
    setNoteToArchive(null)
  }, [spaceId])

  async function handleArchiveNote() {
    if (!noteToArchive || archiveNote.isPending) return
    await archiveNote.mutateAsync(noteToArchive.id)
    setNoteToArchive(null)
  }

  if ((isSpaceLoading && !selectedSpace) || (!!selectedSpace && isNotesLoading && notes.length === 0)) {
    return <NotesPageSkeleton />
  }

  if (!selectedSpace) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <OrganizationEmptyState
          title="Nenhum espaço selecionado"
          description="Selecione um espaço para criar e consultar notas."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notas</h1>
        <p className="text-muted-foreground">Registre contexto, ideias e decisões ligadas ao espaço selecionado.</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative min-w-0 flex-1 md:w-80 md:flex-none">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar notas..."
            value={search}
            onChange={event => setSearch(event.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 shrink-0">
              <Plus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Nova Nota</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Nota</DialogTitle>
            </DialogHeader>
            <OrganizationNoteForm onSuccess={() => setIsCreateOpen(false)} onCancel={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isNotesLoading ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : notes.length > 0 ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {notes.map(note => {
            const project = note.projectId ? projectsById.get(note.projectId) : null
            const task = note.taskId ? tasksById.get(note.taskId) : null

            return (
              <Card key={note.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4">
                  <div className="min-w-0 space-y-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="text-muted-foreground size-4 shrink-0" />
                      <h2 className="truncate text-base font-semibold">{note.title}</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={note.visibility === 'personal' ? 'secondary' : 'default'}>
                        {note.visibility === 'personal' ? 'Pessoal' : 'Compartilhada'}
                      </Badge>
                      {project && (
                        <Badge variant="outline" className="gap-2">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: project.color }}
                            aria-hidden="true"
                          />
                          {project.name}
                        </Badge>
                      )}
                      {note.projectId && !project && <Badge variant="outline">Projeto arquivado/removido</Badge>}
                      {task && <Badge variant="outline">{task.title}</Badge>}
                      {note.taskId && !task && <Badge variant="outline">Tarefa arquivada/removida</Badge>}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingNote(note)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setNoteToArchive(note)}>
                        <Archive className="mr-2 h-4 w-4" />
                        Arquivar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-4 p-4 pt-0">
                  <p className="text-muted-foreground line-clamp-4 text-sm leading-6">
                    {getContentPreview(note.content)}
                  </p>
                  <div className="text-muted-foreground text-xs">
                    Atualizada em {formatDate(note.updatedAt || note.createdAt)}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-8 text-center text-sm">
          Nenhuma nota encontrada.
        </div>
      )}

      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Nota</DialogTitle>
          </DialogHeader>
          {editingNote && (
            <OrganizationNoteForm
              note={editingNote}
              onSuccess={() => setEditingNote(null)}
              onCancel={() => setEditingNote(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!noteToArchive} onOpenChange={() => setNoteToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar nota?</AlertDialogTitle>
            <AlertDialogDescription>
              A nota sairá da lista ativa, mas o histórico permanece preservado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveNote} className="bg-destructive text-destructive-foreground">
              Arquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
