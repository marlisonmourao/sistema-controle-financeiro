import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET - Buscar todos os investimentos
export async function GET() {
  try {
    const investments = await prisma.investment.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(investments)
  } catch (error) {
    console.error('Erro ao buscar investimentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo investimento
export async function POST(request: NextRequest) {
  try {
    const { name, type, initialAmount, currentAmount, purchaseDate, description } = await request.json()

    // Garantir que os valores sejam números
    const numericInitialAmount = parseFloat(initialAmount)
    const numericCurrentAmount = parseFloat(currentAmount)

    if (isNaN(numericInitialAmount) || isNaN(numericCurrentAmount)) {
      return NextResponse.json(
        { error: 'Valores inválidos' },
        { status: 400 }
      )
    }

    const investment = await prisma.investment.create({
      data: {
        name,
        type,
        initialAmount: numericInitialAmount,
        currentAmount: numericCurrentAmount,
        purchaseDate: new Date(purchaseDate),
        description
      }
    })

    return NextResponse.json(investment)
  } catch (error) {
    console.error('Erro ao criar investimento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
