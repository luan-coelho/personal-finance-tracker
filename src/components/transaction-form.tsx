'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from 'lucide-react'
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

import { useSelectedSpace } from '@/hooks/use-selected-space'
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/use-transactions'

type TransactionFormStrictValues = Omit<z.infer<typeof insertTransactionSchema>, 'tags'> & { tags: string[] }

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

  // Formulário react-hook-form
  const form = useForm<TransactionFormStrictValues>({
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

  // Mutations
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const isLoading = createMutation.isPending || updateMutation.isPending

  // Categorias disponíveis
  const availableCategories = DefaultCategories[form.watch('type') as keyof typeof DefaultCategories] || []

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
  async function onSubmit(values: TransactionFormStrictValues) {
    if (!selectedSpace || !session?.user?.id) return
    try {
      const numericAmount = values.amount ? String(Number(values.amount.replace(/\./g, '').replace(',', '.'))) : ''
      const formData = {
        type: values.type,
        amount: numericAmount,
        date: values.date,
        description: values.description,
        category: values.category || undefined,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        {/* Tags - Campo independente */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => {
            const [tagInput, setTagInput] = useState('')
            const addTag = () => {
              const newTag = tagInput.trim()
              if (!newTag || field.value.includes(newTag)) return
              field.onChange([...field.value, newTag])
              setTagInput('')
            }
            return (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <div className="grid w-full grid-cols-[1fr_auto] gap-2">
                      <Input
                        className="h-9"
                        placeholder="Adicionar tag..."
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addTag()
                          }
                        }}
                        disabled={isLoading}
                      />
                      <Button
                        className="h-9 whitespace-nowrap"
                        type="button"
                        variant="outline"
                        onClick={addTag}
                        disabled={isLoading}>
                        Adicionar
                      </Button>
                    </div>
                    {/* Tags selecionadas - sempre abaixo do input */}
                    {Array.isArray(field.value) && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {field.value.map((tag: string) => (
                          <span
                            key={tag}
                            className="bg-secondary inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs">
                            {tag}
                            <button
                              type="button"
                              onClick={() => field.onChange(field.value.filter((t: string) => t !== tag))}
                              className="hover:text-destructive"
                              disabled={isLoading}>
                              ×
                            </button>
                          </span>
                        ))}
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
