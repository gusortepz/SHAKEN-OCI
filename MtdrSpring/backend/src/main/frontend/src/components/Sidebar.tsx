"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import {
  BarChart2,
  CalendarDays,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { format } from "date-fns"

interface SidebarProps {
  className?: string
  selectedDate?: Date | undefined
  onDateSelect?: (date: Date | undefined) => void
  setIsAuthenticated: (value: boolean) => void
}

export function Sidebar({ className, selectedDate, onDateSelect, setIsAuthenticated }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(selectedDate)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate)

    // Update URL search params when date is selected
    if (newDate) {
      const formattedDate = format(newDate, "yyyy-MM-dd")
      setSearchParams((params) => {
        params.set("date", formattedDate)
        return params
      })
    } else {
      setSearchParams((params) => {
        params.delete("date")
        return params
      })
    }

    if (onDateSelect) {
      onDateSelect(newDate)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false)
    navigate("/login")
    toast.info("Logged out", {
      description: "You have been logged out successfully.",
    })
  }

  const navItems = [
    {
      name: "Tasks",
      icon: CheckSquare,
      path: "/",
    },
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      name: "KPI",
      icon: BarChart2,
      path: "/kpi",
    },
    {
      name: "Team",
      icon: Users,
      path: "/team",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ]

  // Get current page title
  const currentPage = navItems.find((item) => item.path === location.pathname) || navItems[0]

  return (
    <>
      {/* Mobile Menu Button */}
      <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50" onClick={toggleMobileSidebar}>
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-white dark:bg-gray-950 border-r",
          collapsed ? "w-[70px]" : "w-[280px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className,
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header with User Info */}
          <div className="flex items-center justify-between px-4 h-16 border-b">
            {!collapsed ? (
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Admin User</span>
                  <span className="text-xs text-muted-foreground">admin@example.com</span>
                </div>
              </div>
            ) : (
              <Avatar className="h-8 w-8 mx-auto">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={toggleSidebar}>
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Page Title */}
          <div className="px-4 py-2">
            <h1 className={cn("font-semibold transition-all", collapsed ? "text-sm text-center" : "text-lg")}>
              {collapsed ? <currentPage.icon className="h-5 w-5 mx-auto" /> : currentPage.name}
            </h1>
          </div>

          <Separator className="my-2" />

          {/* Navigation */}
          <div className="flex-1 px-2 py-2 overflow-auto">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      collapsed ? "justify-center" : "justify-start",
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                )
              })}
            </nav>
          </div>

          <Separator className="my-2" />

          {/* Calendar */}
          <div className={cn("px-2", collapsed ? "hidden" : "block")}>
            <div className="flex items-center px-3 mb-2">
              <CalendarDays className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Calendar</span>
            </div>
            <Calendar mode="single" selected={date} onSelect={handleDateSelect} className="rounded-md border" />
          </div>

          {/* Logout Button */}
          <div className="p-4">
            <Button
              variant="ghost"
              className={cn(
                "w-full flex items-center text-muted-foreground",
                collapsed ? "justify-center px-2" : "justify-start px-3",
              )}
              onClick={handleLogout}
            >
              <LogOut className={cn("h-5 w-5", collapsed ? "" : "mr-2")} />
              {!collapsed && "Logout"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
