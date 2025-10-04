import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET - Buscar salário
export async function GET() {
  try {
    const salary = await prisma.salary.findFirst({
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(salary)
  } catch (error) {
    console.error('Erro ao buscar salário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar/Atualizar salário
export async function POST(request: NextRequest) {
  try {
    const { amount, description } = await request.json()

    // Garantir que amount seja um número
    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount)) {
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      )
    }

    // Buscar salário existente
    const existingSalary = await prisma.salary.findFirst()

    let salary
    if (existingSalary) {
      // Atualizar salário existente
      salary = await prisma.salary.update({
        where: { id: existingSalary.id },
        data: { amount: numericAmount, description }
      })
    } else {
      // Criar novo salário
      salary = await prisma.salary.create({
        data: { amount: numericAmount, description }
      })
    }

    return NextResponse.json(salary)
  } catch (error) {
    console.error('Erro ao salvar salário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar salário
export async function DELETE() {
  try {
    await prisma.salary.deleteMany()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar salário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
