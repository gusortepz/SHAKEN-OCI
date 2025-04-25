"use client"

import { useState, useEffect } from "react"
import { TaskForm } from "@/components/TaskForm"
import { TaskList } from "@/components/TaskList"
import { TaskFilter, type FilterOptions } from "@/components/TaskFilter"
import { type Task, type TaskStatus, fetchTasks, createTask, updateTaskStatus, deleteTask } from "@/utils/api"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"

interface DashboardProps {
  selectedDate?: Date
}

export function Dashboard({ selectedDate }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    assignee: "",
    priority: "",
  })
  const navigate = useNavigate()
  const token = localStorage.getItem("token") || ""

  useEffect(() => {
    if (token) {
      loadTasks()
    } else {
      navigate("/login")
    }
  }, [navigate, token])

  // Apply filters whenever tasks or filters change
  useEffect(() => {
    applyFilters()
  }, [tasks, filters, selectedDate])

  const loadTasks = async () => {
    setIsLoading(true)
    try {
      const data = await fetchTasks(token)
      setTasks(data)
    } catch (error) {
      toast.error("Error", {
        description: "Failed to load tasks. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...tasks]

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter((task) => task.description.toLowerCase().includes(searchLower))
    }

    // Apply assignee filter
    if (filters.assignee) {
      filtered = filtered.filter((task) => task.assignee.toString() === filters.assignee)
    }

    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter((task) => task.priority === filters.priority)
    }

    // Apply date filter
    if (selectedDate) {
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.creation_ts)
        return (
          taskDate.getDate() === selectedDate.getDate() &&
          taskDate.getMonth() === selectedDate.getMonth() &&
          taskDate.getFullYear() === selectedDate.getFullYear()
        )
      })
    }

    setFilteredTasks(filtered)
  }

  const handleAddTask = async (description: string) => {
    setIsAddingTask(true)
    try {
      const newTask = await createTask(token, description)
      setTasks((prevTasks) => [newTask, ...prevTasks])
      toast.success("Task added", {
        description: "Your new task has been created.",
      })
    } catch (error) {
      toast.error("Error", {
        description: "Failed to add task. Please try again.",
      })
    } finally {
      setIsAddingTask(false)
    }
  }

  const handleUpdateStatus = async (id: string | number, description: string, newStatus: TaskStatus) => {
    try {
      await updateTaskStatus(token, id, description, newStatus)

      // Update the task in the local state
      setTasks((prevTasks) => prevTasks.map((task) => (task.id === id ? { ...task, status: newStatus } : task)))

      toast.success("Task updated", {
        description: `Task moved to ${newStatus.toLowerCase()}.`,
      })
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update task. Please try again.",
      })
    }
  }

  const handleDeleteTask = async (id: string | number) => {
    try {
      await deleteTask(token, id)

      // Remove the task from the local state
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))

      toast.success("Task deleted", {
        description: "The task has been removed.",
      })
    } catch (error) {
      toast.error("Error", {
        description: "Failed to delete task. Please try again.",
      })
    }
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      {selectedDate ? (
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tasks for {format(selectedDate, "MMMM d, yyyy")}</h1>
          <button
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => window.location.reload()}
          >
            Clear date filter
          </button>
        </div>
      ) : (
        <h1 className="text-2xl font-bold mb-6">All Tasks</h1>
      )}

      <TaskForm onAddTask={handleAddTask} isLoading={isAddingTask} />

      <TaskFilter onFilterChange={handleFilterChange} />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <TaskList
            title="To Do"
            tasks={filteredTasks}
            status="TODO"
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteTask}
          />

          <TaskList
            title="In Progress"
            tasks={filteredTasks}
            status="INPROGRESS"
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteTask}
          />

          <TaskList
            title="Done"
            tasks={filteredTasks}
            status="DONE"
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteTask}
          />
        </div>
      )}
    </div>
  )
}
