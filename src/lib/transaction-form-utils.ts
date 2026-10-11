import type { Transaction, TransactionFormValues } from '@/app/db/schemas/transaction-schema'

export type TransactionInitialValues = Partial<Pick<TransactionFormValues, 'type' | 'category' | 'date'>>

interface TransactionFormContext {
  transaction?: Transaction
  initialValues?: TransactionInitialValues
  existingTransactions: Transaction[]
  monthStartDate: Date
  userId: string
  mode: 'create' | 'edit' | 'copy'
}

export function getTransactionFormContextDefaults({
  transaction,
  initialValues,
  existingTransactions,
  monthStartDate,
  userId,
  mode,
}: TransactionFormContext) {
  const latestTransaction = existingTransactions.reduce<Transaction | undefined>(
    (latest, current) => (!latest || new Date(current.date) > new Date(latest.date) ? current : latest),
    undefined,
  )

  return {
    type: transaction?.type ?? initialValues?.type ?? 'saida',
    category: transaction ? transaction.category || undefined : initialValues?.category,
    date: transaction?.date
      ? new Date(transaction.date)
      : (initialValues?.date ?? (latestTransaction ? new Date(latestTransaction.date) : monthStartDate)),
    userId: mode === 'edit' && transaction ? transaction.userId : userId,
  }
}
