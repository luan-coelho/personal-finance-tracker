'use client'

import Link from 'next/link'
import { Fragment } from 'react'
import type * as React from 'react'

import { ThemeToggle } from '@/components/layout/theme-toggle'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { IconButton } from '@/components/ui/button'
import { useSidebarOptional } from '@/components/ui/sidebar'

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
  const sidebar = useSidebarOptional()
  const crumbs = variant === 'route' ? (breadcrumb ?? []) : []

  return (
    <header
      data-slot="page-header"
      data-variant={variant}
      className={cn('text-foreground flex items-start justify-between gap-4 pt-5', className)}
      {...props}>
      <div className="flex min-w-0 items-start gap-2">
        {sidebar && (
          <IconButton
            icon="menu"
            label="Abrir menu"
            className="-ml-2 shrink-0 lg:hidden"
            onClick={() => sidebar.setOpenMobile(true)}
          />
        )}

        <div data-slot="page-header-context" className="flex min-w-0 flex-col gap-1">
          {crumbs.length > 0 && (
            <Breadcrumb>
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

          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <h1 className="m-0 min-w-0 text-2xl leading-8 font-semibold tracking-[-0.01em] text-pretty">{title}</h1>
            {status}
          </div>

          {description && <p className="text-muted-foreground text-sm leading-5 text-pretty">{description}</p>}

          {meta && <div className="text-muted-foreground text-sm leading-5">{meta}</div>}
        </div>
      </div>

      <div data-slot="page-header-utilities" className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}
