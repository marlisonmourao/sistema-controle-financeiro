import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET - Buscar todos os gastos fixos
export async function GET() {
  try {
    const fixedExpenses = await prisma.fixedExpense.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(fixedExpenses)
  } catch (error) {
    console.error('Erro ao buscar gastos fixos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo gasto fixo
export async function POST(request: NextRequest) {
  try {
    const { name, amount, category, description, dueDay } = await request.json()

    // Garantir que amount seja um número
    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount)) {
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      )
    }

    const fixedExpense = await prisma.fixedExpense.create({
      data: {
        name,
        amount: numericAmount,
        category,
        description,
        dueDay: parseInt(dueDay)
      }
    })

    return NextResponse.json(fixedExpense)
  } catch (error) {
    console.error('Erro ao criar gasto fixo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
