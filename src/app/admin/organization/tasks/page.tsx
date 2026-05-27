'use client'

import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import type { OrganizationVisibility } from '@/app/db/schemas/organization-project-schema'
import type { OrganizationTaskStatus } from '@/app/db/schemas/organization-task-schema'

import { OrganizationEmptyState } from '@/components/organization/organization-empty-state'
import { OrganizationTaskCard } from '@/components/organization/organization-task-card'
import { OrganizationTaskForm } from '@/components/organization/organization-task-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

import { useOrganizationProjects } from '@/hooks/use-organization-projects'
import {
  useCompleteOrganizationTask,
  useOrganizationTasks,
  useReopenOrganizationTask,
} from '@/hooks/use-organization-tasks'
import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useSpaceMembers } from '@/hooks/use-space-members'

import type { OrganizationTaskWithDetails } from '@/services/organization-task-service'

type StatusFilter = OrganizationTaskStatus | 'all'
type VisibilityFilter = OrganizationVisibility | 'all'

const ALL = 'all'

function TasksPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-3 h-9 w-32" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 p-4 md:flex-row md:items-center md:justify-between md:gap-4 md:p-6">
          <div className="grid w-full gap-2 md:grid-cols-4 xl:w-auto xl:min-w-[680px]">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <div className="flex w-full min-w-0 items-center gap-2 md:w-auto">
            <Skeleton className="h-10 flex-1 md:w-72 md:flex-none" />
            <Skeleton className="h-10 w-10 shrink-0 md:w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-4 pt-0 md:p-6 md:pt-0">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function OrganizationTasksPage() {
  const { selectedSpace, isLoading: isSpaceLoading } = useSelectedSpace()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<OrganizationTaskWithDetails | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL)
  const [projectFilter, setProjectFilter] = useState(ALL)
  const [assigneeFilter, setAssigneeFilter] = useState(ALL)
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>(ALL)

  const spaceId = selectedSpace?.id || ''
  const trimmedSearch = search.trim()

  const filters = useMemo(
    () => ({
      spaceId,
      status: statusFilter === ALL ? undefined : statusFilter,
      projectId: projectFilter === ALL ? undefined : projectFilter,
      assigneeId: assigneeFilter === ALL ? undefined : assigneeFilter,
      visibility: visibilityFilter === ALL ? undefined : visibilityFilter,
      search: trimmedSearch || undefined,
    }),
    [assigneeFilter, projectFilter, spaceId, statusFilter, trimmedSearch, visibilityFilter],
  )

  const { data: tasks = [], isLoading: isTasksLoading } = useOrganizationTasks(filters)
  const { data: projects = [] } = useOrganizationProjects(spaceId)
  const { data: members = [] } = useSpaceMembers(spaceId)
  const completeTask = useCompleteOrganizationTask()
  const reopenTask = useReopenOrganizationTask()

  const memberOptions = useMemo(
    () =>
      members
        .filter(member => member.user)
        .map(member => ({
          id: member.user!.id,
          label: member.user!.name || member.user!.email,
        })),
    [members],
  )

  function handleComplete(task: OrganizationTaskWithDetails) {
    if (completeTask.isPending) return
    completeTask.mutate(task.id)
  }

  function handleReopen(task: OrganizationTaskWithDetails) {
    if (reopenTask.isPending) return
    reopenTask.mutate(task.id)
  }

  if ((isSpaceLoading && !selectedSpace) || (!!selectedSpace && isTasksLoading && tasks.length === 0)) {
    return <TasksPageSkeleton />
  }

  if (!selectedSpace) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <OrganizationEmptyState
          title="Nenhum espaço selecionado"
          description="Selecione um espaço para listar e organizar tarefas."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tarefas</h1>
        <p className="text-muted-foreground">
          Gerencie tarefas pessoais e compartilhadas por projeto, responsável e status.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 p-4 md:flex-row md:items-center md:justify-between md:gap-4 md:p-6">
          <div className="grid w-full min-w-0 gap-2 md:grid-cols-2 xl:w-auto xl:min-w-[680px] xl:grid-cols-4">
            <Select value={statusFilter} onValueChange={value => setStatusFilter(value as StatusFilter)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os status</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
                <SelectItem value="archived">Arquivadas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os projetos</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os responsáveis</SelectItem>
                {memberOptions.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={visibilityFilter} onValueChange={value => setVisibilityFilter(value as VisibilityFilter)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Visibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas as visibilidades</SelectItem>
                <SelectItem value="shared">Compartilhadas</SelectItem>
                <SelectItem value="personal">Pessoais</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex w-full min-w-0 items-center gap-2 md:w-auto">
            <div className="relative min-w-0 flex-1 md:w-72 md:flex-none">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Buscar tarefas..."
                value={search}
                onChange={event => setSearch(event.target.value)}
                className="pl-10"
              />
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="h-10 shrink-0">
                  <Plus className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Nova Tarefa</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nova Tarefa</DialogTitle>
                </DialogHeader>
                <OrganizationTaskForm
                  onSuccess={() => setIsCreateOpen(false)}
                  onCancel={() => setIsCreateOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          {isTasksLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map(task => (
                <OrganizationTaskCard
                  key={task.id}
                  task={task}
                  onEdit={setEditingTask}
                  onComplete={handleComplete}
                  onReopen={handleReopen}
                />
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-8 text-center text-sm">
              Nenhuma tarefa encontrada com os filtros atuais.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <OrganizationTaskForm
              task={editingTask}
              onSuccess={() => setEditingTask(null)}
              onCancel={() => setEditingTask(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
