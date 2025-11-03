import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import JRGamesLogo from '@/components/JRGamesLogo'
import Toaster from '@/components/Toaster'
import SecretAdminAccess from '@/components/SecretAdminAccess'
import KeyboardAdminAccess from '@/components/KeyboardAdminAccess'
import Footer from '@/components/Footer'
import MobileMenu from '@/components/MobileMenu'
import ErrorBoundary from '@/components/ErrorBoundary'
import { SessionProvider } from '@/components/SessionProvider'
import SessionManager from '@/components/SessionManager'
import AdminNavLink from '@/components/AdminNavLink'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'J&R Games - We Buy Your Gaming Items',
    template: '%s | J&R Games'
  },
  description: 'Sell your gaming consoles, games, and accessories to J&R Games. Fair prices, quick transactions.',
  keywords: [
    'sell gaming items',
    'buy gaming consoles',
    'gaming accessories',
    'video game buyback',
    'retro gaming',
    'J&R Games'
  ],
  authors: [{ name: 'J&R Games' }],
  creator: 'J&R Games',
  publisher: 'J&R Games',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL.startsWith('http') 
      ? process.env.NEXT_PUBLIC_BASE_URL 
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'https://localhost:3000'
  ),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'J&R Games - We Buy Your Gaming Items',
    description: 'Sell your gaming consoles, games, and accessories to J&R Games. Fair prices, quick transactions.',
    siteName: 'J&R Games',
    images: [
      {
        url: '/jnr_2024_logo.png',
        width: 1200,
        height: 630,
        alt: 'J&R Games Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'J&R Games - We Buy Your Gaming Items',
    description: 'Sell your gaming consoles, games, and accessories to J&R Games. Fair prices, quick transactions.',
    images: ['/jnr_2024_logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification code
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <SessionManager />
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
          >
            Skip to main content
          </a>
        
        <header>
          <nav className="bg-white shadow-xl border-b border-gray-100" role="navigation" aria-label="Main navigation">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-between h-20">
                <div className="flex items-center relative">
                  <Link 
                    href="/" 
                    className="flex items-center focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 p-2 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                    aria-label="J&R Games - Home"
                  >
                    <JRGamesLogo size="md" />
                  </Link>
                  <SecretAdminAccess />
                </div>
                
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-1">
                  <Link 
                    href="/items" 
                    className="relative text-gray-700 hover:text-green-600 font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-xl px-6 py-3 group"
                    aria-label="View items we buy"
                  >
                    <span className="relative z-10">What We Buy</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-green-600 group-hover:w-8 transition-all duration-300"></div>
                  </Link>
                  
                  {/* Divider */}
                  <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-2"></div>
                  
                  <Link 
                    href="/contact" 
                    className="relative text-gray-700 hover:text-red-600 font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-xl px-6 py-3 group"
                    aria-label="Contact us to sell your items"
                  >
                    <span className="relative z-10">Contact Us</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-red-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-red-600 group-hover:w-8 transition-all duration-300"></div>
                  </Link>
                </div>

                {/* Admin Navigation - Only shows when logged in */}
                <AdminNavLink />

                {/* Mobile Menu */}
                <MobileMenu />
              </div>
            </div>
          </nav>
        </header>
        
        <main id="main-content" className="min-h-screen bg-gray-50" role="main">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        
          <Footer />
          <Toaster />
          <KeyboardAdminAccess />
        </SessionProvider>
      </body>
    </html>
  )
}
