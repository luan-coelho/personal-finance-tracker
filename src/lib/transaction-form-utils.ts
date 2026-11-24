import type { Transaction, TransactionFormValues } from '@/app/db/schemas/transaction-schema'

export type TransactionInitialValues = Partial<Pick<TransactionFormValues, 'type' | 'category' | 'date'>>

interface TransactionFormContext {
  transaction?: Transaction
  initialValues?: TransactionInitialValues
  existingTransactions: Transaction[]
  monthStartDate: Date
  /** Hoje (início do dia). Com `isCurrentMonth`, é a data padrão de uma transação nova. */
  today?: Date
  /** O mês selecionado é o mês corrente. */
  isCurrentMonth?: boolean
  userId: string
  mode: 'create' | 'edit' | 'copy'
}

export function getTransactionFormContextDefaults({
  transaction,
  initialValues,
  existingTransactions,
  monthStartDate,
  today,
  isCurrentMonth = false,
  userId,
  mode,
}: TransactionFormContext) {
  const latestTransaction = existingTransactions.reduce<Transaction | undefined>(
    (latest, current) => (!latest || new Date(current.date) > new Date(latest.date) ? current : latest),
    undefined,
  )

  // No mês corrente a transação nova nasce com a data de hoje (lançamento na hora, no celular);
  // em outros meses vale a última data lançada na página ou o dia 1 do mês selecionado.
  const fallbackDate =
    isCurrentMonth && today ? today : latestTransaction ? new Date(latestTransaction.date) : monthStartDate

  return {
    type: transaction?.type ?? initialValues?.type ?? 'saida',
    category: transaction ? transaction.category || undefined : initialValues?.category,
    date: transaction?.date ? new Date(transaction.date) : (initialValues?.date ?? fallbackDate),
    userId: mode === 'edit' && transaction ? transaction.userId : userId,
  }
}
