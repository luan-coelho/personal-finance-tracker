/**
 * Utilitários para manipulação segura de valores monetários.
 * Centraliza a normalização de formato brasileiro (1.234,56) para formato decimal (1234.56)
 * e operações aritméticas seguras com precisão de 2 casas decimais.
 */

/**
 * Normaliza um valor monetário no formato brasileiro para formato decimal.
 * "1.234,56" → "1234.56"
 * "1234.56" → "1234.56" (já normalizado)
 * "1234,56" → "1234.56"
 * "1234" → "1234.00"
 */
export function normalizeBrazilianAmount(input: string): string {
  if (!input || input.trim() === '') {
    return '0.00'
  }

  let value = input.trim()

  // Se contém vírgula, é formato brasileiro: remove pontos de milhar, troca vírgula por ponto
  if (value.includes(',')) {
    value = value.replace(/\./g, '').replace(',', '.')
  }

  const num = parseFloat(value)
  if (isNaN(num)) {
    return '0.00'
  }

  return num.toFixed(2)
}

/**
 * Verifica se um valor no formato brasileiro é um número positivo válido.
 * Usado para validação Zod.
 */
export function isPositiveAmount(val: string): boolean {
  const normalized = normalizeBrazilianAmount(val)
  const num = parseFloat(normalized)
  return !isNaN(num) && num > 0
}

/**
 * Verifica se um valor no formato brasileiro é um número não-negativo válido.
 * Usado para validação Zod de campos que aceitam zero (ex: currentAmount).
 */
export function isNonNegativeAmount(val: string): boolean {
  const normalized = normalizeBrazilianAmount(val)
  const num = parseFloat(normalized)
  return !isNaN(num) && num >= 0
}

/**
 * Converte uma string de valor monetário (já normalizada do DB ou input normalizado) para número.
 * Valores do banco já vêm no formato "1234.56".
 */
export function toNumber(amount: string): number {
  const num = parseFloat(amount)
  if (isNaN(num)) {
    return 0
  }
  return num
}

/**
 * Soma dois valores monetários com precisão de 2 casas decimais.
 * Aceita strings já normalizadas (formato "1234.56" do DB).
 */
export function addAmounts(a: string, b: string): string {
  const result = toNumber(a) + toNumber(b)
  return result.toFixed(2)
}

/**
 * Subtrai dois valores monetários com precisão de 2 casas decimais.
 * Aceita strings já normalizadas (formato "1234.56" do DB).
 */
export function subtractAmounts(a: string, b: string): string {
  const result = toNumber(a) - toNumber(b)
  return result.toFixed(2)
}
