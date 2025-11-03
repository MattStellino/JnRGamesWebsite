import LoadingSpinner from '@/components/LoadingSpinner'

export default function ItemsLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-br from-red-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="h-12 bg-gray-200 rounded-lg w-96 mx-auto mb-6 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-80 mx-auto animate-pulse"></div>
          </div>

          {/* Search and Filters Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="h-12 bg-gray-200 rounded-lg flex-1 animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600">Loading items...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
