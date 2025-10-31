#!/usr/bin/env tsx
import { db } from '@/app/db'
import { categoriesTable } from '@/app/db/schemas/category-schema'
import { spacesTable } from '@/app/db/schemas/space-schema'

import 'dotenv/config'

import { eq } from 'drizzle-orm'

/**
 * Script para criar categorias padrão de entrada e saída
 *
 * Uso:
 * npx tsx scripts/seed-categories.ts <spaceId>
 *
 * Exemplos:
 * npx tsx scripts/seed-categories.ts 123e4567-e89b-12d3-a456-426614174000
 *
 * Se não informar o spaceId, tentará usar o primeiro espaço encontrado
 */

// Categorias padrão de entrada
const incomeCategoriesData = [
  { name: 'Salário', type: 'entrada' as const },
  { name: 'Freelance', type: 'entrada' as const },
  { name: 'Investimentos', type: 'entrada' as const },
  { name: 'Dividendos', type: 'entrada' as const },
  { name: 'Aluguel Recebido', type: 'entrada' as const },
  { name: 'Bonificação', type: 'entrada' as const },
  { name: 'Prêmio', type: 'entrada' as const },
  { name: 'Reembolso', type: 'entrada' as const },
  { name: 'Venda', type: 'entrada' as const },
  { name: 'Mesada', type: 'entrada' as const },
  { name: 'Doação Recebida', type: 'entrada' as const },
  { name: 'Outros Recebimentos', type: 'entrada' as const },
]

// Categorias padrão de saída
const expenseCategoriesData = [
  { name: 'Alimentação', type: 'saida' as const },
  { name: 'Transporte', type: 'saida' as const },
  { name: 'Moradia', type: 'saida' as const },
  { name: 'Aluguel', type: 'saida' as const },
  { name: 'Contas de Casa', type: 'saida' as const },
  { name: 'Energia Elétrica', type: 'saida' as const },
  { name: 'Água', type: 'saida' as const },
  { name: 'Internet', type: 'saida' as const },
  { name: 'Telefone', type: 'saida' as const },
  { name: 'Saúde', type: 'saida' as const },
  { name: 'Medicamentos', type: 'saida' as const },
  { name: 'Plano de Saúde', type: 'saida' as const },
  { name: 'Educação', type: 'saida' as const },
  { name: 'Lazer', type: 'saida' as const },
  { name: 'Vestuário', type: 'saida' as const },
  { name: 'Beleza', type: 'saida' as const },
  { name: 'Assinaturas', type: 'saida' as const },
  { name: 'Streaming', type: 'saida' as const },
  { name: 'Academia', type: 'saida' as const },
  { name: 'Mercado', type: 'saida' as const },
  { name: 'Restaurante', type: 'saida' as const },
  { name: 'Combustível', type: 'saida' as const },
  { name: 'Estacionamento', type: 'saida' as const },
  { name: 'Transporte Público', type: 'saida' as const },
  { name: 'Viagem', type: 'saida' as const },
  { name: 'Pet', type: 'saida' as const },
  { name: 'Impostos', type: 'saida' as const },
  { name: 'Seguros', type: 'saida' as const },
  { name: 'Manutenção', type: 'saida' as const },
  { name: 'Doação', type: 'saida' as const },
  { name: 'Presentes', type: 'saida' as const },
  { name: 'Empréstimo', type: 'saida' as const },
  { name: 'Cartão de Crédito', type: 'saida' as const },
  { name: 'Outros Gastos', type: 'saida' as const },
]

async function getSpaceId(): Promise<string | null> {
  const args = process.argv.slice(2)

  // Se foi fornecido um spaceId via argumento
  if (args.length > 0) {
    const spaceId = args[0]

    // Valida se é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(spaceId)) {
      console.error('❌ ID do espaço inválido. Deve ser um UUID válido.')
      return null
    }

    // Verifica se o espaço existe
    const space = await db.select().from(spacesTable).where(eq(spacesTable.id, spaceId)).limit(1)

    if (space.length === 0) {
      console.error('❌ Espaço não encontrado com o ID:', spaceId)
      return null
    }

    return spaceId
  }

  // Se não foi fornecido, busca o primeiro espaço
  console.log('⚠️  Nenhum spaceId fornecido. Buscando primeiro espaço disponível...')
  const spaces = await db.select().from(spacesTable).limit(1)

  if (spaces.length === 0) {
    console.error('❌ Nenhum espaço encontrado no banco de dados.')
    console.log('💡 Crie um espaço primeiro ou forneça um spaceId válido.')
    return null
  }

  console.log(`✅ Usando espaço: ${spaces[0].name} (${spaces[0].id})`)
  return spaces[0].id
}

async function seedCategories() {
  console.log('🌱 Iniciando seed de categorias...\n')

  try {
    const spaceId = await getSpaceId()

    if (!spaceId) {
      process.exit(1)
    }

    console.log(`📍 Space ID: ${spaceId}\n`)

    // Verifica se já existem categorias para este espaço
    const existingCategories = await db.select().from(categoriesTable).where(eq(categoriesTable.spaceId, spaceId))

    if (existingCategories.length > 0) {
      console.log(`⚠️  Já existem ${existingCategories.length} categorias para este espaço.`)
      console.log('❓ Deseja continuar e adicionar as categorias que ainda não existem?')
      console.log('💡 As categorias duplicadas serão ignoradas.\n')
    }

    // Prepara todas as categorias
    const allCategories = [...incomeCategoriesData, ...expenseCategoriesData]

    let createdCount = 0
    let skippedCount = 0

    console.log('📝 Criando categorias...\n')

    for (const categoryData of allCategories) {
      // Verifica se a categoria já existe
      const exists = existingCategories.some(
        cat => cat.name.toLowerCase() === categoryData.name.toLowerCase() && cat.type === categoryData.type,
      )

      if (exists) {
        console.log(`⏭️  Pulando: ${categoryData.name} (${categoryData.type}) - já existe`)
        skippedCount++
        continue
      }

      // Cria a categoria
      await db.insert(categoriesTable).values({
        name: categoryData.name,
        type: categoryData.type,
        spaceId: spaceId,
        createdAt: new Date(),
      })

      console.log(`✅ Criada: ${categoryData.name} (${categoryData.type})`)
      createdCount++
    }

    console.log('\n' + '='.repeat(60))
    console.log('🎉 Seed concluído com sucesso!')
    console.log('='.repeat(60))
    console.log(`📊 Resumo:`)
    console.log(`   • Categorias criadas: ${createdCount}`)
    console.log(`   • Categorias puladas: ${skippedCount}`)
    console.log(`   • Total de categorias: ${createdCount + skippedCount}`)
    console.log(`   • Categorias de entrada: ${incomeCategoriesData.length}`)
    console.log(`   • Categorias de saída: ${expenseCategoriesData.length}`)
    console.log('='.repeat(60))
  } catch (error) {
    console.error('\n❌ Erro ao criar categorias:')
    console.error(error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

// Executa o seed
seedCategories()
