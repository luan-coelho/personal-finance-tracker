'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'

import {
  insertOrganizationTaskSchema,
  type OrganizationTaskFormValues,
} from '@/app/db/schemas/organization-task-schema'

import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { MultiSelect } from '@/components/ui/multi-select'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { TimePickerDemo } from '@/components/ui/time-picker'

import { useOrganizationLabels } from '@/hooks/use-organization-labels'
import { useOrganizationProjects } from '@/hooks/use-organization-projects'
import { useCreateOrganizationTask, useUpdateOrganizationTask } from '@/hooks/use-organization-tasks'
import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useSpaceMembers } from '@/hooks/use-space-members'

import type { OrganizationTaskWithDetails } from '@/services/organization-task-service'

type TaskFormValues = Omit<OrganizationTaskFormValues, 'createdById'>
const taskFormSchema = insertOrganizationTaskSchema.omit({ createdById: true })
const NONE = 'none'

const weekdayOptions = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Segunda' },
  { value: '2', label: 'Terça' },
  { value: '3', label: 'Quarta' },
  { value: '4', label: 'Quinta' },
  { value: '5', label: 'Sexta' },
  { value: '6', label: 'Sábado' },
]

interface OrganizationTaskFormProps {
  task?: OrganizationTaskWithDetails
  onSuccess?: () => void
  onCancel?: () => void
}

