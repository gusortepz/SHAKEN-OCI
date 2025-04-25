"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Task, TaskStatus } from "@/utils/api"
import { formatDistanceToNow } from "date-fns"
import { CheckCircle, RotateCcw, Trash2, PlayCircle, Clock, AlertCircle } from "lucide-react"

interface TaskListProps {
  title: string
  tasks: Task[]
  status: TaskStatus
  onUpdateStatus: (id: string | number, description: string, newStatus: TaskStatus) => Promise<void>
  onDelete: (id: string | number) => Promise<void>
}

export function TaskList({ title, tasks, status, onUpdateStatus, onDelete }: TaskListProps) {
  const filteredTasks = tasks.filter((task) => task.status === status)

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

  // Get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return (
          <span className="flex items-center" aria-label="High Priority">
            <AlertCircle className="h-3 w-3 text-red-500" />
          </span>
        )
      case "MEDIUM":
        return (
          <span title="Medium Priority">
            <AlertCircle className="h-3 w-3 text-amber-500" />
          </span>
        )
      case "LOW":
        return (
          <span title="Low Priority">
            <AlertCircle className="h-3 w-3 text-blue-500" />
          </span>
        )
      default:
        return null
    }
  }

  return (
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
              return (
                <li key={task.id} className="border rounded-lg bg-card shadow-sm overflow-hidden">
                  <div className="p-3 border-b bg-muted/30">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        {getPriorityIcon(task.priority)}
                        <p className="font-medium break-words">{task.description}</p>
                      </div>
                      <Avatar className="h-6 w-6 ml-2 flex-shrink-0">
                        <AvatarFallback>#{task.assignee}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div className="p-3 bg-background flex flex-col gap-3 group">
                    <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Created {formatDistanceToNow(new Date(task.creation_ts), { addSuffix: true })}
                      </div>
                      <div className="flex items-center">Assigned to: #{task.assignee}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {status === "TODO" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onUpdateStatus(task.id, task.description, "INPROGRESS")}
                          className="h-8 text-xs"
                        >
                          <PlayCircle className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                      )}

                      {status === "INPROGRESS" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onUpdateStatus(task.id, task.description, "DONE")}
                          className="h-8 text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Button>
                      )}

                      {status === "DONE" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onUpdateStatus(task.id, task.description, "TODO")}
                          className="h-8 text-xs"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reopen
                        </Button>
                      )}

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(task.id)}
                        className="h-8 text-xs ml-auto opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-400"
                      >
                        <Trash2 className="h-3 w-3" />
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
  )
}
