import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// PUT - Atualizar receita variável
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { name, amount, type, description, date } = await request.json()

    const variableIncome = await prisma.variableIncome.update({
      where: { id },
      data: {
        name,
        amount,
        type,
        description,
        date: new Date(date)
      }
    })

    return NextResponse.json(variableIncome)
  } catch (error) {
    console.error('Erro ao atualizar receita variável:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar receita variável
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.variableIncome.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar receita variável:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
