'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import React, { useCallback } from 'react'
import { type Resolver, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

import { DefaultCategories, type Transaction } from '@/app/db/schemas'
import { insertTransactionSchema } from '@/app/db/schemas/transaction-schema'

import { CategoryIcon } from '@/components/category-icon'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Combobox } from '@/components/ui/combobox'
import { CurrencyInput } from '@/components/ui/currency-input'
import { DatePicker } from '@/components/ui/date-picker'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Icon } from '@/components/ui/icon'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SelectionButton } from '@/components/ui/selection-button'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { useCategories } from '@/hooks/use-categories'
import { useReserves } from '@/hooks/use-reserves'
import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useTags } from '@/hooks/use-tags'
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/use-transactions'

import { useSession } from '@/lib/auth-client'
import { getTransactionFormContextDefaults, type TransactionInitialValues } from '@/lib/transaction-form-utils'

import { useMonthSelectorContext } from '@/providers/month-selector-provider'

type TransactionFormValues = Omit<z.infer<typeof insertTransactionSchema>, 'tags'> & { tags?: string[] }
const EMPTY_TRANSACTIONS: Transaction[] = []

interface TransactionFormProps {
  transaction?: Transaction
  onSuccess?: () => void
  onCancel?: () => void
  mode?: 'create' | 'edit' | 'copy'
  initialValues?: TransactionInitialValues
  /** Transações já carregadas na página para cálculo da data padrão */
  existingTransactions?: Transaction[]
}

