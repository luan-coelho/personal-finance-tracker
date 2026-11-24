import type { TransactionType } from '@/app/db/schemas'

import type { IconName } from '@/lib/icons'

export type TransactionTypeTone = 'success' | 'error' | 'info'

/** Rótulo, ícone e tom de cada tipo de transação: entrada verde, saída vermelha, reserva ciano. */
export const transactionTypeMeta: Record<
  TransactionType,
  { label: string; pluralLabel: string; icon: IconName; tone: TransactionTypeTone }
> = {
  entrada: { label: 'Entrada', pluralLabel: 'Entradas', icon: 'arrow-up-circle', tone: 'success' },
  saida: { label: 'Saída', pluralLabel: 'Saídas', icon: 'arrow-down-circle', tone: 'error' },
  reserva: { label: 'Reserva', pluralLabel: 'Reservas', icon: 'piggy-bank', tone: 'info' },
}

export const transactionTypes = ['entrada', 'saida', 'reserva'] as const satisfies readonly TransactionType[]
