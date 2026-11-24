import type * as React from 'react'

import { cn } from '@/lib/utils'

type DonutTone = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'ai' | 'neutral'

interface DonutSegment {
  /** Rótulo da legenda ("Gasto"). */
  label: string
  value: number
  /** Cor da fatia; `neutral` (`border-strong`) para "Outros" ou "sem dado". Não misture `primary` com cores semânticas. */
  tone: DonutTone
}

interface DonutChartProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  /**
   * No máximo 4 fatias, na ordem de leitura (maior primeiro, "Outros" por último); o resto vira
   * "Outros" em `neutral`. Começa às 12h e segue no sentido horário.
   */
  segments: DonutSegment[]
  /** Número do miolo; padrão é a soma dos segmentos. */
  total?: number
  /** Texto pronto do miolo (ex.: "R$ 8.200"); substitui `format(total)`. */
  totalLabel?: React.ReactNode
  /** Linha de 11px sob o total ("de entradas"). */
  unit?: React.ReactNode
  /** Diâmetro do anel em px. Padrão 120 (96 no mobile). */
  size?: number
  /** Espessura do anel em px. Padrão 16. */
  thickness?: number
  /** Cabeçalho opcional, 16/600. */
  title?: React.ReactNode
  /** Legenda com ponto, rótulo e "valor · %". Padrão `true`. */
  legend?: boolean
  /** Formata os valores da legenda e o total. Padrão: número em pt-BR. */
  format?: (value: number) => string
  /** Fundo do miolo: padrão `bg-card`; troque quando o anel não estiver sobre um card. */
  holeClassName?: string
}

const toneColor: Record<DonutTone, string> = {
  primary: 'var(--primary)',
  success: 'var(--success)',
  error: 'var(--error)',
  warning: 'var(--warning)',
  info: 'var(--info)',
  ai: 'var(--ai)',
  neutral: 'var(--border-strong)',
}

const defaultFormat = (value: number) => value.toLocaleString('pt-BR')

/** Percentuais inteiros sobre a soma, pelo maior resto: sempre somam 100. */
function roundedPercents(values: number[]) {
  const sum = values.reduce((a, v) => a + v, 0)
  if (sum <= 0) return values.map(() => 0)
  const raw = values.map(v => (v / sum) * 100)
  const floors = raw.map(Math.floor)
  let missing = 100 - floors.reduce((a, v) => a + v, 0)
  const order = raw.map((v, i) => ({ i, rest: v - floors[i] })).sort((a, b) => b.rest - a.rest)
  for (const { i } of order) {
    if (missing <= 0) break
    floors[i] += 1
    missing -= 1
  }
  return floors
}

/**
 * Radar DonutChart (`.sst-donut`): anel em `conic-gradient` com o total no miolo (22/700) e legenda
 * em 13px com "valor · %". Para partes de um todo com 2 a 4 categorias; para comparar valores use
 * `BarChart`. O texto fica sempre em `fg`; a cor está só no ponto de 10px.
 */
function DonutChart({
  segments,
  total,
  totalLabel,
  unit,
  size = 120,
  thickness = 16,
  title,
  legend = true,
  format = defaultFormat,
  holeClassName,
  className,
  'aria-label': ariaLabel,
  ...props
}: DonutChartProps) {
  const values = segments.map(s => Math.max(0, s.value || 0))
  const sum = values.reduce((a, v) => a + v, 0)
  const percents = roundedPercents(values)
  const centerValue = total ?? sum

  let acc = 0
  const stops = segments.map((s, i) => {
    const from = (acc / (sum || 1)) * 100
    acc += values[i]
    return `${toneColor[s.tone]} ${from.toFixed(2)}% ${((acc / (sum || 1)) * 100).toFixed(2)}%`
  })
  const background = sum > 0 ? `conic-gradient(${stops.join(', ')})` : 'var(--muted)'

  const centerText = totalLabel ?? format(centerValue)
  const summary = segments.map((s, i) => `${s.label} ${format(s.value)} (${percents[i]}%)`).join(', ')
  const label =
    ariaLabel ??
    `${typeof centerText === 'string' ? centerText : format(centerValue)}${typeof unit === 'string' ? ` ${unit}` : ''}: ${summary}`

  return (
    <div data-slot="donut-chart" className={cn('flex min-w-0 flex-col gap-4', className)} {...props}>
      {title != null && <span className="text-base leading-6 font-semibold">{title}</span>}
      <div className="flex flex-wrap items-center gap-6">
        <div
          role="img"
          aria-label={label}
          className="relative shrink-0 rounded-full"
          style={{ width: size, height: size, background }}>
          <div
            className={cn(
              'bg-card absolute flex flex-col items-center justify-center rounded-full text-center',
              holeClassName,
            )}
            style={{ inset: thickness }}>
            <span className="text-[22px] leading-[26px] font-bold tracking-[-0.02em] tabular-nums">{centerText}</span>
            {unit != null && <span className="text-muted-foreground text-[11px] leading-[14px]">{unit}</span>}
          </div>
        </div>
        {legend && (
          <div className="flex min-w-40 flex-1 flex-col gap-2.5 text-[13px] leading-[18px]">
            {segments.map((s, i) => (
              <div key={s.label} className="flex justify-between gap-3">
                <span className="inline-flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-[3px]"
                    style={{ background: toneColor[s.tone] }}
                  />
                  <span className="truncate">{s.label}</span>
                </span>
                <span className="font-medium whitespace-nowrap tabular-nums">
                  {format(s.value)} · {percents[i]}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export type { DonutChartProps, DonutSegment, DonutTone }
export { DonutChart }
