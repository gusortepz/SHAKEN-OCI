"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Task, TaskStatus, User } from "@/utils/api";
import { fetchUsers, updateTaskStatus } from "@/utils/api";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  RotateCcw,
  Trash2,
  PlayCircle,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import { Input } from "./ui/input";

interface TaskListProps {
  title: string;
  tasks: Task[];
  status: TaskStatus;
  onUpdateStatus: (
    task: Task,
    newStatus: TaskStatus,
    realTime?: number
  ) => Promise<void>;
  onDelete: (id: string | number) => Promise<void>;
  updatingTaskIds?: (string | number)[];
}

export function TaskList({
  title,
  tasks,
  status,
  onUpdateStatus,
  onDelete,
  updatingTaskIds = [],
}: TaskListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const filteredTasks = tasks.filter((task) => task.status === status);
  const [realTime, setRealTime] = useState<number | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [showRealTime, setShowRealTime] = useState(false);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const token = localStorage.getItem("token") || "";
        const fetchedUsers = await fetchUsers(token);
        setUsers(fetchedUsers || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  // Define status-specific colors
  const getStatusColor = () => {
    switch (status) {
      case "TODO":
        return "dark:bg-blue-950 border-blue-800 dark:border-blue-800";
      case "INPROGRESS":
        return "dark:bg-amber-950 border-amber-600 dark:border-amber-800";
      case "DONE":
        return "dark:bg-green-950 border-green-800 dark:border-green-800";
      default:
        return "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800";
    }
  };

  // Define status-specific header colors
  const getHeaderColor = () => {
    switch (status) {
      case "TODO":
        return "dark:bg-blue-900 text-blue-800 dark:text-blue-100";
      case "INPROGRESS":
        return "dark:bg-amber-900 text-amber-800 dark:text-amber-100";
      case "DONE":
        return "dark:bg-green-900 text-green-800 dark:text-green-100";
      default:
        return "bg-gray-100 dark:bg-gray-800";
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case "MEDIUM":
        return <AlertCircle className="h-3 w-3 text-amber-500" />;
      case "LOW":
        return <AlertCircle className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const handleRealTimeShow = (task: Task) => {
    setShowRealTime(true);
    setCurrentTask(task);
  };

  // Get username by ID
  const getUsernameById = (userId: number) => {
    if (isLoadingUsers) return `Loading...`;

    if (!users || !Array.isArray(users)) return `User #${userId}`;

    const user = users.find((u) => u.id === userId);
    return user ? user.username || user.username : `User #${userId}`;
  };

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
              const isUpdating = updatingTaskIds.includes(task.id);

              return (
                <li
                  key={task.id}
                  className="border rounded-lg bg-card shadow-sm overflow-hidden"
                  data-testid="task-item"
                >
                  <div className="p-3 border-b bg-muted/30">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        {getPriorityIcon(task.priority)}
                        <p
                          className="font-medium break-words"
                          data-testid="task-description"
                        >
                          {task.description}
                        </p>
                      </div>
                      <Avatar className="h-6 w-6 ml-2 flex-shrink-0">
                        <AvatarFallback>
                          #{task.sprintId ? task.sprintId.toString()[1] : ""}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div className="p-3 bg-background flex flex-col gap-3 group">
                    <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Created{" "}
                        {formatDistanceToNow(new Date(task.creation_ts), {
                          addSuffix: true,
                        })}
                      </div>
                      <div className="flex items-center">
                        Estimated time: {task.estimatedTime || 0}hrs
                      </div>
                      <div className="flex items-center">
                        Assigned to: {getUsernameById(task.assignee)}
                      </div>
                      {task.realTime && (
                        <div className="flex items-center">
                          Real time: {task.realTime || 0}hrs
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {status === "TODO" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onUpdateStatus(task, "INPROGRESS")}
                          className="h-8 text-xs"
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
                          ) : (
                            <PlayCircle className="h-3 w-3 mr-1" />
                          )}
                          Start
                        </Button>
                      )}

                      {status === "INPROGRESS" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRealTimeShow(task)}
                          className="h-8 text-xs"
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
                          ) : (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          Complete
                        </Button>
                      )}

                      {status === "DONE" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onUpdateStatus(task, "TODO")}
                          className="h-8 text-xs"
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
                          ) : (
                            <RotateCcw className="h-3 w-3 mr-1" />
                          )}
                          Reopen
                        </Button>
                      )}

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(task.id)}
                        className="h-8 text-xs ml-auto opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-400"
                        disabled={isUpdating}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
      {showRealTime && currentTask != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-sm border">
            <div className="w-full flex justify-end">
              <X className="w-4 h-4 " onClick={() => setShowRealTime(false)} />
            </div>
            <div className="space-y-2 mb-4">
              <h4 className="font-medium leading-none">Real Hours</h4>
              <p className="text-sm text-muted-foreground">
                Enter the actual hours spent on the task:
              </p>
              <p className="text-sm text-muted-foreground">
                Task: {currentTask.description}
              </p>
            </div>
            <div className="grid gap-2 mb-4">
              <label htmlFor="hours" className="font-medium">
                Hours
              </label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                min="0"
                placeholder="Enter hours"
                onChange={(e) =>
                  setRealTime(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            </div>
            <Button
              className="w-full"
              onClick={async () => {
                await onUpdateStatus(
                  currentTask,
                  "DONE",
                  realTime !== null ? realTime : undefined
                );
                setShowRealTime(false);
              }}
            >
              Submit & Complete
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
