'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarClock, Check, Pencil, RotateCcw, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import type { OrganizationTaskWithDetails } from '@/services/organization-task-service'

interface OrganizationTaskCardProps {
  task: OrganizationTaskWithDetails
  onEdit: (task: OrganizationTaskWithDetails) => void
  onComplete: (task: OrganizationTaskWithDetails) => void
  onReopen: (task: OrganizationTaskWithDetails) => void
}

function formatDueDate(date: Date | string | null, time: string | null) {
  if (!date && !time) return null

  const dateText = date ? format(new Date(date), "dd 'de' MMM", { locale: ptBR }) : null
  return [dateText, time].filter(Boolean).join(' as ')
}

export function OrganizationTaskCard({ task, onEdit, onComplete, onReopen }: OrganizationTaskCardProps) {
  const dueText = formatDueDate(task.dueDate, task.dueTime)
  const isCompleted = task.status === 'completed'

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex gap-3 p-3 sm:items-start">
        <Button
          type="button"
          variant={isCompleted ? 'secondary' : 'outline'}
          size="icon"
          className="size-9 shrink-0"
          onClick={() => (isCompleted ? onReopen(task) : onComplete(task))}
          aria-label={isCompleted ? 'Reabrir tarefa' : 'Concluir tarefa'}>
          {isCompleted ? <RotateCcw className="size-4" /> : <Check className="size-4" />}
        </Button>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3
                className={
                  isCompleted ? 'text-sm font-medium break-words line-through' : 'text-sm font-medium break-words'
                }>
                {task.title}
              </h3>
              <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                {dueText && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="size-3.5" />
                    {dueText}
                  </span>
                )}
                {task.project && (
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: task.project.color }}
                      aria-hidden="true"
                    />
                    <span className="truncate">{task.project.name}</span>
                  </span>
                )}
                {task.assignee && (
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <User className="size-3.5" />
                    <span className="truncate">{task.assignee.name || task.assignee.email}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Badge variant={task.visibility === 'shared' ? 'default' : 'secondary'} className="h-6">
                {task.visibility === 'shared' ? 'Compartilhada' : 'Pessoal'}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => onEdit(task)}
                aria-label="Editar tarefa">
                <Pencil className="size-4" />
              </Button>
            </div>
          </div>

          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.labels.map(label => (
                <Badge key={label.id} variant="outline" className="h-6 max-w-full gap-1">
                  <span className="size-2 rounded-full" style={{ backgroundColor: label.color }} aria-hidden="true" />
                  <span className="truncate">{label.name}</span>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
