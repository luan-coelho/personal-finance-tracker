import { and, desc, eq, ilike } from 'drizzle-orm'

import { db } from '@/app/db'
import { tagsTable, type Tag, type TagFormValues } from '@/app/db/schemas/tag-schema'

export interface TagFilters {
  spaceId?: string
  search?: string
}

export class TagService {
  // Criar nova tag
  static async create(data: TagFormValues): Promise<Tag> {
    const [tag] = await db
      .insert(tagsTable)
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returning()

    return tag
  }

  // Buscar tag por ID
  static async findById(id: string): Promise<Tag | null> {
    const [tag] = await db.select().from(tagsTable).where(eq(tagsTable.id, id)).limit(1)

    return tag || null
  }

  // Listar tags com filtros
  static async findMany(filters: TagFilters = {}): Promise<Tag[]> {
    const conditions = []

    if (filters.spaceId) {
      conditions.push(eq(tagsTable.spaceId, filters.spaceId))
    }

    if (filters.search) {
      conditions.push(ilike(tagsTable.name, `%${filters.search}%`))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const tags = await db.select().from(tagsTable).where(whereClause).orderBy(desc(tagsTable.createdAt))

    return tags
  }

  // Atualizar tag
  static async update(id: string, data: Partial<TagFormValues>): Promise<Tag | null> {
    const [tag] = await db
      .update(tagsTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tagsTable.id, id))
      .returning()

    return tag || null
  }

  // Deletar tag
  static async delete(id: string): Promise<boolean> {
    const result = await db.delete(tagsTable).where(eq(tagsTable.id, id))

    return (result.rowCount ?? 0) > 0
  }

  // Verificar se tag já existe no espaço
  static async exists(spaceId: string, name: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(tagsTable.spaceId, spaceId), eq(tagsTable.name, name)]

    if (excludeId) {
      conditions.push(eq(tagsTable.id, excludeId))
    }

    const [result] = await db
      .select()
      .from(tagsTable)
      .where(and(...conditions))
      .limit(1)

    return !!result
  }
}
