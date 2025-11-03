import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import { sanitizeInput } from '@/lib/security'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        items: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication for state-changing operations
    const authCheck = await requireAuth()
    if (authCheck.error) return authCheck.error

    const body = await request.json()
    const rawName = body.name

    if (!rawName || typeof rawName !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 }
      )
    }

    // Sanitize input
    const name = sanitizeInput(rawName.trim())

    if (!name || name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 50 characters' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      )
    }
    // Don't expose internal error details
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
