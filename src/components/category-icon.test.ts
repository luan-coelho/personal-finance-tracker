import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import { DefaultCategories } from '@/app/db/schemas/transaction-schema'

import { compareCategoryNames } from '@/lib/category-names'

import { getCategoryIconName, getCategoryTone } from './category-icon'

/** Categorias criadas pelo seed (`scripts/seed-categories.ts`). */
function seededCategoryNames() {
  const source = readFileSync(new URL('../../scripts/seed-categories.ts', import.meta.url), 'utf8')
  return [...source.matchAll(/name: '([^']+)'/g)].map(match => match[1])
}

describe('getCategoryIconName', () => {
  it('gives every seeded and default category its own icon instead of the generic folder', () => {
    const names = [...new Set([...seededCategoryNames(), ...DefaultCategories.entrada, ...DefaultCategories.saida])]
    const withFolder = names.filter(name => getCategoryIconName(name) === 'folder-open')

    assert.ok(names.length > 40, 'o seed foi lido')
    assert.deepEqual(withFolder, [])
  })

  it('maps the categories that used to fall back to the folder', () => {
    const expected: Record<string, string> = {
      Academia: 'dumbbell',
      Assinaturas: 'repeat',
      Beleza: 'scissors',
      Bonificação: 'trophy',
      'Cartão de Crédito': 'credit-card',
      Dividendos: 'pie-chart',
      Empréstimo: 'hand-coins',
      Estacionamento: 'square-parking',
      Impostos: 'landmark',
      Manutenção: 'wrench',
      Medicamentos: 'pill',
      Mesada: 'coins',
      Pet: 'paw',
      Prêmio: 'trophy',
      Reembolso: 'undo',
      Seguros: 'shield-check',
      Streaming: 'tv',
      Vestuário: 'shirt',
      Outros: 'circle-ellipsis',
      'Outros Gastos': 'circle-ellipsis',
      'Outros Recebimentos': 'circle-ellipsis',
    }

    for (const [name, icon] of Object.entries(expected)) {
      assert.equal(getCategoryIconName(name), icon, name)
    }
  })

  it('maps the categories in use in the app', () => {
    const expected: Record<string, string> = {
      'Alimentação/Mercado': 'utensils',
      'Apartamento/condominio': 'building-2',
      Assinaturas: 'repeat',
      'Bônus celular': 'smartphone',
      'Cabelo e sobrancelha': 'scissors',
      'Desenvolvimento e Programação': 'code',
      'Energia Elétrica': 'zap',
      'Estuda Ester': 'graduation-cap',
      Gás: 'flame',
      'Igreja (Dizimo+Oferta+Doação)': 'church',
      'Manutenção da casa': 'wrench',
      'Saída em casal': 'heart',
      Transporte: 'car',
    }

    for (const [name, icon] of Object.entries(expected)) {
      assert.equal(getCategoryIconName(name), icon, name)
    }
  })

  it('keeps gasoline on the car and bills at home', () => {
    assert.equal(getCategoryIconName('Gasolina'), 'car')
    assert.equal(getCategoryIconName('Contas de Casa'), 'home')
  })

  it('matches short keywords only as whole words (or their plural)', () => {
    assert.equal(getCategoryIconName('Pets'), 'paw')
    assert.equal(getCategoryIconName('Carpete'), 'folder-open')
    assert.equal(getCategoryIconName('Gás de cozinha'), 'flame')
    assert.equal(getCategoryIconName('Outros Gastos'), 'circle-ellipsis')
  })

  it('keeps the folder for names it does not recognize', () => {
    assert.equal(getCategoryIconName('Xyz'), 'folder-open')
  })
})

describe('compareCategoryNames', () => {
  it('sorts names alphabetically in pt-BR, ignoring accents and case', () => {
    const names = ['Transporte', 'água', 'Gás', 'Alimentação/Mercado', 'Bônus celular', 'apartamento/condominio']

    assert.deepEqual(names.sort(compareCategoryNames), [
      'água',
      'Alimentação/Mercado',
      'apartamento/condominio',
      'Bônus celular',
      'Gás',
      'Transporte',
    ])
  })
})

describe('getCategoryTone', () => {
  it('uses the neutral tone for leftover categories', () => {
    assert.equal(getCategoryTone('Outros Gastos'), 'neutral')
  })
})
