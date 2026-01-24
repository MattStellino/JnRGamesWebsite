'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  fallbackHref?: string
  className?: string
  children?: React.ReactNode
}

export default function BackButton({
  fallbackHref = '/items',
  className = '',
  children = 'Back to What We Buy'
}: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    // Check if there's history to go back to
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      // Fallback to the specified href if no history
      router.push(fallbackHref)
    }
  }

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {children}
    </button>
  )
}
