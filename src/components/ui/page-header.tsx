'use client'

import Link from 'next/link'
import type * as React from 'react'
import { Fragment } from 'react'

import { ThemeToggle } from '@/components/layout/theme-toggle'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

export interface PageHeaderCrumb {
  label: string
  href?: string
}

export interface PageHeaderProps extends Omit<React.ComponentProps<'header'>, 'title'> {
  /** `module`: nome do módulo + descrição (listas). `route`: breadcrumb + nome do registro (`/new`, `/[id]`, `/[id]/edit`). */
  variant?: 'module' | 'route'
  title: React.ReactNode
  description?: React.ReactNode
  /** Só em `route`: níveis acima da página atual, começando pela raiz do módulo. Não repita a página atual. */
  breadcrumb?: PageHeaderCrumb[]
  /** Badge de status ao lado do título. */
  status?: React.ReactNode
  /** Metadados abaixo do título (use " · " entre itens). */
  meta?: React.ReactNode
}

/**
 * Radar PageHeader: contexto da página à esquerda, utilidades globais (tema) à direita.
 * Sem borda nem fundo; o padding lateral vem do `AppLayout`. As ações da página vão em `PageActions`.
 * Abaixo de `lg` vira a AppBar: fixa, 56px, título 18/600 em uma linha, "voltar" no lugar do
 * breadcrumb; descrição e tema saem (a navegação fica na BottomNav).
 */
export function PageHeader({
  variant = 'module',
  title,
  description,
  breadcrumb,
  status,
  meta,
  className,
  ...props
}: PageHeaderProps) {
  const crumbs = variant === 'route' ? (breadcrumb ?? []) : []

  // Abaixo de `lg` o cabeçalho é a AppBar do Radar: "voltar" leva ao nível acima (último nível com link).
  const parent = [...crumbs].reverse().find(crumb => crumb.href)

  return (
    <header
      data-slot="page-header"
      data-variant={variant}
      className={cn(
        'text-foreground flex items-start justify-between gap-4 pt-5',
        // Radar AppBar (mobile): fixa no topo, 56px mais a safe area, `card` com borda inferior, sangrando o padding do conteúdo.
        'max-lg:border-border max-lg:bg-card max-lg:pt-safe-top max-lg:sticky max-lg:top-(--offline-banner) max-lg:z-30 max-lg:-mx-4 max-lg:items-center max-lg:gap-1 max-lg:border-b max-lg:px-4 max-lg:in-data-[offline=true]:pt-0 sm:max-lg:-mx-8 sm:max-lg:px-8 print:static',
        className,
      )}
      {...props}>
      <div className="max-lg:h-app-bar flex min-w-0 items-start gap-2 max-lg:items-center max-lg:gap-1">
        {parent?.href && (
          <Link
            href={parent.href}
            aria-label={`Voltar para ${parent.label}`}
            className={cn(buttonVariants({ variant: 'ghost' }), 'w-control-md -ml-3 px-0 lg:hidden')}>
            <Icon name="arrow-left" size={24} />
          </Link>
        )}

        <div data-slot="page-header-context" className="flex min-w-0 flex-col gap-1 max-lg:gap-0">
          {crumbs.length > 0 && (
            <Breadcrumb className="max-lg:hidden">
              <BreadcrumbList>
                {crumbs.map((crumb, index) => (
                  <Fragment key={`${crumb.label}-${index}`}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {crumb.href ? (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <span>{crumb.label}</span>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}

          <div className="flex min-w-0 flex-wrap items-center gap-3 max-lg:flex-nowrap max-lg:gap-2">
            <h1 className="m-0 min-w-0 text-2xl leading-8 font-semibold tracking-[-0.01em] text-pretty max-lg:truncate max-lg:text-lg max-lg:leading-6">
              {title}
            </h1>
            {status}
          </div>

          {description && (
            <p className="text-muted-foreground text-sm leading-5 text-pretty max-lg:hidden">{description}</p>
          )}

          {meta && (
            <div className="text-muted-foreground text-sm leading-5 max-lg:truncate max-lg:text-xs max-lg:leading-4">
              {meta}
            </div>
          )}
        </div>
      </div>

      {/* No mobile o tema fica no menu da conta ("Mais"). */}
      <div data-slot="page-header-utilities" className="flex shrink-0 items-center gap-2 max-lg:hidden">
        <ThemeToggle />
      </div>
    </header>
  )
}
