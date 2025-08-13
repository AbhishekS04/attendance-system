"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOut, User, Calendar, BarChart3, Users, BookOpen } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User as UserType } from "@/lib/db"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: UserType
  title: string
}

export default function DashboardLayout({ children, user, title }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const getNavigationItems = () => {
    const baseItems = [{ href: `/${user.role}`, icon: BarChart3, label: "Dashboard" }]

    switch (user.role) {
      case "admin":
        return [
          ...baseItems,
          { href: "/admin/users", icon: Users, label: "Manage Users" },
          { href: "/admin/classes", icon: BookOpen, label: "Manage Classes" },
          { href: "/admin/subjects", icon: BookOpen, label: "Manage Subjects" },
          { href: "/admin/reports", icon: BarChart3, label: "Reports" },
        ]
      case "cr":
        return [
          ...baseItems,
          { href: "/cr/attendance", icon: Calendar, label: "Mark Attendance" },
          { href: "/cr/reports", icon: BarChart3, label: "View Reports" },
        ]
      case "teacher":
        return [
          ...baseItems,
          { href: "/teacher/classes", icon: BookOpen, label: "My Classes" },
          { href: "/teacher/reports", icon: BarChart3, label: "Reports" },
        ]
      case "student":
        return [...baseItems, { href: "/student/attendance", icon: Calendar, label: "My Attendance" }]
      default:
        return baseItems
    }
  }

  const navigationItems = getNavigationItems()

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">AttendanceHub</h2>
        <p className="text-sm text-gray-600 mt-1">{user.role.toUpperCase()} Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 px-3 py-2 mb-2">
          <User className="h-5 w-5 text-gray-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <Button onClick={handleLogout} variant="outline" className="w-full justify-start bg-transparent">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-80 md:flex-col md:fixed md:inset-y-0">
        <div className="bg-white shadow-lg">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-80">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
