'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { startOfDay } from 'date-fns'
import React, { useCallback } from 'react'
import { type Resolver, useForm, useWatch } from 'react-hook-form'
import type { z } from 'zod'

import { DefaultCategories, type Transaction } from '@/app/db/schemas'
import { insertTransactionSchema } from '@/app/db/schemas/transaction-schema'

import { CategoryIcon, normalizeCategoryName } from '@/components/category-icon'
import { Button, IconButton } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Combobox } from '@/components/ui/combobox'
import { CurrencyInput } from '@/components/ui/currency-input'
import { DatePicker } from '@/components/ui/date-picker'
import { DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SelectionButton } from '@/components/ui/selection-button'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { useCategories } from '@/hooks/use-categories'
import { useReserves } from '@/hooks/use-reserves'
import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useTags } from '@/hooks/use-tags'
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/use-transactions'

import { useSession } from '@/lib/auth-client'
import { readRecentCategories, rememberRecentCategory, sortCategoriesByRecency } from '@/lib/recent-categories'
import { getTransactionFormContextDefaults, type TransactionInitialValues } from '@/lib/transaction-form-utils'

import { useMonthSelectorContext } from '@/providers/month-selector-provider'

type TransactionFormValues = Omit<z.infer<typeof insertTransactionSchema>, 'tags'> & { tags?: string[] }
const EMPTY_TRANSACTIONS: Transaction[] = []
/** Com mais categorias que isso, o campo ganha busca. */
const CATEGORY_SEARCH_THRESHOLD = 8
/** Categorias visíveis antes de "Ver todas" (as recentes vêm primeiro). */
const CATEGORY_COLLAPSED_COUNT = 9

interface TransactionFormProps {
  transaction?: Transaction
  onSuccess?: () => void
  onCancel?: () => void
  mode?: 'create' | 'edit' | 'copy'
  initialValues?: TransactionInitialValues
  /** Transações já carregadas na página para cálculo da data padrão */
  existingTransactions?: Transaction[]
  /**
   * `inline` (padrão): campos e botões no fluxo. `dialog`: o formulário é filho direto do
   * `DialogContent`; os campos rolam no `DialogBody` e os botões ficam fixos no `DialogFooter`.
   */
  layout?: 'inline' | 'dialog'
}

