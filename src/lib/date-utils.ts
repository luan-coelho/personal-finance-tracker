/**
 * Utilitários para operações de data com fuso horário brasileiro
 */

// Configuração do fuso horário brasileiro
export const BRAZIL_TIMEZONE = 'America/Sao_Paulo'

/**
 * Cria uma nova data no fuso horário brasileiro
 * @param dateString String de data no formato YYYY-MM-DD
 * @returns Date object no fuso horário brasileiro
 */
export function createBrazilianDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00')
}

/**
 * Formata uma data para string no formato brasileiro (DD/MM/YYYY)
 * @param date Data a ser formatada
 * @returns String formatada
 */
export function formatDateBrazilian(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    timeZone: BRAZIL_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Formata uma data para string no formato ISO brasileiro (YYYY-MM-DD)
 * @param date Data a ser formatada
 * @returns String no formato YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Obtém a data atual no fuso horário brasileiro
 * @returns Date object representando agora no Brasil
 */
export function getNowInBrazil(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE }))
}

/**
 * Obtém o primeiro dia do mês no fuso horário brasileiro
 * @param year Ano
 * @param month Mês (0-11)
 * @returns Date object do primeiro dia do mês
 */
export function getFirstDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1)
}

/**
 * Obtém o último dia do mês no fuso horário brasileiro
 * @param year Ano
 * @param month Mês (0-11)
 * @returns Date object do último dia do mês
 */
export function getLastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0)
}

/**
 * Verifica se duas datas são do mesmo mês e ano
 * @param date1 Primeira data
 * @param date2 Segunda data
 * @returns true se são do mesmo mês e ano
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth()
}

/**
 * Obtém o nome do mês em português
 * @param monthIndex Índice do mês (0-11)
 * @returns Nome do mês em português
 */
export function getMonthNameInPortuguese(monthIndex: number): string {
  const months = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ]
  return months[monthIndex] || 'janeiro'
}
