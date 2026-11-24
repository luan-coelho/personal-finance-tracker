'use client'

import type * as React from 'react'
import { useState } from 'react'

import { ActionSheet, type ActionSheetItem } from '@/components/ui/action-sheet'
import { Icon } from '@/components/ui/icon'
import { List, ListItem, type ListItemProps } from '@/components/ui/list-item'
import { Skeleton } from '@/components/ui/skeleton'

import { cn } from '@/lib/utils'

type RecordListRow = Pick<ListItemProps, 'icon' | 'tone' | 'leading' | 'avatar' | 'title' | 'meta' | 'href'> & {
  /** Status ou valor à direita. Com `actions`, o "⋯" entra depois dele. */
  right?: React.ReactNode
}

interface RecordListProps<T> {
  items: T[]
  getKey: (item: T) => string
  /** Conteúdo da linha: um elemento à esquerda, título, metadado em uma linha e um status à direita. */
  row: (item: T) => RecordListRow
  /** Ações do registro. Com elas, tocar na linha abre a folha de ações. */
  actions?: (item: T) => ActionSheetItem[]
  /** Título e contexto da folha de ações; padrão: o título e o metadado da linha. */
  sheetTitle?: (item: T) => React.ReactNode
  sheetDescription?: (item: T) => React.ReactNode
  className?: string
}

const containerClassName = 'border-border bg-card shadow-sh-sm flex flex-col rounded-lg border p-2'

/**
 * Lista de registros do mobile (abaixo de `md`), no lugar de uma `Table`: um `ListItem` por
 * registro dentro de um card. A linha inteira é o alvo de toque; as ações que no web ficam no
 * menu "⋯" abrem numa folha inferior.
 */
function RecordList<T>({ items, getKey, row, actions, sheetTitle, sheetDescription, className }: RecordListProps<T>) {
  const [selected, setSelected] = useState<T | null>(null)
  const selectedRow = selected ? row(selected) : null

  return (
    <div data-slot="record-list" className={cn(containerClassName, className)}>
      <List>
        {items.map(item => {
          const { right, href, ...content } = row(item)
          const hasActions = actions !== undefined && actions(item).length > 0

          return (
            <ListItem
              key={getKey(item)}
              {...content}
              href={hasActions ? undefined : href}
              onClick={hasActions ? () => setSelected(item) : undefined}
              aria-haspopup={hasActions ? 'dialog' : undefined}
              right={
                right || hasActions ? (
                  <span className="inline-flex items-center gap-2">
                    {right}
                    {hasActions && <Icon name="more-vertical" size={20} className="text-muted-foreground" />}
                  </span>
                ) : undefined
              }
            />
          )
        })}
      </List>

      {actions && (
        <ActionSheet
          open={selected !== null}
          onOpenChange={open => !open && setSelected(null)}
          title={selected ? (sheetTitle?.(selected) ?? selectedRow?.title) : null}
          description={selected ? (sheetDescription?.(selected) ?? selectedRow?.meta) : undefined}
          items={selected ? actions(selected) : []}
        />
      )}
    </div>
  )
}

function RecordListSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div aria-busy="true" data-slot="record-list" className={cn(containerClassName, className)}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex min-h-16 items-center gap-3 px-4 py-2.5">
          <Skeleton className="rounded-control size-10 shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-32 max-w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
      <span className="sr-only">Carregando</span>
    </div>
  )
}

export type { RecordListProps, RecordListRow }
export { RecordList, RecordListSkeleton }
