"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TaskDrawer } from "@/components/TaskDrawer"
import type { Task, TaskStatus } from "@/utils/api"
import { formatDistanceToNow } from "date-fns"
import { CheckCircle, RotateCcw, Trash2, PlayCircle, Clock, AlertCircle, Loader2, Eye } from "lucide-react"

interface TaskListProps {
  title: string
  tasks: Task[]
  status: TaskStatus
  onUpdateStatus: (task: Task, newStatus: TaskStatus) => Promise<void>
  onDelete: (id: string | number) => Promise<void>
  updatingTaskIds: (string | number)[]
  isUpdatingTask: boolean
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
}

export function TaskList({
  title,
  tasks,
  status,
  onUpdateStatus,
  onDelete,
  updatingTaskIds,
  isUpdatingTask,
  setTasks,
}: TaskListProps) {
  const filteredTasks = tasks.filter((task) => task.status === status)
  const [selectedTaskId, setSelectedTaskId] = useState<string | number | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Define status-specific colors
  const getStatusColor = () => {
    switch (status) {
      case "TODO":
        return "dark:bg-blue-950 border-blue-800 dark:border-blue-800"
      case "INPROGRESS":
        return "dark:bg-amber-950 border-amber-600 dark:border-amber-800"
      case "DONE":
        return "dark:bg-green-950 border-green-800 dark:border-green-800"
      default:
        return "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
    }
  }

  // Define status-specific header colors
  const getHeaderColor = () => {
    switch (status) {
      case "TODO":
        return "dark:bg-blue-900 text-blue-800 dark:text-blue-100"
      case "INPROGRESS":
        return "dark:bg-amber-900 text-amber-800 dark:text-amber-100"
      case "DONE":
        return "dark:bg-green-900 text-green-800 dark:text-green-100"
      default:
        return "bg-gray-100 dark:bg-gray-800"
    }
  }

  // Get priority icon with tooltip text
  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return { icon: <AlertCircle className="h-4 w-4 text-red-500" />, label: "High Priority" }
      case "MEDIUM":
        return { icon: <AlertCircle className="h-4 w-4 text-amber-500" />, label: "Medium Priority" }
      case "LOW":
        return { icon: <AlertCircle className="h-4 w-4 text-blue-500" />, label: "Low Priority" }
      default:
        return { icon: null, label: "" }
    }
  }

  // Check if a task is currently being updated
  const isUpdating = (taskId: string | number) => {
    return updatingTaskIds.includes(taskId)
  }

  // Handle opening the drawer with task details
  const handleViewTask = (taskId: string | number) => {
    setSelectedTaskId(taskId)
    setDrawerOpen(true)
  }

  // Safely get assignee display text
  const getAssigneeDisplay = (assignee: number | null | undefined) => {
    return assignee != null ? `#${assignee}` : "Unassigned"
  }

  return (
    <>
      <Card className={`h-full shadow-md border ${getStatusColor()}`}>
        <CardHeader className={`pb-3 ${getHeaderColor()} rounded-t-lg`}>
          <CardTitle className="text-lg font-medium flex items-center justify-center">
            {status === "TODO" && <PlayCircle className="h-4 w-4 mr-2" />}
            {status === "INPROGRESS" && <Clock className="h-4 w-4 mr-2" />}
            {status === "DONE" && <CheckCircle className="h-4 w-4 mr-2" />}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {filteredTasks.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-muted-foreground text-sm border border-dashed rounded-md bg-background/50">
              No tasks in this category
            </div>
          ) : (
            <ul className="space-y-4">
              {filteredTasks.map((task) => {
                const updating = isUpdating(task.id)
                const priorityInfo = getPriorityInfo(task.priority)

                return (
                  <li
                    key={task.id}
                    className={`border rounded-lg bg-card shadow-sm overflow-hidden transition-opacity ${
                      updating ? "opacity-70 pointer-events-none" : ""
                    }`}
                  >
                    <div className="p-3 border-b bg-muted/30">
                      <div className="flex items-start">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex-shrink-0 mt-1 mr-2">{priorityInfo.icon}</div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{priorityInfo.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium break-words pr-2">{task.description}</p>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 ml-2 flex-shrink-0"
                          onClick={() => handleViewTask(task.id)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View task details</span>
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-background flex flex-col gap-3 group">
                      <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Created {formatDistanceToNow(new Date(task.creation_ts), { addSuffix: true })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-[10px]">{getAssigneeDisplay(task.assignee)}</AvatarFallback>
                          </Avatar>
                          <span>{getAssigneeDisplay(task.assignee)}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {status === "TODO" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onUpdateStatus(task, "INPROGRESS")}
                            className="h-8 text-xs"
                            disabled={updating}
                          >
                            {updating ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Starting...
                              </>
                            ) : (
                              <>
                                <PlayCircle className="h-3 w-3 mr-1" />
                                Start
                              </>
                            )}
                          </Button>
                        )}

                        {status === "INPROGRESS" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onUpdateStatus(task, "DONE")}
                            className="h-8 text-xs"
                            disabled={updating}
                          >
                            {updating ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Completing...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Complete
                              </>
                            )}
                          </Button>
                        )}

                        {status === "DONE" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onUpdateStatus(task, "TODO")}
                            className="h-8 text-xs"
                            disabled={updating}
                          >
                            {updating ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Reopening...
                              </>
                            ) : (
                              <>
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Reopen
                              </>
                            )}
                          </Button>
                        )}

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(task.id)}
                          className="h-8 text-xs ml-auto opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-400"
                          disabled={updating}
                        >
                          {isUpdatingTask ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Task Details Drawer */}
      <TaskDrawer taskId={selectedTaskId} open={drawerOpen} onOpenChange={setDrawerOpen} setTasks={setTasks} />
    </>
  )
}
