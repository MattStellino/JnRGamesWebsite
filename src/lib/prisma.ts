import { PrismaClient } from '@prisma/client'

// Check for required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// For serverless environments, configure connection pooling
const connectionString = process.env.DATABASE_URL

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: connectionString,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
