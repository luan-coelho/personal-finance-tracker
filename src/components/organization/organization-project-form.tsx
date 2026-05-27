'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Folder, Loader2 } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'

import {
  insertOrganizationProjectSchema,
  type OrganizationProject,
  type OrganizationProjectFormValues,
} from '@/app/db/schemas/organization-project-schema'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import { useCreateOrganizationProject, useUpdateOrganizationProject } from '@/hooks/use-organization-projects'
import { useSelectedSpace } from '@/hooks/use-selected-space'

type ProjectFormValues = Omit<OrganizationProjectFormValues, 'createdById'>
const projectFormSchema = insertOrganizationProjectSchema.omit({ createdById: true })

interface OrganizationProjectFormProps {
  project?: OrganizationProject
  onSuccess?: () => void
  onCancel?: () => void
}

export function OrganizationProjectForm({ project, onSuccess, onCancel }: OrganizationProjectFormProps) {
  const { selectedSpace } = useSelectedSpace()
  const isEditing = !!project

  const computeDefaultValues = useCallback(
    (): ProjectFormValues => ({
      spaceId: selectedSpace?.id || project?.spaceId || '',
      name: project?.name || '',
      description: project?.description || '',
      color: project?.color || '#10B981',
      icon: project?.icon || 'folder',
      visibility: project?.visibility || 'shared',
    }),
    [project, selectedSpace?.id],
  )

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema) as Resolver<ProjectFormValues>,
    defaultValues: computeDefaultValues(),
  })

  useEffect(() => {
    form.reset(computeDefaultValues())
  }, [computeDefaultValues, form])

  const createMutation = useCreateOrganizationProject()
  const updateMutation = useUpdateOrganizationProject()
  const isLoading = createMutation.isPending || updateMutation.isPending

  async function onSubmit(values: ProjectFormValues) {
    if (!selectedSpace) return

    const data = {
      ...values,
      spaceId: selectedSpace.id,
      description: values.description?.trim() || undefined,
      color: values.color || '#10B981',
      icon: values.icon?.trim() || 'folder',
    }

    if (isEditing && project) {
      await updateMutation.mutateAsync({ id: project.id, data })
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Casa, Trabalho, Estudos..." disabled={isLoading} />
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input {...field} type="color" disabled={isLoading} className="h-10 w-14 p-1" />
                    <Input {...field} disabled={isLoading} placeholder="#10B981" className="font-mono" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ícone</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Folder className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input {...field} placeholder="folder" disabled={isLoading} className="pl-9" />
                  </div>
                </FormControl>
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
                <FormLabel>Projeto pessoal</FormLabel>
                <p className="text-muted-foreground text-xs">Desligado mantém o projeto compartilhado com o espaço.</p>
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
            {isEditing ? 'Atualizar' : 'Criar'} Projeto
          </Button>
        </div>
      </form>
    </Form>
  )
}
