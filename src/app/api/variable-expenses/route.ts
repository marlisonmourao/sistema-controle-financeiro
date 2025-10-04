import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET - Buscar todos os gastos variáveis
export async function GET() {
  try {
    const variableExpenses = await prisma.variableExpense.findMany({
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(variableExpenses)
  } catch (error) {
    console.error('Erro ao buscar gastos variáveis:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo gasto variável
export async function POST(request: NextRequest) {
  try {
    const { name, amount, category, description, date } = await request.json()

    // Garantir que amount seja um número
    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount)) {
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      )
    }

    const variableExpense = await prisma.variableExpense.create({
      data: {
        name,
        amount: numericAmount,
        category,
        description,
        date: new Date(date)
      }
    })

    return NextResponse.json(variableExpense)
  } catch (error) {
    console.error('Erro ao criar gasto variável:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
