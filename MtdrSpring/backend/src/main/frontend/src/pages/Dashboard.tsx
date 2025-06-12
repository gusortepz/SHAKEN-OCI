"use client"

import { useState, useEffect, useCallback } from "react"
import { TaskList } from "@/components/TaskList"
import { TaskFilter, type FilterOptions } from "@/components/TaskFilter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type Task,
  type TaskStatus,
  fetchTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  API_TASKS,
} from "@/utils/api"
import { toast } from "sonner"
import { useNavigate, useSearchParams } from "react-router-dom"
import { format, parse, isWithinInterval } from "date-fns"
import type { DateRange } from "react-day-picker"
import { CheckCircle, Clock, ListTodo, TrendingUp, Users } from "lucide-react"
import { TaskForm } from "@/components/TaskForm"

export function Dashboard() {
  const [searchParams] = useSearchParams()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isUpdatingTask, setIsUpdatingTask] = useState(false)
  const [updatingTaskIds, setUpdatingTaskIds] = useState<(string | number)[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    assignee: "",
    priority: "",
    sprint: "",
  })
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || ""

  // Sync dateRange with URL params
  useEffect(() => {
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")

    if (fromParam) {
      const from = parse(fromParam, "yyyy-MM-dd", new Date())
      const to = toParam ? parse(toParam, "yyyy-MM-dd", new Date()) : undefined
      setDateRange({ from, to })
    } else {
      setDateRange(undefined)
    }
  }, [searchParams])

  const loadTasks = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchTasks(token)
      console.log("Fetched tasks:", data) // Debugging log
      setTasks(data)
    } catch {
      toast.error("Error", {
        description: "Failed to load tasks. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      loadTasks()
    } else {
      navigate("/login")
    }
  }, [navigate, token, loadTasks])

  // Apply filters whenever tasks, filters, or dateRange change
  useEffect(() => {
    let filtered = [...tasks]

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter((task) => task.description.toLowerCase().includes(searchLower))
    }

    // Apply assignee filter
    if (filters.assignee) {
      filtered = filtered.filter((task) => {
        return task.assignee != null && task.assignee.toString() === filters.assignee
      })
    }

    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter((task) => task.priority === filters.priority)
    }

    // Apply sprint filter
    if (filters.sprint) {
      filtered = filtered.filter((task) => {
        return task.sprintId != null && task.sprintId.toString() === filters.sprint
      })
    }

    // Apply date range filter from sidebar
    if (dateRange?.from) {
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.creation_ts)
        if (dateRange.to) {
          // Range selection
          return isWithinInterval(taskDate, {
            start: dateRange.from!,
            end: dateRange.to,
          })
        } else {
          // Single date selection
          const taskDateStr = format(taskDate, "yyyy-MM-dd")
          const filterDateStr = format(dateRange.from!, "yyyy-MM-dd")
          return taskDateStr === filterDateStr
        }
      })
    }

    setFilteredTasks(filtered)
  }, [tasks, filters, dateRange])

  const handleAddTask = async (taskData: Partial<Task>) => {
    setIsAddingTask(true)
    try {
      const newTask = await createTask(token, taskData)
      setTasks((prevTasks) => [newTask, ...prevTasks])
      toast.success("Task added", {
        description: "Your new task has been created.",
      })
    } catch {
      toast.error("Error", {
        description: "Failed to add task. Please try again.",
      })
    } finally {
      setIsAddingTask(false)
    }
  }

  const handleUpdateStatus = async (task: Task, newStatus: TaskStatus) => {
    setUpdatingTaskIds((prev) => [...prev, task.id])
    setIsUpdatingTask(true)

    try {
      await updateTaskStatus(token, task, newStatus)
      setTasks((prevTasks) => prevTasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)))

      toast.success("Task updated", {
        description: `Task moved to ${newStatus.toLowerCase()}.`,
      })
    } catch {
      toast.error("Error", {
        description: "Failed to update task. Please try again.",
      })
    } finally {
      setUpdatingTaskIds((prev) => prev.filter((id) => id !== task.id))
      setIsUpdatingTask(false)
    }
  }

  const handleUpdateTaskWithRealTime = async (task: Task, newStatus: TaskStatus, realTime: number) => {
    setUpdatingTaskIds((prev) => [...prev, task.id])
    setIsUpdatingTask(true)

    try {
      const updatedTask = { ...task, status: newStatus, realTime }

      const response = await fetch(`${API_TASKS}/${task.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      setTasks((prevTasks) => prevTasks.map((t) => (t.id === task.id ? updatedTask : t)))

      toast.success("Task completed", {
        description: `Task completed with ${realTime} hours of real time.`,
      })
    } catch {
      toast.error("Error", {
        description: "Failed to update task. Please try again.",
      })
    } finally {
      setUpdatingTaskIds((prev) => prev.filter((id) => id !== task.id))
      setIsUpdatingTask(false)
    }
  }

  const handleDeleteTask = async (id: string | number) => {
    setIsUpdatingTask(true)
    try {
      await deleteTask(token, id)
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))

      toast.success("Task deleted", {
        description: "The task has been removed.",
      })
    } catch {
      toast.error("Error", {
        description: "Failed to delete task. Please try again.",
      })
    } finally {
      setIsUpdatingTask(false)
    }
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const clearDateFilter = () => {
    // Clear the URL params
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.delete("from")
    newSearchParams.delete("to")
    window.history.replaceState({}, "", `${window.location.pathname}?${newSearchParams}`)

    // This will trigger the useEffect that syncs dateRange with URL params
    setDateRange(undefined)
  }

  // Calculate metrics
  const inProgressTasks = filteredTasks.filter((task) => task.status === "INPROGRESS")
  const doneTasks = filteredTasks.filter((task) => task.status === "DONE")
  const completionRate = filteredTasks.length > 0 ? (doneTasks.length / filteredTasks.length) * 100 : 0
  const uniqueAssignees = new Set(filteredTasks.map((task) => task.assignee)).size

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        {dateRange?.from ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Tasks for {format(dateRange.from, "MMM d, yyyy")}
                {dateRange.to && ` - ${format(dateRange.to, "MMM d, yyyy")}`}
              </h1>
              <p className="text-muted-foreground mt-1">Filtered by date range</p>
            </div>
            <button
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
              onClick={clearDateFilter}
            >
              Clear date filter
            </button>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Task Management</h1>
            <p className="text-muted-foreground mt-1">Manage and track your team's tasks</p>
          </div>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              <span className="hidden sm:inline">Total Tasks</span>
              <span className="sm:hidden">Total</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{filteredTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredTasks.length !== tasks.length && `of ${tasks.length} total`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">In Progress</span>
              <span className="sm:hidden">Active</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{inProgressTasks.length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Completed</span>
              <span className="sm:hidden">Done</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{doneTasks.length}</div>
            <p className="text-xs text-muted-foreground">{completionRate.toFixed(0)}% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Completion</span>
              <span className="sm:hidden">Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{completionRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Assignees</span>
              <span className="sm:hidden">Team</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{uniqueAssignees}</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Add Task */}
      <div className="flex flex-col xl:flex-row gap-6 mb-6">
        <div className="flex-1">
          <TaskFilter
            onFilterChange={handleFilterChange}
            totalTasks={tasks.length}
            filteredCount={filteredTasks.length}
          />
        </div>
        <div className="xl:w-auto">
          <div className="sticky top-4">
            <TaskForm onAddTask={handleAddTask} isLoading={isAddingTask} />
          </div>
        </div>
      </div>

      {/* Task Lists */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3 overflow-hidden">
          <TaskList
            title="To Do"
            tasks={filteredTasks}
            status="TODO"
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteTask}
            updatingTaskIds={updatingTaskIds}
            isUpdatingTask={isUpdatingTask}
            setTasks={setTasks}
            onUpdateTaskWithRealTime={handleUpdateTaskWithRealTime}
          />

          <TaskList
            title="In Progress"
            tasks={filteredTasks}
            status="INPROGRESS"
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteTask}
            updatingTaskIds={updatingTaskIds}
            isUpdatingTask={isUpdatingTask}
            setTasks={setTasks}
            onUpdateTaskWithRealTime={handleUpdateTaskWithRealTime}
          />

          <TaskList
            title="Done"
            tasks={filteredTasks}
            status="DONE"
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteTask}
            updatingTaskIds={updatingTaskIds}
            isUpdatingTask={isUpdatingTask}
            setTasks={setTasks}
            onUpdateTaskWithRealTime={handleUpdateTaskWithRealTime}
          />
        </div>
      )}
    </div>
  )
}
