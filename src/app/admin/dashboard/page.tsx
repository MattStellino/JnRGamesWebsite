import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  Package, 
  Tag, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Gamepad2, 
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getDashboardStats() {
  const [
    totalItems,
    totalCategories,
    totalConsoleTypes,
    totalConsoles,
    recentItems,
    totalValue,
    itemsByCategory,
    itemsByConsoleType,
    lowStockItems,
    highValueItems
  ] = await Promise.all([
    prisma.item.count(),
    prisma.category.count(),
    prisma.consoleType.count(),
    prisma.console.count(),
    prisma.item.findMany({
      take: 5,
      include: {
        category: true,
        console: {
          include: {
            consoleType: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.item.aggregate({
      _sum: {
        price: true
      }
    }),
    prisma.item.groupBy({
      by: ['categoryId'],
      _count: {
        id: true
      }
    }),
    prisma.item.groupBy({
      by: ['consoleId'],
      _count: {
        id: true
      }
    }),
    prisma.item.findMany({
      where: {
        price: {
          lt: 10
        }
      },
      take: 5,
      include: {
        category: true,
        console: {
          include: {
            consoleType: true
          }
        }
      },
      orderBy: {
        price: 'asc'
      }
    }),
    prisma.item.findMany({
      where: {
        price: {
          gt: 50
        }
      },
      take: 5,
      include: {
        category: true,
        console: {
          include: {
            consoleType: true
          }
        }
      },
      orderBy: {
        price: 'desc'
      }
    })
  ])

  return {
    totalItems,
    totalCategories,
    totalConsoleTypes,
    totalConsoles,
    recentItems,
    totalValue: totalValue._sum.price || 0,
    itemsByCategory,
    itemsByConsoleType,
    lowStockItems,
    highValueItems
  }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/admin/login')
  }

  const { 
    totalItems, 
    totalCategories, 
    totalConsoleTypes, 
    totalConsoles, 
    recentItems, 
    totalValue,
    itemsByCategory,
    itemsByConsoleType,
    lowStockItems,
    highValueItems
  } = await getDashboardStats()

  const stats = [
    {
      name: 'Total Items',
      value: totalItems,
      icon: Package,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      href: '/admin/dashboard/items',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Categories',
      value: totalCategories,
      icon: Tag,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      href: '/admin/dashboard/categories',
      change: '+2',
      changeType: 'positive'
    },
    {
      name: 'Console Types',
      value: totalConsoleTypes,
      icon: Gamepad2,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      href: '/admin/dashboard/consoles',
      change: '0%',
      changeType: 'neutral'
    },
    {
      name: 'Total Consoles',
      value: totalConsoles,
      icon: Gamepad2,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      href: '/admin/dashboard/consoles',
      change: '+5',
      changeType: 'positive'
    },
    {
      name: 'Inventory Value',
      value: `$${totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      href: '/admin/dashboard/analytics',
      change: '+8.2%',
      changeType: 'positive'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {session.user?.name || session.user?.email || 'Admin'}!</h1>
            <p className="text-blue-100 text-lg">Here's your inventory overview and key insights</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold">${totalValue.toLocaleString()}</div>
                <div className="text-blue-100 text-sm">Total Inventory Value</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/admin/dashboard/items?action=create"
            className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
          >
            <div className="p-2 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <div className="font-medium text-gray-900">Add Item</div>
              <div className="text-sm text-gray-600">Create new inventory item</div>
            </div>
          </Link>
          
          <Link
            href="/admin/dashboard/categories?action=create"
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
          >
            <div className="p-2 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors">
              <Tag className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <div className="font-medium text-gray-900">Add Category</div>
              <div className="text-sm text-gray-600">Create new category</div>
            </div>
          </Link>
          
          <Link
            href="/admin/dashboard/consoles?action=create"
            className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
          >
            <div className="p-2 bg-purple-500 rounded-lg group-hover:bg-purple-600 transition-colors">
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <div className="font-medium text-gray-900">Add Console</div>
              <div className="text-sm text-gray-600">Create new console</div>
            </div>
          </Link>
          
          <Link
            href="/admin/dashboard/analytics"
            className="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
          >
            <div className="p-2 bg-orange-500 rounded-lg group-hover:bg-orange-600 transition-colors">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <div className="font-medium text-gray-900">View Analytics</div>
              <div className="text-sm text-gray-600">See detailed reports</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center text-sm">
                {stat.changeType === 'positive' && <ArrowUpRight className="h-4 w-4 text-green-500" />}
                {stat.changeType === 'negative' && <ArrowDownRight className="h-4 w-4 text-red-500" />}
                <span className={`ml-1 font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Items */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Items</h2>
            <Link
              href="/admin/dashboard/items"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              View all <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentItems.map((item) => (
              <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.console?.consoleType?.name} - {item.console?.name} • {item.category.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center">
            <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Low Value Items</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {lowStockItems.map((item) => (
              <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.category.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-orange-600">${item.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High Value Items */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">High Value Items</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {highValueItems.map((item) => (
            <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.console?.consoleType?.name} - {item.console?.name} • {item.category.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">${item.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500">High Value</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}