"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchUsers, User, type Task, type TaskPriority } from "@/utils/api"

interface TaskFormProps {
  onAddTask: (taskData: Partial<Task>) => Promise<void>
  isLoading: boolean
}

export function TaskForm({ onAddTask, isLoading }: TaskFormProps) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [formData, setFormData] = useState<Partial<Task>>({
    description: "",
    status: "TODO",
    priority: "LOW",
    createdBy: 1,
    assignee: undefined,
    projectId: null,
    sprintId: null,
    storyPoints: null,
    estimatedTime: null,
    realTime: null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true)
      try {
        const token = localStorage.getItem("token") || ""
        const fetchedUsers = await fetchUsers(token)
        setUsers(fetchedUsers)
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        setIsLoadingUsers(false)
      }
    }

    if (open) {
      loadUsers()
    }
  }, [open])

  const handleChange = (field: keyof Task, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters"
    }

    if (!formData.status) {
      newErrors.status = "Status is required"
    }

    if (!formData.priority) {
      newErrors.priority = "Priority is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      await onAddTask(formData)
      setFormData({
        description: "",
        status: "TODO",
        priority: "LOW",
        createdBy: 1,
        assignee: undefined,
        projectId: null,
        sprintId: null,
        storyPoints: null,
        estimatedTime: null,
        realTime: null,
      })
      setOpen(false)
    } catch (error) {
      console.error("Failed to add task:", error)
    }
  }

  return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center justify-center gap-2 h-10">
              <PlusCircle className="h-5 w-5" />
              Add New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>Fill in the details to create a new task.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="description" className="font-medium">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter task description"
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
                <p className="text-xs text-muted-foreground">{formData.description?.length || 0}/500 characters</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status" className="font-medium">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.status as string} onValueChange={(value) => handleChange("status", value)}>
                    <SelectTrigger id="status" className={errors.status ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">To Do</SelectItem>
                      <SelectItem value="INPROGRESS">In Progress</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-red-500 text-xs">{errors.status}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="priority" className="font-medium">
                    Priority <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.priority as string}
                    onValueChange={(value) => handleChange("priority", value as TaskPriority)}
                  >
                    <SelectTrigger id="priority" className={errors.priority ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.priority && <p className="text-red-500 text-xs">{errors.priority}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="assignee" className="font-medium">
                    Assignee <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.assignee?.toString() || ""}
                    onValueChange={(value) => handleChange("assignee", value ? Number.parseInt(value) : undefined)}
                  >
                    <SelectTrigger id="assignee">
                      <SelectValue placeholder={isLoadingUsers ? "Loading..." : "Select assignee"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sprintId" className="font-medium">
                    Sprint <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.sprintId?.toString() || ""}
                    onValueChange={(value) => handleChange("sprintId", value ? Number.parseInt(value) : null)}
                  >
                    <SelectTrigger id="sprintId">
                      <SelectValue placeholder="Select sprint" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Sprint 1</SelectItem>
                      <SelectItem value="2">Sprint 2</SelectItem>
                      <SelectItem value="3">Sprint 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="storyPoints" className="font-medium">
                    Story Points <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="storyPoints"
                    type="number"
                    min="0"
                    placeholder="Enter story points"
                    value={formData.storyPoints || ""}
                    onChange={(e) =>
                      handleChange("storyPoints", e.target.value ? Number.parseInt(e.target.value) : null)
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="estimatedTime" className="font-medium">
                    Estimated Time (hours) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Enter estimated time"
                    value={formData.estimatedTime || ""}
                    onChange={(e) =>
                      handleChange("estimatedTime", e.target.value ? Number.parseFloat(e.target.value) : null)
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Adding...
                  </>
                ) : (
                  "Add Task"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
  )
}
