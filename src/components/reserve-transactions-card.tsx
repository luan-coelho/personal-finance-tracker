'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, User, Wallet } from 'lucide-react'

import { TransactionWithUser } from '@/app/db/schemas'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatarDisplay } from '@/components/user-avatar-display'

interface ReserveTransactionsCardProps {
  transactions: TransactionWithUser[]
  isLoading?: boolean
}

export function ReserveTransactionsCard({ transactions, isLoading }: ReserveTransactionsCardProps) {
  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value))
  }

  const totalAmount = transactions.reduce((acc, t) => acc + Number(t.amount), 0)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              Transações de Reserva
            </CardTitle>
            <CardDescription>
              {transactions.length} {transactions.length === 1 ? 'transação registrada' : 'transações registradas'} como
              reserva
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Total Alocado</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(totalAmount.toString())}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="py-8 text-center">
            <Wallet className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
            <p className="text-muted-foreground text-sm">Nenhuma transação de reserva registrada ainda</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Crie transações do tipo &quot;Reserva&quot; vinculadas a esta reserva
            </p>
          </div>
        ) : (
          <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
            {transactions.map(transaction => (
              <div
                key={transaction.id}
                className="flex items-start justify-between rounded-lg border border-blue-100 bg-blue-50/50 p-3 transition-colors hover:bg-blue-50 dark:border-blue-900/30 dark:bg-blue-950/20 dark:hover:bg-blue-950/30">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-blue-200 bg-blue-100 text-blue-700">
                      <Wallet className="mr-1 h-3 w-3" />
                      Reserva
                    </Badge>
                    <span className="text-sm font-medium">{transaction.description}</span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(transaction.date), "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </div>
                    {transaction.user && (
                      <div className="flex items-center gap-1">
                        <UserAvatarDisplay user={transaction.user} size="sm" />
                        <span>{transaction.user.name || transaction.user.email}</span>
                      </div>
                    )}
                  </div>
                  {transaction.tags && transaction.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {transaction.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="ml-4 text-right">
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(transaction.amount)}</p>
                  <p className="text-muted-foreground text-xs">{format(new Date(transaction.createdAt), 'HH:mm')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
