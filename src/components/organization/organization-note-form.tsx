'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm, type Resolver } from 'react-hook-form'

import {
  insertOrganizationNoteSchema,
  type OrganizationNote,
  type OrganizationNoteFormValues,
} from '@/app/db/schemas/organization-note-schema'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import { useCreateOrganizationNote, useUpdateOrganizationNote } from '@/hooks/use-organization-notes'
import { useOrganizationProjects } from '@/hooks/use-organization-projects'
import { useOrganizationTasks } from '@/hooks/use-organization-tasks'
import { useSelectedSpace } from '@/hooks/use-selected-space'

type NoteFormValues = Omit<OrganizationNoteFormValues, 'createdById'>
const noteFormSchema = insertOrganizationNoteSchema.omit({ createdById: true })
const NONE = 'none'

interface OrganizationNoteFormProps {
  note?: OrganizationNote
  onSuccess?: () => void
  onCancel?: () => void
}

export function OrganizationNoteForm({ note, onSuccess, onCancel }: OrganizationNoteFormProps) {
  const { selectedSpace } = useSelectedSpace()
  const spaceId = selectedSpace?.id || note?.spaceId || ''
  const isEditing = !!note

  const { data: projects = [] } = useOrganizationProjects(spaceId)
  const { data: tasks = [] } = useOrganizationTasks({ spaceId })

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema) as Resolver<NoteFormValues>,
    defaultValues: {
      spaceId,
      projectId: note?.projectId || null,
      taskId: note?.taskId || null,
      title: note?.title || '',
      content: note?.content || '',
      visibility: note?.visibility || 'shared',
    },
  })

  const createMutation = useCreateOrganizationNote()
  const updateMutation = useUpdateOrganizationNote()
  const isLoading = createMutation.isPending || updateMutation.isPending

  async function onSubmit(values: NoteFormValues) {
    if (!selectedSpace) return

    const data = {
      ...values,
      spaceId: selectedSpace.id,
      projectId: values.projectId || null,
      taskId: values.taskId || null,
      content: values.content || '',
    }

    if (isEditing && note) {
      await updateMutation.mutateAsync({ id: note.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }

    form.reset()
    onSuccess?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Ideias para a próxima reunião" disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ''}
                  rows={8}
                  className="min-h-40 resize-y"
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
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Projeto</FormLabel>
                <Select
                  value={field.value || NONE}
                  onValueChange={value => field.onChange(value === NONE ? null : value)}
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
            name="taskId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tarefa</FormLabel>
                <Select
                  value={field.value || NONE}
                  onValueChange={value => field.onChange(value === NONE ? null : value)}
                  disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar tarefa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE}>Sem tarefa</SelectItem>
                    {tasks.map(task => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
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
          name="visibility"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between gap-4 rounded-md border p-3">
              <div className="space-y-0.5">
                <FormLabel>Nota pessoal</FormLabel>
                <p className="text-muted-foreground text-xs">Desligado mantém a nota compartilhada.</p>
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

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading || !selectedSpace}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEditing ? 'Atualizar' : 'Criar'} Nota
          </Button>
        </div>
      </form>
    </Form>
  )
}
