'use client'

import { Clock, ListTodo, Loader2, Plus } from 'lucide-react'
import { FormEvent, useState } from 'react'

import { OrganizationEmptyState } from '@/components/organization/organization-empty-state'
import { OrganizationTaskCard } from '@/components/organization/organization-task-card'
import { OrganizationTaskForm } from '@/components/organization/organization-task-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

import {
  useCompleteOrganizationTask,
  useCreateOrganizationTask,
  useOrganizationToday,
  useReopenOrganizationTask,
} from '@/hooks/use-organization-tasks'
import { useSelectedSpace } from '@/hooks/use-selected-space'

import type { OrganizationTaskWithDetails } from '@/services/organization-task-service'

interface TodaySectionProps {
  title: string
  description: string
  tasks: OrganizationTaskWithDetails[]
  emptyText: string
  onEdit: (task: OrganizationTaskWithDetails) => void
  onComplete: (task: OrganizationTaskWithDetails) => void
  onReopen: (task: OrganizationTaskWithDetails) => void
}

function TodayPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-3 h-9 w-28" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      <div className="flex items-center gap-2">
        <Skeleton className="h-10 min-w-0 flex-1" />
        <Skeleton className="h-10 w-10 shrink-0" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {[...Array(4)].map((_, sectionIndex) => (
          <section key={sectionIndex} className="space-y-3">
            <div>
              <Skeleton className="mb-2 h-6 w-36" />
              <Skeleton className="h-4 w-56 max-w-full" />
            </div>
            {[...Array(2)].map((_, taskIndex) => (
              <Skeleton key={taskIndex} className="h-24 rounded-xl" />
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}

function TodayQuickCapture({ spaceId }: { spaceId: string }) {
  const [title, setTitle] = useState('')
  const createTask = useCreateOrganizationTask()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = title.trim()
    if (!spaceId || !trimmed || createTask.isPending) return

    await createTask.mutateAsync({
      spaceId,
      title: trimmed,
      status: 'pending',
      visibility: 'shared',
      dueDate: new Date(),
      recurrenceType: 'none',
      recurrenceInterval: 1,
      recurrenceDaysOfWeek: [],
      labelIds: [],
    })
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        value={title}
        onChange={event => setTitle(event.target.value)}
        placeholder="Adicionar tarefa para acompanhar hoje..."
        disabled={createTask.isPending}
        className="h-10 min-w-0 flex-1"
      />
      <Button type="submit" size="icon" disabled={!title.trim() || createTask.isPending} aria-label="Adicionar tarefa">
        {createTask.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
      </Button>
    </form>
  )
}

function TodaySection({ title, description, tasks, emptyText, onEdit, onComplete, onReopen }: TodaySectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <span className="bg-muted text-muted-foreground inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md px-2 text-xs font-medium">
          {tasks.length}
        </span>
      </div>

      {tasks.length > 0 ? (
        <div className="space-y-2">
          {tasks.map(task => (
            <OrganizationTaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onComplete={onComplete}
              onReopen={onReopen}
            />
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-6 text-sm">{emptyText}</div>
      )}
    </section>
  )
}

export default function OrganizationTodayPage() {
  const { selectedSpace, isLoading: isSpaceLoading } = useSelectedSpace()
  const [editingTask, setEditingTask] = useState<OrganizationTaskWithDetails | null>(null)

  const { data: today, isLoading: isTodayLoading } = useOrganizationToday(selectedSpace?.id || '')
  const completeTask = useCompleteOrganizationTask()
  const reopenTask = useReopenOrganizationTask()

  const isLoading = isSpaceLoading || (!!selectedSpace && isTodayLoading)

  function handleComplete(task: OrganizationTaskWithDetails) {
    if (completeTask.isPending) return
    completeTask.mutate(task.id)
  }

  function handleReopen(task: OrganizationTaskWithDetails) {
    if (reopenTask.isPending) return
    reopenTask.mutate(task.id)
  }

  if (isLoading && !today) {
    return <TodayPageSkeleton />
  }

  if (!selectedSpace) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <OrganizationEmptyState
          title="Nenhum espaço selecionado"
          description="Selecione um espaço para acompanhar as tarefas de hoje."
        />
      </div>
    )
  }

  const overdue = today?.overdue ?? []
  const timedToday = today?.timedToday ?? []
  const untimedToday = today?.untimedToday ?? []
  const upcoming = today?.upcoming ?? []
  const totalTasks = overdue.length + timedToday.length + untimedToday.length + upcoming.length

  return (
    <div className="space-y-6">
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold">Hoje</h1>
          <p className="text-muted-foreground">
            Capture, priorize e conclua o que precisa de atenção no espaço selecionado.
          </p>
        </div>
        <div className="text-muted-foreground flex shrink-0 items-center gap-2 text-sm">
          <ListTodo className="size-4" />
          <span>{totalTasks} tarefas em foco</span>
        </div>
      </div>

      <TodayQuickCapture spaceId={selectedSpace.id} />

      <div className="grid gap-6 xl:grid-cols-2">
        <TodaySection
          title="Atrasadas"
          description="Pendências que já passaram da data combinada."
          tasks={overdue}
          emptyText="Nenhuma tarefa atrasada."
          onEdit={setEditingTask}
          onComplete={handleComplete}
          onReopen={handleReopen}
        />
        <TodaySection
          title="Com horário hoje"
          description="Compromissos e entregas com hora marcada."
          tasks={timedToday}
          emptyText="Nenhuma tarefa com horário para hoje."
          onEdit={setEditingTask}
          onComplete={handleComplete}
          onReopen={handleReopen}
        />
        <TodaySection
          title="Sem horário hoje"
          description="Tarefas do dia que ainda não têm hora definida."
          tasks={untimedToday}
          emptyText="Nenhuma tarefa sem horário para hoje."
          onEdit={setEditingTask}
          onComplete={handleComplete}
          onReopen={handleReopen}
        />
        <TodaySection
          title="Próximas"
          description="As próximas tarefas pendentes com data futura."
          tasks={upcoming}
          emptyText="Nenhuma próxima tarefa com data."
          onEdit={setEditingTask}
          onComplete={handleComplete}
          onReopen={handleReopen}
        />
      </div>

      {totalTasks === 0 && (
        <div className="text-muted-foreground flex items-center gap-2 rounded-lg border border-dashed px-4 py-6 text-sm">
          <Clock className="size-4 shrink-0" />
          <span>Nada planejado para hoje. Use a captura rápida para registrar o próximo item.</span>
        </div>
      )}

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