export function TransactionForm({
  transaction,
  onSuccess,
  onCancel,
  mode,
  initialValues,
  existingTransactions = EMPTY_TRANSACTIONS,
}: TransactionFormProps) {
  const { data: session } = useSession()
  const { selectedSpace } = useSelectedSpace()
  const { monthStartDate } = useMonthSelectorContext()
  const selectedSpaceId = selectedSpace?.id || ''
  const userId = session?.user?.id || ''
  const formMode = mode ?? (transaction ? 'edit' : 'create')
  const isEditing = formMode === 'edit'
  const initialType = initialValues?.type
  const initialCategory = initialValues?.category
  const initialDate = initialValues?.date
  const contextDefaults = React.useMemo(
    () =>
      getTransactionFormContextDefaults({
        transaction,
        initialValues: { type: initialType, category: initialCategory, date: initialDate },
        existingTransactions,
        monthStartDate,
        userId,
        mode: formMode,
      }),
    [transaction, initialType, initialCategory, initialDate, existingTransactions, monthStartDate, userId, formMode],
  )

  // Buscar tags cadastradas no espaço
  const { data: existingTagsData = [] } = useTags(selectedSpaceId)
  const existingTags = existingTagsData.map(tag => tag.name)

  // Formulário react-hook-form
  const computeDefaultValues = useCallback((): TransactionFormValues => {
    return {
      type: contextDefaults.type,
      amount: transaction?.amount
        ? Number(transaction.amount).toLocaleString('pt-BR', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : '',
      date: contextDefaults.date,
      description: transaction?.description || '',
      category: contextDefaults.category,
      reserveId: transaction?.reserveId || undefined,
      tags: Array.isArray(transaction?.tags) ? transaction.tags : [],
      spaceId: selectedSpaceId,
      userId: contextDefaults.userId,
    }
  }, [selectedSpaceId, transaction, contextDefaults])

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(insertTransactionSchema) as Resolver<TransactionFormValues>,
    defaultValues: computeDefaultValues(),
  })

  React.useEffect(() => {
    form.reset(computeDefaultValues())
  }, [computeDefaultValues, form])

  // Buscar categorias do espaço baseado no tipo selecionado
  const currentType = useWatch({ control: form.control, name: 'type' })
  const { data: customCategories = [] } = useCategories(
    selectedSpaceId,
    currentType === 'reserva' ? undefined : currentType,
  )

  // Buscar reservas ativas do espaço
  const { data: allReserves = [] } = useReserves(selectedSpaceId)
  const activeReserves = allReserves.filter(r => r.active)

  // Mutations
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const isLoading = createMutation.isPending || updateMutation.isPending

  // Combinar categorias: customCategories + DefaultCategories (fallback)
  const defaultCats = DefaultCategories[currentType as keyof typeof DefaultCategories] || []
  const categoryNames = customCategories.map(c => c.name)
  const availableCategories: string[] = [...(categoryNames.length > 0 ? categoryNames : defaultCats)]
  const contextCategory = currentType === contextDefaults.type ? contextDefaults.category : undefined
  if (contextCategory && !availableCategories.includes(contextCategory)) {
    availableCategories.push(contextCategory)
  }

  // Máscara de real para o campo amount: o CurrencyInput já entrega o valor mascarado
  // por formatBrazilianAmountInput.
  function handleAmountChange(maskedValue: string) {
    form.setValue('amount', maskedValue)
  }

  // Submit
  async function onSubmit(values: TransactionFormValues) {
    if (!selectedSpace || !session?.user?.id) return
    try {
      // O valor já foi normalizado pelo Zod transform (ex: "8,88" → "8.88")
      const formData = {
        type: values.type,
        amount: values.amount || '',
        date: values.date,
        description: values.description,
        category: values.type !== 'reserva' ? values.category : undefined,
        reserveId: values.type === 'reserva' ? values.reserveId : undefined,
        tags: Array.isArray(values.tags) ? values.tags : [],
        spaceId: selectedSpace.id,
        userId: contextDefaults.userId,
      }
      if (isEditing && transaction) {
        await updateMutation.mutateAsync({
          id: transaction.id,
          data: { ...formData, id: transaction.id },
        })
      } else {
        await createMutation.mutateAsync(formData)
      }
      form.reset()
      onSuccess?.()
    } catch (error) {
      toast.error('Não foi possível salvar a transação. Verifique a conexão e tente novamente.', {
        duration: Infinity,
        closeButton: true,
      })
      console.error('Erro ao salvar transação:', error)
    }
  }

  if (!selectedSpace || !session?.user?.id) {
    return null // ou um loader/spinner se preferir
  }

  if (!selectedSpace) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum espaço selecionado</CardTitle>
          <CardDescription>Selecione um espaço para criar transações.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const tagOptions = existingTags.map(tag => ({ value: tag, label: tag }))
  const submitError = createMutation.error?.message || updateMutation.error?.message

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Tipo de transação */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Tipo</FormLabel>
                <FormControl>
                  <ToggleGroup
                    type="single"
                    fullWidth
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                    aria-label="Tipo de transação">
                    <ToggleGroupItem value="entrada" icon="arrow-up-circle">
                      Entrada
                    </ToggleGroupItem>
                    <ToggleGroupItem value="saida" icon="arrow-down-circle">
                      Saída
                    </ToggleGroupItem>
                    <ToggleGroupItem value="reserva" icon="piggy-bank">
                      Reserva
                    </ToggleGroupItem>
                  </ToggleGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Descrição */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Ex.: Compra no mercado"
                    className="resize-none"
                    rows={3}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Valor */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <CurrencyInput
                    ref={field.ref}
                    name={field.name}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={handleAmountChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Data */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value}
                    onSelect={field.onChange}
                    placeholder="Selecione uma data"
                    disabled={isLoading}
                    defaultMonth={monthStartDate}
                    showNavigation
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Categoria - apenas para entrada e saída */}
          {currentType !== 'reserva' && (
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Categoria</FormLabel>
                  <div role="group" aria-label="Categoria" className="flex flex-wrap gap-2">
                    {availableCategories.map((category, index) => {
                      const button = (
                        <SelectionButton
                          key={category}
                          ref={index === 0 ? field.ref : undefined}
                          aria-label={category}
                          selected={field.value === category}
                          onClick={() => field.onChange(category)}
                          onBlur={field.onBlur}
                          disabled={isLoading}>
                          <CategoryIcon name={category} size={18} />
                          <span>{category}</span>
                        </SelectionButton>
                      )

                      return index === 0 ? <FormControl key={category}>{button}</FormControl> : button
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Reserva - apenas para tipo reserva */}
          {currentType === 'reserva' && (
            <FormField
              control={form.control}
              name="reserveId"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Reserva</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma reserva" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeReserves.length === 0 ? (
                        <div className="text-muted-foreground px-3 py-2 text-sm">Nenhuma reserva ativa</div>
                      ) : (
                        activeReserves.map(reserve => (
                          <SelectItem key={reserve.id} value={reserve.id}>
                            {reserve.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Tags - seleção apenas das cadastradas */}
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Tags (opcional)</FormLabel>
                {existingTags.length === 0 ? (
                  <FormDescription>Nenhuma tag cadastrada. Cadastre tags na página de tags.</FormDescription>
                ) : (
                  <FormControl>
                    <Combobox
                      multiple
                      options={tagOptions}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      placeholder="Selecione as tags"
                      searchPlaceholder="Buscar tag"
                      emptyText="Nenhuma tag encontrada"
                      disabled={isLoading}
                    />
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Erro global */}
        {submitError && (
          <p role="alert" className="text-error-text flex items-start gap-1.5 text-[13px]/[18px]">
            <Icon name="alert-circle" size={14} className="mt-0.5" />
            <span className="min-w-0">{submitError}</span>
          </p>
        )}

        {/* Ações */}
        <div className="flex flex-wrap justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" variant="primary" loading={isLoading}>
            {isLoading ? 'Salvando' : isEditing ? 'Salvar alterações' : 'Salvar transação'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
