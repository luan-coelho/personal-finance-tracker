import { Icon, type IconProps } from '@/components/ui/icon'

import type { IconName } from '@/lib/icons'

const categoryIcons: Array<{ keywords: string[]; icon: IconName }> = [
  { keywords: ['salario', 'remuneracao'], icon: 'banknote' },
  { keywords: ['freelance', 'trabalho', 'servico'], icon: 'briefcase' },
  { keywords: ['investimento', 'poupanca', 'rendimento'], icon: 'trending-up' },
  { keywords: ['venda'], icon: 'store' },
  { keywords: ['presente', 'doacao'], icon: 'gift' },
  { keywords: ['alimentacao', 'mercado', 'restaurante', 'comida'], icon: 'utensils' },
  { keywords: ['transporte', 'combustivel', 'gasolina', 'uber', 'onibus'], icon: 'car' },
  { keywords: ['moradia', 'casa', 'aluguel', 'habitacao'], icon: 'home' },
  { keywords: ['saude', 'medico', 'farmacia'], icon: 'heart-pulse' },
  { keywords: ['educacao', 'escola', 'curso', 'faculdade'], icon: 'graduation-cap' },
  { keywords: ['lazer', 'entretenimento', 'diversao'], icon: 'gamepad' },
  { keywords: ['compra', 'shopping'], icon: 'shopping-bag' },
  { keywords: ['energia', 'luz', 'eletricidade'], icon: 'zap' },
  { keywords: ['agua'], icon: 'droplets' },
  { keywords: ['telefone', 'celular', 'internet'], icon: 'smartphone' },
  { keywords: ['viagem', 'ferias'], icon: 'plane' },
  { keywords: ['conta', 'fatura', 'boleto'], icon: 'receipt' },
]

const FALLBACK_CATEGORY_ICON: IconName = 'folder-open'

/** Resolve o ícone Radar de uma categoria pelo nome (palavras-chave sem acento). */
export function getCategoryIconName(name: string): IconName {
  const normalizedName = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  return (
    categoryIcons.find(({ keywords }) => keywords.some(keyword => normalizedName.includes(keyword)))?.icon ??
    FALLBACK_CATEGORY_ICON
  )
}

export interface CategoryIconProps extends Omit<IconProps, 'name'> {
  /** Nome da categoria (não o nome do ícone). */
  name: string
}

export function CategoryIcon({ name, size = 16, ...props }: CategoryIconProps) {
  return <Icon name={getCategoryIconName(name)} size={size} {...props} />
}
