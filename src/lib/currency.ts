/**
 * Utilitários para formatação de moeda brasileira (BRL).
 */

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

/**
 * Formata um valor numérico ou string como moeda brasileira (R$).
 * Aceita number, string numérica, ou string de decimal do DB.
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return 'R$ 0,00'
  return currencyFormatter.format(numValue)
}

/**
 * Máscara de input para valores monetários brasileiros.
 * Permite apenas dígitos, pontos (milhar) e vírgula (decimal).
 */
export function handleCurrencyInput(value: string, setValue: (val: string) => void): void {
  // Remove tudo que não é dígito, vírgula ou ponto
  const cleaned = value.replace(/[^\d.,]/g, '')
  setValue(cleaned)
}
