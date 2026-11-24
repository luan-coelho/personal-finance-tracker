'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

import { type Category, insertCategorySchema } from '@/app/db/schemas/category-schema'

import { Button } from '@/components/ui/button'
import { DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { useCreateCategory, useUpdateCategory } from '@/hooks/use-categories'
import { useSelectedSpace } from '@/hooks/use-selected-space'

type CategoryFormValues = z.infer<typeof insertCategorySchema>

interface CategoryFormProps {
  category?: Category
  onSuccess?: () => void
  onCancel?: () => void
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const { selectedSpace } = useSelectedSpace()
  const isEditing = !!category

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: category?.name || '',
      type: category?.type || 'saida',
      spaceId: selectedSpace?.id || '',
    },
  })

  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const isLoading = createMutation.isPending || updateMutation.isPending

  async function onSubmit(values: CategoryFormValues) {
    if (!selectedSpace) return

    try {
      if (isEditing && category) {
        await updateMutation.mutateAsync({
          id: category.id,
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
      console.error('Erro ao salvar categoria:', error)
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
                  <Input {...field} placeholder="Ex.: Alimentação, Salário" disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <FormControl>
                  <ToggleGroup
                    type="single"
                    fullWidth
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading || isEditing}
                    aria-label="Tipo da categoria">
                    <ToggleGroupItem value="entrada" icon="arrow-up-circle" tone="success">
                      Entrada
                    </ToggleGroupItem>
                    <ToggleGroupItem value="saida" icon="arrow-down-circle" tone="error">
                      Saída
                    </ToggleGroupItem>
                  </ToggleGroup>
                </FormControl>
                {isEditing && <FormDescription>O tipo não pode ser alterado depois da criação.</FormDescription>}
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
            {isLoading ? 'Salvando' : isEditing ? 'Salvar alterações' : 'Criar categoria'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
