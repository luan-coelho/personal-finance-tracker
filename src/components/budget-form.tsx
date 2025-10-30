'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Budget, BudgetFormValues, insertBudgetSchema } from '@/app/db/schemas/budget-schema'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useCreateBudget, useUpdateBudget } from '@/hooks/use-budgets'
import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useTransactionCategories } from '@/hooks/use-transactions'

interface BudgetFormProps {
  budget?: Budget
  defaultMonth?: string
  onSuccess?: () => void
}

export function BudgetForm({ budget, defaultMonth, onSuccess }: BudgetFormProps) {
  const { selectedSpace } = useSelectedSpace()
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const [customCategory, setCustomCategory] = useState(false)

  // Buscar categorias existentes para sugestões
  const { data: existingCategories = [] } = useTransactionCategories(selectedSpace?.id || '')

  const isEditing = !!budget

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(insertBudgetSchema),
    defaultValues: {
      spaceId: selectedSpace?.id || '',
      category: budget?.category || '',
      amount: budget ? Number(budget.amount) : 0,
      month: budget?.month || defaultMonth || '',
      createdById: '', // Será preenchido pela API
    },
  })

  // Atualizar spaceId quando selectedSpace mudar
  useEffect(() => {
    if (selectedSpace?.id) {
      form.setValue('spaceId', selectedSpace.id)
    }
  }, [selectedSpace?.id, form])

  function handleSubmit(values: BudgetFormValues) {
    if (isEditing) {
      updateBudget.mutate(
        { id: budget.id, data: values },
        {
          onSuccess: () => {
            onSuccess?.()
          },
        },
      )
    } else {
      createBudget.mutate(values, {
        onSuccess: () => {
          form.reset()
          onSuccess?.()
        },
      })
    }
  }

  const isLoading = createBudget.isPending || updateBudget.isPending

  // Gerar opções de mês (12 meses para frente e 12 para trás)
  const monthOptions = Array.from({ length: 25 }, (_, i) => {
    const currentDate = new Date()
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 12 + i, 1)
    const year = targetDate.getFullYear()
    const month = String(targetDate.getMonth() + 1).padStart(2, '0')
    const value = `${year}-${month}`
    const label = targetDate.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })
    return { value, label }
  })

  // Remover duplicatas usando Map para garantir chaves únicas
  const uniqueMonthOptions = Array.from(new Map(monthOptions.map(option => [option.value, option])).values())

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Categoria */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <FormControl>
                  {!customCategory && existingCategories.length > 0 ? (
                    <div className="space-y-2">
                      <Select
                        value={field.value}
                        onValueChange={value => {
                          if (value === '__custom__') {
                            setCustomCategory(true)
                            field.onChange('')
                          } else {
                            field.onChange(value)
                          }
                        }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {existingCategories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                          <SelectItem value="__custom__">+ Nova categoria</SelectItem>
                        </SelectContent>
                      </Select>
                      {field.value && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCustomCategory(true)
                            field.onChange('')
                          }}
                          className="h-8 text-xs">
                          Criar nova categoria
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Input placeholder="Digite o nome da categoria" {...field} maxLength={255} />
                      {existingCategories.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCustomCategory(false)
                            field.onChange('')
                          }}
                          className="h-8 text-xs">
                          Escolher categoria existente
                        </Button>
                      )}
                    </div>
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Valor do Orçamento */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Limite do Orçamento (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Mês */}
        <FormField
          control={form.control}
          name="month"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mês de Referência</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueMonthOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botões */}
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : isEditing ? 'Atualizar Orçamento' : 'Criar Orçamento'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
