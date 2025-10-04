import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// PUT - Atualizar gasto fixo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { name, amount, category, description, dueDay, isActive } = await request.json()

    const fixedExpense = await prisma.fixedExpense.update({
      where: { id },
      data: { name, amount, category, description, dueDay, isActive }
    })

    return NextResponse.json(fixedExpense)
  } catch (error) {
    console.error('Erro ao atualizar gasto fixo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar gasto fixo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.fixedExpense.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar gasto fixo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
