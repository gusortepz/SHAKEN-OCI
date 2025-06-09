export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_TASKS = `${API_BASE_URL}/todolist`;
export const API_USERS = `${API_BASE_URL}/users`;
export const API_SPRINTS = `${API_BASE_URL}/sprint`;

export enum TaskStatusEnum {
  TODO = "TODO",
  INPROGRESS = "INPROGRESS",
  DONE = "DONE",
}
export enum TaskPriorityEnum {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}
export type TaskStatus = "TODO" | "INPROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type SprintStatus = "PLANNED" | "ACTIVE" | "COMPLETED";

export interface Sprint {
  id: number;
  name: string;
  projectId: number | null;
  startDate: string;
  endDate: string;
  status: SprintStatus;
}

export interface Task {
  id: string | number;
  description: string;
  status: TaskStatus;
  creation_ts: string;
  priority: TaskPriority;
  createdBy: number;
  assignee: number;
  projectId: number | null;
  sprintId: number | null;
  storyPoints: number | null;
  estimatedTime: number | null;
  realTime: number | null;
}

export interface User {
  id: number;
  username: string;
  role: string;
  avatar?: string;
}

export type SprintKpi = {
  id: number;
  name: string;
  totalTasks: number;
  completedTasks: number;
  totalEstimatedTime: number;
  totalRealTime: number;
  totalStoryPoints: number;
};

export type DeveloperKpi = {
  assigneeId: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalEstimatedTime: number;
  totalRealTime: number;
  totalStoryPoints: number;
};

export type DeveloperSprintKpi = {
  assigneeId: number;
  sprintId: number;
  totalTasks: number;
  totalEstimatedTime: number;
  totalRealTime: number;
  totalStoryPoints: number;
  completedTasks: number;
  completionRate: number;
};

export type KpiResponse = {
  sprintKpis: SprintKpi[];
  developerKpis: DeveloperKpi[];
  developerSprintKpis: DeveloperSprintKpi[];
};

// API functions with authentication
export const fetchTasks = async (token: string): Promise<Task[]> => {
  const response = await fetch(API_TASKS, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return response.json();
};

export const fetchSprints = async (token: string): Promise<Sprint[]> => {
  const response = await fetch(API_SPRINTS, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch sprints");
  }

  return response.json();
};

export const getKpi = async (token: string): Promise<KpiResponse> => {
  const response = await fetch(`${API_BASE_URL}/kpi/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch KPI");
  }
  return response.json();
};

// Add this function after the getUserById function
export const fetchUsers = async (token: string): Promise<User[]> => {
  const response = await fetch(API_USERS, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
};

export const createTask = async (
  token: string,
  taskData: Partial<Task>
): Promise<Task> => {
  const response = await fetch(API_TASKS, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    throw new Error("Failed to create task");
  }

  // Get the ID from the location header
  const id = response.headers.get("location");

  // Return a partial task object with the information we have
  return {
    id: id || "",
    description: taskData.description || "",
    status: taskData.status || "TODO",
    creation_ts: taskData.creation_ts || new Date().toISOString(),
    priority: taskData.priority || "LOW",
    createdBy: taskData.createdBy || 1,
    assignee: taskData.assignee || 1,
    projectId: null,
    sprintId: taskData.sprintId || null,
    storyPoints: taskData.storyPoints || null,
    estimatedTime: taskData.estimatedTime || null,
    realTime: taskData.realTime || null,
  };
};

export const updateTaskStatus = async (
  token: string,
  task: Task,
  newStatus: TaskStatus,
  realTime?: number
): Promise<void> => {
  // If realTime is provided, include it in the updated task

  const updatedTask =
    realTime !== undefined
      ? { ...task, status: newStatus, realTime }
      : { ...task, status: newStatus };
  const response = await fetch(`${API_TASKS}/${task.id}`, {
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
};

export const updateTaskPriority = async (
  token: string,
  task: Task,
  newPriority: TaskPriority
): Promise<void> => {
  const updatedTask = { ...task, priority: newPriority };

  const response = await fetch(`${API_TASKS}/${task.id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedTask),
  });

  if (!response.ok) {
    throw new Error("Failed to update task priority");
  }
};

export const deleteTask = async (
  token: string,
  id: string | number
): Promise<void> => {
  const response = await fetch(`${API_TASKS}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete task");
  }
};

export const updateTaskSprint = async (
  token: string,
  task: Task,
  newSprintId: number | null
): Promise<void> => {
  const updatedTask = { ...task, sprintId: newSprintId };

  const response = await fetch(`${API_TASKS}/${task.id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedTask),
  });

  if (!response.ok) {
    throw new Error("Failed to update task sprint");
  }
};
