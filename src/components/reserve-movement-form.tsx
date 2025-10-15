'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { ReserveMovementFormValues } from '@/app/db/schemas/reserve-movement-schema'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'

import { useCreateReserveMovement } from '@/hooks/use-reserve-movements'

import { cn } from '@/lib/utils'

interface ReserveMovementFormProps {
  reserveId: string
  spaceId: string
  onSuccess?: () => void
}

const formSchema = z.object({
  type: z.enum(['deposit', 'withdraw']),
  amount: z.string().min(1, 'Valor é obrigatório'),
  date: z.date(),
  description: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export function ReserveMovementForm({ reserveId, spaceId, onSuccess }: ReserveMovementFormProps) {
  const { data: session } = useSession()
  const createMutation = useCreateReserveMovement(spaceId)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'deposit',
      amount: '',
      date: new Date(),
      description: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    if (!session?.user?.id) {
      return
    }

    try {
      const payload: ReserveMovementFormValues = {
        ...data,
        reserveId,
        userId: session.user.id,
      }

      await createMutation.mutateAsync(payload)
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao criar movimentação:', error)
    }
  }

  const isLoading = createMutation.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de Movimentação *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1">
                  <FormItem className="flex items-center space-y-0 space-x-3">
                    <FormControl>
                      <RadioGroupItem value="deposit" />
                    </FormControl>
                    <FormLabel className="font-normal">Depósito (adicionar dinheiro)</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-y-0 space-x-3">
                    <FormControl>
                      <RadioGroupItem value="withdraw" />
                    </FormControl>
                    <FormLabel className="font-normal">Retirada (retirar dinheiro)</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormDescription>Valor da movimentação</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                        {field.value ? (
                          new Intl.DateTimeFormat('pt-BR').format(field.value)
                        ) : (
                          <span>Selecione a data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={date => date > new Date() || date < new Date('1900-01-01')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Data da movimentação</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Adicione uma descrição opcional..." className="resize-none" {...field} />
              </FormControl>
              <FormDescription>Opcional: detalhes sobre a movimentação</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Registrar Movimentação'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
