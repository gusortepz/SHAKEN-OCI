"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchTasks as apiFetchTasks,
  createTask as apiCreateTask,
  updateTaskStatus as apiUpdateTaskStatus,
  deleteTask as apiDeleteTask,
  type Task,
  type TaskStatus,
} from "../utils/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingTaskIds, setUpdatingTaskIds] = useState<(string | number)[]>(
    []
  );
  const navigate = useNavigate();

  // Load tasks
  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const fetchedTasks = await apiFetchTasks(token);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("Failed to load tasks");
      if (!localStorage.getItem("token")) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Add a new task
  const addTask = useCallback(
    async (description: string) => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const newTask = await apiCreateTask(token, { description });
        setTasks((prevTasks) => [...prevTasks, newTask]);
        toast.success("Task added successfully");
        return newTask;
      } catch (error) {
        console.error("Error adding task:", error);
        toast.error("Failed to add task");
      }
    },
    [navigate]
  );

  // Update task status
  const updateTaskStatus = useCallback(
    async (task: Task, newStatus: TaskStatus) => {
      try {
        setUpdatingTaskIds((prev) => [...prev, task.id]);
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        await apiUpdateTaskStatus(token, task, newStatus);

        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === task.id ? { ...task, status: newStatus } : task
          )
        );

        toast.success("Task updated successfully");
      } catch (error) {
        console.error("Error updating task:", error);
        toast.error("Failed to update task");
      } finally {
        setUpdatingTaskIds((prev) =>
          prev.filter((taskId) => taskId !== task.id)
        );
      }
    },
    [navigate]
  );

  // Delete a task
  const deleteTask = useCallback(
    async (id: string | number) => {
      try {
        setUpdatingTaskIds((prev) => [...prev, id]);
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        await apiDeleteTask(token, id);
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
        toast.success("Task deleted successfully");
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error("Failed to delete task");
      } finally {
        setUpdatingTaskIds((prev) => prev.filter((taskId) => taskId !== id));
      }
    },
    [navigate]
  );

  return {
    tasks,
    isLoading,
    updatingTaskIds,
    addTask,
    updateTaskStatus,
    deleteTask,
    loadTasks,
  };
}
