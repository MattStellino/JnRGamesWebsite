import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rateLimit'
import { requireAuth } from '@/lib/auth-helpers'
import { 
  sanitizeInput, 
  validatePrice, 
  validateDescription,
  validateUrl,
  escapeSqlString 
} from '@/lib/security'

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimit(request, '/api/items')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const consoleId = searchParams.get('consoleId')
    const category = searchParams.get('category') // Filter by category name
    const consoleType = searchParams.get('consoleType') // Filter by console type
    const console = searchParams.get('console') // Filter by specific console
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    // Sanitize search input
    const sanitizedSearch = search ? sanitizeInput(search) : null

    const where: any = {}

    if (categoryId) {
      where.categoryId = parseInt(categoryId)
    }

    if (consoleId) {
      where.consoleId = parseInt(consoleId)
    }

    // Handle category name filtering
    if (category) {
      if (category === 'consoles') {
        // Filter for console items
        where.category = {
          name: 'Consoles'
        }
      } else if (category === 'accessories') {
        // Filter for accessory items
        where.category = {
          name: 'Accessories'
        }
      } else if (category === 'handhelds') {
        // Filter for handheld items
        where.category = {
          name: 'Handhelds'
        }
      } else if (category === 'controllers') {
        // Filter for controller items
        where.category = {
          name: 'Controllers'
        }
      } else if (category === 'games') {
        // Filter for games category
        where.category = {
          name: 'Games'
        }
      } else {
        // Filter by specific category name
        where.category = {
          name: { contains: category, mode: 'insensitive' }
        }
      }
    }

    // Handle console type filtering
    if (consoleType) {
      // Check if consoleType is a number (ID) or string (name)
      const consoleTypeId = parseInt(consoleType)
      if (!isNaN(consoleTypeId)) {
        // It's an ID
        where.console = {
          consoleType: {
            id: consoleTypeId
          }
        }
      } else {
        // It's a name
        where.console = {
          consoleType: {
            name: { contains: consoleType, mode: 'insensitive' }
          }
        }
      }
    }

    // Handle specific console filtering
    if (console) {
      if (console === 'all') {
        // Show all console items (only if no console type filter)
        if (!consoleType) {
          where.console = { isNot: null }
        }
      } else {
        // Filter by specific console ID
        where.consoleId = parseInt(console)
      }
    }

    if (sanitizedSearch) {
      where.OR = [
        { name: { contains: sanitizedSearch, mode: 'insensitive' } },
        { description: { contains: sanitizedSearch, mode: 'insensitive' } },
        { 
          console: {
            name: { contains: sanitizedSearch, mode: 'insensitive' }
          }
        },
        { 
          console: {
            consoleType: {
              name: { contains: sanitizedSearch, mode: 'insensitive' }
            }
          }
        },
        { 
          category: {
            name: { contains: sanitizedSearch, mode: 'insensitive' }
          }
        }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalItems = await prisma.item.count({ where })

    // Get paginated items
    const items = await prisma.item.findMany({
      where,
      include: {
        category: true,
        console: {
          include: {
            consoleType: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }, // Show newest items first
        { name: 'asc' }, // Then sort alphabetically for items created at the same time
      ],
      skip,
      take: limit,
    })

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch items' },
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
    
    // Sanitize inputs
    const name = sanitizeInput(body.name || '')
    const description = sanitizeInput(body.description || '')
    const price = parseFloat(body.price)
    const imageUrl = sanitizeInput(body.imageUrl || '')
    const categoryId = parseInt(body.categoryId)
    const consoleId = parseInt(body.consoleId)

    // Validation
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

    if (!categoryId || !consoleId) {
      return NextResponse.json(
        { error: 'Category and console are required' },
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

    const item = await prisma.item.create({
      data: {
        name,
        description,
        price,
        imageUrl,
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

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    )
  }
}


