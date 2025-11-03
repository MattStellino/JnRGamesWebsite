'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function SessionManager() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Handle browser back/forward navigation and pathname changes
  useEffect(() => {
    const handlePopState = () => {
      // If user navigates away from admin pages, clear session
      if (session && !pathname.startsWith('/admin')) {
        signOut({ redirect: false })
      }
    }

    // Also check immediately when pathname changes
    if (session && !pathname.startsWith('/admin')) {
      signOut({ redirect: false })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [session, pathname])

  // Handle page unload (closing tab, refreshing, etc.)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (session) {
        // Clear session data when leaving the page
        signOut({ redirect: false })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [session])

  useEffect(() => {
    // Check if we're on an admin page
    const isAdminPage = pathname.startsWith('/admin')
    
    if (isAdminPage && status === 'unauthenticated') {
      // If on admin page but not authenticated, redirect to login
      router.push('/admin/login')
    }
  }, [session, status, router, pathname])

  useEffect(() => {
    // Set up a timer to check session validity every minute
    const interval = setInterval(() => {
      if (session) {
        // Check if session is still valid
        const now = new Date()
        const sessionExpiry = new Date(session.expires || 0)
        
        if (now > sessionExpiry) {
          // Session expired, sign out
          signOut({ 
            redirect: false,
            callbackUrl: '/admin/login'
          })
          router.push('/admin/login')
        }
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [session, router])

  // Listen for page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && session) {
        // Page became visible, check if session is still valid
        const now = new Date()
        const sessionExpiry = new Date(session.expires || 0)
        
        if (now > sessionExpiry) {
          // Session expired while away, sign out
          signOut({ 
            redirect: false,
            callbackUrl: '/admin/login'
          })
          router.push('/admin/login')
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [session, router])

  return null // This component doesn't render anything
}
