"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, X, RotateCcw } from "lucide-react"
import { fetchUsers } from "@/utils/api"

interface TaskFilterProps {
  onFilterChange: (filters: FilterOptions) => void
}

export interface FilterOptions {
  search: string
  assignee: string
  priority: string
}

export function TaskFilter({ onFilterChange }: TaskFilterProps) {
  const [search, setSearch] = useState("")
  const [assignee, setAssignee] = useState("")
  const [priority, setPriority] = useState("")
  const [users, setUsers] = useState<{ id: string; username: string; role: string }[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)

  // Fetch users on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoadingUsers(true)
      try {
        const token = localStorage.getItem("token")
        const response = await fetchUsers(token || "")
        setUsers(response.map((user) => ({ ...user, id: user.id.toString() })))
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setIsLoadingUsers(false)
      }
    }
    fetchUserData()
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    onFilterChange({ search: e.target.value, assignee, priority })
  }

  const handleAssigneeChange = (value: string) => {
    setAssignee(value === "all" ? "" : value)
    onFilterChange({ search, assignee: value === "all" ? "" : value, priority })
  }

  const handlePriorityChange = (value: string) => {
    setPriority(value === "all" ? "" : value)
    onFilterChange({ search, assignee, priority: value === "all" ? "" : value })
  }

  const handleReset = () => {
    setSearch("")
    setAssignee("")
    setPriority("")
    onFilterChange({ search: "", assignee: "", priority: "" })
  }

  return (
    <div className="w-full max-w-3xl px-4 mb-6">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9 py-2 h-10"
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => {
                setSearch("")
                onFilterChange({ search: "", assignee, priority })
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {/* Assignee filter */}
          <Select value={assignee || "all"} onValueChange={handleAssigneeChange}>
            <SelectTrigger className="h-10 min-w-[150px]">
              <SelectValue placeholder={isLoadingUsers ? "Loading..." : "Assignee"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.username} ({user.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority filter */}
          <Select value={priority || "all"} onValueChange={handlePriorityChange}>
            <SelectTrigger className="min-w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="">
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset button - only show if filters are active */}
          {(search || assignee || priority) && (
            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={handleReset} title="Reset all filters">
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active filters display */}
      {(assignee || priority) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {assignee && (
            <Badge variant="secondary" className="flex justify-between gap-1 pl-2 pr-1 py-1">
              <span>Assignee: {users.find((u) => u.id === assignee)?.username || `User #${assignee}`}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setAssignee("")
                  onFilterChange({ search, assignee: "", priority })
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {priority && (
            <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1 py-1">
              <span>Priority: {priority === "HIGH" ? "High" : priority === "MEDIUM" ? "Medium" : "Low"}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setPriority("")
                  onFilterChange({ search, assignee, priority: "" })
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
