'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  Home,
  Settings,
  Gamepad2,
  BarChart3
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Items', href: '/admin/dashboard/items', icon: Package },
  { name: 'Categories', href: '/admin/dashboard/categories', icon: Tag },
  { name: 'Consoles', href: '/admin/dashboard/consoles', icon: Gamepad2 },
  { name: 'Analytics', href: '/admin/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/dashboard/settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-sm border-r min-h-screen hidden lg:block">
      <div className="p-6">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-black'
                    : 'text-black hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/"
            className="flex items-center px-3 py-2 text-sm font-medium text-black hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
          >
            <Home className="mr-3 h-5 w-5" />
            View Site
          </Link>
        </div>
      </div>
    </div>
  )
}
