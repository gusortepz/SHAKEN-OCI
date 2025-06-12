import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { TaskList } from "../components/TaskList"
import { act } from "react-dom/test-utils"
import { Task } from "@/utils/api"
import { SetStateAction } from "react"

vi.spyOn(Storage.prototype, "getItem").mockReturnValue("fake-token")

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
    {
      id: "2",
      description: "Task 2",
      status: "INPROGRESS",
      creation_ts: "2023-05-16T10:00:00Z",
      priority: "MEDIUM",
      createdBy: 1,
      assignee: 3,
      projectId: 1,
      sprintId: 1,
      storyPoints: 2,
      estimatedTime: 3,
      realTime: 2,
    },
  ]),
  fetchUsers: vi.fn().mockResolvedValue([
    { id: 1, name: "User 1" },
    { id: 2, name: "User 2" },
    { id: 3, name: "User 3" },
  ]),
  updateTaskStatus: vi.fn().mockResolvedValue(undefined),
  getUserById: vi.fn().mockImplementation((id) => ({ id, name: `User ${id}` })),
}))

describe("TaskList Component", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("muestra correctamente las tareas filtradas por estado", async () => {
    await act(async () => {
      render(
        <TaskList
          status="TODO"
          onUpdateStatus={vi.fn()}
          onDelete={vi.fn()}
          title="To Do"
          tasks={[
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
          ]}
          updatingTaskIds={[]} isUpdatingTask={false} setTasks={function (value: SetStateAction<Task[]>): void {
            throw new Error("Function not implemented.")
          } }        />,
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId("task-description")).toHaveTextContent("Task 1")
    })
  })

  it("muestra mensaje cuando no hay tareas en la categoría", async () => {
    render(
      <TaskList
        status="DONE"
        onUpdateStatus={vi.fn()}
        onDelete={vi.fn()}
        title="Done"
        tasks={[]}
        updatingTaskIds={[]} isUpdatingTask={false} setTasks={function (value: SetStateAction<Task[]>): void {
          throw new Error("Function not implemented.")
        } }      />,
    )

    expect(screen.getByText(/No tasks in this category/i)).toBeInTheDocument()
  })

  it("muestra la información correcta de la tarea", async () => {
    await act(async () => {
      render(
        <TaskList
          status="TODO"
          onUpdateStatus={vi.fn()}
          onDelete={vi.fn()}
          title="To Do"
          tasks={[
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
          ]}
          updatingTaskIds={[]} isUpdatingTask={false} setTasks={function (value: SetStateAction<Task[]>): void {
            throw new Error("Function not implemented.")
          } }        />,
      )
    })

    await waitFor(() => {
      const taskElement = screen.getByTestId("task-item")
      expect(taskElement).toBeInTheDocument()
      expect(screen.getByTestId("task-description")).toHaveTextContent("Task 1")
    })
  })
})
