import Link from 'next/link'
import type * as React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Icon, type IconName } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

type ListItemTone = 'muted' | 'primary' | 'info' | 'success' | 'warning' | 'error' | 'ai'

const tileTone: Record<ListItemTone, string> = {
  muted: 'bg-muted text-muted-foreground',
  primary: 'bg-primary-soft text-primary-text',
  info: 'bg-info-soft text-info-text',
  success: 'bg-success-soft text-success-text',
  warning: 'bg-warning-soft text-warning-text',
  error: 'bg-error-soft text-error-text',
  ai: 'bg-ai-soft text-ai-text',
}

/**
 * Radar `.sst-list`: coluna com 2px entre os itens, sem divisores. Dentro de um card, `-mx-2`
 * alinha o texto dos itens com o título do card.
 */
function List({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="list" className={cn('flex flex-col gap-0.5', className)} {...props} />
}

interface ListItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'onClick'> {
  /** Ícone Radar num tile de 40px (`radius-control`). */
  icon?: IconName
  /** Cor do tile do `icon`: `muted` (padrão) ou a família `-soft`/`-text`. */
  tone?: ListItemTone
  /** Elemento de 40px pronto no lugar do tile (ex.: tile da categoria). */
  leading?: React.ReactNode
  /** Avatar de 40px com iniciais (ou foto). */
  avatar?: string | { name: string; src?: string }
  /** Título 14/500, uma linha com reticências. */
  title: React.ReactNode
  /** Metadado 12px `muted-fg`, uma linha com reticências. Sem ele o item cai de 64 para 56px. */
  meta?: React.ReactNode
  /** Um só elemento de ação ou status à direita (valor, badge, chevron). */
  right?: React.ReactNode
  /** Vira um `next/link`. */
  href?: string
  /** Sem `href`, vira um `<button>`. */
  onClick?: React.MouseEventHandler<HTMLElement>
  /** Fundo `primary-soft` com anel interno de 1px em `primary` (a altura não muda). */
  selected?: boolean
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '')).toUpperCase()
}

/**
 * Radar ListItem (`.sst-list-item`): 64px (56 sem `meta`), raio 12, padding 10/16, elemento de 40px
 * à esquerda e um só elemento à direita. Hover `accent` quando clicável; selecionado `primary-soft`
 * com anel interno. Use um tipo de elemento à esquerda por lista.
 */
function ListItem({
  icon,
  tone = 'muted',
  leading,
  avatar,
  title,
  meta,
  right,
  href,
  onClick,
  selected = false,
  className,
  children,
  ...props
}: ListItemProps) {
  const interactive = href !== undefined || onClick !== undefined

  let start: React.ReactNode = null
  if (leading) start = <span className="inline-flex shrink-0">{leading}</span>
  else if (avatar) {
    const person = typeof avatar === 'string' ? { name: avatar } : avatar
    start = (
      <Avatar size={40}>
        {person.src && <AvatarImage src={person.src} alt="" />}
        <AvatarFallback className="text-xs">{initials(person.name)}</AvatarFallback>
      </Avatar>
    )
  } else if (icon) {
    start = (
      <span
        aria-hidden
        className={cn('rounded-control inline-flex size-10 shrink-0 items-center justify-center', tileTone[tone])}>
        <Icon name={icon} size={20} />
      </span>
    )
  }

  const content = (
    <>
      {start}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span data-slot="list-item-title" className="truncate text-sm leading-5 font-medium">
          {title}
        </span>
        {meta != null && (
          <span data-slot="list-item-meta" className="text-muted-foreground truncate text-xs leading-4">
            {meta}
          </span>
        )}
      </span>
      {right != null && <span className="inline-flex shrink-0 items-center">{right}</span>}
      {children}
    </>
  )

  const classes = cn(
    'text-foreground flex w-full items-center gap-3 rounded-[12px] px-4 py-2.5 text-left text-sm leading-5 no-underline outline-none',
    meta != null ? 'min-h-16' : 'min-h-14',
    interactive && 'cursor-pointer transition-[background-color,box-shadow] duration-120',
    selected
      ? 'bg-primary-soft shadow-[inset_0_0_0_1px_var(--primary)] focus-visible:shadow-[inset_0_0_0_1px_var(--primary),var(--focus-ring)]'
      : interactive && 'hover:bg-accent focus-visible:shadow-focus-ring',
    className,
  )

  if (href !== undefined) {
    return (
      <Link
        data-slot="list-item"
        data-selected={selected || undefined}
        aria-current={selected ? 'true' : undefined}
        href={href}
        onClick={onClick}
        className={classes}
        {...(props as Omit<React.ComponentProps<'a'>, 'href'>)}>
        {content}
      </Link>
    )
  }

  if (onClick !== undefined) {
    return (
      <button
        type="button"
        data-slot="list-item"
        data-selected={selected || undefined}
        aria-pressed={selected || undefined}
        onClick={onClick}
        className={cn('border-0', !selected && 'bg-transparent', classes)}
        {...(props as React.ComponentProps<'button'>)}>
        {content}
      </button>
    )
  }

  return (
    <div
      data-slot="list-item"
      data-selected={selected || undefined}
      className={classes}
      {...(props as React.ComponentProps<'div'>)}>
      {content}
    </div>
  )
}

export type { ListItemProps, ListItemTone }
export { List, ListItem }
