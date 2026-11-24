const categoryCollator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true })

/** Ordem alfabética de nomes de categoria em pt-BR: "Água" junto do "A", sem diferença de caixa. */
export function compareCategoryNames(a: string, b: string) {
  return categoryCollator.compare(a, b)
}
