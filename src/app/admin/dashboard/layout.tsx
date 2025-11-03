import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import MobileNav from '@/components/admin/MobileNav'
import JRGamesLogo from '@/components/JRGamesLogo'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Middleware already protects this route, so we can safely get session without checking
  // If middleware didn't protect it, we wouldn't get here
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <MobileNav />
              <JRGamesLogo size="sm" />
              <span className="text-gray-500 hidden sm:block">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                Welcome, {session.user?.username}
              </span>
              <a
                href="/api/auth/signout"
                className="text-sm text-red-600 hover:text-red-800"
              >
                Sign Out
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
