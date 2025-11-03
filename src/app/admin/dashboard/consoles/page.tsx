import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ConsoleTypeManager from '@/components/admin/ConsoleTypeManager'

export default async function AdminConsolesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/admin/login')
  }

  const consoleTypes = await prisma.consoleType.findMany({
    include: {
      consoles: {
        include: {
          items: true
        },
        orderBy: {
          name: 'asc'
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Console Management</h1>
        <p className="text-gray-600">Manage console types and specific consoles</p>
      </div>

      <ConsoleTypeManager consoleTypes={consoleTypes} />
    </div>
  )
}


