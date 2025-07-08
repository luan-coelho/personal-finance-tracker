'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Space } from '@/app/db/schemas/space-schema'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { useCreateSpace, useUpdateSpace } from '@/hooks/use-spaces'

// Schema específico para o formulário (sem ownerId)
const spaceFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
})

type SpaceFormData = z.infer<typeof spaceFormSchema>

interface SpaceFormProps {
  space?: Space
  onSuccess?: () => void
  onCancel?: () => void
}

export function SpaceForm({ space, onSuccess, onCancel }: SpaceFormProps) {
  const { data: session } = useSession()
  const isEditing = !!space
  const form = useForm<SpaceFormData>({
    resolver: zodResolver(spaceFormSchema),
    defaultValues: {
      name: space?.name || '',
      description: space?.description || '',
    },
  })

  const createMutation = useCreateSpace()
  const updateMutation = useUpdateSpace()

  const isLoading = createMutation.isPending || updateMutation.isPending

  // Reset form when space changes
  useEffect(() => {
    if (space) {
      form.reset({
        name: space.name,
        description: space.description || '',
      })
    }
  }, [space, form])

  async function onSubmit(values: SpaceFormData) {
    try {
      if (isEditing && space) {
        await updateMutation.mutateAsync({
          id: space.id,
          data: values,
        })
      } else {
        if (!session?.user?.id) {
          toast.error('Usuário não autenticado')
          return
        }

        await createMutation.mutateAsync({
          ...values,
          ownerId: session.user.id,
        })
      }

      form.reset()
      onSuccess?.()
    } catch (error) {
      toast.error('Erro ao salvar espaço')
      console.error('Erro ao salvar espaço:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Espaço</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Casa, Trabalho, Empresa" {...field} disabled={isLoading} />
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
                <Textarea
                  placeholder="Descreva o propósito deste espaço financeiro..."
                  className="resize-none"
                  rows={3}
                  {...field}
                  disabled={isLoading}
                />
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

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Atualizar' : 'Criar'} Espaço
          </Button>
        </div>

        {(createMutation.error || updateMutation.error) && (
          <div className="text-destructive text-sm">
            {createMutation.error?.message || updateMutation.error?.message}
          </div>
        )}
      </form>
    </Form>
  )
}
