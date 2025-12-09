import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const consoleTypeId = parseInt(id)

    if (isNaN(consoleTypeId)) {
      return NextResponse.json(
        { error: 'Invalid console type ID' },
        { status: 400 }
      )
    }

    const consoles = await prisma.console.findMany({
      where: {
        consoleTypeId: consoleTypeId,
        name: {
          not: 'Wii' // Exclude "Wii" console (keep "Nintendo Wii")
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(consoles)
  } catch (error) {
    console.error('Error fetching consoles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch consoles' },
      { status: 500 }
    )
  }
}

