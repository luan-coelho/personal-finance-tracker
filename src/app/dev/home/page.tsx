'use client'

import { notFound } from 'next/navigation'
import { useState } from 'react'

import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'
import { DashboardView } from '@/components/dashboard/dashboard-view'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { buildDashboardFixture, type DashboardFixtureVariant } from './_fixtures'

type Variant = DashboardFixtureVariant | 'loading'

const variants: Array<{ value: Variant; label: string }> = [
  { value: 'current', label: 'Mês atual' },
  { value: 'tight', label: 'Apertado' },
  { value: 'past', label: 'Mês passado' },
  { value: 'empty', label: 'Vazio' },
  { value: 'loading', label: 'Carregando' },
]

/** Vitrine do painel Início com dados fictícios. Só existe em desenvolvimento. */
export default function DevHomePage() {
  const [variant, setVariant] = useState<Variant>('current')

  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }

  return (
    <main className="bg-background text-foreground min-h-svh">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-8 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl leading-8 font-semibold tracking-[-0.01em]">Vitrine do Início</h1>
            <p className="text-muted-foreground text-sm leading-5">Dados fictícios, sem banco.</p>
          </div>
          <div className="flex max-w-full items-center gap-2">
            <ToggleGroup
              className="max-w-full overflow-x-auto"
              type="single"
              value={variant}
              onValueChange={value => setVariant(value as Variant)}
              aria-label="Cenário">
              {variants.map(item => (
                <ToggleGroupItem key={item.value} value={item.value} data-variant={item.value}>
                  {item.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <ThemeToggle />
          </div>
        </header>

        {variant === 'loading' ? (
          <DashboardSkeleton />
        ) : (
          <DashboardView overview={buildDashboardFixture(variant)} onSelectMonth={() => {}} onCreateTransaction={() => {}} />
        )}
      </div>
    </main>
  )
}
