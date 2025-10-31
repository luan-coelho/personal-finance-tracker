'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Category, insertCategorySchema } from '@/app/db/schemas/category-schema'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Nome */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Alimentação, Salário..." disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tipo */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo *</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex gap-4"
                  disabled={isLoading || isEditing}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="entrada" id="type-entrada" />
                    <label htmlFor="type-entrada" className="cursor-pointer text-sm leading-none font-medium">
                      💰 Entrada
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="saida" id="type-saida" />
                    <label htmlFor="type-saida" className="cursor-pointer text-sm leading-none font-medium">
                      💸 Saída
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botões */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Atualizar' : 'Criar'} Categoria
          </Button>
        </div>
      </form>
    </Form>
  )
}
