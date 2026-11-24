'use client'

import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import type * as React from 'react'

import { Icon, type IconName } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> & {
  /** Ocupa a largura toda com colunas iguais. */
  fullWidth?: boolean
}

/**
 * Radar Segmented (`.sst-segmented`): trilho `muted` em cápsula, padding 3, gap 2,
 * para 2–4 opções mutuamente exclusivas. Com `type="single"` controlado, a seleção nunca fica vazia.
 */
function ToggleGroup({ className, fullWidth = false, ...props }: ToggleGroupProps) {
  const rootProps =
    props.type === 'single' && props.onValueChange
      ? {
          ...props,
          onValueChange: (value: string) => {
            if (value) props.onValueChange?.(value)
          },
        }
      : props

  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn(
        'group/toggle-group bg-muted items-stretch gap-0.5 self-start rounded-full p-[3px]',
        fullWidth ? 'grid w-full auto-cols-fr grid-flow-col self-stretch' : 'inline-flex w-fit',
        className,
      )}
      {...(rootProps as React.ComponentProps<typeof ToggleGroupPrimitive.Root>)}
    />
  )
}

type ToggleGroupItemTone = 'success' | 'warning' | 'error' | 'info' | 'ai'

const ITEM_TONE: Record<ToggleGroupItemTone, { text: string; active: string; dot: string }> = {
  success: { text: 'text-success-text', active: 'data-[state=on]:text-success-text', dot: 'bg-success' },
  warning: { text: 'text-warning-text', active: 'data-[state=on]:text-warning-text', dot: 'bg-warning' },
  error: { text: 'text-error-text', active: 'data-[state=on]:text-error-text', dot: 'bg-error' },
  info: { text: 'text-info-text', active: 'data-[state=on]:text-info-text', dot: 'bg-info' },
  ai: { text: 'text-ai-text', active: 'data-[state=on]:text-ai-text', dot: 'bg-ai' },
}

interface ToggleGroupItemProps extends React.ComponentProps<typeof ToggleGroupPrimitive.Item> {
  /** Ícone Radar de 16px antes do rótulo (use em todas as opções ou em nenhuma). */
  icon?: IconName
  /**
   * Tom semântico da opção: pinta o ícone (ou, sem ícone, um ponto de 6px antes do rótulo)
   * e o texto da opção ativa.
   */
  tone?: ToggleGroupItemTone
}

/**
 * Opção do Segmented (`.sst-segmented__option`): 34px, padding 14, 13/20 500 em `muted-fg`;
 * a ativa sobe para `card` + `sh-sm` + `fg`.
 */
function ToggleGroupItem({ className, icon, tone, children, ...props }: ToggleGroupItemProps) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        'text-muted-foreground inline-flex h-[34px] min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 bg-transparent px-3.5 text-[13px]/5 font-medium whitespace-nowrap outline-none',
        'transition-[background-color,color,box-shadow] duration-120',
        'hover:not-disabled:data-[state=off]:text-foreground',
        'focus-visible:shadow-focus-ring',
        'disabled:cursor-not-allowed disabled:opacity-45',
        'data-[state=on]:bg-card data-[state=on]:shadow-sh-sm data-[state=on]:focus-visible:shadow-[var(--sh-sm),var(--focus-ring)]',
        tone ? ITEM_TONE[tone].active : 'data-[state=on]:text-foreground',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        className,
      )}
      {...props}>
      {icon ? (
        <Icon name={icon} size={16} className={tone ? ITEM_TONE[tone].text : undefined} />
      ) : tone ? (
        <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', ITEM_TONE[tone].dot)} />
      ) : null}
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export type { ToggleGroupItemProps, ToggleGroupItemTone, ToggleGroupProps }
export { ToggleGroup, ToggleGroupItem }
