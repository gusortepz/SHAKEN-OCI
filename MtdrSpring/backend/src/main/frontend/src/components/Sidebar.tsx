"use client";

import { useState, useEffect } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  BarChart2,
  CalendarDays,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Users,
  X,
  Folder,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { format, addDays, parse } from "date-fns";
import type { DateRange } from "react-day-picker";

interface SidebarProps {
  className?: string;
  selectedDateRange?: DateRange | undefined;
  onDateRangeSelect?: (dateRange: DateRange | undefined) => void;
  setIsAuthenticated?: (value: boolean) => void;
}

export function Sidebar({
  className,
  selectedDateRange,
  onDateRangeSelect,
  setIsAuthenticated = () => {},
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    selectedDateRange
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync with URL params on mount and when searchParams change
  useEffect(() => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    if (fromParam) {
      try {
        const from = parse(fromParam, "yyyy-MM-dd", new Date());
        const to = toParam
          ? parse(toParam, "yyyy-MM-dd", new Date())
          : undefined;
        setDateRange({ from, to });
      } catch (error) {
        console.error("Error parsing date from URL params:", error);
        setDateRange(undefined);
      }
    } else {
      setDateRange(undefined);
    }
  }, [searchParams]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);

    // Update URL search params when date range is selected
    setSearchParams((params) => {
      if (range?.from) {
        const fromFormatted = format(range.from, "yyyy-MM-dd");
        params.set("from", fromFormatted);
        if (range.to) {
          const toFormatted = format(range.to, "yyyy-MM-dd");
          params.set("to", toFormatted);
        } else {
          params.delete("to");
        }
      } else {
        params.delete("from");
        params.delete("to");
      }
      return params;
    });

    if (onDateRangeSelect) {
      onDateRangeSelect(range);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts

    setIsLoggingOut(true);

    try {
      // Clear token first
      localStorage.removeItem("token");

      // Set authentication state
      setIsAuthenticated(false);

      // Show toast
      toast.info("Logged out", {
        description: "You have been logged out successfully.",
      });

      // Navigate to login after a small delay to ensure state is updated
      setTimeout(() => {
        navigate("/login", { replace: true });
        setIsLoggingOut(false);
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      name: "Tasks",
      icon: CheckSquare,
      path: "/",
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
      name: "Projects",
      icon: Folder,
      path: "/projects",
    },
    {
      name: "Sprints",
      icon: Rocket,
      path: "/sprints",
    }
  ];

  // Get current page title
  const currentPage =
    navItems.find((item) => item.path === location.pathname) || navItems[0];

  // Predefined date ranges for quick selection
  const predefinedRanges = [
    { name: "Today", range: { from: new Date(), to: new Date() } },
    {
      name: "This Week",
      range: { from: new Date(), to: addDays(new Date(), 6) },
    },
    {
      name: "Next Week",
      range: { from: addDays(new Date(), 7), to: addDays(new Date(), 13) },
    },
  ];

  return (
    <>
      {/* Mobile Menu Button - Hidden when sidebar is open */}
      {!mobileOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm border"
          onClick={toggleMobileSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-white dark:bg-gray-950 border-r",
          collapsed ? "w-[70px]" : "w-[280px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header with User Info */}
          <div className="flex items-center justify-between px-4 h-16 border-b">
            {!collapsed ? (
              <div className="flex items-center min-w-0">
                <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">
                    Admin User
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    admin@example.com
                  </span>
                </div>
              </div>
            ) : (
              <Avatar className="h-8 w-8 mx-auto">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}

            {/* Close button for mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Collapse button for desktop */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={toggleSidebar}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Page Title */}
          <div className="px-4 py-2">
            <h1
              className={cn(
                "font-semibold transition-all",
                collapsed ? "text-sm text-center" : "text-lg"
              )}
            >
              {collapsed ? (
                <currentPage.icon className="h-5 w-5 mx-auto" />
              ) : (
                currentPage.name
              )}
            </h1>
          </div>

          <Separator className="my-2" />

          {/* Navigation */}
          <div className="flex-1 px-2 py-2 overflow-auto">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      collapsed ? "justify-center" : "justify-start"
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        collapsed ? "" : "mr-3"
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <Separator className="my-2" />

          {/* Calendar */}
          <div className={cn("px-2", collapsed ? "hidden" : "block")}>
            <div className="flex items-center px-3 mb-2">
              <CalendarDays className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm font-medium">Date Range</span>
            </div>

            {/* Quick date range buttons */}
            <div className="flex flex-wrap gap-1 px-3 mb-2">
              {predefinedRanges.map((item) => (
                <Button
                  key={item.name}
                  variant="outline"
                  size="sm"
                  className="text-xs flex-1 min-w-0"
                  onClick={() => handleDateRangeSelect(item.range)}
                >
                  <span className="truncate">{item.name}</span>
                </Button>
              ))}
              {dateRange && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground w-full"
                  onClick={() => handleDateRangeSelect(undefined)}
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Date range display */}
            {dateRange?.from && (
              <div className="px-3 mb-2 text-sm">
                <span className="font-medium">Selected: </span>
                <span className="text-muted-foreground">
                  {format(dateRange.from, "MMM dd")}
                  {dateRange.to && ` - ${format(dateRange.to, "MMM dd")}`}
                </span>
              </div>
            )}

            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              className="rounded-md border"
              key={`${dateRange?.from?.getTime()}-${dateRange?.to?.getTime()}`} // Force re-render when dateRange changes
            />
          </div>

          {/* Logout Button */}
          <div className="p-4">
            <Button
              variant="ghost"
              className={cn(
                "w-full flex items-center text-muted-foreground",
                collapsed ? "justify-center px-2" : "justify-start px-3"
              )}
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut
                className={cn("h-5 w-5 flex-shrink-0", collapsed ? "" : "mr-2")}
              />
              {!collapsed && (
                <span className="truncate">
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
