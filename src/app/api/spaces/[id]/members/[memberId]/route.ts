import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/app/db'
import { spaceMembersTable, updateSpaceMemberSchema } from '@/app/db/schemas/space-member-schema'
import { spacesTable } from '@/app/db/schemas/space-schema'
import { usersTable } from '@/app/db/schemas/user-schema'

import { auth } from '@/lib/auth'

// PUT /api/spaces/[id]/members/[memberId] - Atualizar papel do membro
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Não autenticado' }, { status: 401 })
    }

    const { id: spaceId, memberId } = await params
    const body = await request.json()

    // Validar dados
    const validatedData = updateSpaceMemberSchema.parse({ id: memberId, ...body })

    // Buscar usuário atual
    const currentUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, session.user.email),
    })

    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar se o usuário é dono do espaço
    const space = await db.query.spacesTable.findFirst({
      where: eq(spacesTable.id, spaceId),
    })

    if (!space) {
      return NextResponse.json({ success: false, message: 'Espaço não encontrado' }, { status: 404 })
    }

    if (space.ownerId !== currentUser.id) {
      return NextResponse.json(
        { success: false, message: 'Apenas o proprietário pode atualizar membros' },
        { status: 403 },
      )
    }

    // Atualizar membro
    const [updatedMember] = await db
      .update(spaceMembersTable)
      .set({
        role: validatedData.role,
        updatedAt: new Date(),
      })
      .where(and(eq(spaceMembersTable.id, memberId), eq(spaceMembersTable.spaceId, spaceId)))
      .returning()

    if (!updatedMember) {
      return NextResponse.json({ success: false, message: 'Membro não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedMember,
      message: 'Membro atualizado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao atualizar membro:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao atualizar membro',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    )
  }
}

// DELETE /api/spaces/[id]/members/[memberId] - Remover membro do espaço
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Não autenticado' }, { status: 401 })
    }

    const { id: spaceId, memberId } = await params

    // Buscar usuário atual
    const currentUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, session.user.email),
    })

    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar se o usuário é dono do espaço
    const space = await db.query.spacesTable.findFirst({
      where: eq(spacesTable.id, spaceId),
    })

    if (!space) {
      return NextResponse.json({ success: false, message: 'Espaço não encontrado' }, { status: 404 })
    }

    if (space.ownerId !== currentUser.id) {
      return NextResponse.json(
        { success: false, message: 'Apenas o proprietário pode remover membros' },
        { status: 403 },
      )
    }

    // Remover membro
    const deletedRows = await db
      .delete(spaceMembersTable)
      .where(and(eq(spaceMembersTable.id, memberId), eq(spaceMembersTable.spaceId, spaceId)))

    return NextResponse.json({
      success: true,
      message: 'Membro removido com sucesso',
    })
  } catch (error) {
    console.error('Erro ao remover membro:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao remover membro',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    )
  }
}
