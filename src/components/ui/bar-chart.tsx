import type * as React from 'react'

import { cn } from '@/lib/utils'

type BarTone = 'primary' | 'success' | 'error' | 'warning' | 'info'

interface BarChartDatum {
  /** Rótulo do eixo em DM Mono 11px ("jun"); curto, trunca com reticências. */
  label: string
  value: number
  /** Barra em segundo plano (opacidade .55): a cauda depois das 3 maiores. */
  dim?: boolean
  /** Cor da barra. `primary` por padrão; semântica só quando a categoria é um status. */
  tone?: BarTone
}

interface BarChartProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  /** Já na ordem de leitura (cronológica para meses, maior → menor para rankings). Até 8 num card. */
  data: BarChartDatum[]
  /** Altura da área das barras em px. Padrão 140. */
  height?: number
  /** Valor que ocupa 100% da altura; padrão é o maior valor. */
  max?: number
  /** Cabeçalho opcional: título 16/600 e subtítulo 12 `muted-fg`. */
  title?: React.ReactNode
  subtitle?: React.ReactNode
  /** Valor acima de cada barra (12/600 tabular). Padrão `true`. */
  showValues?: boolean
  /** Formata o valor acima da barra e o rótulo acessível. Padrão: número em pt-BR. */
  format?: (value: number) => string
  /** Torna cada barra um botão focável (aria-label "rótulo: valor"). */
  onBarClick?: (index: number) => void
  /** Barra selecionada: as outras ficam em segundo plano e ela recebe `aria-pressed`. */
  activeIndex?: number | null
}

const barTone: Record<BarTone, string> = {
  primary: 'bg-primary group-hover/bar:bg-primary-hover',
  success: 'bg-success',
  error: 'bg-error',
  warning: 'bg-warning',
  info: 'bg-info',
}

const defaultFormat = (value: number) => value.toLocaleString('pt-BR')

/**
 * Radar BarChart (`.sst-barchart`): barras verticais em CSS puro, valor acima de cada uma e eixo
 * em DM Mono 11px. Raio `radius-sm` no topo e 2px na base, sem borda, gradiente ou sombra.
 * A escala sempre começa em zero.
 */
function BarChart({
  data,
  height = 140,
  max,
  title,
  subtitle,
  showValues = true,
  format = defaultFormat,
  onBarClick,
  activeIndex,
  className,
  'aria-label': ariaLabel,
  ...props
}: BarChartProps) {
  const top = max || data.reduce((m, d) => Math.max(m, d.value || 0), 0) || 1
  const columns = { gridTemplateColumns: `repeat(${Math.max(data.length, 1)}, minmax(0, 1fr))` }
  const summary = data.map(d => `${d.label}: ${format(d.value)}`).join(', ')
  const interactive = onBarClick !== undefined
  const plotLabel = ariaLabel ?? (typeof title === 'string' ? `${title}. ${summary}` : summary)
  const hasActive = activeIndex !== undefined && activeIndex !== null

  return (
    <div data-slot="bar-chart" className={cn('flex min-w-0 flex-col gap-4', className)} {...props}>
      {(title != null || subtitle != null) && (
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-base leading-6 font-semibold">{title}</span>
          {subtitle != null && <span className="text-muted-foreground text-xs leading-4">{subtitle}</span>}
        </div>
      )}

      <div
        data-slot="bar-chart-plot"
        // Interativo: grupo de botões, cada um com o próprio rótulo; senão, uma imagem com o resumo.
        {...{ role: interactive ? 'group' : 'img', 'aria-label': plotLabel }}
        className="grid items-end gap-3"
        style={{ height, ...columns }}>
        {data.map((d, index) => {
          const ratio = Math.max(0, Math.min(1, (d.value || 0) / top))
          const dim = hasActive ? index !== activeIndex : d.dim
          const content = (
            <>
              {showValues && <span className="text-xs leading-4 font-semibold tabular-nums">{format(d.value)}</span>}
              <span
                aria-hidden
                className={cn(
                  'block min-h-0.5 w-full rounded-t-sm rounded-b-[2px] transition-colors duration-120',
                  barTone[d.tone ?? 'primary'],
                  dim && 'opacity-55',
                )}
                style={{ height: `calc((100% - 22px) * ${ratio})` }}
              />
            </>
          )
          const colClass = 'group/bar flex h-full min-w-0 flex-col items-center justify-end gap-1.5'

          return interactive ? (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: rótulos podem repetir; a posição é a identidade.
              key={index}
              type="button"
              aria-label={`${d.label}: ${format(d.value)}`}
              aria-pressed={hasActive ? index === activeIndex : undefined}
              onClick={() => onBarClick(index)}
              className={cn(
                colClass,
                'focus-visible:shadow-focus-ring cursor-pointer rounded-sm border-0 bg-transparent p-0 text-inherit outline-none',
              )}>
              {content}
            </button>
          ) : (
            // biome-ignore lint/suspicious/noArrayIndexKey: rótulos podem repetir; a posição é a identidade.
            <div key={index} title={`${d.label}: ${format(d.value)}`} className={colClass}>
              {content}
            </div>
          )
        })}
      </div>

      <div
        aria-hidden
        className="text-muted-foreground grid gap-3 text-center font-mono text-[11px] leading-4"
        style={columns}>
        {data.map((d, index) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: rótulos podem repetir; a posição é a identidade.
            key={index}
            className={cn('truncate', hasActive && index === activeIndex && 'text-foreground font-medium')}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export type { BarChartDatum, BarChartProps, BarTone }
export { BarChart }
