import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Shield, GitBranch, Bell, Workflow, FileText, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/lib/auth";

/**
 * FRAMEWORK DASHBOARD
 * Generic dashboard showcasing core framework features
 */
export default async function Dashboard() {
  const user = await currentUser();

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome{user?.name ? `, ${user.name}` : ""}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Enterprise Framework - Core Features Dashboard
        </p>
      </div>

      {/* Framework Features Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Management</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mt-1">
              Manage users, roles and permissions
            </p>
            <Link href="/admin/users">
              <Button variant="link" className="px-0 mt-2 h-auto text-sm">
                View Users →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Organization Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organization</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mt-1">
              Hierarchy: Companies, Branches, Departments
            </p>
            <Link href="/admin/organization/companies">
              <Button variant="link" className="px-0 mt-2 h-auto text-sm">
                Manage Organization →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Roles Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles & Permissions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mt-1">
              Multi-role RBAC system
            </p>
            <Link href="/admin/roles">
              <Button variant="link" className="px-0 mt-2 h-auto text-sm">
                Manage Roles →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Workflows Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workflows</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mt-1">
              Visual workflow designer & engine
            </p>
            <Link href="/admin/workflows">
              <Button variant="link" className="px-0 mt-2 h-auto text-sm">
                Design Workflows →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Core Administration</CardTitle>
            <CardDescription>
              Framework administration features
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                User Management
              </Button>
            </Link>
            <Link href="/admin/roles">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                Role Management
              </Button>
            </Link>
            <Link href="/admin/organization/companies">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Organization Structure
              </Button>
            </Link>
            <Link href="/admin/workflows">
              <Button variant="outline" className="w-full justify-start">
                <Workflow className="mr-2 h-4 w-4" />
                Workflow Designer
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Features</CardTitle>
            <CardDescription>
              Advanced framework capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/admin/custom-fields">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Custom Fields
              </Button>
            </Link>
            <Link href="/admin/hr-sync">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                HR Integration
              </Button>
            </Link>
            <Link href="/system/menus">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Menu Management
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                User Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Framework Info */}
      <Card>
        <CardHeader>
          <CardTitle>🏗️ Enterprise Framework Core</CardTitle>
          <CardDescription>
            A modern, production-ready Next.js framework for building enterprise applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 mt-0.5 text-green-600" />
              <div>
                <p className="font-medium">Authentication & Authorization</p>
                <p className="text-muted-foreground">Multi-role RBAC, context-based permissions, menu access control</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 mt-0.5 text-blue-600" />
              <div>
                <p className="font-medium">Organization Management</p>
                <p className="text-muted-foreground">Hierarchical structure, teams & groups, position management</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <GitBranch className="h-4 w-4 mt-0.5 text-purple-600" />
              <div>
                <p className="font-medium">Workflow Engine</p>
                <p className="text-muted-foreground">Visual designer, approval flows, delegation, deadline tracking</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Bell className="h-4 w-4 mt-0.5 text-orange-600" />
              <div>
                <p className="font-medium">Notification System</p>
                <p className="text-muted-foreground">Multi-channel alerts, priority levels, category filtering</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
