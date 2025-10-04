import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET - Buscar todas as receitas fixas
export async function GET() {
  try {
    const fixedIncomes = await prisma.fixedIncome.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(fixedIncomes)
  } catch (error) {
    console.error('Erro ao buscar receitas fixas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova receita fixa
export async function POST(request: NextRequest) {
  try {
    const { name, amount, type, description } = await request.json()

    // Garantir que amount seja um número
    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount)) {
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      )
    }

    const fixedIncome = await prisma.fixedIncome.create({
      data: { name, amount: numericAmount, type, description }
    })

    return NextResponse.json(fixedIncome)
  } catch (error) {
    console.error('Erro ao criar receita fixa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
