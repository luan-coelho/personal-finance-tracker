import {
  Banknote,
  Briefcase,
  Car,
  Droplets,
  FolderOpen,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Plane,
  ReceiptText,
  ShoppingBag,
  Smartphone,
  Store,
  TrendingUp,
  Utensils,
  Zap,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react'

const categoryIcons: Array<{ keywords: string[]; icon: LucideIcon }> = [
  { keywords: ['salario', 'remuneracao'], icon: Banknote },
  { keywords: ['freelance', 'trabalho', 'servico'], icon: Briefcase },
  { keywords: ['investimento', 'poupanca', 'rendimento'], icon: TrendingUp },
  { keywords: ['venda'], icon: Store },
  { keywords: ['presente', 'doacao'], icon: Gift },
  { keywords: ['alimentacao', 'mercado', 'restaurante', 'comida'], icon: Utensils },
  { keywords: ['transporte', 'combustivel', 'gasolina', 'uber', 'onibus'], icon: Car },
  { keywords: ['moradia', 'casa', 'aluguel', 'habitacao'], icon: House },
  { keywords: ['saude', 'medico', 'farmacia'], icon: HeartPulse },
  { keywords: ['educacao', 'escola', 'curso', 'faculdade'], icon: GraduationCap },
  { keywords: ['lazer', 'entretenimento', 'diversao'], icon: Gamepad2 },
  { keywords: ['compra', 'shopping'], icon: ShoppingBag },
  { keywords: ['energia', 'luz', 'eletricidade'], icon: Zap },
  { keywords: ['agua'], icon: Droplets },
  { keywords: ['telefone', 'celular', 'internet'], icon: Smartphone },
  { keywords: ['viagem', 'ferias'], icon: Plane },
  { keywords: ['conta', 'fatura', 'boleto'], icon: ReceiptText },
]

interface CategoryIconProps extends LucideProps {
  name: string
}

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  const normalizedName = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  const Icon =
    categoryIcons.find(({ keywords }) => keywords.some(keyword => normalizedName.includes(keyword)))?.icon || FolderOpen

  return <Icon {...props} />
}
