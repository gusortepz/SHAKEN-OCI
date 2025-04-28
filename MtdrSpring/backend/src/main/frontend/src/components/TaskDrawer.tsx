"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { X, Clock, Calendar, User, BarChart2, Timer, ChevronDown, AlertCircle, Loader2 } from "lucide-react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { API_BASE_URL, type Task, type TaskPriority, updateTaskPriority } from "@/utils/api"
import { toast } from "sonner"

interface TaskDrawerProps {
  taskId: string | number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>
}

export function TaskDrawer({ taskId, open, onOpenChange, setTasks }: TaskDrawerProps) {
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isChangingPriority, setIsChangingPriority] = useState(false)

  useEffect(() => {
    if (open && taskId) {
      fetchTaskDetails(taskId)
    } else {
      setTask(null)
    }
  }, [open, taskId])

  const fetchTaskDetails = async (id: string | number) => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token") || ""
      const response = await fetch(`${API_BASE_URL}/todolist/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch task details")
      }

      const data = await response.json()
      setTask(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TODO":
        return <Badge className="bg-blue-500">To Do</Badge>
      case "INPROGRESS":
        return <Badge className="bg-amber-500">In Progress</Badge>
      case "DONE":
        return <Badge className="bg-green-500">Done</Badge>
      default:
        return null
    }
  }

  // Helper function to get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return (
          <Badge variant="outline" className="border-red-600 text-red-600 bg-red-50">
            High Priority
          </Badge>
        )
      case "MEDIUM":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500 bg-amber-50">
            Medium Priority
          </Badge>
        )
      case "LOW":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500 bg-blue-50">
            Low Priority
          </Badge>
        )
      default:
        return null
    }
  }

  // Handle priority change
  const handlePriorityChange = async (newPriority: TaskPriority) => {
    if (!task) return

    setIsChangingPriority(true)

    try {
      const token = localStorage.getItem("token") || ""
      await updateTaskPriority(token, task, newPriority)

      // Update local task state
      const updatedTask = { ...task, priority: newPriority }
      setTask(updatedTask)

      // Update tasks in parent component if setTasks is provided
      if (setTasks) {
        setTasks((prevTasks) => prevTasks.map((t) => (t.id === task.id ? updatedTask : t)))
      }

      toast.success("Priority updated", {
        description: `Task priority changed to ${newPriority.toLowerCase()}.`,
      })
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update task priority. Please try again.",
      })
      console.error("Failed to update task priority", error)
    } finally {
      setIsChangingPriority(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] h-[55vh]">
        <DrawerHeader className="px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <DrawerTitle>Task Details</DrawerTitle>
            <DrawerClose className="rounded-full h-6 w-6 flex items-center justify-center">
              <X className="h-4 w-4" />
            </DrawerClose>
          </div>
          <DrawerDescription>View detailed information about this task</DrawerDescription>
        </DrawerHeader>

        <div className="px-4 sm:px-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-destructive">
              <p>{error}</p>
              <button onClick={() => taskId && fetchTaskDetails(taskId)} className="mt-2 text-sm underline">
                Try again
              </button>
            </div>
          ) : task ? (
            <div className="space-y-6 pb-6">
              {/* Task title and badges */}
              <div>
                <h3 className="text-xl font-semibold mb-3">{task.description}</h3>
                <div className="flex flex-wrap gap-2 items-center">
                  {getStatusBadge(task.status)}

                  {/* Priority badge with dropdown */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="flex items-center cursor-pointer group">
                        <div className="flex items-center">
                          {getPriorityBadge(task.priority)}
                          <ChevronDown className="h-4 w-4 ml-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handlePriorityChange("HIGH")}
                          disabled={task.priority === "HIGH" || isChangingPriority}
                        >
                          {isChangingPriority && task.priority !== "HIGH" ? (
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          ) : (
                            <AlertCircle className="h-3 w-3 mr-2" />
                          )}
                          High Priority
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          onClick={() => handlePriorityChange("MEDIUM")}
                          disabled={task.priority === "MEDIUM" || isChangingPriority}
                        >
                          {isChangingPriority && task.priority !== "MEDIUM" ? (
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          ) : (
                            <AlertCircle className="h-3 w-3 mr-2" />
                          )}
                          Medium Priority
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handlePriorityChange("LOW")}
                          disabled={task.priority === "LOW" || isChangingPriority}
                        >
                          {isChangingPriority && task.priority !== "LOW" ? (
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          ) : (
                            <AlertCircle className="h-3 w-3 mr-2" />
                          )}
                          Low Priority
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Separator />

              {/* Task details in a clean layout */}
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{task.creation_ts ? format(new Date(task.creation_ts), "MMM d, yyyy") : "N/A"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Time</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p>{task.creation_ts ? format(new Date(task.creation_ts), "h:mm a") : "N/A"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Assignee</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p>{task.assignee != null ? `User #${task.assignee}` : "Unassigned"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created By</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p>User #{task.createdBy}</p>
                  </div>
                </div>

                {task.sprintId && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Sprint</p>
                    <div className="flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-muted-foreground" />
                      <p>Sprint #{task.sprintId}</p>
                    </div>
                  </div>
                )}

                {task.estimatedTime !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Est. Time</p>
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <p>{task.estimatedTime}h</p>
                    </div>
                  </div>
                )}

                {task.storyPoints !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Story Points</p>
                    <p>{task.storyPoints}</p>
                  </div>
                )}

                {task.realTime !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Real Time</p>
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <p>{task.realTime}h</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-40 text-muted-foreground">No task selected</div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
