import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { useTasks } from "../hooks/useTasks"
import { MemoryRouter } from "react-router-dom"

vi.mock("../utils/api", () => ({
  fetchTasks: vi.fn().mockResolvedValue([
    {
      id: "1",
      description: "Task 1",
      status: "TODO",
      creation_ts: "2023-05-15T10:00:00Z",
      priority: "HIGH",
      createdBy: 1,
      assignee: 2,
      projectId: 1,
      sprintId: 1,
      storyPoints: 3,
      estimatedTime: 5,
      realTime: 4,
    },
  ]),
  createTask: vi.fn().mockResolvedValue({
    id: "2",
    description: "New Task",
    status: "TODO",
    creation_ts: "2023-05-16T10:00:00Z",
    priority: "LOW",
    createdBy: 1,
    assignee: 1,
    projectId: null,
    sprintId: null,
    storyPoints: null,
    estimatedTime: null,
    realTime: null,
  }),
  updateTaskStatus: vi.fn().mockResolvedValue(undefined),
  deleteTask: vi.fn().mockResolvedValue(undefined),
  fetchUsers: vi.fn().mockResolvedValue([
    { id: 1, name: "User 1" },
    { id: 2, name: "User 2" },
  ]),
  fetchSprints: vi.fn().mockResolvedValue([
    { id: 1, name: "Sprint 1" },
    { id: 2, name: "Sprint 2" },
  ]),
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.spyOn(Storage.prototype, "getItem").mockReturnValue("fake-token")

const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe("useTasks Hook", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it.skip("carga las tareas correctamente", async () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: MemoryRouter,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].description).toBe("Task 1")
  })

  it.skip("agrega una tarea correctamente", async () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: MemoryRouter,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await result.current.addTask("New Task")

    expect(result.current.tasks).toHaveLength(2)
    expect(result.current.tasks[1].description).toBe("New Task")
  })
})
