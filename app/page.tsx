"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Building2 } from "lucide-react"
import { OverviewTab } from "@/components/overview-tab"
import { AttendanceTab } from "@/components/attendance-tab"
import { TeamManagementTab } from "@/components/team-management-tab"
import { UserManagementTab } from "@/components/user-management-tab"

export default function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <Building2 className="h-6 w-6" />
            <span className="text-lg">Medical Billing Portal</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-sm">
              <div className="font-medium">{user.name}</div>
              <div className="text-muted-foreground">{user.position}</div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="teams">Team Management</TabsTrigger>
            {user.position === "Super Admin" && <TabsTrigger value="users">User Management</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <AttendanceTab />
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <TeamManagementTab />
          </TabsContent>

          {user.position === "Super Admin" && (
            <TabsContent value="users" className="space-y-4">
              <UserManagementTab />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
