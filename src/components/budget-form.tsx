'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { type Budget, type CreateBudgetFormValues, createBudgetSchema } from '@/app/db/schemas/budget-schema'

import { getCategoryIconName } from '@/components/category-icon'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CardContent, CardFooter } from '@/components/ui/card'
import { Combobox } from '@/components/ui/combobox'
import { CurrencyInput } from '@/components/ui/currency-input'
import { DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useCreateBudget, useUpdateBudget } from '@/hooks/use-budgets'
import { useCategories } from '@/hooks/use-categories'
import { useSelectedSpace } from '@/hooks/use-selected-space'

import { useMonthSelectorContext } from '@/providers/month-selector-provider'

const CUSTOM_CATEGORY = '__custom__'

interface BudgetFormProps {
  budget?: Budget
  onSuccess?: () => void
  /** Mostra "Cancelar" no rodapé. */
  onCancel?: () => void
  /**
   * `card` (padrão): campos em `CardContent` e ações em `CardFooter`, para usar dentro de um `Card`.
   * `dialog`: campos em `DialogBody` e ações em `DialogFooter`, para usar dentro de um `DialogContent`.
   */
  layout?: 'card' | 'dialog'
}

export function BudgetForm({ budget, onSuccess, onCancel, layout = 'card' }: BudgetFormProps) {
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

  const categoryOptions = [
    ...categories.map(category => ({
      value: category.name,
      label: category.name,
      icon: getCategoryIconName(category.name),
    })),
    { value: CUSTOM_CATEGORY, label: 'Nova categoria', icon: 'plus' as const },
  ]

  const Body = layout === 'dialog' ? DialogBody : CardContent
  const Footer = layout === 'dialog' ? DialogFooter : CardFooter

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={layout === 'card' ? 'flex flex-col gap-(--card-gap)' : undefined}>
        <Body className="flex flex-col gap-4">
          {/* Exibir mês selecionado */}
          {!isEditing && (
            <Alert tone="info" icon="calendar">
              <AlertDescription>
                Orçamento para <strong className="font-semibold">{monthDisplay}</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Categoria */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                {!customCategory && categories.length > 0 ? (
                  <FormControl>
                    <Combobox
                      options={categoryOptions}
                      value={field.value}
                      onChange={value => {
                        if (value === CUSTOM_CATEGORY) {
                          setCustomCategory(true)
                          field.onChange('')
                        } else {
                          field.onChange(value)
                        }
                      }}
                      disabled={isLoading}
                      placeholder="Selecione a categoria"
                      searchPlaceholder="Buscar categoria"
                      emptyText="Nenhuma categoria encontrada"
                    />
                  </FormControl>
                ) : (
                  <>
                    <FormControl>
                      <Input
                        placeholder="Nome da categoria, como Mercado"
                        {...field}
                        maxLength={255}
                        disabled={isLoading}
                      />
                    </FormControl>
                    {categories.length > 0 && (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="self-start"
                        onClick={() => {
                          setCustomCategory(false)
                          field.onChange('')
                        }}>
                        Escolher categoria existente
                      </Button>
                    )}
                  </>
                )}
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
                <FormLabel>Limite mensal</FormLabel>
                <FormControl>
                  <CurrencyInput {...field} value={String(field.value ?? '')} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo oculto para month - será preenchido automaticamente */}
          <input type="hidden" {...form.register('month')} />
        </Body>

        <Footer className={layout === 'card' ? 'border-border border-t' : undefined}>
          {onCancel && (
            <Button type="button" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" variant="primary" loading={isLoading}>
            {isLoading ? 'Salvando' : isEditing ? 'Salvar alterações' : 'Criar orçamento'}
          </Button>
        </Footer>
      </form>
    </Form>
  )
}
