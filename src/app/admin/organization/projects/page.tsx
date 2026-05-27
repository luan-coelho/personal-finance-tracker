'use client'

import { Archive, Edit, Loader2, MoreVertical, Plus, Trash2 } from 'lucide-react'
import { FormEvent, useEffect, useMemo, useState } from 'react'

import type { OrganizationLabel } from '@/app/db/schemas/organization-label-schema'
import type { OrganizationProject } from '@/app/db/schemas/organization-project-schema'
import type { OrganizationProjectSection } from '@/app/db/schemas/organization-project-section-schema'

import { OrganizationEmptyState } from '@/components/organization/organization-empty-state'
import { OrganizationLabelForm } from '@/components/organization/organization-label-form'
import { OrganizationProjectForm } from '@/components/organization/organization-project-form'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useDeleteOrganizationLabel, useOrganizationLabels } from '@/hooks/use-organization-labels'
import {
  useArchiveOrganizationProject,
  useArchiveOrganizationProjectSection,
  useCreateOrganizationProjectSection,
  useOrganizationProjects,
  useUpdateOrganizationProjectSection,
} from '@/hooks/use-organization-projects'
import { useSelectedSpace } from '@/hooks/use-selected-space'

import type { OrganizationProjectWithSections } from '@/services/organization-project-service'

type SectionDialogState =
  | { mode: 'create'; project: OrganizationProjectWithSections }
  | { mode: 'edit'; project: OrganizationProjectWithSections; section: OrganizationProjectSection }
  | null

function ProjectsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-3 h-9 w-36" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-10 w-32" />
          </CardHeader>
          <CardContent className="p-0">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="mx-6 mb-4 h-12" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-10 w-28" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function formatDate(date: Date | string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

function visibilityLabel(visibility: OrganizationProject['visibility']) {
  return visibility === 'personal' ? 'Pessoal' : 'Compartilhado'
}

