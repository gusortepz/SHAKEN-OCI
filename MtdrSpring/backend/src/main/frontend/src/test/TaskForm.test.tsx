import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { TaskForm } from "../components/TaskForm"
import userEvent from "@testing-library/user-event"
import { act } from "react-dom/test-utils"


vi.spyOn(Storage.prototype, "getItem").mockReturnValue("fake-token")


vi.mock("../utils/api", () => ({
  fetchUsers: vi.fn().mockResolvedValue([
    { id: 1, name: "User 1" },
    { id: 2, name: "User 2" },
  ]),
  fetchSprints: vi.fn().mockResolvedValue([
    { id: 1, name: "Sprint 1" },
    { id: 2, name: "Sprint 2" },
  ]),
}))

describe("TaskForm Component", () => {
  const mockAddTask = vi.fn()

  beforeEach(() => {
    vi.resetAllMocks()
    mockAddTask.mockResolvedValue(undefined)
  })

  it("renderiza correctamente el formulario", async () => {
    render(<TaskForm onAddTask={mockAddTask} isLoading={false} />)

    
    const openButton = screen.getByRole("button", { name: /Add New Task/i })
    expect(openButton).toBeInTheDocument()

    
    await act(async () => {
      fireEvent.click(openButton)
    })

    
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
    })
  })

  it("deshabilita el botón cuando el campo está vacío", async () => {
    render(<TaskForm onAddTask={mockAddTask} isLoading={false} />)

    
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Add New Task/i }))
    })

    
    await waitFor(() => {
      const submitButton = screen.getByRole("button", { name: /Add Task/i })
      
      expect(submitButton).toBeDisabled()
    })
  })

  it("habilita el botón cuando se ingresa texto", async () => {
    const user = userEvent.setup()
    render(<TaskForm onAddTask={mockAddTask} isLoading={false} />)

    
    await act(async () => {
      await user.click(screen.getByRole("button", { name: /Add New Task/i }))
    })

    
    const input = await screen.findByLabelText(/Description/i)

    
    await user.type(input, "Nueva tarea")

    
    const submitButton = screen.getByRole("button", { name: /Add Task/i })
    expect(submitButton).not.toBeDisabled()
  })

  it("llama a onAddTask con el texto ingresado al enviar el formulario", async () => {
    const user = userEvent.setup()
    render(<TaskForm onAddTask={mockAddTask} isLoading={false} />)

    
    await act(async () => {
      await user.click(screen.getByRole("button", { name: /Add New Task/i }))
    })

    
    const input = await screen.findByLabelText(/Description/i)

    
    await user.type(input, "Nueva tarea")
    await user.click(screen.getByRole("button", { name: /Add Task/i }))

    
    expect(mockAddTask).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Nueva tarea",
      }),
    )
  })

  it("muestra un indicador de carga cuando isLoading es true", async () => {
    render(<TaskForm onAddTask={mockAddTask} isLoading={true} />)

    
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Add New Task/i }))
    })

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Adding/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Adding/i })).toBeDisabled()
    })
  })
})
