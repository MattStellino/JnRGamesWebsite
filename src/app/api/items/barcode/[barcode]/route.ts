import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barcode: string }> }
) {
  try {
    const resolvedParams = await params
    const { barcode } = resolvedParams

    if (!barcode) {
      return NextResponse.json(
        { error: 'Barcode is required' },
        { status: 400 }
      )
    }

    // Search for item by name (since barcode fields don't exist in schema)
    const item = await prisma.item.findFirst({
      where: {
        name: {
          contains: barcode,
          mode: 'insensitive'
        }
      },
      include: {
        category: true,
        console: {
          include: {
            consoleType: true
          }
        }
      }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found', barcode },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      item: {
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        console: item.console,
        imageUrl: item.imageUrl,
        description: item.description
      }
    })

  } catch (error) {
    console.error('Error checking barcode:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

