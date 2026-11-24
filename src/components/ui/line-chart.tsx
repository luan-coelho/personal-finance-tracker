'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type LineTone = 'primary' | 'previous' | 'success' | 'error' | 'warning' | 'info'

interface LineSeries {
  /** Nome na legenda e no tooltip ("novembro"). */
  name: string
  /** Um valor por rótulo do eixo. `null` interrompe a linha (ex.: o mês atual para em hoje). */
  values: Array<number | null>
  /** Padrão: `primary` na 1ª série (2,5px contínua), `previous` na 2ª (`border-strong`, 2px tracejada). */
  tone?: LineTone
  /** Traço tracejado. Padrão: `true` só para `previous`. */
  dashed?: boolean
}

interface LineChartMarker {
  /** Índice do ponto destacado quando não há hover. */
  index: number
  /** Série onde o ponto fica (padrão 0). */
  series?: number
  /** Texto fixo do tooltip no lugar de "rótulo + valores". */
  label?: string
}

interface LineChartProps extends Omit<React.ComponentProps<'div'>, 'title' | 'aria-label'> {
  /** Até 3 séries; nunca duas contínuas da mesma cor. */
  series: LineSeries[]
  /** Rótulos do eixo X (DM Mono 11px, `muted-fg`), um por ponto. Rótulo vazio não aparece. */
  labels?: string[]
  /** Mostra só 1 a cada N rótulos (índices 0, N, 2N…). */
  labelEvery?: number
  /** Base da escala. Padrão 0. */
  min?: number
  /** Topo da escala. Padrão: máximo "redondo" acima do maior valor. */
  max?: number
  /** Formata os valores do tooltip. Padrão: número em pt-BR. */
  format?: (value: number) => string
  /** Altura da área do gráfico em px. Padrão 140. */
  height?: number
  /** Cabeçalho opcional (16/600); dentro de um `Card` com `CardHeader`, deixe sem. */
  title?: React.ReactNode
  subtitle?: React.ReactNode
  /** Legenda (traço 10×3) aparece com 2+ séries; `false` esconde. */
  legend?: boolean
  /** Ponto fixo com tooltip quando não há hover (faz o papel do hover no toque). */
  marker?: LineChartMarker
  /** `false` desliga o tooltip que segue o ponteiro e as setas do teclado. */
  hover?: boolean
  /** Resumo do gráfico para leitores de tela (o SVG é `role="img"`). */
  'aria-label': string
}

// Geometria do Radar (`LC_*`): viewBox 320×140, linhas entre y=20 e y=139.
const VIEW_W = 320
const VIEW_H = 140
const PLOT_TOP = 20
const PLOT_BOTTOM = 139

const strokeTone: Record<LineTone, string> = {
  primary: 'stroke-primary',
  previous: 'stroke-border-strong',
  success: 'stroke-success',
  error: 'stroke-error',
  warning: 'stroke-warning',
  info: 'stroke-info',
}

const borderTone: Record<LineTone, string> = {
  primary: 'border-primary',
  previous: 'border-border-strong',
  success: 'border-success',
  error: 'border-error',
  warning: 'border-warning',
  info: 'border-info',
}

const textTone: Record<LineTone, string> = {
  primary: 'text-primary',
  previous: 'text-border-strong',
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  info: 'text-info',
}

const defaultFormat = (value: number) => value.toLocaleString('pt-BR')

function round(n: number) {
  return Math.round(n * 10) / 10
}

/** Topo "redondo" da escala: 1, 2, 2,5, 5 ou 10 × 10^k acima do maior valor. */
function niceMax(value: number) {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].find(f => f * magnitude >= value) ?? 10
  return step * magnitude
}

/**
 * Curva suave monotônica (Fritsch–Carlson, como `curveMonotoneX`): não ultrapassa os pontos,
 * então um acumulado nunca parece cair entre dois dias.
 */
function smoothPath(points: Array<[number, number]>) {
  const n = points.length
  if (n === 0) return ''
  if (n === 1) return `M${round(points[0][0])} ${round(points[0][1])}h0`
  const dx: number[] = []
  const slope: number[] = []
  for (let i = 0; i < n - 1; i++) {
    dx[i] = points[i + 1][0] - points[i][0]
    slope[i] = (points[i + 1][1] - points[i][1]) / (dx[i] || 1)
  }
  const tangent: number[] = [slope[0]]
  for (let i = 1; i < n - 1; i++) {
    tangent[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2
  }
  tangent[n - 1] = slope[n - 2]
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      tangent[i] = 0
      tangent[i + 1] = 0
      continue
    }
    const a = tangent[i] / slope[i]
    const b = tangent[i + 1] / slope[i]
    const h = a * a + b * b
    if (h > 9) {
      const t = 3 / Math.sqrt(h)
      tangent[i] = t * a * slope[i]
      tangent[i + 1] = t * b * slope[i]
    }
  }
  let d = `M${round(points[0][0])} ${round(points[0][1])}`
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i]
    const [x1, y1] = points[i + 1]
    const third = dx[i] / 3
    d += `C${round(x0 + third)} ${round(y0 + tangent[i] * third)} ${round(x1 - third)} ${round(y1 - tangent[i + 1] * third)} ${round(x1)} ${round(y1)}`
  }
  return d
}

