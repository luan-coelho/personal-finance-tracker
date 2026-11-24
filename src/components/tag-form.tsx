'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

import { insertTagSchema, type Tag } from '@/app/db/schemas/tag-schema'

import { Button } from '@/components/ui/button'
import { DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useCreateTag, useUpdateTag } from '@/hooks/use-tags'

type TagFormValues = z.infer<typeof insertTagSchema>

interface TagFormProps {
  tag?: Tag
  onSuccess?: () => void
  onCancel?: () => void
}

export function TagForm({ tag, onSuccess, onCancel }: TagFormProps) {
  const { selectedSpace } = useSelectedSpace()
  const isEditing = !!tag

  const form = useForm<TagFormValues>({
    resolver: zodResolver(insertTagSchema),
    defaultValues: {
      name: tag?.name || '',
      spaceId: selectedSpace?.id || '',
    },
  })

  const createMutation = useCreateTag()
  const updateMutation = useUpdateTag()
  const isLoading = createMutation.isPending || updateMutation.isPending

  async function onSubmit(values: TagFormValues) {
    if (!selectedSpace) return

    try {
      if (isEditing && tag) {
        await updateMutation.mutateAsync({
          id: tag.id,
          data: values,
        })
      } else {
        await createMutation.mutateAsync({
          ...values,
          spaceId: selectedSpace.id,
        })
      }
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar tag:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogBody className="gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex.: Urgente, Recorrente" disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </DialogBody>

        <DialogFooter>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" variant="primary" loading={isLoading}>
            {isLoading ? 'Salvando' : isEditing ? 'Salvar alterações' : 'Criar tag'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
