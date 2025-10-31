import { and, desc, eq, ilike } from 'drizzle-orm'

import { db } from '@/app/db'
import {
  categoriesTable,
  type Category,
  type CategoryFormValues,
  type CategoryType,
} from '@/app/db/schemas/category-schema'

export interface CategoryFilters {
  spaceId?: string
  type?: CategoryType
  search?: string
}

export class CategoryService {
  // Criar nova categoria
  static async create(data: CategoryFormValues): Promise<Category> {
    const [category] = await db
      .insert(categoriesTable)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning()

    return category
  }

  // Buscar categoria por ID
  static async findById(id: string): Promise<Category | null> {
    const [category] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id)).limit(1)

    return category || null
  }

  // Listar categorias com filtros
  static async findMany(filters: CategoryFilters = {}): Promise<Category[]> {
    const conditions = []

    if (filters.spaceId) {
      conditions.push(eq(categoriesTable.spaceId, filters.spaceId))
    }

    if (filters.type) {
      conditions.push(eq(categoriesTable.type, filters.type))
    }

    if (filters.search) {
      conditions.push(ilike(categoriesTable.name, `%${filters.search}%`))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const categories = await db
      .select()
      .from(categoriesTable)
      .where(whereClause)
      .orderBy(desc(categoriesTable.createdAt))

    return categories
  }

  // Atualizar categoria
  static async update(id: string, data: Partial<CategoryFormValues>): Promise<Category | null> {
    const [category] = await db
      .update(categoriesTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(categoriesTable.id, id))
      .returning()

    return category || null
  }

  // Deletar categoria
  static async delete(id: string): Promise<boolean> {
    const result = await db.delete(categoriesTable).where(eq(categoriesTable.id, id))

    return (result.rowCount ?? 0) > 0
  }

  // Verificar se categoria já existe no espaço
  static async exists(spaceId: string, name: string, type: CategoryType, excludeId?: string): Promise<boolean> {
    const conditions = [
      eq(categoriesTable.spaceId, spaceId),
      eq(categoriesTable.name, name),
      eq(categoriesTable.type, type),
    ]

    if (excludeId) {
      conditions.push(eq(categoriesTable.id, excludeId))
    }

    const [result] = await db
      .select()
      .from(categoriesTable)
      .where(and(...conditions))
      .limit(1)

    return !!result
  }
}
