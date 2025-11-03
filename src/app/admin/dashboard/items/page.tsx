import { prisma } from '@/lib/prisma'
import ItemTable from '@/components/admin/ItemTable'

export const dynamic = 'force-dynamic'

async function getItems() {
  const items = await prisma.item.findMany({
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
  })
  // Serialize Date objects to strings for client component compatibility
  return items.map(item => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    console: {
      ...item.console,
      createdAt: item.console.createdAt.toISOString(),
      updatedAt: item.console.updatedAt.toISOString(),
      consoleType: {
        ...item.console.consoleType,
        createdAt: item.console.consoleType.createdAt.toISOString(),
        updatedAt: item.console.consoleType.updatedAt.toISOString(),
      }
    },
    category: {
      ...item.category,
      createdAt: item.category.createdAt.toISOString(),
      updatedAt: item.category.updatedAt.toISOString(),
    }
  }))
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  })
  return categories
}

async function getConsoleTypes() {
  const consoleTypes = await prisma.consoleType.findMany({
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
  })
  return consoleTypes
}

export default async function AdminItemsPage() {
  const [items, categories, consoleTypes] = await Promise.all([
    getItems(),
    getCategories(),
    getConsoleTypes(),
  ])

  return <ItemTable initialItems={items} categories={categories} consoleTypes={consoleTypes} />
}
