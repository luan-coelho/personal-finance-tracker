/**
 * Utilitários para operações de data com fuso horário brasileiro (America/Sao_Paulo)
 * Este módulo garante que todas as operações de data funcionem corretamente
 * independente do timezone do servidor (importante para Vercel que usa UTC)
 */

// Configuração do fuso horário brasileiro
export const BRAZIL_TIMEZONE = 'America/Sao_Paulo'

/**
 * Obtém a data e hora atual no fuso horário brasileiro
 * Funciona corretamente em qualquer servidor (UTC, etc.)
 * @returns Date object representando agora no Brasil
 */
export function getBrazilNow(): Date {
  // Usa Intl.DateTimeFormat para obter os componentes da data no timezone do Brasil
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BRAZIL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(new Date())
  const get = (type: string) => parts.find(p => p.type === type)?.value || '0'

  const year = parseInt(get('year'))
  const month = parseInt(get('month')) - 1 // JavaScript months are 0-indexed
  const day = parseInt(get('day'))
  const hour = parseInt(get('hour'))
  const minute = parseInt(get('minute'))
  const second = parseInt(get('second'))

  return new Date(year, month, day, hour, minute, second)
}

/**
 * Obtém o ano e mês atual no timezone do Brasil
 * @returns { year: number, month: number } onde month é 0-indexed
 */
export function getBrazilCurrentYearMonth(): { year: number; month: number } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BRAZIL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
  })

  const parts = formatter.formatToParts(new Date())
  const get = (type: string) => parts.find(p => p.type === type)?.value || '0'

  return {
    year: parseInt(get('year')),
    month: parseInt(get('month')) - 1, // JavaScript months are 0-indexed
  }
}

/**
 * Obtém o range de datas para um mês específico, com timestamps adequados para queries
 * As datas retornadas são UTC mas representam o início e fim do mês no timezone brasileiro
 * @param year Ano
 * @param month Mês (0-11)
 * @returns { start: Date, end: Date } com timestamps UTC ajustados para São Paulo
 */
export function getMonthRangeBrazil(year: number, month: number): { start: Date; end: Date } {
  // Calcula o último dia do mês
  const lastDay = new Date(year, month + 1, 0).getDate()

  // Cria as datas como strings ISO no timezone de São Paulo
  // São Paulo é UTC-3, então precisamos ajustar:
  // - Início do mês: 00:00:00 em São Paulo = 03:00:00 UTC
  // - Fim do mês: 23:59:59 em São Paulo = 02:59:59 UTC do dia seguinte

  // Formato: YYYY-MM-DDTHH:mm:ss.sssZ (UTC)
  // Para início do dia em SP (00:00:00), adicionamos 3 horas para UTC
  const startUTC = new Date(`${year}-${String(month + 1).padStart(2, '0')}-01T03:00:00.000Z`)

  // Para fim do último dia em SP (23:59:59.999), que é 02:59:59.999 UTC do dia seguinte
  // Mas como queremos incluir todo o dia, é mais seguro ir até 03:00:00.000 do próximo mês
  const endUTC = new Date(
    `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, '0')}-01T02:59:59.999Z`,
  )

  return { start: startUTC, end: endUTC }
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
 * Formata uma data para string no formato ISO (YYYY-MM-DD) considerando o timezone brasileiro
 * @param date Data a ser formatada
 * @returns String no formato YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BRAZIL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(date)
}

/**
 * Formata uma data para uso em queries de banco de dados
 * Retorna a string ISO completa (com timezone UTC)
 * @param date Data a ser formatada
 * @returns String ISO completa pronta para query
 */
export function formatDateForQuery(date: Date): string {
  return date.toISOString()
}

/**
 * Cria uma data a partir de uma string YYYY-MM-DD, interpretando como data no Brasil
 * @param dateString String de data no formato YYYY-MM-DD
 * @returns Date object representando o início do dia no Brasil (convertido para UTC)
 */
export function createBrazilianDate(dateString: string): Date {
  // Adiciona o offset de São Paulo (+03:00 UTC para representar 00:00 em SP)
  return new Date(dateString + 'T03:00:00.000Z')
}

/**
 * Obtém o primeiro dia do mês com hora 00:00:00 no timezone brasileiro
 * @param year Ano
 * @param month Mês (0-11)
 * @returns Date object do primeiro dia do mês (UTC ajustado para SP)
 */
export function getFirstDayOfMonth(year: number, month: number): Date {
  return getMonthRangeBrazil(year, month).start
}

/**
 * Obtém o último dia do mês com hora 23:59:59 no timezone brasileiro
 * @param year Ano
 * @param month Mês (0-11)
 * @returns Date object do último dia do mês (UTC ajustado para SP)
 */
export function getLastDayOfMonth(year: number, month: number): Date {
  return getMonthRangeBrazil(year, month).end
}

/**
 * Verifica se duas datas são do mesmo mês e ano (considerando timezone brasileiro)
 * @param date1 Primeira data
 * @param date2 Segunda data
 * @returns true se são do mesmo mês e ano
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  const format = (d: Date) => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: BRAZIL_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
    })
    return formatter.format(d)
  }
  return format(date1) === format(date2)
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

/**
 * Alias para compatibilidade com código existente
 * @deprecated Use getBrazilNow() para novo código
 */
export function getNowInBrazil(): Date {
  return getBrazilNow()
}
