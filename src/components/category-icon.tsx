import type * as React from 'react'

import { Icon, type IconProps } from '@/components/ui/icon'

import type { IconName } from '@/lib/icons'
import { cn } from '@/lib/utils'

export type CategoryTone = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'ai'

const categoryIcons: Array<{ keywords: string[]; icon: IconName; tone: CategoryTone }> = [
  { keywords: ['salario', 'remuneracao'], icon: 'banknote', tone: 'success' },
  { keywords: ['freelance', 'trabalho', 'servico'], icon: 'briefcase', tone: 'info' },
  { keywords: ['investimento', 'poupanca', 'rendimento'], icon: 'trending-up', tone: 'success' },
  { keywords: ['venda'], icon: 'store', tone: 'warning' },
  { keywords: ['presente', 'doacao'], icon: 'gift', tone: 'ai' },
  { keywords: ['alimentacao', 'mercado', 'restaurante', 'comida'], icon: 'utensils', tone: 'warning' },
  { keywords: ['transporte', 'combustivel', 'gasolina', 'uber', 'onibus'], icon: 'car', tone: 'info' },
  { keywords: ['moradia', 'casa', 'aluguel', 'habitacao'], icon: 'home', tone: 'primary' },
  { keywords: ['saude', 'medico', 'farmacia'], icon: 'heart-pulse', tone: 'error' },
  { keywords: ['educacao', 'escola', 'curso', 'faculdade'], icon: 'graduation-cap', tone: 'ai' },
  { keywords: ['lazer', 'entretenimento', 'diversao'], icon: 'gamepad', tone: 'ai' },
  { keywords: ['compra', 'shopping'], icon: 'shopping-bag', tone: 'primary' },
  { keywords: ['energia', 'luz', 'eletricidade'], icon: 'zap', tone: 'warning' },
  { keywords: ['agua'], icon: 'droplets', tone: 'info' },
  { keywords: ['telefone', 'celular', 'internet'], icon: 'smartphone', tone: 'primary' },
  { keywords: ['viagem', 'ferias'], icon: 'plane', tone: 'info' },
  { keywords: ['conta', 'fatura', 'boleto'], icon: 'receipt', tone: 'error' },
]

const FALLBACK_CATEGORY_ICON: IconName = 'folder-open'

/** Tons usados quando nenhuma palavra-chave casa: o nome escolhe um, sempre o mesmo. */
const FALLBACK_TONES: CategoryTone[] = ['primary', 'info', 'ai', 'success', 'warning', 'error']

const toneClasses: Record<CategoryTone, { text: string; tile: string }> = {
  primary: { text: 'text-primary-text', tile: 'bg-primary-soft text-primary-text' },
  success: { text: 'text-success-text', tile: 'bg-success-soft text-success-text' },
  warning: { text: 'text-warning-text', tile: 'bg-warning-soft text-warning-text' },
  error: { text: 'text-error-text', tile: 'bg-error-soft text-error-text' },
  info: { text: 'text-info-text', tile: 'bg-info-soft text-info-text' },
  ai: { text: 'text-ai-text', tile: 'bg-ai-soft text-ai-text' },
}

/** Nome sem acento e em minúsculas, para casar palavras-chave e buscas. */
export function normalizeCategoryName(name: string) {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

function findCategoryEntry(name: string) {
  const normalizedName = normalizeCategoryName(name)
  return categoryIcons.find(({ keywords }) => keywords.some(keyword => normalizedName.includes(keyword)))
}

/** Resolve o ícone Radar de uma categoria pelo nome (palavras-chave sem acento). */
export function getCategoryIconName(name: string): IconName {
  return findCategoryEntry(name)?.icon ?? FALLBACK_CATEGORY_ICON
}

/** Tom de cor da categoria: o da palavra-chave ou, sem ela, um derivado do nome (estável). */
export function getCategoryTone(name: string): CategoryTone {
  const entry = findCategoryEntry(name)
  if (entry) return entry.tone

  const normalizedName = normalizeCategoryName(name)
  let hash = 0
  for (let index = 0; index < normalizedName.length; index++) {
    hash = (hash * 31 + normalizedName.charCodeAt(index)) % 9973
  }
  return FALLBACK_TONES[hash % FALLBACK_TONES.length]
}

/** Classe de cor do ícone da categoria (`text-*-text`), para usar fora do `CategoryIcon`. */
export function getCategoryIconClassName(name: string): string {
  return toneClasses[getCategoryTone(name)].text
}

export interface CategoryIconProps extends Omit<IconProps, 'name'> {
  /** Nome da categoria (não o nome do ícone). */
  name: string
  /** Pinta o ícone com o tom da categoria. Padrão `true`. */
  colored?: boolean
}

export function CategoryIcon({ name, size = 16, colored = true, className, ...props }: CategoryIconProps) {
  return (
    <Icon
      name={getCategoryIconName(name)}
      size={size}
      className={cn(colored && getCategoryIconClassName(name), className)}
      {...props}
    />
  )
}

export interface CategoryIconTileProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  /** Nome da categoria (não o nome do ícone). */
  name: string
  /** Tamanho do ícone dentro do tile de 32px. Padrão 16. */
  iconSize?: number
}

/** Tile de 32px com o ícone da categoria: fundo suave e ícone no tom da categoria. */
export function CategoryIconTile({ name, iconSize = 16, className, ...props }: CategoryIconTileProps) {
  return (
    <span
      data-slot="category-icon-tile"
      className={cn(
        'rounded-control inline-flex size-8 shrink-0 items-center justify-center',
        toneClasses[getCategoryTone(name)].tile,
        className,
      )}
      {...props}>
      <CategoryIcon name={name} size={iconSize} colored={false} />
    </span>
  )
}
