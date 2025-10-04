import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// PUT - Atualizar investimento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { name, type, initialAmount, currentAmount, purchaseDate, description, isActive } = await request.json()

    const investment = await prisma.investment.update({
      where: { id },
      data: {
        name,
        type,
        initialAmount,
        currentAmount,
        purchaseDate: new Date(purchaseDate),
        description,
        isActive
      }
    })

    return NextResponse.json(investment)
  } catch (error) {
    console.error('Erro ao atualizar investimento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar investimento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.investment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar investimento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
