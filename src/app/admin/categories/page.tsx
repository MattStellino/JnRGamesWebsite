// Middleware already protects this route
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CategoryManager from '@/components/admin/CategoryManager'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  // Middleware already protects this route
  const categories = await prisma.category.findMany({
    include: {
      items: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Categories</h1>
        <p className="text-gray-600">Add, edit, or delete categories</p>
      </div>

      <CategoryManager categories={categories} />
    </div>
  )
}
