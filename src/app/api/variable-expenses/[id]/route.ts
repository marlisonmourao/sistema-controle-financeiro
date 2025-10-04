import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// PUT - Atualizar gasto variável
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { name, amount, category, description, date } = await request.json()

    const variableExpense = await prisma.variableExpense.update({
      where: { id },
      data: {
        name,
        amount,
        category,
        description,
        date: new Date(date)
      }
    })

    return NextResponse.json(variableExpense)
  } catch (error) {
    console.error('Erro ao atualizar gasto variável:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar gasto variável
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.variableExpense.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar gasto variável:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
