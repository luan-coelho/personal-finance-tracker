import { sql } from 'drizzle-orm'

import { db } from '@/app/db'

export async function createBudgetsTableIfNotExists() {
  try {
    // Verificar se a tabela já existe
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'budgets'
      );
    `)

    const exists = tableExists.rows[0]?.exists

    if (!exists) {
      console.log('Criando tabela budgets...')

      // Criar a tabela budgets
      await db.execute(sql`
        CREATE TABLE "budgets" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "space_id" uuid NOT NULL,
          "category" varchar(255) NOT NULL,
          "amount" numeric(12, 2) NOT NULL,
          "month" text NOT NULL,
          "created_by_id" uuid NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `)

      // Adicionar constraints
      await db.execute(sql`
        ALTER TABLE "budgets" ADD CONSTRAINT "budgets_space_id_spaces_id_fk"
        FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id")
        ON DELETE cascade ON UPDATE no action;
      `)

      await db.execute(sql`
        ALTER TABLE "budgets" ADD CONSTRAINT "budgets_created_by_id_users_id_fk"
        FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id")
        ON DELETE no action ON UPDATE no action;
      `)

      // Criar índice único para prevenir orçamentos duplicados por categoria/mês/espaço
      await db.execute(sql`
        CREATE UNIQUE INDEX "budgets_space_category_month_unique"
        ON "budgets" ("space_id", "category", "month");
      `)

      console.log('Tabela budgets criada com sucesso!')
      return { success: true, message: 'Tabela budgets criada com sucesso!' }
    } else {
      console.log('Tabela budgets já existe')
      return { success: true, message: 'Tabela budgets já existe' }
    }
  } catch (error) {
    console.error('Erro ao criar tabela budgets:', error)
    return {
      success: false,
      message: 'Erro ao criar tabela budgets',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// Função para executar todas as migrações manuais necessárias
export async function runManualMigrations() {
  console.log('Iniciando migrações manuais...')

  const results = []

  // Migração da tabela budgets
  const budgetsResult = await createBudgetsTableIfNotExists()
  results.push({ table: 'budgets', ...budgetsResult })

  const allSuccessful = results.every(result => result.success)

  if (allSuccessful) {
    console.log('Todas as migrações manuais executadas com sucesso!')
  } else {
    console.error(
      'Algumas migrações falharam:',
      results.filter(r => !r.success),
    )
  }

  return {
    success: allSuccessful,
    results,
  }
}
