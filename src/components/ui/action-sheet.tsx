'use client'

import type * as React from 'react'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Icon, type IconName } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

type ActionSheetTone = 'muted' | 'primary' | 'success' | 'warning' | 'error' | 'info'

const tileTone: Record<ActionSheetTone, string> = {
  muted: 'bg-muted text-muted-foreground',
  primary: 'bg-primary-soft text-primary-text',
  success: 'bg-success-soft text-success-text',
  warning: 'bg-warning-soft text-warning-text',
  error: 'bg-error-soft text-error-text',
  info: 'bg-info-soft text-info-text',
}

interface ActionSheetItem {
  icon: IconName
  label: string
  /** Par soft/text do tile; `error` também pinta o rótulo (ação destrutiva, sempre por último). */
  tone?: ActionSheetTone
  disabled?: boolean
  onSelect: () => void
}

interface ActionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Frase curta que nomeia o registro ("Compra no mercado"). */
  title: React.ReactNode
  /** Linha de contexto abaixo do título (valor, data). */
  description?: React.ReactNode
  /** Ações na ordem de frequência de uso; a destrutiva por último. */
  items: ActionSheetItem[]
}

/**
 * Radar BottomSheet de ações de um registro: no mobile o Menu de 240px vira esta folha, com itens
 * de 56px, tile de 40px e rótulo de 16px. Escolher uma ação fecha a folha. A partir de `sm` o
 * mesmo conteúdo aparece como dialog centralizado.
 */
function ActionSheet({ open, onOpenChange, title, description, items }: ActionSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="truncate text-base leading-6">{title}</DialogTitle>
          {description ? <DialogDescription className="truncate">{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogBody className="gap-0.5 px-2! pt-3 pb-4">
          {items.map(item => (
            <button
              key={item.label}
              type="button"
              data-slot="action-sheet-item"
              disabled={item.disabled}
              onClick={() => {
                onOpenChange(false)
                item.onSelect()
              }}
              className={cn(
                'text-foreground flex min-h-14 w-full cursor-pointer items-center gap-3.5 rounded-[12px] border-0 bg-transparent px-4 py-2 text-left text-base leading-6 outline-none',
                'hover:bg-accent focus-visible:shadow-focus-ring active:bg-accent transition-[background-color,box-shadow] duration-120',
                'disabled:cursor-not-allowed disabled:opacity-45',
                item.tone === 'error' && 'text-error-text',
              )}>
              <span
                aria-hidden="true"
                className={cn(
                  'inline-flex size-10 shrink-0 items-center justify-center rounded-[12px]',
                  tileTone[item.tone ?? 'muted'],
                )}>
                <Icon name={item.icon} size={22} strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            </button>
          ))}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

export type { ActionSheetItem, ActionSheetProps }
export { ActionSheet }
