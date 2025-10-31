'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDownCircle, ArrowUpCircle, Edit2, Loader2, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { DefaultCategories, Transaction } from '@/app/db/schemas'
import { insertTransactionSchema } from '@/app/db/schemas/transaction-schema'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { useCategories } from '@/hooks/use-categories'
import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useTags } from '@/hooks/use-tags'
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/use-transactions'

type TransactionFormValues = Omit<z.infer<typeof insertTransactionSchema>, 'tags'> & { tags?: string[] }

interface TransactionFormProps {
  transaction?: Transaction
  onSuccess?: () => void
  onCancel?: () => void
}

export function TransactionForm({ transaction, onSuccess, onCancel }: TransactionFormProps) {
  const { data: session } = useSession()
  const { selectedSpace } = useSelectedSpace()

  if (!selectedSpace || !session?.user?.id) {
    return null // ou um loader/spinner se preferir
  }

  const isEditing = !!transaction

  // Buscar tags cadastradas no espaço
  const { data: existingTagsData = [] } = useTags(selectedSpace.id)
  const existingTags = existingTagsData.map(tag => tag.name)

  // Formulário react-hook-form
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(insertTransactionSchema),
    defaultValues: {
      type: transaction?.type || 'saida',
      amount: transaction?.amount
        ? Number(transaction.amount).toLocaleString('pt-BR', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : '',
      date: transaction?.date ? new Date(transaction.date) : new Date(),
      description: transaction?.description || '',
      category: transaction?.category || '',
      tags: Array.isArray(transaction?.tags) ? transaction.tags : [],
      spaceId: selectedSpace.id,
      userId: session.user.id,
    },
  })

  // Buscar categorias do espaço baseado no tipo selecionado
  const currentType = form.watch('type')
  const { data: customCategories = [] } = useCategories(selectedSpace.id, currentType)

  // Mutations
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const isLoading = createMutation.isPending || updateMutation.isPending

  // Combinar categorias: customCategories + DefaultCategories (fallback)
  const defaultCats = DefaultCategories[currentType as keyof typeof DefaultCategories] || []
  const categoryNames = customCategories.map(c => c.name)
  const availableCategories = categoryNames.length > 0 ? categoryNames : defaultCats

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

  // Submit
  async function onSubmit(values: TransactionFormValues) {
    if (!selectedSpace || !session?.user?.id) return
    try {
      const numericAmount = values.amount ? String(Number(values.amount.replace(/\./g, '').replace(',', '.'))) : ''
      const formData = {
        type: values.type,
        amount: numericAmount,
        date: values.date,
        description: values.description,
        category: values.category,
        tags: Array.isArray(values.tags) ? values.tags : [],
        spaceId: selectedSpace.id,
        userId: session.user.id,
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
      toast.error('Erro ao salvar transação')
      console.error('Erro ao salvar transação:', error)
    }
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-h-[80vh] space-y-6 overflow-y-auto pr-2">
        {/* Tipo de Transação */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Transação</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="mt-2 flex gap-6"
                  disabled={isLoading}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="entrada" id="entrada" />
                    <label
                      htmlFor="entrada"
                      className="flex items-center gap-1 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      <ArrowDownCircle className="h-4 w-4 text-green-600" aria-label="Entrada" /> Entrada
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="saida" id="saida" />
                    <label
                      htmlFor="saida"
                      className="flex items-center gap-1 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      <ArrowUpCircle className="h-4 w-4 text-red-600" aria-label="Saída" /> Saída
                    </label>
                  </div>
                </RadioGroup>
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
              <FormLabel>Descrição *</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Descreva a transação..."
                  className="resize-none"
                  rows={3}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Grid para Valor, Data e Categoria */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Valor */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transform">R$</span>
                    <Input
                      {...field}
                      placeholder="0,00"
                      className="h-9 pl-10"
                      inputMode="decimal"
                      pattern="[0-9,.]*"
                      autoComplete="off"
                      onChange={handleAmountChange}
                      disabled={isLoading}
                    />
                  </div>
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
                <FormLabel>Data *</FormLabel>
                <FormControl>
                  <DatePicker
                    className="h-9 w-full"
                    date={field.value}
                    onSelect={field.onChange}
                    placeholder="Selecione uma data"
                    disabled={isLoading}
                    error={form.formState.errors.date}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Categoria */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat: string) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags - Seleção apenas das cadastradas */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => {
            const currentTags = field.value ?? []
            const toggleTag = (tag: string) => {
              if (currentTags.includes(tag)) {
                field.onChange(currentTags.filter((t: string) => t !== tag))
              } else {
                field.onChange([...currentTags, tag])
              }
            }
            return (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {existingTags.length === 0 ? (
                      <span className="text-muted-foreground text-xs">
                        Nenhuma tag cadastrada. Cadastre tags na página de tags.
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {existingTags.map((tag: string) => {
                          const selected = currentTags.includes(tag)
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-secondary-foreground border-secondary'}`}
                              disabled={isLoading}>
                              {selected ? <X className="mr-1 h-3 w-3" /> : '+'}
                              {tag}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        {/* Botões */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Atualizar' : 'Criar'} Transação
          </Button>
        </div>
        {/* Erro global */}
        {(createMutation.error || updateMutation.error) && (
          <div className="text-destructive mt-2 text-sm">
            {createMutation.error?.message || updateMutation.error?.message}
          </div>
        )}
      </form>
    </Form>
  )
}
