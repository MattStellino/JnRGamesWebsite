'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLogout() {
  const router = useRouter()

  const handleLogout = async () => {
    // Clear all session data and cookies
    await signOut({ 
      redirect: false,
      callbackUrl: '/admin/login'
    })
    
    // Clear any local storage or session storage
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear all cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      })
    }
    
    // Force redirect to login
    router.push('/admin/login')
    router.refresh() // Force a page refresh to clear any cached data
  }

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
    >
      Logout
    </button>
  )
}
