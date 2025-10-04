import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// PUT - Atualizar receita fixa
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { name, amount, type, description, isActive } = await request.json()

    const fixedIncome = await prisma.fixedIncome.update({
      where: { id },
      data: { name, amount, type, description, isActive }
    })

    return NextResponse.json(fixedIncome)
  } catch (error) {
    console.error('Erro ao atualizar receita fixa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar receita fixa
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.fixedIncome.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar receita fixa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
