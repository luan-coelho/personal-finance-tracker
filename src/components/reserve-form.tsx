'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import * as LucideIcons from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Reserve, ReserveFormValues } from '@/app/db/schemas/reserve-schema'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { useCreateReserve, useUpdateReserve } from '@/hooks/use-reserves'

import { routes } from '@/lib/routes'

const AVAILABLE_ICONS = [
  { value: 'piggy-bank', label: 'Porquinho', icon: LucideIcons.PiggyBank },
  { value: 'wallet', label: 'Carteira', icon: LucideIcons.Wallet },
  { value: 'shield', label: 'Escudo', icon: LucideIcons.Shield },
  { value: 'plane', label: 'Avião', icon: LucideIcons.Plane },
  { value: 'trending-up', label: 'Crescimento', icon: LucideIcons.TrendingUp },
  { value: 'shopping-cart', label: 'Compras', icon: LucideIcons.ShoppingCart },
  { value: 'home', label: 'Casa', icon: LucideIcons.Home },
  { value: 'car', label: 'Carro', icon: LucideIcons.Car },
  { value: 'heart', label: 'Coração', icon: LucideIcons.Heart },
  { value: 'gift', label: 'Presente', icon: LucideIcons.Gift },
  { value: 'graduation-cap', label: 'Educação', icon: LucideIcons.GraduationCap },
  { value: 'briefcase', label: 'Trabalho', icon: LucideIcons.Briefcase },
  { value: 'smartphone', label: 'Celular', icon: LucideIcons.Smartphone },
  { value: 'laptop', label: 'Notebook', icon: LucideIcons.Laptop },
  { value: 'droplet', label: 'Gota', icon: LucideIcons.Droplet },
  { value: 'zap', label: 'Energia', icon: LucideIcons.Zap },
]

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

  const selectedIcon = AVAILABLE_ICONS.find(i => i.value === form.watch('icon'))
  const IconComponent = selectedIcon?.icon || LucideIcons.PiggyBank

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Reserva *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Fundo de Emergência" {...field} />
              </FormControl>
              <FormDescription>Nome para identificar sua reserva</FormDescription>
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
                <Textarea placeholder="Descreva o objetivo desta reserva..." className="resize-none" {...field} />
              </FormControl>
              <FormDescription>Opcional: adicione mais detalhes sobre a reserva</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="targetAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormDescription>Opcional: valor que deseja alcançar</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {mode === 'edit' && reserve && (
            <FormItem>
              <FormLabel>Saldo Atual (R$)</FormLabel>
              <FormControl>
                <Input value={reserve.currentAmount} disabled />
              </FormControl>
              <FormDescription>Calculado automaticamente</FormDescription>
            </FormItem>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ícone</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um ícone">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span>{selectedIcon?.label}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AVAILABLE_ICONS.map(icon => {
                      const Icon = icon.icon
                      return (
                        <SelectItem key={icon.value} value={icon.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{icon.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <FormDescription>Ícone para identificar visualmente</FormDescription>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma cor">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: field.value }} />
                          <span>{AVAILABLE_COLORS.find(c => c.value === field.value)?.label}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AVAILABLE_COLORS.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color.value }} />
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Cor para destacar a reserva</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(routes.frontend.admin.reserves.index)}
            disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar Reserva' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
