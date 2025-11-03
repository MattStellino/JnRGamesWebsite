import { prisma } from '@/lib/prisma'
import { Shield, Database, Users, Settings as SettingsIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getSystemStats() {
  const [totalItems, totalCategories, totalAdmins] = await Promise.all([
    prisma.item.count(),
    prisma.category.count(),
    prisma.admin.count(),
  ])

  return {
    totalItems,
    totalCategories,
    totalAdmins,
  }
}

export default async function AdminSettingsPage() {
  const { totalItems, totalCategories, totalAdmins } = await getSystemStats()

  const stats = [
    {
      name: 'Total Items',
      value: totalItems,
      icon: Database,
      color: 'bg-blue-500',
    },
    {
      name: 'Categories',
      value: totalCategories,
      icon: SettingsIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Admin Users',
      value: totalAdmins,
      icon: Users,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your J&R Games buylist system
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Application</h3>
              <p className="text-sm text-gray-600">J&R Games Buylist System</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Version</h3>
              <p className="text-sm text-gray-600">1.0.0</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Framework</h3>
              <p className="text-sm text-gray-600">Next.js 15 with App Router</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Database</h3>
              <p className="text-sm text-gray-600">PostgreSQL with Prisma ORM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <Shield className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Make sure to keep your admin credentials secure and change default passwords in production.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
