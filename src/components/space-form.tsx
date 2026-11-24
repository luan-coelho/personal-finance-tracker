'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import type { Space } from '@/app/db/schemas/space-schema'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { useCreateSpace, useUpdateSpace } from '@/hooks/use-spaces'

import { useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

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
  className?: string
}

/** Formulário de espaço já dentro do seu `Card` (máx. 768px), com ações no rodapé. */
export function SpaceForm({ space, onSuccess, onCancel, className }: SpaceFormProps) {
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

  const mutationError = createMutation.error?.message || updateMutation.error?.message

  return (
    <Form {...form}>
      <Card asChild className={cn('w-full max-w-3xl', className)}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Dados do espaço</CardTitle>
            <CardDescription>O nome aparece no seletor de espaço e nos relatórios.</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Casa, Trabalho, Empresa" {...field} disabled={isLoading} />
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
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Para que serve este espaço"
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

            {mutationError && <p className="text-error-text text-[13px]/[18px]">{mutationError}</p>}
          </CardContent>

          <CardFooter className="border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancelar
              </Button>
            )}

            <Button type="submit" variant="primary" loading={isLoading}>
              {isLoading ? 'Salvando' : isEditing ? 'Salvar alterações' : 'Criar espaço'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Form>
  )
}
