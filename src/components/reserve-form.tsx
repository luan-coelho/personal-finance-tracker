'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type { Reserve, ReserveFormValues } from '@/app/db/schemas/reserve-schema'

import { ReserveIconTile } from '@/components/reserve-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Icon, type IconName } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { SelectionButton } from '@/components/ui/selection-button'
import { Textarea } from '@/components/ui/textarea'

import { useCreateReserve, useUpdateReserve } from '@/hooks/use-reserves'

import { formatCurrency } from '@/lib/currency'
import { routes } from '@/lib/routes'

const AVAILABLE_ICONS: { value: IconName; label: string }[] = [
  { value: 'piggy-bank', label: 'Porquinho' },
  { value: 'wallet', label: 'Carteira' },
  { value: 'shield', label: 'Escudo' },
  { value: 'plane', label: 'Avião' },
  { value: 'trending-up', label: 'Crescimento' },
  { value: 'shopping-cart', label: 'Compras' },
  { value: 'home', label: 'Casa' },
  { value: 'car', label: 'Carro' },
  { value: 'heart', label: 'Coração' },
  { value: 'gift', label: 'Presente' },
  { value: 'graduation-cap', label: 'Educação' },
  { value: 'briefcase', label: 'Trabalho' },
  { value: 'smartphone', label: 'Celular' },
  { value: 'laptop', label: 'Notebook' },
  { value: 'droplet', label: 'Gota' },
  { value: 'zap', label: 'Energia' },
]

// Valores gravados em `reserves.color` (dado do usuário, aplicado via `style`).
const AVAILABLE_COLORS = [
  { value: '#ef4444', label: 'Vermelho' },
  { value: '#f97316', label: 'Laranja' },
  { value: '#f59e0b', label: 'Amarelo' },
  { value: '#10b981', label: 'Verde' },
  { value: '#3b82f6', label: 'Azul' },
  { value: '#6366f1', label: 'Índigo' },
  { value: '#8b5cf6', label: 'Roxo' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#6b7280', label: 'Cinza' },
]

interface ReserveFormProps {
  spaceId: string
  reserve?: Reserve
  mode: 'create' | 'edit'
}

// Schema específico para o formulário
const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  targetAmount: z.string().optional(),
  color: z.string(),
  icon: z.string(),
})

type FormData = z.infer<typeof formSchema>

const swatchButtonClass = 'h-11! w-full justify-center rounded-control! px-0'

export function ReserveForm({ spaceId, reserve, mode }: ReserveFormProps) {
  const router = useRouter()
  const createMutation = useCreateReserve()
  const updateMutation = useUpdateReserve(reserve?.id || '', spaceId)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: reserve?.name || '',
      description: reserve?.description || '',
      targetAmount: reserve?.targetAmount || '',
      color: reserve?.color || '#3b82f6',
      icon: reserve?.icon || 'piggy-bank',
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const payload: ReserveFormValues = {
        ...data,
        targetAmount: data.targetAmount || undefined,
        currentAmount: reserve?.currentAmount || '0',
        active: reserve?.active ?? true,
        spaceId: spaceId,
      }

      if (mode === 'create') {
        await createMutation.mutateAsync(payload)
      } else if (reserve) {
        await updateMutation.mutateAsync(payload)
      }
      router.push(routes.frontend.admin.reserves.index)
      router.refresh()
    } catch (error) {
      console.error('Erro ao salvar reserva:', error)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending
  const watchedIcon = form.watch('icon')
  const watchedColor = form.watch('color')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-3xl">
        <Card>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <ReserveIconTile icon={watchedIcon} color={watchedColor} size={44} className="mt-[26px]" />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="min-w-0 flex-1">
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex.: Fundo de emergência" autoComplete="off" {...field} />
                    </FormControl>
                    <FormDescription>Como a reserva aparece nas listas e transações</FormDescription>
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
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Para que serve esta reserva" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        prefix="R$"
                        placeholder="0.00"
                        className="tabular-nums"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Valor que você quer alcançar</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {mode === 'edit' && reserve && (
                <FormItem>
                  <FormLabel>Saldo atual</FormLabel>
                  <FormControl>
                    <Input value={formatCurrency(reserve.currentAmount)} className="tabular-nums" readOnly disabled />
                  </FormControl>
                  <FormDescription>Calculado pelas movimentações da reserva</FormDescription>
                </FormItem>
              )}
            </div>

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone</FormLabel>
                  <FormControl>
                    <fieldset aria-label="Ícone" className="grid min-w-0 grid-cols-6 gap-2 sm:grid-cols-8">
                      {AVAILABLE_ICONS.map(option => (
                        <SelectionButton
                          key={option.value}
                          selected={field.value === option.value}
                          aria-label={option.label}
                          title={option.label}
                          className={swatchButtonClass}
                          onClick={() => field.onChange(option.value)}>
                          <Icon name={option.value} size={20} />
                        </SelectionButton>
                      ))}
                    </fieldset>
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
                    <fieldset aria-label="Cor" className="grid min-w-0 grid-cols-6 gap-2 sm:grid-cols-9">
                      {AVAILABLE_COLORS.map(option => (
                        <SelectionButton
                          key={option.value}
                          selected={field.value === option.value}
                          aria-label={option.label}
                          title={option.label}
                          className={swatchButtonClass}
                          onClick={() => field.onChange(option.value)}>
                          <span
                            aria-hidden
                            className="border-border-strong size-5 rounded-full border"
                            style={{ backgroundColor: option.value }}
                          />
                        </SelectionButton>
                      ))}
                    </fieldset>
                  </FormControl>
                  <FormDescription>Tom de fundo do ícone da reserva</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="border-border border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(routes.frontend.admin.reserves.index)}
              disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={isLoading}>
              {isLoading ? 'Salvando' : mode === 'create' ? 'Criar reserva' : 'Salvar alterações'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
