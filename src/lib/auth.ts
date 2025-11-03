import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

// Ensure a secret exists in production; avoid falling back silently
if (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is required in production')
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            return null
          }

          const admin = await prisma.admin.findUnique({
            where: {
              username: credentials.username
            }
          })

          if (!admin) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            admin.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: admin.id.toString(),
            username: admin.username,
          }
        } catch (error) {
          console.error('Auth error:', error)
          // Log more details in development
          if (process.env.NODE_ENV === 'development') {
            console.error('Auth error details:', {
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined
            })
          }
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60, // 15 minutes - shorter session
  },
  jwt: {
    maxAge: 15 * 60, // 15 minutes - JWT expires too
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = (user as any).username || user.name || user.email
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string || token.sub!
        session.user.username = token.username as string
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  // Cookie configuration for Vercel
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Don't set domain - let browser handle it
        // This ensures cookies work on Vercel subdomains
      },
    },
  },
}
