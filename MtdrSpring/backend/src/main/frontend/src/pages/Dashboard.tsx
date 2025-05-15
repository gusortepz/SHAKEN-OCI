"use client";

import { useState, useEffect } from "react";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import { TaskFilter, type FilterOptions } from "@/components/TaskFilter";
// Reemplazar con la importación correcta desde el archivo de API
import {
  API_BASE_URL,
  type Task,
  type TaskStatus,
  fetchTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
} from "@/utils/api";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format, parse } from "date-fns";

interface DashboardProps {
  selectedDate?: Date;
}

export function Dashboard({ selectedDate: propSelectedDate }: DashboardProps) {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get("date");

  // Use the date from URL params if available, otherwise use the prop
  const selectedDate = dateParam
    ? parse(dateParam, "yyyy-MM-dd", new Date())
    : propSelectedDate;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [updatingTaskIds, setUpdatingTaskIds] = useState<(string | number)[]>(
    []
  );
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    assignee: "",
    priority: "",
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";
  // Eliminar la línea que usa process.env
  //const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  useEffect(() => {
    if (token) {
      loadTasks();
    } else {
      navigate("/login");
    }
  }, [navigate, token]);

  // Apply filters whenever tasks or filters change
  useEffect(() => {
    applyFilters();
  }, [tasks, filters, selectedDate]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTasks(token);
      setTasks(data);
    } catch (error) {
      toast.error("Error", {
        description: "Failed to load tasks. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((task) =>
        task.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply assignee filter - Fix the null/undefined check
    if (filters.assignee) {
      filtered = filtered.filter((task) => {
        // Check if assignee exists and convert safely to string
        return (
          task.assignee != null && task.assignee.toString() === filters.assignee
        );
      });
    }

    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }

    // Apply date filter
    if (selectedDate) {
      const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.creation_ts);
        const taskDateStr = format(taskDate, "yyyy-MM-dd");
        return taskDateStr === selectedDateStr;
      });
    }

    setFilteredTasks(filtered);
  };

  // Update the handleAddTask function to accept the new task data structure
  const handleAddTask = async (taskData: Partial<Task>) => {
    setIsAddingTask(true);
    try {
      const newTask = await createTask(token, taskData);
      setTasks((prevTasks) => [newTask, ...prevTasks]);
      toast.success("Task added", {
        description: "Your new task has been created.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to add task. Please try again.",
      });
    } finally {
      setIsAddingTask(false);
    }
  };

  // Update the handleUpdateStatus function to pass the complete task object
  const handleUpdateStatus = async (task: Task, newStatus: TaskStatus) => {
    // Add the task ID to the updating list
    setUpdatingTaskIds((prev) => [...prev, task.id]);
    setIsUpdatingTask(true);

    try {
      await updateTaskStatus(token, task, newStatus);

      // Update the task in the local state
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === task.id ? { ...t, status: newStatus } : t
        )
      );

      toast.success("Task updated", {
        description: `Task moved to ${newStatus.toLowerCase()}.`,
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update task. Please try again.",
      });
    } finally {
      // Remove the task ID from the updating list
      setUpdatingTaskIds((prev) => prev.filter((id) => id !== task.id));
      setIsUpdatingTask(false);
    }
  };

  // Nueva función para actualizar una tarea con tiempo real
  const handleUpdateTaskWithRealTime = async (
    task: Task,
    newStatus: TaskStatus,
    realTime: number
  ) => {
    // Add the task ID to the updating list
    setUpdatingTaskIds((prev) => [...prev, task.id]);
    setIsUpdatingTask(true);

    try {
      const updatedTask = { ...task, status: newStatus, realTime };

      // Llamar a la API para actualizar la tarea
      const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      // Update the task in the local state
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === task.id ? updatedTask : t))
      );

      toast.success("Task completed", {
        description: `Task completed with ${realTime} hours of real time.`,
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update task. Please try again.",
      });
    } finally {
      // Remove the task ID from the updating list
      setUpdatingTaskIds((prev) => prev.filter((id) => id !== task.id));
      setIsUpdatingTask(false);
    }
  };

  const handleDeleteTask = async (id: string | number) => {
    setIsUpdatingTask(true);
    try {
      await deleteTask(token, id);

      // Remove the task from the local state
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));

      toast.success("Task deleted", {
        description: "The task has been removed.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to delete task. Please try again.",
      });
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      {selectedDate ? (
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Tasks for {format(selectedDate, "MMMM d, yyyy")}
          </h1>
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
      <div className="flex w-full justify-between h-24">
        <TaskFilter onFilterChange={handleFilterChange} />
        <TaskForm onAddTask={handleAddTask} isLoading={isAddingTask} />
      </div>

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
            updatingTaskIds={updatingTaskIds}
          />

          <TaskList
            title="In Progress"
            tasks={filteredTasks}
            status="INPROGRESS"
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteTask}
            updatingTaskIds={updatingTaskIds}
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
  );
}
