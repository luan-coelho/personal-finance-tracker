'use client'

import { notFound } from 'next/navigation'
import { useState } from 'react'

import type { TransactionWithUser } from '@/app/db/schemas'

import { BottomNav } from '@/components/layout/bottom-nav'
import { MonthSelector } from '@/components/month-selector'
import { TransactionsTable } from '@/components/transactions-table'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from '@/components/ui/currency-input'
import { DatePicker } from '@/components/ui/date-picker'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Fab } from '@/components/ui/fab'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MetricCard } from '@/components/ui/metric-card'
import { PageActions } from '@/components/ui/page-actions'
import { PageHeader } from '@/components/ui/page-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { MonthSelectorProvider } from '@/providers/month-selector-provider'

import { buildDashboardFixture } from '../home/_fixtures'

/**
 * Vitrine do shell mobile (AppBar, BottomNav, FAB, lista de transações e folha inferior) com
 * dados fictícios, sem sessão nem banco. Só existe em desenvolvimento.
 */
export default function DevMobilePage() {
  const [variant, setVariant] = useState<'root' | 'route'>('root')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState<Date | undefined>(new Date())

  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }

  const base = buildDashboardFixture('current').recentTransactions as TransactionWithUser[]
  // Três dias de lançamentos para exercitar o agrupamento.
  const transactions = [0, 1, 2].flatMap(offset =>
    base.map(transaction => {
      const date = new Date()
      date.setDate(date.getDate() - offset)
      return { ...transaction, id: `${transaction.id}-${offset}`, date }
    }),
  )

  return (
    <SidebarProvider>
      <MonthSelectorProvider>
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-6 px-4 pb-8 max-lg:pb-[calc(var(--bottom-nav)+var(--safe-bottom)+--spacing(22))] sm:px-8">
            {variant === 'root' ? (
              <PageHeader title="Transações" description="Entradas, saídas e reservas de Família Coelho" />
            ) : (
              <PageHeader
                variant="route"
                title="Reserva de emergência com um nome bem comprido"
                breadcrumb={[{ label: 'Reservas', href: '/dev/mobile' }]}
                meta="Meta de R$ 30.000,00 · 62% concluída"
              />
            )}

            <PageActions
              actions={
                <Button variant="primary" icon="plus" className="max-lg:hidden" onClick={() => setSheetOpen(true)}>
                  Nova transação
                </Button>
              }>
              <MonthSelector />
            </PageActions>

            <ToggleGroup
              type="single"
              value={variant}
              onValueChange={value => setVariant(value as 'root' | 'route')}
              aria-label="Tipo de tela">
              <ToggleGroupItem value="root">Tela-raiz</ToggleGroupItem>
              <ToggleGroupItem value="route">Tela interna</ToggleGroupItem>
            </ToggleGroup>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <MetricCard
                label="Saldo"
                value="R$ 4.322,69"
                icon="wallet"
                note="Positivo · 74 transações"
                className="max-sm:col-span-2"
              />
              <MetricCard label="Entradas" value="R$ 128.350,00" icon="arrow-up-circle" tone="success" note="Entradas no período" />
              <MetricCard label="Saídas" value="R$ 3.127,31" icon="arrow-down-circle" tone="error" note="Saídas no período" />
              <MetricCard label="Transações" value={74} icon="hash" className="max-sm:hidden" />
            </div>

            <TransactionsTable transactions={transactions} onEdit={() => setSheetOpen(true)} onDuplicate={() => {}} />
          </div>
        </SidebarInset>

        {variant === 'root' && <BottomNav />}
        {variant === 'root' && (
          <Fab
            label="Nova transação"
            className="fixed right-4 bottom-[calc(var(--bottom-nav)+var(--safe-bottom)+--spacing(4))] z-30 lg:hidden"
            onClick={() => setSheetOpen(true)}
          />
        )}

        <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
          <DialogContent size="md">
            <DialogHeader>
              <DialogTitle>Nova transação</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={event => {
                event.preventDefault()
                setSheetOpen(false)
              }}>
              <DialogBody className="gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dev-amount">Valor</Label>
                  <CurrencyInput
                    id="dev-amount"
                    name="amount"
                    value={amount}
                    onChange={setAmount}
                    className="max-lg:text-xl max-lg:font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dev-description">Descrição</Label>
                  <Input id="dev-description" placeholder="Ex.: Compra no mercado" enterKeyHint="next" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Data</Label>
                  <DatePicker date={date} onSelect={setDate} showNavigation />
                </div>
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="flex flex-col gap-1.5">
                    <Label htmlFor={`dev-extra-${index}`}>Campo extra {index + 1}</Label>
                    <Input id={`dev-extra-${index}`} placeholder="Para forçar a rolagem do corpo" />
                  </div>
                ))}
              </DialogBody>
              <DialogFooter>
                <Button type="button" onClick={() => setSheetOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Salvar transação
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </MonthSelectorProvider>
    </SidebarProvider>
  )
}
