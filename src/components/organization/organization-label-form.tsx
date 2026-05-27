'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'

import {
  insertOrganizationLabelSchema,
  type OrganizationLabel,
  type OrganizationLabelFormValues,
} from '@/app/db/schemas/organization-label-schema'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useCreateOrganizationLabel, useUpdateOrganizationLabel } from '@/hooks/use-organization-labels'
import { useSelectedSpace } from '@/hooks/use-selected-space'

interface OrganizationLabelFormProps {
  label?: OrganizationLabel
  onSuccess?: () => void
  onCancel?: () => void
}

export function OrganizationLabelForm({ label, onSuccess, onCancel }: OrganizationLabelFormProps) {
  const { selectedSpace } = useSelectedSpace()
  const isEditing = !!label

  const computeDefaultValues = useCallback(
    (): OrganizationLabelFormValues => ({
      spaceId: selectedSpace?.id || label?.spaceId || '',
      name: label?.name || '',
      color: label?.color || '#64748B',
    }),
    [label, selectedSpace?.id],
  )

  const form = useForm<OrganizationLabelFormValues>({
    resolver: zodResolver(insertOrganizationLabelSchema) as Resolver<OrganizationLabelFormValues>,
    defaultValues: computeDefaultValues(),
  })

  useEffect(() => {
    form.reset(computeDefaultValues())
  }, [computeDefaultValues, form])

  const createMutation = useCreateOrganizationLabel()
  const updateMutation = useUpdateOrganizationLabel()
  const isLoading = createMutation.isPending || updateMutation.isPending

  async function onSubmit(values: OrganizationLabelFormValues) {
    if (!selectedSpace) return

    const data = {
      ...values,
      spaceId: selectedSpace.id,
      color: values.color || '#64748B',
    }

    if (isEditing && label) {
      await updateMutation.mutateAsync({ id: label.id, data })
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
                <Input {...field} placeholder="Ex: Urgente, Rotina, Ideia..." disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input {...field} type="color" disabled={isLoading} className="h-10 w-14 p-1" />
                  <Input {...field} disabled={isLoading} placeholder="#64748B" className="font-mono" />
                </div>
              </FormControl>
              <FormMessage />
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
            {isEditing ? 'Atualizar' : 'Criar'} Etiqueta
          </Button>
        </div>
      </form>
    </Form>
  )
}
