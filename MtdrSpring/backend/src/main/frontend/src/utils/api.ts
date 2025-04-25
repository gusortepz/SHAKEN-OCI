export const API_BASE_URL = "http://localhost:8080"
export const API_TASKS = `${API_BASE_URL}/todolist`

export type TaskStatus = "TODO" | "INPROGRESS" | "DONE"
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH"

export interface Task {
  id: string | number
  description: string
  status: TaskStatus
  creation_ts: string
  priority: TaskPriority
  createdBy: number
  assignee: number
  projectId: number | null
  sprintId: number | null
  storyPoints: number | null
  estimatedTime: number | null
  realTime: number | null
}

export interface User {
  id: number
  name: string
  avatar?: string
}

// Mock users (replace with actual API call if available)
// export const users: User[] = fetch(`${API_BASE_URL}/users`);
export const users: User[] = [
  { id: 1, name: "Dano", avatar: "A1" },
  { id: 2, name: "Pablo", avatar: "B2" },
  { id: 3, name: "Gustavo", avatar: "C3" },
  { id: 4, name: "Joaquin", avatar: "D4" },
  { id: 5, name: "Lucas", avatar: "E5" },
]

// Get user by id
export const getUserById = (id: number): User => {
  return users.find(user => user.id === id) || { id, name: `User ${id}`, avatar: `U${id}` }
}

// API functions with authentication
export const fetchTasks = async (token: string): Promise<Task[]> => {
  const response = await fetch(API_TASKS, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch tasks")
  }

  return response.json()
}

export const createTask = async (token: string, description: string): Promise<Task> => {
  const response = await fetch(API_TASKS, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ description }),
  })

  if (!response.ok) {
    throw new Error("Failed to create task")
  }

  // Get the ID from the location header
  const id = response.headers.get("location")

  // Return a partial task object with the information we have
  return {
    id: id || "",
    description,
    status: "TODO",
    creation_ts: new Date().toISOString(),
    priority: "LOW",
    createdBy: 1, // Default to current user
    assignee: 1, // Default to current user
    projectId: null,
    sprintId: null,
    storyPoints: null,
    estimatedTime: null,
    realTime: null,
  }
}

export const updateTaskStatus = async (
  token: string,
  id: string | number,
  description: string,
  status: TaskStatus,
): Promise<void> => {
  const response = await fetch(`${API_TASKS}/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ description, status }),
  })

  if (!response.ok) {
    throw new Error("Failed to update task")
  }
}

export const deleteTask = async (token: string, id: string | number): Promise<void> => {
  const response = await fetch(`${API_TASKS}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to delete task")
  }
}
