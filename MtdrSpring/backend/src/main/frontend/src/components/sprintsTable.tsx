"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { Calendar, Search, Check, Clock, CalendarClock, Eye } from "lucide-react"
import type { Sprint, Project } from "@/utils/api"

interface SprintsTableProps {
  sprints: Sprint[]
  projects: Project[]
  onViewSprint: (sprint: Sprint) => void
}

export function SprintsTable({ sprints, projects, onViewSprint }: SprintsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSprints = searchTerm
    ? sprints.filter(
        (sprint) =>
          sprint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getProjectName(sprint.projectId).toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : sprints

  function getProjectName(projectId: number | null): string {
    if (projectId === null) return "No Project"
    const project = projects.find((p) => p.id === projectId)
    return project ? project.name : `Project #${projectId}`
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "PLANNED":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <CalendarClock className="h-3 w-3 mr-1" />
            Planned
          </Badge>
        )
      case "ACTIVE":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Clock className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "COMPLETED":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <Check className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sprints..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Showing <strong>{filteredSprints.length}</strong> of <strong>{sprints.length}</strong> sprints
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Sprint Name</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSprints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No sprints found.
                </TableCell>
              </TableRow>
            ) : (
              filteredSprints.map((sprint) => (
                <TableRow
                  key={sprint.id}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{sprint.id}</TableCell>
                  <TableCell>{sprint.name}</TableCell>
                  <TableCell>{getProjectName(sprint.projectId)}</TableCell>
                  <TableCell>{getStatusBadge(sprint.status)}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {format(new Date(sprint.startDate), "MMM d, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {format(new Date(sprint.endDate), "MMM d, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Eye className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary"
                      onClick={() => onViewSprint(sprint)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
