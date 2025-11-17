import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { currentUser } from '@/lib/auth/server'
import { Users, Building2, UserCog, Shield } from 'lucide-react'
import { db } from '@/core/database/client'
import { users, companies, roles } from '@/core/database/schema'
import { count } from 'drizzle-orm'

export const metadata = {
  title: 'Dashboard',
  description: 'Admin Dashboard - Framework Overview',
}

async function DashboardStats() {
  // Get counts
  const [userCount] = await db.select({ count: count() }).from(users)
  const [companyCount] = await db.select({ count: count() }).from(companies)
  const [roleCount] = await db.select({ count: count() }).from(roles)

  const stats = [
    {
      title: 'Total Users',
      value: userCount.count,
      icon: Users,
      description: 'Active users in the system',
    },
    {
      title: 'Companies',
      value: companyCount.count,
      icon: Building2,
      description: 'Organizations',
    },
    {
      title: 'Roles',
      value: roleCount.count,
      icon: UserCog,
      description: 'System roles',
    },
    {
      title: 'Access Level',
      value: 'Admin',
      icon: Shield,
      description: 'Your current role',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default async function DashboardPage() {
  const user = await currentUser()

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name || 'Admin'}!
        </h2>
      </div>
      
      <Suspense fallback={<div>Loading stats...</div>}>
        <DashboardStats />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Framework Overview</CardTitle>
            <CardDescription>
              Your self-hosted, vendor-free framework is ready!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">✅ Features Active:</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• User Management & RBAC</li>
                  <li>• Organization Structure</li>
                  <li>• Redis Caching</li>
                  <li>• Rate Limiting</li>
                  <li>• SMTP Email (Production Ready)</li>
                  <li>• MinIO File Storage</li>
                  <li>• Error Boundaries</li>
                  <li>• Performance Monitoring</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">🔓 Vendor Lock-in:</h3>
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-green-600">0%</span> - Fully self-hosted!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a 
                href="/admin/users" 
                className="block p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="font-medium">Manage Users</div>
                <div className="text-sm text-muted-foreground">View and edit user accounts</div>
              </a>
              <a 
                href="/admin/roles" 
                className="block p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="font-medium">Manage Roles</div>
                <div className="text-sm text-muted-foreground">Configure permissions</div>
              </a>
              <a 
                href="/admin/organization/companies" 
                className="block p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="font-medium">Organizations</div>
                <div className="text-sm text-muted-foreground">Manage company structure</div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
