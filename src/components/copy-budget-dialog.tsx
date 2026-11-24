'use client'

import { useState } from 'react'

import { CategoryIcon } from '@/components/category-icon'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useBudgetsWithSpending, useCreateBudget } from '@/hooks/use-budgets'
import { useSelectedSpace } from '@/hooks/use-selected-space'

import { formatCurrency } from '@/lib/currency'

interface CopyBudgetDialogProps {
  currentMonth: string
}

function formatMonth(monthStr: string) {
  const [year, month] = monthStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })
}

export function CopyBudgetDialog({ currentMonth }: CopyBudgetDialogProps) {
  const { selectedSpace } = useSelectedSpace()
  const [isOpen, setIsOpen] = useState(false)
  const [sourceMonth, setSourceMonth] = useState('')
  const [isCopying, setIsCopying] = useState(false)
  const [error, setError] = useState('')

  const createBudget = useCreateBudget()

  // Buscar orçamentos do mês de origem
  const { data: sourceBudgets = [] } = useBudgetsWithSpending(selectedSpace?.id || '', sourceMonth)

  // Gerar opções de meses (últimos 12 meses)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i - 1)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const value = `${year}-${month}`
    const label = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })
    return { value, label }
  })

  const handleCopy = async () => {
    if (!sourceMonth || !selectedSpace) return

    setError('')
    setIsCopying(true)

    try {
      // Copiar cada orçamento do mês de origem
      const promises = sourceBudgets.map(budget =>
        createBudget.mutateAsync({
          spaceId: selectedSpace.id,
          category: budget.category,
          amount: Number(budget.amount),
          month: currentMonth,
        }),
      )

      await Promise.all(promises)

      setIsOpen(false)
      setSourceMonth('')
    } catch (err) {
      setError('Não foi possível copiar os orçamentos. Verifique se o mês atual já tem orçamentos nessas categorias.')
      console.error(err)
    } finally {
      setIsCopying(false)
    }
  }

  const count = sourceBudgets.length

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button icon="copy">Copiar orçamentos</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Copiar orçamentos</DialogTitle>
          <DialogDescription>
            Copia as categorias e os valores de um mês anterior para {formatMonth(currentMonth)}.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="source-month">Mês de origem</Label>
            <Select value={sourceMonth} onValueChange={setSourceMonth}>
              <SelectTrigger id="source-month" className="w-full">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {sourceMonth && count > 0 && (
            <section aria-label="Orçamentos a copiar" className="border-border rounded-md border">
              <p className="text-muted-foreground border-border border-b px-4 py-2.5 text-xs leading-4 font-medium">
                {count === 1 ? '1 orçamento será copiado' : `${count} orçamentos serão copiados`}
              </p>
              <ul className="divide-border divide-y">
                {sourceBudgets.slice(0, 5).map(budget => (
                  <li key={budget.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <CategoryIcon name={budget.category} size={16} className="text-muted-foreground shrink-0" />
                      <span className="truncate">{budget.category}</span>
                    </span>
                    <span className="font-medium tabular-nums">{formatCurrency(Number(budget.amount))}</span>
                  </li>
                ))}
              </ul>
              {count > 5 && (
                <p className="text-muted-foreground border-border border-t px-4 py-2.5 text-xs leading-4">
                  {count - 5 === 1 ? 'Mais 1 orçamento' : `Mais ${count - 5} orçamentos`}
                </p>
              )}
            </section>
          )}

          {sourceMonth && count === 0 && (
            <Alert tone="info">
              <AlertDescription>
                Nenhum orçamento em {formatMonth(sourceMonth)}. Escolha outro mês de origem.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert tone="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </DialogBody>

        <DialogFooter>
          <Button onClick={() => setIsOpen(false)} disabled={isCopying}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            icon="copy"
            loading={isCopying}
            onClick={handleCopy}
            disabled={!sourceMonth || count === 0}>
            {isCopying
              ? 'Copiando'
              : count > 0
                ? `Copiar ${count === 1 ? '1 orçamento' : `${count} orçamentos`}`
                : 'Copiar orçamentos'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
