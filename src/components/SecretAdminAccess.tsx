'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SecretAdminAccess() {
  const [showAdminLink, setShowAdminLink] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check for Ctrl+Shift+A (Admin access)
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault()
        setShowAdminLink(true)
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleAdminClick = () => {
    router.push('/admin')
    setShowAdminLink(false)
  }

  return (
    <>
      {/* Secret admin link */}
      {showAdminLink && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleAdminClick}
            className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            🔐 Admin Access
          </button>
        </div>
      )}
    </>
  )
}
