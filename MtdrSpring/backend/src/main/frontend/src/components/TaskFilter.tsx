"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"
import { users } from "@/utils/api"

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
  const [showFilters, setShowFilters] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    onFilterChange({ search: e.target.value, assignee, priority })
  }

  const handleAssigneeChange = (value: string) => {
    setAssignee(value)
    onFilterChange({ search, assignee: value, priority })
  }

  const handlePriorityChange = (value: string) => {
    setPriority(value)
    onFilterChange({ search, assignee, priority: value })
  }

  const handleReset = () => {
    setSearch("")
    setAssignee("")
    setPriority("")
    onFilterChange({ search: "", assignee: "", priority: "" })
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
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
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-muted" : ""}
          >
            <Filter className="h-4 w-4" />
          </Button>
          {(assignee || priority) && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
              Reset
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-5 duration-300">
            <div className="flex-1 min-w-[150px]">
              <Select value={assignee} onValueChange={handleAssigneeChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All assignees</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <Select value={priority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