function dateToTime(value?: Date | string | null) {
  if (!value) return ''
  const date = new Date(value)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function combineDateAndTime(date?: Date | null, time?: string) {
  if (!date) return null
  const [hours = 9, minutes = 0] = time ? time.split(':').map(Number) : []
  const combined = new Date(date)
  combined.setHours(hours, minutes, 0, 0)
  return combined
}

export function OrganizationTaskForm({ task, onSuccess, onCancel }: OrganizationTaskFormProps) {
  const { selectedSpace } = useSelectedSpace()
  const spaceId = selectedSpace?.id || task?.spaceId || ''
  const [reminderDate, setReminderDate] = useState<Date | undefined>(
    task?.reminderAt ? new Date(task.reminderAt) : undefined,
  )
  const [reminderTime, setReminderTime] = useState(dateToTime(task?.reminderAt))
  const isEditing = !!task

  const { data: projects = [] } = useOrganizationProjects(spaceId)
  const { data: labels = [] } = useOrganizationLabels(spaceId)
  const { data: spaceMembers = [] } = useSpaceMembers(spaceId)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema) as Resolver<TaskFormValues>,
    defaultValues: {
      spaceId,
      projectId: task?.projectId || null,
      sectionId: task?.sectionId || null,
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'pending',
      visibility: task?.visibility || 'shared',
      assigneeId: task?.assigneeId || null,
      dueDate: task?.dueDate ? new Date(task.dueDate) : null,
      dueTime: task?.dueTime || null,
      reminderAt: task?.reminderAt ? new Date(task.reminderAt) : null,
      recurrenceType: task?.recurrenceType || 'none',
      recurrenceInterval: task?.recurrenceInterval || 1,
      recurrenceDaysOfWeek: task?.recurrenceDaysOfWeek || [],
      recurrenceDayOfMonth: task?.recurrenceDayOfMonth || null,
      recurrenceEndsAt: task?.recurrenceEndsAt ? new Date(task.recurrenceEndsAt) : null,
      labelIds: task?.labels.map(label => label.id) || [],
    },
  })

  const selectedProjectId = form.watch('projectId')
  const recurrenceType = form.watch('recurrenceType')

  const sectionOptions = useMemo(
    () => projects.find(project => project.id === selectedProjectId)?.sections ?? [],
    [projects, selectedProjectId],
  )

  const assigneeOptions = useMemo(() => {
    const users = new Map<string, { id: string; label: string }>()

    for (const member of spaceMembers) {
      if (member.user) {
        users.set(member.user.id, {
          id: member.user.id,
          label: member.user.name || member.user.email,
        })
      }
    }

    if (task?.assignee) {
      users.set(task.assignee.id, {
        id: task.assignee.id,
        label: task.assignee.name || task.assignee.email,
      })
    }

    return [...users.values()]
  }, [spaceMembers, task?.assignee])

  const createMutation = useCreateOrganizationTask()
  const updateMutation = useUpdateOrganizationTask()
  const isLoading = createMutation.isPending || updateMutation.isPending

  async function onSubmit(values: TaskFormValues) {
    if (!selectedSpace) return

    const data = {
      ...values,
      spaceId: selectedSpace.id,
      description: values.description?.trim() || null,
      projectId: values.projectId || null,
      sectionId: values.sectionId || null,
      assigneeId: values.assigneeId || null,
      dueDate: values.dueDate || null,
      dueTime: values.dueTime || null,
      reminderAt: combineDateAndTime(reminderDate, reminderTime),
      recurrenceDayOfMonth: values.recurrenceDayOfMonth || null,
      recurrenceEndsAt: values.recurrenceEndsAt || null,
      labelIds: values.labelIds || [],
    }

    if (isEditing && task) {
      await updateMutation.mutateAsync({ id: task.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }

    form.reset()
    onSuccess?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-h-[80vh] space-y-5 overflow-y-auto px-1">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Revisar planejamento da semana" disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ''} rows={3} className="resize-none" disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Projeto</FormLabel>
                <Select
                  value={field.value || NONE}
                  onValueChange={value => {
                    field.onChange(value === NONE ? null : value)
                    form.setValue('sectionId', null)
                  }}
                  disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar projeto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE}>Sem projeto</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sectionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seção</FormLabel>
                <Select
                  value={field.value || NONE}
                  onValueChange={value => field.onChange(value === NONE ? null : value)}
                  disabled={isLoading || !selectedProjectId}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar seção" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE}>Sem seção</SelectItem>
                    {sectionOptions.map(section => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="labelIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etiquetas</FormLabel>
              <FormControl>
                <MultiSelect
                  options={labels.map(label => ({ value: label.id, label: label.name }))}
                  value={field.value || []}
                  onValueChange={field.onChange}
                  placeholder="Selecionar etiquetas"
                  searchPlaceholder="Buscar etiqueta..."
                  emptyText="Nenhuma etiqueta encontrada."
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de entrega</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value || undefined}
                    onSelect={date => field.onChange(date || null)}
                    className="w-full"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <FormControl>
                  <TimePickerDemo value={field.value || ''} onChange={value => field.onChange(value || null)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormItem>
            <FormLabel>Lembrete</FormLabel>
            <DatePicker
              date={reminderDate}
              onSelect={date => setReminderDate(date)}
              className="w-full"
              placeholder="Dia do lembrete"
              disabled={isLoading}
            />
          </FormItem>
          <FormItem>
            <FormLabel>Hora do lembrete</FormLabel>
            <TimePickerDemo value={reminderTime} onChange={setReminderTime} />
          </FormItem>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="assigneeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsável</FormLabel>
                <Select
                  value={field.value || NONE}
                  onValueChange={value => field.onChange(value === NONE ? null : value)}
                  disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar responsável" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE}>Sem responsável</SelectItem>
                    {assigneeOptions.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4 rounded-md border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Tarefa pessoal</FormLabel>
                  <p className="text-muted-foreground text-xs">Desligado mantém a tarefa compartilhada.</p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value === 'personal'}
                    onCheckedChange={checked => field.onChange(checked ? 'personal' : 'shared')}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="recurrenceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recorrência</FormLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Não repetir</SelectItem>
                    <SelectItem value="daily">Diária</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recurrenceInterval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Intervalo</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min={1} disabled={isLoading || recurrenceType === 'none'} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {recurrenceType === 'weekly' && (
          <FormField
            control={form.control}
            name="recurrenceDaysOfWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dias da semana</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={weekdayOptions}
                    value={(field.value || []).map(String)}
                    onValueChange={values => field.onChange(values.map(Number))}
                    placeholder="Selecionar dias"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="recurrenceDayOfMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dia do mês</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    type="number"
                    min={1}
                    max={31}
                    disabled={isLoading || recurrenceType !== 'monthly'}
                    onChange={event => field.onChange(event.target.value ? Number(event.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recurrenceEndsAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Termina em</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value || undefined}
                    onSelect={date => field.onChange(date || null)}
                    className="w-full"
                    disabled={isLoading || recurrenceType === 'none'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading || !selectedSpace}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEditing ? 'Atualizar' : 'Criar'} Tarefa
          </Button>
        </div>
      </form>
    </Form>
  )
}
