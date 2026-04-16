'use client'

import { useMonthSelectorContext } from '@/providers/month-selector-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Budget, CreateBudgetFormValues, createBudgetSchema } from '@/app/db/schemas/budget-schema'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useCreateBudget, useUpdateBudget } from '@/hooks/use-budgets'
import { useCategories } from '@/hooks/use-categories'
import { useSelectedSpace } from '@/hooks/use-selected-space'

interface BudgetFormProps {
  budget?: Budget
  onSuccess?: () => void
}

export function BudgetForm({ budget, onSuccess }: BudgetFormProps) {
  const { selectedSpace } = useSelectedSpace()
  const monthSelector = useMonthSelectorContext()
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const [customCategory, setCustomCategory] = useState(false)

  // Buscar categorias de saída cadastradas no sistema
  const { data: categories = [] } = useCategories(selectedSpace?.id || '', 'saida')

  const isEditing = !!budget

  // Gerar string do mês atual selecionado no contexto
  const currentMonthString = `${monthSelector.selectedYear}-${String(monthSelector.selectedMonth + 1).padStart(2, '0')}`

  const form = useForm<CreateBudgetFormValues>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      spaceId: selectedSpace?.id || '',
      category: budget?.category || '',
      amount: budget
        ? Number(budget.amount).toLocaleString('pt-BR', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : '',
      month: budget?.month || currentMonthString,
    },
  })

  // Atualizar spaceId quando selectedSpace mudar
  useEffect(() => {
    if (selectedSpace?.id) {
      form.setValue('spaceId', selectedSpace.id)
    }
  }, [selectedSpace?.id, form])

  // Atualizar month quando o mês selecionado mudar (apenas em criação)
  useEffect(() => {
    if (!isEditing) {
      form.setValue('month', currentMonthString)
    }
  }, [currentMonthString, isEditing, form])

  // Máscara de real para o campo amount
  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    const onlyDigits = raw.replace(/\D/g, '')
    const number = Number(onlyDigits) / 100
    form.setValue(
      'amount',
      number === 0
        ? ''
        : number.toLocaleString('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    )
  }

  function handleSubmit(values: CreateBudgetFormValues) {
    // Converter valor formatado para número
    const numericAmount =
      typeof values.amount === 'string' ? Number(values.amount.replace(/\./g, '').replace(',', '.')) : values.amount

    if (isEditing) {
      // Para edição, enviar apenas os campos editáveis
      const updateData = {
        category: values.category,
        amount: numericAmount,
        month: values.month,
      }

      updateBudget.mutate(
        { id: budget.id, data: updateData },
        {
          onSuccess: () => {
            onSuccess?.()
          },
        },
      )
    } else {
      // Para criação, enviar todos os campos
      const createData = {
        spaceId: values.spaceId,
        category: values.category,
        amount: numericAmount,
        month: values.month,
      }

      createBudget.mutate(createData, {
        onSuccess: () => {
          form.reset()
          onSuccess?.()
        },
      })
    }
  }

  const isLoading = createBudget.isPending || updateBudget.isPending

  // Formatar o nome do mês para exibição
  const monthDisplay = new Date(monthSelector.selectedYear, monthSelector.selectedMonth).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Exibir mês selecionado */}
        {!isEditing && (
          <div className="bg-muted rounded-lg p-4">
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Criando orçamento para <strong className="text-foreground">{monthDisplay}</strong>
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-1">
          {/* Categoria */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <FormControl>
                  {!customCategory && categories.length > 0 ? (
                    <div>
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
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="__custom__">+ Nova categoria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Input placeholder="Digite o nome da categoria" {...field} maxLength={255} />
                      {categories.length > 0 && (
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
                <FormLabel>Limite do Orçamento</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transform">R$</span>
                    <Input
                      {...field}
                      value={field.value}
                      onChange={handleAmountChange}
                      placeholder="0,00"
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Campo oculto para month - será preenchido automaticamente */}
        <input type="hidden" {...form.register('month')} />

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
