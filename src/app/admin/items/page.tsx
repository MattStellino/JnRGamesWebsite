// Middleware already protects this route
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ItemTable from '@/components/admin/ItemTable'

export const dynamic = 'force-dynamic'

export default async function AdminItemsPage() {
  // Middleware already protects this route
  const [rawItems, categories, consoleTypes] = await Promise.all([
    prisma.item.findMany({
      include: {
        category: true,
        console: {
          include: {
            consoleType: true
          }
        }
      },
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.consoleType.findMany({
      include: {
        consoles: {
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ])

  const items = rawItems.map(item => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    category: {
      ...item.category,
      createdAt: item.category.createdAt.toISOString(),
      updatedAt: item.category.updatedAt.toISOString(),
    },
    console: item.console ? {
      ...item.console,
      createdAt: item.console.createdAt.toISOString(),
      updatedAt: item.console.updatedAt.toISOString(),
      consoleType: {
        ...item.console.consoleType,
        createdAt: item.console.consoleType.createdAt.toISOString(),
        updatedAt: item.console.consoleType.updatedAt.toISOString(),
      }
    } : undefined
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ItemTable initialItems={items} categories={categories} consoleTypes={consoleTypes} />
    </div>
  )
}
