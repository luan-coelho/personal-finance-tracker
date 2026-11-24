'use client'

import { usePathname } from 'next/navigation'
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import type { Transaction } from '@/app/db/schemas'

import { isPrimaryRootPath } from '@/components/layout/navigation'
import { TransactionForm } from '@/components/transaction-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Fab } from '@/components/ui/fab'

import { useSelectedSpace } from '@/hooks/use-selected-space'

import type { TransactionInitialValues } from '@/lib/transaction-form-utils'

/** Parâmetro de URL que abre o formulário (atalho "Nova transação" do ícone do app). */
export const NEW_TRANSACTION_PARAM = 'new'

export interface TransactionComposerOptions {
  /** Transação a duplicar: os campos vêm preenchidos e o lançamento é do usuário atual. */
  duplicateOf?: Transaction
  /** Tipo, categoria e data iniciais. */
  initialValues?: TransactionInitialValues
  /** Transações carregadas na tela, usadas na data padrão fora do mês corrente. */
  existingTransactions?: Transaction[]
}

interface TransactionComposerContextValue {
  /** Abre o formulário "Nova transação" sobre a tela atual. */
  openComposer: (options?: TransactionComposerOptions) => void
}

const TransactionComposerContext = createContext<TransactionComposerContextValue | undefined>(undefined)

/** Foco inicial no valor: é o primeiro dado que a pessoa digita. */
function focusAmountField(event: Event) {
  const amount = (event.currentTarget as HTMLElement | null)?.querySelector<HTMLInputElement>('input[name="amount"]')
  if (!amount) return
  event.preventDefault()
  amount.focus()
}

/**
 * Formulário único de "Nova transação" do app: qualquer tela (FAB, botões, atalho do ícone)
 * abre o mesmo dialog, que no celular é uma folha inferior.
 */
export function TransactionComposerProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<TransactionComposerOptions | null>(null)

  const openComposer = useCallback((next: TransactionComposerOptions = {}) => setOptions(next), [])
  const close = useCallback(() => setOptions(null), [])
  const value = useMemo(() => ({ openComposer }), [openComposer])

  // Atalho do ícone do app: `?new=1` abre o formulário e sai da URL.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (!url.searchParams.has(NEW_TRANSACTION_PARAM)) return
    url.searchParams.delete(NEW_TRANSACTION_PARAM)
    window.history.replaceState(window.history.state, '', url)
    setOptions({})
  }, [])

  return (
    <TransactionComposerContext.Provider value={value}>
      {children}
      <Dialog open={options !== null} onOpenChange={open => !open && close()}>
        <DialogContent size="md" onInteractOutside={event => event.preventDefault()} onOpenAutoFocus={focusAmountField}>
          <DialogHeader>
            <DialogTitle>Nova transação</DialogTitle>
          </DialogHeader>
          {options && (
            <TransactionForm
              layout="dialog"
              transaction={options.duplicateOf}
              mode={options.duplicateOf ? 'copy' : 'create'}
              initialValues={options.initialValues}
              existingTransactions={options.existingTransactions}
              onSuccess={close}
              onCancel={close}
            />
          )}
        </DialogContent>
      </Dialog>
    </TransactionComposerContext.Provider>
  )
}

export function useTransactionComposer(): TransactionComposerContextValue {
  const context = useContext(TransactionComposerContext)

  if (!context) {
    throw new Error('useTransactionComposer must be used within a TransactionComposerProvider')
  }

  return context
}

/**
 * FAB "Nova transação" do mobile: nas telas-raiz de finanças, 16px acima da BottomNav.
 * No desktop a mesma ação é o botão primário da página.
 */
export function TransactionComposerFab() {
  const pathname = usePathname()
  const { selectedSpace } = useSelectedSpace()
  const { openComposer } = useTransactionComposer()

  if (!selectedSpace || !isPrimaryRootPath(pathname)) return null

  return (
    <Fab
      label="Nova transação"
      className="bottom-[calc(var(--bottom-nav)+var(--safe-bottom)+--spacing(4))] fixed right-4 z-30 lg:hidden print:hidden"
      onClick={() => openComposer()}
    />
  )
}
