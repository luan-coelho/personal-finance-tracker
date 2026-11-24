import type * as React from 'react'

import { Icon, type IconName } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

type DeltaTone = 'success' | 'error' | 'warning' | 'info' | 'neutral'

const deltaToneClass: Record<DeltaTone, string> = {
  success: 'bg-success-soft text-success-text',
  error: 'bg-error-soft text-error-text',
  warning: 'bg-warning-soft text-warning-text',
  info: 'bg-info-soft text-info-text',
  neutral: 'bg-muted text-muted-foreground',
}

const noteToneClass = {
  error: 'font-medium text-error-text',
  warning: 'font-medium text-warning-text',
  success: 'font-medium text-success-text',
} as const

type TrendTone = 'primary' | 'success' | 'error' | 'warning' | 'info'

// Radar `.sst-metric__trend--*`: traço na cor cheia da família; padrão `muted-fg`.
const trendToneClass: Record<TrendTone, string> = {
  primary: 'text-primary',
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  info: 'text-info',
}

/** Caminho da sparkline 96×32 (Radar `metricSparkPath`): 2px de respiro lateral, 4px vertical, min–max normalizado. */
function sparkPath(values: number[]) {
  const n = values.length
  if (n < 2) return ''
  const min = Math.min(...values)
  const span = Math.max(...values) - min || 1
  const points = values.map(
    (value, index) => `${(2 + index * (92 / (n - 1))).toFixed(1)} ${(28 - ((value - min) / span) * 24).toFixed(1)}`,
  )
  return `M${points.join('L')}`
}

const valueToneClass = {
  default: 'text-foreground',
  success: 'text-success-text',
  error: 'text-error-text',
} as const

type MetricCardProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** 13/500 `muted-fg` label. */
  label: React.ReactNode
  /** Already formatted value ("R$ 12.480,00", "86"). */
  value: React.ReactNode
  /** Suffix glued to the value, 20/500 `muted-fg` ("%"). */
  unit?: React.ReactNode
  /** Variation pill text ("12%"); the arrow comes from `deltaTrend`. */
  delta?: React.ReactNode
  deltaTrend?: 'up' | 'down'
  /** Pill family. Default: `success` going up, `error` going down. */
  deltaTone?: DeltaTone
  /** 12px support line ("vs. R$ 9.800,00 em outubro"). */
  note?: React.ReactNode
  noteTone?: keyof typeof noteToneClass
  /** Value color: `success` for income, `error` for expenses. */
  tone?: keyof typeof valueToneClass
  /** Discreet 16px icon next to the label. */
  icon?: IconName
  /**
   * Série da sparkline de 96×32 à direita do valor (traço 2, uma cor, sem eixos). Indica direção,
   * não valores. Some quando a linha do valor tem menos de 160px.
   */
  trend?: number[]
  /** Cor do traço da sparkline. Padrão `muted-fg`. */
  trendTone?: TrendTone
  /** 6px bar under the value, 0–100. */
  progress?: number
  loading?: boolean
  children?: React.ReactNode
}

const shimmer =
  'block rounded-sm bg-muted bg-[linear-gradient(90deg,var(--muted)_25%,var(--accent)_50%,var(--muted)_75%)] bg-size-[200%_100%] animate-[sst-shimmer_1.6s_linear_infinite] motion-reduce:animate-none'

function MetricCard({
  className,
  label,
  value,
  unit,
  delta,
  deltaTrend = 'up',
  deltaTone,
  note,
  noteTone,
  tone = 'default',
  icon,
  trend,
  trendTone,
  progress,
  loading = false,
  children,
  ...props
}: MetricCardProps) {
  const base =
    'flex min-w-0 flex-col rounded-lg border border-border bg-card px-6 py-5 text-card-foreground shadow-sh-sm'

  if (loading) {
    return (
      <div data-slot="metric-card" data-loading aria-busy="true" className={cn(base, 'gap-3.5', className)} {...props}>
        <span className="sr-only">Carregando</span>
        <span aria-hidden className={cn(shimmer, 'h-3.5 w-3/5')} />
        <span aria-hidden className={cn(shimmer, 'h-8 w-2/5 rounded-[8px]')} />
        <span aria-hidden className={cn(shimmer, 'h-3 w-4/5')} />
      </div>
    )
  }

  const resolvedDeltaTone = deltaTone ?? (deltaTrend === 'down' ? 'error' : 'success')
  const hasTrend = trend !== undefined && trend.length > 1
  const clampedProgress = progress === undefined ? undefined : Math.min(100, Math.max(0, progress))

  const valueRow = (
    <>
      <span
        data-slot="metric-card-value"
        className={cn('text-[32px] leading-9 font-bold tracking-[-0.02em] tabular-nums', valueToneClass[tone])}>
        {value}
        {unit && <span className="text-muted-foreground text-xl font-medium tracking-normal">{unit}</span>}
      </span>
      {delta && (
        <span
          data-slot="metric-card-delta"
          className={cn(
            'inline-flex h-[22px] items-center gap-0.5 rounded-full px-2 text-xs leading-4 font-semibold whitespace-nowrap tabular-nums',
            deltaToneClass[resolvedDeltaTone],
          )}>
          <Icon name={deltaTrend === 'down' ? 'arrow-down' : 'arrow-up'} size={12} strokeWidth={2.5} />
          {delta}
        </span>
      )}
    </>
  )

  return (
    <div data-slot="metric-card" className={cn(base, 'gap-3', className)} {...props}>
      <div
        data-slot="metric-card-label"
        className="text-muted-foreground flex min-w-0 items-center gap-2 text-[13px] font-medium">
        {icon && <Icon name={icon} size={16} />}
        <span className="min-w-0">{label}</span>
      </div>
      {hasTrend ? (
        // Quebra em vez de sobrepor: sem espaço ao lado do valor, a sparkline desce para a linha de baixo
        <div className="@container flex min-w-0 flex-wrap items-center justify-between gap-x-2.5 gap-y-2">
          <div className="flex min-w-0 flex-wrap items-baseline gap-2.5">{valueRow}</div>
          <svg
            data-slot="metric-card-trend"
            viewBox="0 0 96 32"
            width={96}
            height={32}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={cn(
              'ml-auto shrink-0 @max-[160px]:hidden',
              trendTone ? trendToneClass[trendTone] : 'text-muted-foreground',
            )}>
            <path d={sparkPath(trend)} />
          </svg>
        </div>
      ) : (
        <div className="flex flex-wrap items-baseline gap-2.5">{valueRow}</div>
      )}
      {clampedProgress !== undefined && (
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={clampedProgress}
          className="bg-muted h-1.5 overflow-hidden rounded-full">
          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${clampedProgress}%` }} />
        </div>
      )}
      {note && (
        <p
          data-slot="metric-card-note"
          className={cn('text-muted-foreground text-xs leading-4', noteTone && noteToneClass[noteTone])}>
          {note}
        </p>
      )}
      {children}
    </div>
  )
}

export type { MetricCardProps, TrendTone as MetricCardTrendTone }
export { MetricCard }