/**
 * Radar LineChart (`.sst-linechart`): linhas suaves em SVG, série atual em `primary` (2,5px contínua),
 * anterior em `border-strong` (2px tracejada), grade de 4 linhas em `border-subtle`, sem eixo Y.
 * O valor exato vive no tooltip (`inverse`, DM Mono 11px), que segue o ponteiro ou as setas do teclado.
 * Não preencha a área nem use mais de 3 séries.
 */
function LineChart({
  series,
  labels = [],
  labelEvery = 1,
  min = 0,
  max,
  format = defaultFormat,
  height = 140,
  title,
  subtitle,
  legend,
  marker,
  hover: hoverEnabled = true,
  'aria-label': ariaLabel,
  className,
  ...props
}: LineChartProps) {
  const [active, setActive] = React.useState<number | null>(null)
  const liveId = React.useId()

  const visibleSeries = series.slice(0, 3)
  const count = Math.max(labels.length, ...visibleSeries.map(s => s.values.length))
  const n = Math.max(2, count)
  const dataMax = Math.max(
    min,
    ...visibleSeries.flatMap(s => s.values.filter((v): v is number => v !== null && Number.isFinite(v))),
  )
  const top = max ?? niceMax(dataMax - min) + min
  const span = top - min || 1

  const x = (index: number) => (index / (n - 1)) * VIEW_W
  const y = (value: number) => PLOT_BOTTOM - ((value - min) / span) * (PLOT_BOTTOM - PLOT_TOP)
  const toneOf = (s: LineSeries, index: number): LineTone => s.tone ?? (index === 0 ? 'primary' : 'previous')
  const dashedOf = (s: LineSeries, index: number) => s.dashed ?? toneOf(s, index) === 'previous'

  const grid = [0, 1, 2, 3].map(k => `M0 ${round(PLOT_TOP + (k * (PLOT_BOTTOM - PLOT_TOP)) / 3)}h${VIEW_W}`).join('')

  const paths = visibleSeries.map(s => {
    // Cada trecho contínuo vira um subcaminho; `null` interrompe a linha.
    const runs: Array<Array<[number, number]>> = []
    let run: Array<[number, number]> = []
    s.values.forEach((value, index) => {
      if (value === null || !Number.isFinite(value)) {
        if (run.length) runs.push(run)
        run = []
      } else {
        run.push([x(index), y(value)])
      }
    })
    if (run.length) runs.push(run)
    return runs.map(smoothPath).join('')
  })

  const showLegend = legend !== false && visibleSeries.length > 1
  const showHeader = title != null || subtitle != null || showLegend

  const usingMarker = active === null && marker !== undefined
  const activeIndex = active ?? marker?.index ?? null
  const points =
    activeIndex === null
      ? []
      : visibleSeries
          .map((s, index) => ({ series: s, index, value: s.values[activeIndex] ?? null }))
          .filter((p): p is { series: LineSeries; index: number; value: number } => p.value !== null)
  const anchor =
    points.find(p => p.index === (usingMarker ? (marker?.series ?? 0) : 0)) ?? (points.length ? points[0] : undefined)
  const label = activeIndex !== null ? labels[activeIndex] : undefined
  const tipLines =
    usingMarker && marker?.label
      ? [marker.label]
      : points.length > 1
        ? [label ?? '', ...points.map(p => `${p.series.name} · ${format(p.value)}`)].filter(Boolean)
        : points.length === 1
          ? [label ? `${label} · ${format(points[0].value)}` : format(points[0].value)]
          : []

  const anchorX = activeIndex !== null ? x(activeIndex) : 0
  const anchorTopPx = anchor ? (y(anchor.value) / VIEW_H) * height : 0
  const tipHeightPx = tipLines.length > 1 ? tipLines.length * 16 + 8 : 24
  const tipBelow = anchorTopPx < tipHeightPx + 16
  const tipEdge = anchorX < 48 ? 'left' : anchorX > VIEW_W - 48 ? 'right' : 'center'

  function lastIndexWithValue() {
    const values = visibleSeries[0]?.values ?? []
    for (let i = values.length - 1; i >= 0; i--) if (values[i] !== null) return i
    return n - 1
  }

  function indexFromPointer(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    if (!rect.width) return null
    return Math.max(0, Math.min(n - 1, Math.round(((event.clientX - rect.left) / rect.width) * (n - 1))))
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const current = active ?? marker?.index ?? lastIndexWithValue()
    let next: number | null = null
    if (event.key === 'ArrowLeft') next = Math.max(0, current - 1)
    else if (event.key === 'ArrowRight') next = Math.min(n - 1, current + 1)
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = n - 1
    else if (event.key === 'Escape') {
      setActive(null)
      return
    }
    if (next === null) return
    event.preventDefault()
    setActive(next)
  }

  const axisLabels = labels.map((text, index) => (index % Math.max(1, labelEvery) === 0 ? text : ''))

  return (
    <div data-slot="line-chart" className={cn('flex min-w-0 flex-col gap-4', className)} {...props}>
      {showHeader && (
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            {title != null && <span className="text-base leading-6 font-semibold">{title}</span>}
            {subtitle != null && <span className="text-muted-foreground text-xs leading-4">{subtitle}</span>}
          </div>
          {showLegend && (
            <div className="text-muted-foreground flex flex-wrap justify-end gap-3 text-xs leading-4">
              {visibleSeries.map((s, index) => (
                <span key={s.name} className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className={cn(
                      'h-[3px] w-2.5 shrink-0 rounded-[2px]',
                      textTone[toneOf(s, index)],
                      dashedOf(s, index)
                        ? 'bg-[repeating-linear-gradient(90deg,currentColor_0_4px,transparent_4px_6px)]'
                        : 'bg-current',
                    )}
                  />
                  {s.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div
        data-slot="line-chart-plot"
        role="img"
        aria-label={ariaLabel}
        aria-describedby={hoverEnabled ? liveId : undefined}
        tabIndex={hoverEnabled ? 0 : undefined}
        className={cn(
          'relative w-full rounded-sm outline-none',
          hoverEnabled && 'focus-visible:shadow-focus-ring touch-pan-y',
        )}
        style={{ height }}
        onPointerMove={hoverEnabled ? event => setActive(indexFromPointer(event)) : undefined}
        onPointerDown={hoverEnabled ? event => setActive(indexFromPointer(event)) : undefined}
        onPointerLeave={hoverEnabled ? () => setActive(null) : undefined}
        onBlur={hoverEnabled ? () => setActive(null) : undefined}
        onKeyDown={hoverEnabled ? handleKeyDown : undefined}>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          className="block size-full overflow-visible"
          fill="none">
          <path d={grid} vectorEffect="non-scaling-stroke" strokeWidth={1} className="stroke-border-subtle" />
          {visibleSeries.map((s, index) => {
            const tone = toneOf(s, index)
            return (
              <path
                key={s.name}
                d={paths[index]}
                vectorEffect="non-scaling-stroke"
                strokeWidth={tone === 'previous' ? 2 : 2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={dashedOf(s, index) ? '4 4' : undefined}
                className={strokeTone[tone]}
              />
            )
          })}
        </svg>

        {tipLines.length > 0 &&
          points.map(p => (
            <span
              key={p.series.name}
              aria-hidden
              className={cn(
                'bg-card pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px]',
                borderTone[toneOf(p.series, p.index)],
              )}
              style={{ left: `${(anchorX / VIEW_W) * 100}%`, top: `${(y(p.value) / VIEW_H) * 100}%` }}
            />
          ))}

        {anchor && tipLines.length > 0 && (
          <span
            aria-hidden
            className={cn(
              'bg-inverse text-inverse-fg pointer-events-none absolute rounded-sm px-2.5 font-mono text-[11px] whitespace-nowrap',
              tipLines.length > 1 ? 'flex flex-col py-1 leading-4' : 'h-6 leading-6',
              tipEdge === 'left' && '-translate-x-1.5',
              tipEdge === 'right' && 'translate-x-[calc(-100%_+_6px)]',
              tipEdge === 'center' && '-translate-x-1/2',
              tipBelow ? 'translate-y-2' : 'translate-y-[calc(-100%_-_8px)]',
            )}
            style={{ left: `${(anchorX / VIEW_W) * 100}%`, top: `${(y(anchor.value) / VIEW_H) * 100}%` }}>
            {tipLines.map(line => (
              <span key={line}>{line}</span>
            ))}
          </span>
        )}
      </div>

      {hoverEnabled && (
        <span id={liveId} aria-live="polite" className="sr-only">
          {active !== null ? tipLines.join(', ') : ''}
        </span>
      )}

      {axisLabels.some(Boolean) && (
        <div aria-hidden className="text-muted-foreground relative h-4 font-mono text-[11px] leading-4">
          {axisLabels.map((text, index) =>
            text ? (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: rótulos podem repetir; a posição é a identidade.
                key={index}
                className={cn(
                  'absolute top-0 whitespace-nowrap',
                  index === 0 ? 'translate-x-0' : index === n - 1 ? '-translate-x-full' : '-translate-x-1/2',
                )}
                style={{ left: `${(index / (n - 1)) * 100}%` }}>
                {text}
              </span>
            ) : null,
          )}
        </div>
      )}
    </div>
  )
}

export type { LineChartMarker, LineChartProps, LineSeries, LineTone }
export { LineChart }
