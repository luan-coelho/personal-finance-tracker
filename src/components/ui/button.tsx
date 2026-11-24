import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type * as React from 'react'

import { Icon, type IconName } from '@/components/ui/icon'
import { Spinner } from '@/components/ui/spinner'

import { cn } from '@/lib/utils'

/**
 * Radar Button (`.sst-btn`): cápsula, plano, 14/20 500.
 * Hover/pressed só mudam fundo e borda (sem translate/scale); foco com `focus-ring`.
 */
const buttonVariants = cva(
  [
    'group/button text-foreground inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-transparent bg-transparent text-sm font-medium whitespace-nowrap no-underline outline-none select-none',
    'transition-[background-color,border-color,box-shadow,color] duration-120',
    'focus-visible:shadow-focus-ring',
    'disabled:not-aria-busy:cursor-not-allowed disabled:not-aria-busy:opacity-45',
    'aria-disabled:pointer-events-none aria-disabled:opacity-45',
    'aria-busy:cursor-progress',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:not-disabled:bg-primary-hover active:not-disabled:bg-primary-active active:not-disabled:text-white',
        secondary: 'bg-primary-soft text-primary-soft-fg',
        outline:
          'border-input bg-card text-foreground hover:not-disabled:not-active:border-border-strong hover:not-disabled:not-active:bg-accent active:not-disabled:border-border-strong active:not-disabled:bg-muted',
        ghost: 'text-foreground hover:not-disabled:not-active:bg-accent active:not-disabled:bg-muted bg-transparent',
        destructive:
          'bg-destructive hover:not-disabled:not-active:bg-error-700 text-white focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--error)_40%,transparent)] active:not-disabled:bg-[#912018]',
        link: 'text-primary-text active:not-disabled:text-primary-active justify-start rounded-sm border-0 bg-transparent underline-offset-4 hover:not-disabled:underline active:not-disabled:underline',
      },
      size: {
        sm: 'h-control-sm gap-1.5 px-3 text-[13px]/5',
        md: 'h-control-md px-4',
        lg: 'h-control-lg px-5',
      },
    },
    compoundVariants: [{ variant: 'link', className: 'px-1' }],
    defaultVariants: {
      variant: 'outline',
      size: 'md',
    },
  },
)

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>
type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>

/** Ícone de 16px em sm/md e 20px em lg (Radar). */
const BUTTON_ICON_SIZE: Record<ButtonSize, number> = { sm: 16, md: 16, lg: 20 }

interface ButtonProps extends React.ComponentProps<'button'> {
  /** Hierarquia: `primary` no máximo uma vez por tela; `outline` é o padrão. */
  variant?: ButtonVariant
  /** sm 32 · md 40 (padrão) · lg 44. */
  size?: ButtonSize
  /** Mostra o spinner no lugar do ícone, marca `aria-busy` e bloqueia cliques. Troque o rótulo pelo gerúndio. */
  loading?: boolean
  /** Ícone Radar à esquerda do rótulo. */
  icon?: IconName
  /** Ícone Radar à direita do rótulo. */
  iconRight?: IconName
  asChild?: boolean
}

function Button({
  className,
  variant = 'outline',
  size = 'md',
  asChild = false,
  loading = false,
  icon,
  iconRight,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'
  const iconSize = BUTTON_ICON_SIZE[size]
  const leading = loading ? <Spinner size={16} /> : icon ? <Icon name={icon} size={iconSize} /> : null

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={asChild ? undefined : disabled || loading}
      aria-disabled={asChild && (disabled || loading) ? true : undefined}
      aria-busy={loading || undefined}
      {...props}>
      {leading}
      <Slot.Slottable>{children}</Slot.Slottable>
      {iconRight ? <Icon name={iconRight} size={iconSize} /> : null}
    </Comp>
  )
}

type IconButtonVariant = Exclude<ButtonVariant, 'link'>

interface IconButtonProps extends Omit<React.ComponentProps<'button'>, 'children' | 'aria-label'> {
  /** Ícone Radar. */
  icon: IconName
  /** Rótulo acessível obrigatório (vira `aria-label` e `title`). */
  label: string
  /** `ghost` (padrão: headers e células) ou `outline` (barras de ferramentas). */
  variant?: IconButtonVariant
  /** Quadrado com o lado do botão de texto do mesmo tamanho: sm 32 · md 40 · lg 44. */
  size?: ButtonSize
  loading?: boolean
}

const ICON_BUTTON_SIZE: Record<ButtonSize, string> = {
  sm: 'w-control-sm px-0',
  md: 'w-control-md px-0',
  lg: 'w-control-lg px-0',
}

/** Radar IconButton (`.sst-btn--icon`): ícone de 16px em sm e 20px em md/lg. */
function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  loading = false,
  disabled,
  className,
  title,
  ...props
}: IconButtonProps) {
  const iconSize = size === 'sm' ? 16 : 20

  return (
    <button
      data-slot="icon-button"
      data-variant={variant}
      data-size={size}
      aria-label={label}
      title={title ?? label}
      className={cn(
        buttonVariants({ variant, size }),
        ICON_BUTTON_SIZE[size],
        variant === 'ghost' && 'text-muted-foreground hover:not-disabled:text-foreground',
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}>
      {loading ? <Spinner size={16} /> : <Icon name={icon} size={iconSize} />}
    </button>
  )
}

export type { ButtonProps, ButtonSize, ButtonVariant, IconButtonProps }
export { Button, buttonVariants, IconButton }
