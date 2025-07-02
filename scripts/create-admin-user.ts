#!/usr/bin/env tsx
import { db } from '@/app/db'
import { usersTable } from '@/app/db/schemas'

import 'dotenv/config'

import { eq } from 'drizzle-orm'

/**
 * Script para criar um usuário administrador
 *
 * Uso:
 * npx tsx scripts/create-admin-user.ts <email> [nome]
 *
 * Exemplos:
 * npx tsx scripts/create-admin-user.ts admin@example.com
 * npx tsx scripts/create-admin-user.ts admin@example.com "João Silva"
 *
 * Se não informar argumentos, usará valores padrão
 */

function parseArguments() {
  const args = process.argv.slice(2)

  // Valores padrão
  let email = 'lumyth.br@gmail.com'
  let name = 'Administrador'

  // Se argumentos foram fornecidos
  if (args.length > 0) {
    email = args[0]

    if (args.length > 1) {
      name = args[1]
    } else {
      // Se só o email foi fornecido, usar parte antes do @ como nome
      name = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
    }
  }

  // Validação básica do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    console.error('❌ Email inválido fornecido:', email)
    console.log('💡 Use o formato: email@dominio.com')
    process.exit(1)
  }

  return { email, name }
}

async function createAdminUser() {
  const { email, name } = parseArguments()

  console.log('📧 Email:', email)
  console.log('👤 Nome:', name)
  console.log()

  try {
    console.log('🔍 Verificando se o usuário já existe...')

    // Verifica se já existe um usuário com este email
    const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1)

    if (existingUser.length > 0) {
      console.log('👤 Usuário já existe. Atualizando para administrador...')

      // Atualiza o usuário existente para admin
      const [updatedUser] = await db
        .update(usersTable)
        .set({
          name: name,
          active: true,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.email, email))
        .returning()

      console.log('✅ Usuário atualizado com sucesso!')
      console.log('📋 Dados do usuário:')
      console.log(`   ID: ${updatedUser.id}`)
      console.log(`   Nome: ${updatedUser.name}`)
      console.log(`   Email: ${updatedUser.email}`)
      console.log(`   Ativo: ${updatedUser.active}`)
    } else {
      console.log('➕ Criando novo usuário administrador...')

      // Cria um novo usuário admin
      const [newUser] = await db
        .insert(usersTable)
        .values({
          name: name,
          email: email,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      console.log('✅ Usuário criado com sucesso!')
      console.log('📋 Dados do usuário:')
      console.log(`   ID: ${newUser.id}`)
      console.log(`   Nome: ${newUser.name}`)
      console.log(`   Email: ${newUser.email}`)
      console.log(`   Ativo: ${newUser.active}`)
    }

    console.log('\n🎉 Operação concluída com sucesso!')
    console.log('💡 O usuário agora pode fazer login com Google usando este email.')
  } catch (error) {
    console.error('❌ Erro ao criar/atualizar usuário administrador:')
    console.error(error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

// Executa o script
if (require.main === module) {
  createAdminUser()
}

export { createAdminUser }