export function TransactionForm({
  transaction,
  onSuccess,
  onCancel,
  mode,
  initialValues,
  existingTransactions = EMPTY_TRANSACTIONS,
  layout = 'inline',
}: TransactionFormProps) {
  const { data: session } = useSession()
  const { selectedSpace } = useSelectedSpace()
  const { monthStartDate, isCurrentMonth } = useMonthSelectorContext()
  // Fixado na montagem: a data padrão não muda com o formulário aberto.
  const [today] = React.useState(() => startOfDay(new Date()))
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
        today,
        isCurrentMonth,
        userId,
        mode: formMode,
      }),
    [
      transaction,
      initialType,
      initialCategory,
      initialDate,
      existingTransactions,
      monthStartDate,
      today,
      isCurrentMonth,
      userId,
      formMode,
    ],
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
  const [categorySearch, setCategorySearch] = React.useState('')
  const [showAllCategories, setShowAllCategories] = React.useState(false)
  // Ao criar: continuar lançando depois de salvar, sem fechar o formulário.
  const [addAnother, setAddAnother] = React.useState(false)
  // Categorias usadas por último neste espaço e tipo, para aparecerem primeiro.
  const [recentCategories, setRecentCategories] = React.useState<string[]>([])
  React.useEffect(() => {
    setRecentCategories(readRecentCategories(selectedSpaceId, currentType))
  }, [selectedSpaceId, currentType])
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

  const selectedCategory = useWatch({ control: form.control, name: 'category' })
  const sortedCategories = sortCategoriesByRecency(availableCategories, recentCategories)
  const hasCategorySearch = availableCategories.length > CATEGORY_SEARCH_THRESHOLD

  // Busca de categoria: ignora acentos e maiúsculas
  const categoryQuery = hasCategorySearch ? normalizeCategoryName(categorySearch.trim()) : ''
  const isCategoryListCollapsed =
    !categoryQuery && !showAllCategories && sortedCategories.length > CATEGORY_COLLAPSED_COUNT + 1
  let visibleCategories = sortedCategories
  if (categoryQuery) {
    visibleCategories = sortedCategories.filter(category => normalizeCategoryName(category).includes(categoryQuery))
  } else if (isCategoryListCollapsed) {
    // Recolhida: as primeiras (recentes na frente) e sempre a selecionada.
    visibleCategories = sortedCategories.slice(0, CATEGORY_COLLAPSED_COUNT)
    if (selectedCategory && !visibleCategories.includes(selectedCategory)) {
      visibleCategories = [...visibleCategories, selectedCategory]
    }
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
      if (formData.category) {
        rememberRecentCategory(selectedSpace.id, formData.type, formData.category)
        setRecentCategories(readRecentCategories(selectedSpace.id, formData.type))
      }
      if (!isEditing && addAnother) {
        // Mantém tipo, data, categoria e reserva; limpa só o que muda a cada lançamento.
        form.reset({ ...values, amount: '', description: '', tags: [] })
        setCategorySearch('')
        form.setFocus('amount')
        return
      }
      form.reset()
      onSuccess?.()
    } catch (error) {
      // O hook de mutation já mostra o toast; aqui o erro fica também abaixo dos campos.
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
  // No dialog, os campos rolam no corpo e os botões ficam fixos no rodapé.
  const Body = layout === 'dialog' ? DialogBody : 'div'
  const Footer = layout === 'dialog' ? DialogFooter : 'div'
  const submitError = createMutation.error?.message || updateMutation.error?.message

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={layout === 'inline' ? 'flex flex-col gap-6' : undefined}>
        <Body className={layout === 'dialog' ? 'gap-6' : 'contents'}>
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
                      <ToggleGroupItem value="entrada" icon="arrow-up-circle" tone="success">
                        Entrada
                      </ToggleGroupItem>
                      <ToggleGroupItem value="saida" icon="arrow-down-circle" tone="error">
                        Saída
                      </ToggleGroupItem>
                      <ToggleGroupItem value="reserva" icon="piggy-bank" tone="info">
                        Reserva
                      </ToggleGroupItem>
                    </ToggleGroup>
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
                      className="max-lg:text-xl max-lg:font-semibold"
                    />
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
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Ex.: Compra no mercado"
                      autoComplete="off"
                      autoCapitalize="sentences"
                      enterKeyHint="next"
                      disabled={isLoading}
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
                    {hasCategorySearch && (
                      <Input
                        type="text"
                        enterKeyHint="search"
                        icon="search"
                        aria-label="Buscar categoria"
                        placeholder="Buscar categoria"
                        autoComplete="off"
                        value={categorySearch}
                        onChange={event => setCategorySearch(event.target.value)}
                        onKeyDown={event => {
                          if (event.key !== 'Enter') return
                          // Enter não envia o formulário; com um só resultado, escolhe-o.
                          event.preventDefault()
                          if (visibleCategories.length === 1) field.onChange(visibleCategories[0])
                        }}
                        disabled={isLoading}
                        className="sm:max-w-80"
                        action={
                          categorySearch ? (
                            <IconButton
                              icon="x"
                              label="Limpar busca"
                              size="sm"
                              onClick={() => setCategorySearch('')}
                              disabled={isLoading}
                            />
                          ) : undefined
                        }
                      />
                    )}
                    {visibleCategories.length === 0 && (
                      <p className="text-muted-foreground text-sm" role="status">
                        Nenhuma categoria encontrada para "{categorySearch.trim()}".
                      </p>
                    )}
                    <div role="group" aria-label="Categoria" className="flex flex-wrap gap-2">
                      {visibleCategories.map((category, index) => {
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
                      {isCategoryListCollapsed && (
                        <Button
                          type="button"
                          variant="ghost"
                          iconRight="chevron-down"
                          onClick={() => setShowAllCategories(true)}
                          disabled={isLoading}>
                          Ver todas
                        </Button>
                      )}
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

          {/* Ao criar: continuar lançando sem fechar */}
          {!isEditing && (
            <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4 text-sm leading-5">
              <span className="flex min-w-0 flex-col">
                <span className="font-medium">Adicionar outra em seguida</span>
                <span className="text-muted-foreground text-[13px] leading-[18px]">
                  Depois de salvar, mantém tipo, data e categoria.
                </span>
              </span>
              <Switch checked={addAnother} onCheckedChange={setAddAnother} disabled={isLoading} />
            </label>
          )}
        </Body>

        {/* Ações */}
        <Footer className={layout === 'inline' ? 'flex flex-wrap justify-end gap-2' : undefined}>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" variant="primary" loading={isLoading}>
            {isLoading ? 'Salvando' : isEditing ? 'Salvar alterações' : 'Salvar transação'}
          </Button>
        </Footer>
      </form>
    </Form>
  )
}
