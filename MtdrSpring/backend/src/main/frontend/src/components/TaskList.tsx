"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { TaskDrawer } from "@/components/TaskDrawer"
import type { Task, TaskStatus, User, Sprint } from "@/utils/api"
import { fetchUsers, fetchSprints } from "@/utils/api"
import { formatDistanceToNow } from "date-fns"
import {
  CheckCircle,
  RotateCcw,
  Trash2,
  PlayCircle,
  Clock,
  AlertCircle,
  Loader2,
  Eye,
  Timer,
  UserIcon,
  MoreVertical,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TaskListProps {
  title: string
  tasks: Task[]
  status: TaskStatus
  onUpdateStatus: (task: Task, newStatus: TaskStatus) => Promise<void>
  onDelete: (id: string | number) => Promise<void>
  updatingTaskIds: (string | number)[]
  isUpdatingTask: boolean
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  onUpdateTaskWithRealTime?: (task: Task, newStatus: TaskStatus, realTime: number) => Promise<void>
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
  onUpdateTaskWithRealTime,
}: TaskListProps) {
  const filteredTasks = tasks.filter((task) => task.status === status)
  const [selectedTaskId, setSelectedTaskId] = useState<string | number | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isLoadingSprints, setIsLoadingSprints] = useState(true)
  const [completingTask, setCompletingTask] = useState<Task | null>(null)
  const [realTime, setRealTime] = useState<string>("")
  const [isCompletingDialogOpen, setIsCompletingDialogOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Cargar usuarios y sprints al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingUsers(true)
      setIsLoadingSprints(true)
      try {
        const token = localStorage.getItem("token") || ""
        const [fetchedUsers, fetchedSprints] = await Promise.all([fetchUsers(token), fetchSprints(token)])
        setUsers(fetchedUsers)
        setSprints(fetchedSprints)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoadingUsers(false)
        setIsLoadingSprints(false)
      }
    }
    loadData()
  }, [])

  // Define status-specific colors
  const getStatusColor = () => {
    switch (status) {
      case "TODO":
        return "border-blue-800 dark:border-blue-800"
      case "INPROGRESS":
        return "border-amber-800 dark:border-amber-800"
      case "DONE":
        return "border-green-800 dark:border-green-800"
      default:
        return "border-gray-800 dark:border-gray-800"
    }
  }

  // Define status-specific header colors
  const getHeaderColor = () => {
    switch (status) {
      case "TODO":
        return "text-blue-800 dark:text-blue-100"
      case "INPROGRESS":
        return "text-amber-800 dark:text-amber-100"
      case "DONE":
        return "text-green-800 dark:text-green-100"
      default:
        return ""
    }
  }

  // Get priority badge with consistent styling
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return (
          <Badge variant="destructive" className="text-xs font-medium">
            <AlertCircle className="h-3 w-3 mr-1" />
            High
          </Badge>
        )
      case "MEDIUM":
        return (
          <Badge
            variant="outline"
            className="text-xs font-medium border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Medium
          </Badge>
        )
      case "LOW":
        return (
          <Badge
            variant="outline"
            className="text-xs font-medium border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Low
          </Badge>
        )
      default:
        return null
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

  // Manejar el clic en el botón Complete
  const handleCompleteClick = (task: Task) => {
    setCompletingTask(task)
    setRealTime(task.realTime?.toString() || "")
    setIsCompletingDialogOpen(true)
  }

  // Manejar la confirmación del diálogo de completar tarea
  const handleCompleteConfirm = async () => {
    if (!completingTask) return

    const realTimeValue = Number.parseFloat(realTime)
    if (isNaN(realTimeValue) || realTimeValue < 0) {
      return // Validación básica
    }

    if (onUpdateTaskWithRealTime) {
      await onUpdateTaskWithRealTime(completingTask, "DONE", realTimeValue)
    }

    setIsCompletingDialogOpen(false)
    setCompletingTask(null)
    setRealTime("")
  }

  // Obtener el nombre de usuario a partir del ID
  const getUsernameById = (userId: number | null | undefined) => {
    if (userId == null) return "Unassigned"
    if (isLoadingUsers) return `Loading...`

    const user = users.find((u) => u.id === userId)
    return user ? user.username : `User #${userId}`
  }

  // Obtener el nombre del sprint a partir del ID
  const getSprintNameById = (sprintId: number | null | undefined) => {
    if (sprintId == null) return null
    if (isLoadingSprints) return "Loading..."

    const sprint = sprints.find((s) => s.id === sprintId)
    return sprint ? sprint.name : `Sprint #${sprintId}`
  }

  // Mobile Accordion Version
  if (isMobile) {
    return (
      <>
        <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
          <Card className={`shadow-md border ${getStatusColor()}`}>
            <CollapsibleTrigger asChild>
              <CardHeader className={`pb-3 ${getHeaderColor()} rounded-t-lg cursor-pointer`}>
                <CardTitle className="text-base font-semibold flex items-center justify-between">
                  <div className="flex items-center">
                    {status === "TODO" && <PlayCircle className="h-4 w-4 mr-2" />}
                    {status === "INPROGRESS" && <Clock className="h-4 w-4 mr-2" />}
                    {status === "DONE" && <CheckCircle className="h-4 w-4 mr-2" />}
                    <span>{title.split(" ")[0]}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {filteredTasks.length}
                    </Badge>
                  </div>
                  {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="p-3">
                {filteredTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground text-sm border border-dashed rounded-lg bg-background/50">
                    <div className="text-center">
                      <div className="mb-2 opacity-50">
                        {status === "TODO" && <PlayCircle className="h-6 w-6 mx-auto" />}
                        {status === "INPROGRESS" && <Clock className="h-6 w-6 mx-auto" />}
                        {status === "DONE" && <CheckCircle className="h-6 w-6 mx-auto" />}
                      </div>
                      <span className="text-xs">No tasks in this category</span>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] overflow-hidden">
                    <ul className="space-y-3 pr-4">
                      {filteredTasks.map((task) => {
                        const updating = isUpdating(task.id)
                        const sprintName = getSprintNameById(task.sprintId)

                        return (
                          <li
                            key={task.id}
                            className={`border rounded-lg bg-card shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${
                              updating ? "opacity-70 pointer-events-none" : ""
                            }`}
                          >
                            {/* Header with priority and actions */}
                            <div className="p-3 border-b bg-muted/20">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    {getPriorityBadge(task.priority)}
                                    {sprintName && (
                                      <Badge variant="secondary" className="text-xs">
                                        {sprintName}
                                      </Badge>
                                    )}
                                  </div>
                                  <h3 className="font-semibold text-sm leading-relaxed break-words pr-2">
                                    {task.description}
                                  </h3>
                                </div>

                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 flex-shrink-0"
                                    onClick={() => handleViewTask(task.id)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View task details</span>
                                  </Button>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {status === "TODO" && (
                                        <DropdownMenuItem
                                          onClick={() => onUpdateStatus(task, "INPROGRESS")}
                                          disabled={updating}
                                        >
                                          <PlayCircle className="h-4 w-4 mr-2" />
                                          Start Task
                                        </DropdownMenuItem>
                                      )}
                                      {status === "INPROGRESS" && (
                                        <DropdownMenuItem onClick={() => handleCompleteClick(task)} disabled={updating}>
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Complete Task
                                        </DropdownMenuItem>
                                      )}
                                      {status === "DONE" && (
                                        <DropdownMenuItem
                                          onClick={() => onUpdateStatus(task, "TODO")}
                                          disabled={updating}
                                        >
                                          <RotateCcw className="h-4 w-4 mr-2" />
                                          Reopen Task
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem
                                        onClick={() => onDelete(task.id)}
                                        disabled={updating}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Task
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>

                            {/* Content with metadata */}
                            <div className="p-3 bg-background">
                              <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">
                                    Created {formatDistanceToNow(new Date(task.creation_ts), { addSuffix: true })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <UserIcon className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{getUsernameById(task.assignee)}</span>
                                </div>
                                {task.estimatedTime && (
                                  <div className="flex items-center gap-1">
                                    <Timer className="h-3 w-3 flex-shrink-0" />
                                    <span>Est: {task.estimatedTime}h</span>
                                  </div>
                                )}
                                {task.realTime && (
                                  <div className="flex items-center gap-1">
                                    <Timer className="h-3 w-3 flex-shrink-0" />
                                    <span>Real: {task.realTime}h</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </ScrollArea>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Task Details Drawer */}
        <TaskDrawer taskId={selectedTaskId} open={drawerOpen} onOpenChange={setDrawerOpen} setTasks={setTasks} />

        {/* Dialog para capturar el tiempo real */}
        <Dialog open={isCompletingDialogOpen} onOpenChange={setIsCompletingDialogOpen}>
          <DialogContent className="sm:max-w-[425px] mx-4">
            <DialogHeader>
              <DialogTitle>Complete Task</DialogTitle>
              <DialogDescription>Enter the actual time it took to complete this task.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="realTime" className="text-right">
                  Real time (hours)
                </Label>
                <Input
                  id="realTime"
                  type="number"
                  step="0.5"
                  min="0"
                  value={realTime}
                  onChange={(e) => setRealTime(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter className="flex-col gap-2">
              <Button variant="outline" onClick={() => setIsCompletingDialogOpen(false)} className="w-full">
                Cancel
              </Button>
              <Button onClick={handleCompleteConfirm} className="w-full">
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Desktop Version (original)
  return (
    <>
      <Card className={`h-full shadow-md border ${getStatusColor()}`}>
        <CardHeader className={`pb-3 ${getHeaderColor()} rounded-t-lg`}>
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center justify-center">
            {status === "TODO" && <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />}
            {status === "INPROGRESS" && <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />}
            {status === "DONE" && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />}
            <span>{title}</span>
            <Badge variant="secondary" className="ml-2 text-xs">
              {filteredTasks.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          {filteredTasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm border-2 border-dashed rounded-lg bg-background/50">
              <div className="text-center">
                <div className="mb-2 opacity-50">
                  {status === "TODO" && <PlayCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto" />}
                  {status === "INPROGRESS" && <Clock className="h-6 w-6 sm:h-8 sm:w-8 mx-auto" />}
                  {status === "DONE" && <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto" />}
                </div>
                <span className="text-xs sm:text-sm">No tasks in this category</span>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <ul className="space-y-3 sm:space-y-4 pr-4">
                {filteredTasks.map((task) => {
                  const updating = isUpdating(task.id)
                  const sprintName = getSprintNameById(task.sprintId)

                  return (
                    <li
                      key={task.id}
                      className={`border-2 rounded-lg bg-card shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${
                        updating ? "opacity-70 pointer-events-none" : ""
                      }`}
                    >
                      {/* Header with priority and actions */}
                      <div className="p-3 sm:p-4 border-b bg-muted/20">
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {getPriorityBadge(task.priority)}
                              {sprintName && (
                                <Badge variant="secondary" className="text-xs">
                                  {sprintName}
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-semibold text-sm leading-relaxed break-words pr-2">
                              {task.description}
                            </h3>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 flex-shrink-0"
                            onClick={() => handleViewTask(task.id)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View task details</span>
                          </Button>
                        </div>
                      </div>

                      {/* Content with metadata and actions */}
                      <div className="p-3 sm:p-4 bg-background">
                        {/* Metadata grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              Created {formatDistanceToNow(new Date(task.creation_ts), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <UserIcon className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{getUsernameById(task.assignee)}</span>
                          </div>
                          {task.estimatedTime && (
                            <div className="flex items-center gap-1">
                              <Timer className="h-3 w-3 flex-shrink-0" />
                              <span>Est: {task.estimatedTime}h</span>
                            </div>
                          )}
                          {task.realTime && (
                            <div className="flex items-center gap-1">
                              <Timer className="h-3 w-3 flex-shrink-0" />
                              <span>Real: {task.realTime}h</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons - Desktop only */}
                        <div className="flex flex-wrap gap-2 group">
                          {status === "TODO" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onUpdateStatus(task, "INPROGRESS")}
                              className="h-8 text-xs flex-1 min-w-0"
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
                              variant="outline"
                              size="sm"
                              onClick={() => handleCompleteClick(task)}
                              className="h-8 text-xs flex-1 min-w-0"
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
                              variant="outline"
                              size="sm"
                              onClick={() => onUpdateStatus(task, "TODO")}
                              className="h-8 text-xs flex-1 min-w-0"
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
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Task Details Drawer */}
      <TaskDrawer taskId={selectedTaskId} open={drawerOpen} onOpenChange={setDrawerOpen} setTasks={setTasks} />

      {/* Dialog para capturar el tiempo real */}
      <Dialog open={isCompletingDialogOpen} onOpenChange={setIsCompletingDialogOpen}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
            <DialogDescription>Enter the actual time it took to complete this task.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="realTime" className="text-right">
                Real time (hours)
              </Label>
              <Input
                id="realTime"
                type="number"
                step="0.5"
                min="0"
                value={realTime}
                onChange={(e) => setRealTime(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsCompletingDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleCompleteConfirm} className="w-full sm:w-auto">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
