'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function SessionManager() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Only redirect to login if on admin page and not authenticated
  // Middleware already handles protection, so we just need to handle client-side redirect
  useEffect(() => {
    const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login'
    
    if (isAdminPage && status === 'unauthenticated') {
      // If on admin page but not authenticated, redirect to login
      router.push('/admin/login')
    }
  }, [status, router, pathname])

  return null // This component doesn't render anything
}
