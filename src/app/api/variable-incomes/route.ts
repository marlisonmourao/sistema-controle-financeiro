import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET - Buscar todas as receitas variáveis
export async function GET() {
  try {
    const variableIncomes = await prisma.variableIncome.findMany({
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(variableIncomes)
  } catch (error) {
    console.error('Erro ao buscar receitas variáveis:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova receita variável
export async function POST(request: NextRequest) {
  try {
    const { name, amount, type, description, date } = await request.json()

    // Garantir que amount seja um número
    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount)) {
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      )
    }

    const variableIncome = await prisma.variableIncome.create({
      data: {
        name,
        amount: numericAmount,
        type,
        description,
        date: new Date(date)
      }
    })

    return NextResponse.json(variableIncome)
  } catch (error) {
    console.error('Erro ao criar receita variável:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
