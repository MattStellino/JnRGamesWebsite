import { prisma } from '@/lib/prisma'
import CategoryTable from '@/components/admin/CategoryTable'

export const dynamic = 'force-dynamic'

async function getCategories() {
  const categories = await prisma.category.findMany({
    include: {
      items: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
  return categories.map(category => ({
    ...category,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
    items: category.items.map(item => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }))
  }))
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories()

  return <CategoryTable initialCategories={categories} />
}
