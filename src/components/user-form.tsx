'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { insertUserSchema, type User, type UserFormValues } from '@/app/db/schemas/user-schema'

import { Button } from '@/components/ui/button'
import { DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

import { useCreateUser, useUpdateUser } from '@/hooks/use-users'

interface UserFormProps {
  user?: User
  onSuccess?: () => void
  onCancel?: () => void
}

/** Corpo e rodapé do dialog de usuário: renderize dentro de `DialogContent`, depois do `DialogHeader`. */
export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const isEditing = !!user
  const form = useForm<UserFormValues>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      active: user?.active ?? true,
    },
  })

  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()

  const isLoading = createMutation.isPending || updateMutation.isPending

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        active: user.active,
      })
    }
  }, [user, form])

  async function onSubmit(values: UserFormValues) {
    try {
      if (isEditing && user) {
        await updateMutation.mutateAsync({
          id: user.id,
          data: values,
        })
      } else {
        await createMutation.mutateAsync(values)
      }

      form.reset()
      onSuccess?.()
    } catch (error) {
      toast.error('Erro ao salvar usuário')
      console.error('Erro ao salvar usuário:', error)
    }
  }

  const mutationError = createMutation.error?.message || updateMutation.error?.message

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogBody className="gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input placeholder="Ex.: Ana Souza" autoComplete="name" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    icon="mail"
                    placeholder="nome@exemplo.com.br"
                    autoComplete="email"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="border-border rounded-control flex-row items-center justify-between gap-4 border p-4">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <FormLabel>Usuário ativo</FormLabel>
                  <FormDescription>Usuários inativos não conseguem entrar no sistema.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                </FormControl>
              </FormItem>
            )}
          />

          {mutationError && <p className="text-error-text text-[13px]/[18px]">{mutationError}</p>}
        </DialogBody>

        <DialogFooter>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}

          <Button type="submit" variant="primary" loading={isLoading}>
            {isLoading ? 'Salvando' : isEditing ? 'Salvar alterações' : 'Criar usuário'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
