'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import JRGamesLogo from '@/components/JRGamesLogo'

function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    console.log(logMessage)
    setDebugInfo(prev => [...prev, logMessage].slice(-10)) // Keep last 10 logs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      addDebugLog(`Attempting login for: ${username}`)
      
      // Use redirect: false to handle it manually and verify session
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
        callbackUrl: callbackUrl,
      })

      addDebugLog(`SignIn result: ${JSON.stringify(result)}`)

      if (result?.error) {
        addDebugLog(`❌ Sign in error: ${result.error}`)
        setError(result.error === 'CredentialsSignin' ? 'Invalid username or password' : `Login failed: ${result.error}`)
        setLoading(false)
      } else if (result?.ok) {
        // Login successful - verify session before redirecting
        addDebugLog('✅ Login successful!')
        addDebugLog('⏳ Waiting for session cookie to be set...')
        
        // Wait longer for cookie to be set, then verify session
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Try to get session to verify it's set
        try {
          const { getSession } = await import('next-auth/react')
          addDebugLog('Checking session...')
          let session = await getSession()
          
          // If no session, try again after another delay
          if (!session) {
            addDebugLog('⚠️ Session not found, waiting longer...')
            await new Promise(resolve => setTimeout(resolve, 1000))
            session = await getSession()
          }
          
          addDebugLog(`📋 Session check: ${session ? '✅ Session found!' : '❌ No session'}`)
          if (session) {
            addDebugLog(`📋 Session user: ${session.user?.username || session.user?.email || 'unknown'}`)
          }
          
          if (session) {
            // Session is set, redirect to dashboard
            // Use router.push() instead of window.location.href for better cookie handling
            const redirectUrl = '/admin/dashboard'
            addDebugLog(`🔄 Will redirect to: ${redirectUrl} in 2 seconds...`)
            
            // Give cookie time to propagate, then use router.push for better Next.js handling
            setTimeout(() => {
              addDebugLog('🚀 Redirecting now...')
              router.push(redirectUrl)
            }, 2000)
          } else {
            addDebugLog('❌ Session not found after login attempts')
            setError('Login succeeded but session not found. Check debug info above.')
            setLoading(false)
          }
        } catch (sessionError) {
          addDebugLog(`❌ Error checking session: ${sessionError}`)
          setError('Login succeeded but could not verify session.')
          setLoading(false)
        }
      } else {
        addDebugLog(`❌ Unexpected result: ${JSON.stringify(result)}`)
        setError('Login failed. Please try again.')
        setLoading(false)
      }
    } catch (error) {
      addDebugLog(`❌ Login error: ${error}`)
      setError(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-6">
            <JRGamesLogo size="lg" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the J&R Games admin dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center mb-4">{error}</div>
          )}

          {debugInfo.length > 0 && (
            <div className="bg-gray-100 p-4 rounded-md text-xs font-mono max-h-40 overflow-y-auto mb-4">
              <div className="font-bold mb-2">Debug Info:</div>
              {debugInfo.map((log, idx) => (
                <div key={idx} className="text-gray-700 mb-1">{log}</div>
              ))}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
