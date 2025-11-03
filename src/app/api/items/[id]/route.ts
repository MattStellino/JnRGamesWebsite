import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import { sanitizeInput, validatePrice, validateDescription, validateUrl } from '@/lib/security'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const itemId = parseInt(id)

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      )
    }

    const item = await prisma.item.findUnique({
      where: {
        id: itemId
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
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const authCheck = await requireAuth()
    if (authCheck.error) return authCheck.error

    const { id } = await params
    const itemId = parseInt(id)

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Sanitize inputs
    const name = sanitizeInput(body.name || '')
    const description = sanitizeInput(body.description || '')
    const price = parseFloat(body.price)
    const imageUrl = sanitizeInput(body.imageUrl || '')
    const categoryId = parseInt(body.categoryId)
    const consoleId = parseInt(body.consoleId)

    if (!name || name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: 'Name is required and must be 2-100 characters' },
        { status: 400 }
      )
    }

    if (!validatePrice(price)) {
      return NextResponse.json(
        { error: 'Valid price is required (0-1,000,000)' },
        { status: 400 }
      )
    }

    if (description && !validateDescription(description)) {
      return NextResponse.json(
        { error: 'Description too long (max 1000 characters)' },
        { status: 400 }
      )
    }

    if (imageUrl && !validateUrl(imageUrl)) {
      return NextResponse.json(
        { error: 'Invalid image URL' },
        { status: 400 }
      )
    }

    if (!categoryId || !consoleId || isNaN(categoryId) || isNaN(consoleId)) {
      return NextResponse.json(
        { error: 'Valid categoryId and consoleId are required' },
        { status: 400 }
      )
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Verify console exists
    const console = await prisma.console.findUnique({
      where: { id: consoleId },
    })

    if (!console) {
      return NextResponse.json(
        { error: 'Console not found' },
        { status: 404 }
      )
    }

    const updatedItem = await prisma.item.update({
      where: {
        id: itemId
      },
      data: {
        name,
        description: description || null,
        price,
        imageUrl: imageUrl || null,
        categoryId,
        consoleId,
      },
      include: {
        category: true,
        console: {
          include: {
            consoleType: true
          }
        }
      },
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }
    // Don't expose internal error details
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const authCheck = await requireAuth()
    if (authCheck.error) return authCheck.error

    const { id } = await params
    const itemId = parseInt(id)

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      )
    }

    await prisma.item.delete({
      where: {
        id: itemId
      }
    })

    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }
    // Don't expose internal error details
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
}