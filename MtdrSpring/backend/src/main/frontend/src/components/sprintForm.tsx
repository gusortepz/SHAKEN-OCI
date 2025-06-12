"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import { startOfDay } from "date-fns"
import { Loader2 } from "lucide-react"
import type { Sprint, Project } from "@/utils/api"

interface SprintFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Sprint
  onSave: (sprint: Sprint) => void
  projects: Project[]
}

const createEmptySprint = (): Omit<Sprint, "id"> => ({
  name: "",
  projectId: null,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), 
  status: "PLANNED",
})

export function SprintFormDialog({ open, onOpenChange, initialData, onSave, projects }: SprintFormDialogProps) {
  const [formData, setFormData] = useState<Omit<Sprint, "id">>(initialData ? { ...initialData } : createEmptySprint())
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData ? new Date(initialData.startDate) : new Date(),
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData ? new Date(initialData.endDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Sprint name is required"
    }

    if (!formData.projectId) {
      newErrors.projectId = "Project is required"
    }

    if (!startDate) {
      newErrors.startDate = "Start date is required"
    }

    if (!endDate) {
      newErrors.endDate = "End date is required"
    } else if (startDate && endDate && startDate > endDate) {
      newErrors.endDate = "End date cannot be before start date"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  
  const handleChange = (field: keyof typeof formData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setStartDate(date)
      handleChange("startDate", startOfDay(date).toISOString())
    }
  }

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      setEndDate(date)
      handleChange("endDate", startOfDay(date).toISOString())
    }
  }

  
  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token") || ""
      const url = initialData
        ? `http://localhost:8080/api/sprint/${initialData.id}`
        : "http://localhost:8080/api/sprint"

      const method = initialData ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${initialData ? "update" : "create"} sprint`)
      }

      
      let sprintId: number
      if (!initialData) {
        const location = response.headers.get("Location")
        
        sprintId = location ? Number.parseInt(location.split("/").pop() || "0", 10) : 0
      } else {
        sprintId = initialData.id
      }

      
      const savedSprint: Sprint = {
        ...formData,
        id: sprintId,
      }

      onSave(savedSprint)
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving sprint:", error)
      toast.error(`Failed to ${initialData ? "update" : "create"} sprint`, {
        description: "Please try again or contact support.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Sprint" : "Create Sprint"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Sprint Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">
              Sprint Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter sprint name"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Project Selection */}
          <div className="grid gap-2">
            <Label htmlFor="project">
              Project <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.projectId?.toString() || ""}
              onValueChange={(value) => handleChange("projectId", value ? Number(value) : null)}
            >
              <SelectTrigger className={errors.projectId ? "border-destructive" : ""}>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.projectId && <p className="text-xs text-destructive">{errors.projectId}</p>}
          </div>

          {/* Date Range (Start and End Dates) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="grid gap-2">
              <Label>
                Start Date <span className="text-destructive">*</span>
              </Label>
                <Calendar mode="single" selected={startDate} onSelect={handleStartDateChange} initialFocus />
              {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
            </div>

            {/* End Date */}
            <div className="grid gap-2">
              <Label>
                End Date <span className="text-destructive">*</span>
              </Label>
                <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleEndDateChange}
                initialFocus
                disabled={(date) => (startDate ? date < startDate : false)}
                />
              {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
            </div>
          </div>

          {/* Status */}
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLANNED">Planned</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{initialData ? "Update" : "Create"}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
