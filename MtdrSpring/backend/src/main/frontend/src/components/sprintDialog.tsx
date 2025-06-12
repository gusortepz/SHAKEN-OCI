"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { format, formatDistanceStrict } from "date-fns"
import { Calendar, Check, Clock, CalendarClock, Pencil, Trash2, Building, Loader2 } from "lucide-react"
import type { Sprint, Project } from "@/utils/api"
import { SprintFormDialog } from "./sprintForm"

interface SprintViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sprint: Sprint
  projects: Project[]
  onUpdate: (sprint: Sprint) => void
  onDelete: (id: number) => void
}

export function SprintViewDialog({ open, onOpenChange, sprint, projects, onUpdate, onDelete }: SprintViewDialogProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Find project details
  const project = projects.find((p) => p.id === sprint.projectId)

  // Calculate sprint duration in days
  const sprintDuration = formatDistanceStrict(new Date(sprint.endDate), new Date(sprint.startDate))

  // Get status badge
  const getStatusBadge = (status: string) => {
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

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)

    try {
      const token = localStorage.getItem("token") || ""

      const response = await fetch(`http://localhost:8080/api/sprint/${sprint.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete sprint")
      }

      onDelete(sprint.id)
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting sprint:", error)
      toast.error("Failed to delete sprint", {
        description: "Please try again or contact support.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Sprint Details
              <span className="ml-2">{getStatusBadge(sprint.status)}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Sprint Name */}
            <div>
              <h2 className="text-xl font-semibold">{sprint.name}</h2>
              <p className="text-muted-foreground text-sm">Sprint #{sprint.id}</p>
            </div>

            {/* Project Info */}
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Project:</span>
              {project ? project.name : "Unknown Project"}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{format(new Date(sprint.startDate), "MMM d, yyyy")}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">End Date</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{format(new Date(sprint.endDate), "MMM d, yyyy")}</span>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{sprintDuration}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" className="gap-1" onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" className="gap-1" onClick={handleDeleteConfirm}>
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Sprint Dialog */}
      <SprintFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={sprint}
        projects={projects}
        onSave={(updatedSprint) => {
          onUpdate(updatedSprint)
          setIsEditDialogOpen(false)
        }}
      />
    </>
  )
}