function SectionDialog({ state, onOpenChange }: { state: SectionDialogState; onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState('')
  const [position, setPosition] = useState(0)
  const createSection = useCreateOrganizationProjectSection()
  const updateSection = useUpdateOrganizationProjectSection()

  const isOpen = !!state
  const isEditing = state?.mode === 'edit'
  const isLoading = createSection.isPending || updateSection.isPending

  useEffect(() => {
    if (!state) return

    setName(state.mode === 'edit' ? state.section.name : '')
    setPosition(state.mode === 'edit' ? state.section.position : state.project.sections.length)
  }, [state])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!state || !name.trim() || isLoading) return

    const data = { name: name.trim(), position }

    if (state.mode === 'edit') {
      await updateSection.mutateAsync({
        projectId: state.project.id,
        sectionId: state.section.id,
        data,
      })
    } else {
      await createSection.mutateAsync({
        projectId: state.project.id,
        data,
      })
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Seção' : 'Nova Seção'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section-name">Nome *</Label>
            <Input
              id="section-name"
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="Ex: Backlog, Em andamento..."
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="section-position">Posição</Label>
            <Input
              id="section-position"
              type="number"
              min={0}
              step={1}
              value={position}
              onChange={event => setPosition(Number(event.target.value) || 0)}
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? 'Atualizar' : 'Criar'} Seção
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function OrganizationProjectsPage() {
  const { selectedSpace, isLoading: isSpaceLoading } = useSelectedSpace()
  const spaceId = selectedSpace?.id || ''

  const [isProjectCreateOpen, setIsProjectCreateOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<OrganizationProject | null>(null)
  const [projectToArchive, setProjectToArchive] = useState<OrganizationProject | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [sectionDialog, setSectionDialog] = useState<SectionDialogState>(null)
  const [sectionToArchive, setSectionToArchive] = useState<{
    project: OrganizationProjectWithSections
    section: OrganizationProjectSection
  } | null>(null)
  const [isLabelCreateOpen, setIsLabelCreateOpen] = useState(false)
  const [editingLabel, setEditingLabel] = useState<OrganizationLabel | null>(null)
  const [labelToDelete, setLabelToDelete] = useState<OrganizationLabel | null>(null)

  const { data: projects = [], isLoading: isProjectsLoading } = useOrganizationProjects(spaceId)
  const { data: labels = [], isLoading: isLabelsLoading } = useOrganizationLabels(spaceId)
  const archiveProject = useArchiveOrganizationProject()
  const archiveSection = useArchiveOrganizationProjectSection()
  const deleteLabel = useDeleteOrganizationLabel()

  const selectedProject = useMemo(
    () => projects.find(project => project.id === selectedProjectId) ?? projects[0],
    [projects, selectedProjectId],
  )

  useEffect(() => {
    if (!spaceId) {
      setSelectedProjectId('')
      return
    }

    if (projects.length === 0) {
      setSelectedProjectId('')
      return
    }

    if (!projects.some(project => project.id === selectedProjectId)) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects, selectedProjectId, spaceId])

  async function handleArchiveProject() {
    if (!projectToArchive || archiveProject.isPending) return
    await archiveProject.mutateAsync(projectToArchive.id)
    setProjectToArchive(null)
  }

  async function handleArchiveSection() {
    if (!sectionToArchive || archiveSection.isPending) return
    await archiveSection.mutateAsync({
      projectId: sectionToArchive.project.id,
      sectionId: sectionToArchive.section.id,
    })
    setSectionToArchive(null)
  }

  async function handleDeleteLabel() {
    if (!labelToDelete || deleteLabel.isPending) return
    await deleteLabel.mutateAsync(labelToDelete.id)
    setLabelToDelete(null)
  }

  if (isSpaceLoading && !selectedSpace) {
    return <ProjectsPageSkeleton />
  }

  if (!selectedSpace) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <OrganizationEmptyState
          title="Nenhum espaço selecionado"
          description="Selecione um espaço para gerenciar projetos, seções e etiquetas."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projetos</h1>
        <p className="text-muted-foreground">Organize tarefas por projetos, seções e etiquetas do espaço.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
        <Card>
          <CardHeader className="flex flex-col gap-3 space-y-0 p-4 md:flex-row md:items-center md:justify-between md:p-6">
            <CardTitle>Projetos ({projects.length})</CardTitle>
            <Dialog open={isProjectCreateOpen} onOpenChange={setIsProjectCreateOpen}>
              <DialogTrigger asChild>
                <Button className="h-10 shrink-0">
                  <Plus className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Novo Projeto</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo Projeto</DialogTitle>
                </DialogHeader>
                <OrganizationProjectForm
                  onSuccess={() => setIsProjectCreateOpen(false)}
                  onCancel={() => setIsProjectCreateOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            {isProjectsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="text-muted-foreground size-8 animate-spin" />
              </div>
            ) : projects.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Visibilidade</TableHead>
                    <TableHead>Seções</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map(project => {
                    const isSelected = selectedProject?.id === project.id

                    return (
                      <TableRow
                        key={project.id}
                        className={isSelected ? 'bg-muted/50' : undefined}
                        onClick={() => setSelectedProjectId(project.id)}>
                        <TableCell className="font-medium">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="size-3 shrink-0 rounded-full"
                              style={{ backgroundColor: project.color }}
                              aria-hidden="true"
                            />
                            <span className="truncate">{project.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={project.visibility === 'personal' ? 'secondary' : 'default'}>
                            {visibilityLabel(project.visibility)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{project.sections.length}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(project.createdAt)}</TableCell>
                        <TableCell onClick={event => event.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Abrir menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingProject(project)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSectionDialog({ mode: 'create', project })}>
                                <Plus className="mr-2 h-4 w-4" />
                                Nova seção
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setProjectToArchive(project)}>
                                <Archive className="mr-2 h-4 w-4" />
                                Arquivar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-muted-foreground px-6 py-8 text-center text-sm">Nenhum projeto encontrado.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-3 space-y-0 p-4 md:flex-row md:items-center md:justify-between md:p-6">
            <div className="min-w-0">
              <CardTitle>Seções</CardTitle>
              <p className="text-muted-foreground mt-1 truncate text-sm">
                {selectedProject ? selectedProject.name : 'Selecione um projeto'}
              </p>
            </div>
            <Button
              className="h-10 shrink-0"
              disabled={!selectedProject}
              onClick={() => selectedProject && setSectionDialog({ mode: 'create', project: selectedProject })}>
              <Plus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Nova Seção</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {selectedProject ? (
              selectedProject.sections.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Posição</TableHead>
                      <TableHead>Criada em</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedProject.sections.map(section => (
                      <TableRow key={section.id}>
                        <TableCell className="font-medium">{section.name}</TableCell>
                        <TableCell className="text-muted-foreground">{section.position}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(section.createdAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Abrir menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setSectionDialog({ mode: 'edit', project: selectedProject, section })}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setSectionToArchive({ project: selectedProject, section })}>
                                <Archive className="mr-2 h-4 w-4" />
                                Arquivar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-muted-foreground px-6 py-8 text-center text-sm">
                  Nenhuma seção criada para este projeto.
                </div>
              )
            ) : (
              <div className="text-muted-foreground px-6 py-8 text-center text-sm">
                Crie ou selecione um projeto para gerenciar seções.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 p-4 md:flex-row md:items-center md:justify-between md:p-6">
          <CardTitle>Etiquetas ({labels.length})</CardTitle>
          <Dialog open={isLabelCreateOpen} onOpenChange={setIsLabelCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 shrink-0">
                <Plus className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Nova Etiqueta</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Etiqueta</DialogTitle>
              </DialogHeader>
              <OrganizationLabelForm
                onSuccess={() => setIsLabelCreateOpen(false)}
                onCancel={() => setIsLabelCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          {isLabelsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="text-muted-foreground size-8 animate-spin" />
            </div>
          ) : labels.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labels.map(label => (
                  <TableRow key={label.id}>
                    <TableCell>
                      <Badge variant="secondary" className="gap-2">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: label.color }}
                          aria-hidden="true"
                        />
                        {label.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">{label.color}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(label.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingLabel(label)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setLabelToDelete(label)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-muted-foreground px-6 py-8 text-center text-sm">Nenhuma etiqueta encontrada.</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <OrganizationProjectForm
              project={editingProject}
              onSuccess={() => setEditingProject(null)}
              onCancel={() => setEditingProject(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <SectionDialog state={sectionDialog} onOpenChange={open => !open && setSectionDialog(null)} />

      <Dialog open={!!editingLabel} onOpenChange={() => setEditingLabel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Etiqueta</DialogTitle>
          </DialogHeader>
          {editingLabel && (
            <OrganizationLabelForm
              label={editingLabel}
              onSuccess={() => setEditingLabel(null)}
              onCancel={() => setEditingLabel(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!projectToArchive} onOpenChange={() => setProjectToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              O projeto sairá das listas ativas. As tarefas relacionadas permanecem no histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveProject} className="bg-destructive text-destructive-foreground">
              Arquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!sectionToArchive} onOpenChange={() => setSectionToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar seção?</AlertDialogTitle>
            <AlertDialogDescription>
              A seção sairá do projeto ativo e poderá afetar a organização visual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveSection} className="bg-destructive text-destructive-foreground">
              Arquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!labelToDelete} onOpenChange={() => setLabelToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar etiqueta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove a etiqueta do espaço e das tarefas associadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLabel} className="bg-destructive text-destructive-foreground">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
