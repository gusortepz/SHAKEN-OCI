"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Search, X, RotateCcw, Filter, Users, AlertTriangle, Calendar } from "lucide-react"
import { fetchUsers, fetchSprints, type Sprint } from "@/utils/api"
import { Skeleton } from "./ui/skeleton"

interface TaskFilterProps {
  onFilterChange: (filters: FilterOptions) => void
  totalTasks?: number
  filteredCount?: number
}

export interface FilterOptions {
  search: string
  assignee: string
  priority: string
  sprint: string
  dateRange?: { from: Date; to?: Date }
}

export function TaskFilter({ onFilterChange, totalTasks = 0, filteredCount = 0 }: TaskFilterProps) {
  const [search, setSearch] = useState("")
  const [assignee, setAssignee] = useState("")
  const [priority, setPriority] = useState("")
  const [sprint, setSprint] = useState("")
  const [users, setUsers] = useState<{ id: string; username: string; role: string }[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isLoadingSprints, setIsLoadingSprints] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Fetch users and sprints on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingUsers(true)
      setIsLoadingSprints(true)
      try {
        const token = localStorage.getItem("token")
        const [usersResponse, sprintsResponse] = await Promise.all([fetchUsers(token || ""), fetchSprints(token || "")])
        setUsers(usersResponse.map((user) => ({ ...user, id: user.id.toString() })))
        setSprints(sprintsResponse)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoadingUsers(false)
        setIsLoadingSprints(false)
      }
    }
    fetchData()
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    onFilterChange({ search: e.target.value, assignee, priority, sprint })
  }

  const handleAssigneeChange = (value: string) => {
    const newAssignee = value === "all" ? "" : value
    setAssignee(newAssignee)
    onFilterChange({ search, assignee: newAssignee, priority, sprint })
  }

  const handlePriorityChange = (value: string) => {
    const newPriority = value === "all" ? "" : value
    setPriority(newPriority)
    onFilterChange({ search, assignee, priority: newPriority, sprint })
  }

  const handleSprintChange = (value: string) => {
    const newSprint = value === "all" ? "" : value
    setSprint(newSprint)
    onFilterChange({ search, assignee, priority, sprint: newSprint })
  }

  const handleReset = () => {
    setSearch("")
    setAssignee("")
    setPriority("")
    setSprint("")
    onFilterChange({ search: "", assignee: "", priority: "", sprint: "" })
  }

  const hasActiveFilters = search || assignee || priority || sprint
  const activeFilterCount = [search, assignee, priority, sprint].filter(Boolean).length

  return (
    <div className="w-full space-y-4">
          {/* Search and Filter Button Row */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks by description..."
                value={search}
                onChange={handleSearchChange}
                className="pl-10 h-11 text-base"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => {
                    setSearch("")
                    onFilterChange({ search: "", assignee, priority, sprint })
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Filter Button and Reset */}
            <div className="flex gap-2">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className={`h-11 px-4 ${hasActiveFilters ? "border border-black" : ""}`}>
                    <Filter className={`h-4 w-4 mr-2 ${hasActiveFilters ? "text-black" : "text-muted-foreground"}`} />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge className="ml-2 h-5 w-5 p-0 text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="px-4">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Advanced Filters
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-6 space-y-6 px-4">
                    {/* Assignee Filter */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <label className="text-sm font-medium">Assignee</label>
                      </div>
                      <Select value={assignee || "all"} onValueChange={handleAssigneeChange}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={isLoadingUsers ? "Loading..." : "All assignees"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All assignees</SelectItem>
                          <Separator className="my-1" />
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                                <span>{user.username}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {user.role}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priority Filter */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        <label className="text-sm font-medium">Priority</label>
                      </div>
                      <Select value={priority || "all"} onValueChange={handlePriorityChange}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="All priorities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All priorities</SelectItem>
                          <Separator className="my-1" />
                          <SelectItem value="HIGH">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-red-500" />
                              <span>High Priority</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="MEDIUM">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-amber-500" />
                              <span>Medium Priority</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="LOW">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500" />
                              <span>Low Priority</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Active Filters in Sheet */}
                    {hasActiveFilters && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Active Filters:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {search && (
                            <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1 py-1">
                              <Search className="h-3 w-3" />
                              <span>Search: "{search}"</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => {
                                  setSearch("")
                                  onFilterChange({ search: "", assignee, priority, sprint })
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          )}

                          {assignee && (
                            <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1 py-1">
                              <Users className="h-3 w-3" />
                              <span>
                                Assignee: {users.find((u) => u.id === assignee)?.username || `User #${assignee}`}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => {
                                  setAssignee("")
                                  onFilterChange({ search, assignee: "", priority, sprint })
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          )}

                          {priority && (
                            <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1 py-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span>
                                Priority: {priority === "HIGH" ? "High" : priority === "MEDIUM" ? "Medium" : "Low"}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => {
                                  setPriority("")
                                  onFilterChange({ search, assignee, priority: "", sprint })
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          )}

                          {sprint && (
                            <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1 py-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Sprint: {sprints.find((s) => s.id.toString() === sprint)?.name || `Sprint #${sprint}`}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => {
                                  setSprint("")
                                  onFilterChange({ search, assignee, priority, sprint: "" })
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          )}
                        </div>

                        <Button variant="outline" size="sm" onClick={handleReset} className="w-full">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Clear All Filters
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11"
                  onClick={handleReset}
                  title="Reset all filters"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Sprint Tabs */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sprint Filter</span>
            </div>

            {isLoadingSprints ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Tabs value={sprint || "all"} onValueChange={handleSprintChange} className="w-full">
                <TabsList className="w-full h-auto flex flex-wrap gap-1 p-1 bg-muted/50">
                  <TabsTrigger
                    value="all"
                    className="flex-1 min-w-[80px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    All Sprints
                  </TabsTrigger>
                  {sprints.map((sprintItem) => (
                    <TabsTrigger
                      key={sprintItem.id}
                      value={sprintItem.id.toString()}
                      className="flex-1 min-w-[80px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <span className="truncate">{sprintItem.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>

          {/* Results Counter */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {filteredCount === totalTasks ? `${totalTasks} tasks` : `${filteredCount} of ${totalTasks} tasks`}
              </span>
              {hasActiveFilters && <span>• Filtered</span>}
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
                Clear all filters
              </Button>
            )}
          </div>
    </div>
  )
}
