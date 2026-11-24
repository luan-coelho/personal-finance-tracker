import Link from 'next/link'
import type * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { routes } from '@/lib/routes'
import { buildTransactionUrlQuery, type TransactionUrlFilters } from '@/lib/transaction-filter-utils'
import { cn } from '@/lib/utils'

const compactCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
})

/** "R$ 6,1 mil": rótulos curtos de gráfico. O valor exato fica no tooltip ou na lista. */
export function formatCurrencyCompact(value: number): string {
  return compactCurrencyFormatter.format(value)
}

/** "6,1 mil": rótulo compacto sem o símbolo, para barras lado a lado e miolo do donut. */
export function formatAmountCompact(value: number): string {
  return compactCurrencyFormatter.format(value).replace(/^R\$\s*/, '')
}

/** Link para Transações já filtrada (o mês segue o seletor compartilhado). */
export function transactionsHref(filters: TransactionUrlFilters = {}): string {
  return `${routes.frontend.admin.transactions.index}${buildTransactionUrlQuery(filters)}`
}

interface DashboardCardProps extends Omit<React.ComponentProps<typeof Card>, 'title'> {
  title: React.ReactNode
  description?: React.ReactNode
  /** Link "Ver tudo" no canto do cabeçalho. */
  href?: string
  hrefLabel?: string
  contentClassName?: string
}

/** Card padrão dos blocos do Início: título 16/600, descrição curta e link para a tela de origem. */
export function DashboardCard({
  title,
  description,
  href,
  hrefLabel = 'Ver tudo',
  className,
  contentClassName,
  children,
  ...props
}: DashboardCardProps) {
  return (
    <Card className={cn('min-w-0', className)} {...props}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {href ? (
          <CardAction>
            <Button asChild variant="ghost" size="sm" iconRight="arrow-right" className="-my-1 -mr-2">
              <Link href={href}>{hrefLabel}</Link>
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className={cn('flex min-w-0 flex-col gap-4', contentClassName)}>{children}</CardContent>
    </Card>
  )
}

/** Estado vazio compacto dentro de um card. */
export function DashboardCardEmpty({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground py-6 text-center text-sm leading-5">{children}</p>
}
