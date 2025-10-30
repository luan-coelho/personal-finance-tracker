'use client'

import { Copy, Plus } from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
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

interface CopyBudgetDialogProps {
  currentMonth: string
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
      setError('Erro ao copiar orçamentos. Verifique se já existem orçamentos para este mês.')
      console.error(err)
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Copy className="mr-2 h-4 w-4" />
          Copiar Mês Anterior
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Copiar Orçamentos de Outro Mês</DialogTitle>
          <DialogDescription>
            Copie todos os orçamentos de um mês anterior para o mês atual, mantendo as mesmas categorias e valores.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="source-month">Selecione o mês de origem</Label>
            <Select value={sourceMonth} onValueChange={setSourceMonth}>
              <SelectTrigger id="source-month">
                <SelectValue placeholder="Escolha um mês" />
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

          {sourceMonth && sourceBudgets.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Orçamentos a serem copiados</CardTitle>
                <CardDescription className="text-xs">
                  {sourceBudgets.length} categoria(s) serão copiadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sourceBudgets.slice(0, 5).map(budget => (
                    <div key={budget.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{budget.category}</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(Number(budget.amount))}
                      </span>
                    </div>
                  ))}
                  {sourceBudgets.length > 5 && (
                    <p className="text-muted-foreground text-xs">
                      + {sourceBudgets.length - 5} categoria(s) adicional(is)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {sourceMonth && sourceBudgets.length === 0 && (
            <Alert>
              <AlertDescription>Nenhum orçamento encontrado para o mês selecionado.</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isCopying}>
            Cancelar
          </Button>
          <Button onClick={handleCopy} disabled={!sourceMonth || sourceBudgets.length === 0 || isCopying}>
            <Plus className="mr-2 h-4 w-4" />
            {isCopying ? 'Copiando...' : `Copiar ${sourceBudgets.length} Orçamento(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
