import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ItemCard from '@/components/ItemCard'

async function getCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      items: {
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
      },
    },
  })
  return category
}

export default async function CategoryPage({
  params,
}: {
  params: { id: string }
}) {
  const category = await getCategory(params.id)

  if (!category) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {category.name}
        </h1>
        <p className="text-gray-600">
          {category.items.length} item{category.items.length !== 1 ? 's' : ''} in this category
        </p>
      </div>

      {category.items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No items in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {category.items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
