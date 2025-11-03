'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, LogOut } from 'lucide-react'

export default function AdminNavLink() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Don't show anything if not authenticated, still loading, or not on admin pages
  if (status === 'loading' || !session || !pathname.startsWith('/admin')) {
    return null
  }

  return (
    <div className="hidden md:flex items-center">
      {/* Admin Panel Link */}
      <Link
        href="/admin"
        className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-3 py-2 hover:bg-blue-50"
        aria-label="Admin Dashboard"
      >
        <Settings className="h-4 w-4 mr-2" />
        Admin
      </Link>
    </div>
  )
}
