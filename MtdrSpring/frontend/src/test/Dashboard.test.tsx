import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Dashboard } from '../pages/Dashboard'
import { MemoryRouter } from 'react-router-dom'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()]
  }
})

vi.mock('../utils/api', () => {
  return {
    fetchTasks: vi.fn().mockResolvedValue([
      {
        id: '1',
        description: 'Task 1',
        status: 'TODO',
        creation_ts: '2023-05-15T10:00:00Z',
        priority: 'HIGH',
        createdBy: 1,
        assignee: 2,
        projectId: 1,
        sprintId: 1,
        storyPoints: 3,
        estimatedTime: 5,
        realTime: 4
      },
      {
        id: '2',
        description: 'Task 2',
        status: 'INPROGRESS',
        creation_ts: '2023-05-15T11:00:00Z',
        priority: 'MEDIUM',
        createdBy: 1,
        assignee: 3,
        projectId: 1,
        sprintId: 1,
        storyPoints: 2,
        estimatedTime: 3,
        realTime: 2
      },
      {
        id: '3',
        description: 'Task 3',
        status: 'DONE',
        creation_ts: '2023-05-15T12:00:00Z',
        priority: 'LOW',
        createdBy: 1,
        assignee: 2,
        projectId: 1,
        sprintId: 1,
        storyPoints: 1,
        estimatedTime: 2,
        realTime: 2
      }
    ]),
    createTask: vi.fn(),
    updateTaskStatus: vi.fn(),
    deleteTask: vi.fn(),
    TaskStatus: {
      TODO: 'TODO',
      INPROGRESS: 'INPROGRESS',
      DONE: 'DONE'
    },
    TaskPriority: {
      LOW: 'LOW',
      MEDIUM: 'MEDIUM',
      HIGH: 'HIGH'
    }
  }
})

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('fake-token')
  })

  it('muestra el título correcto', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    
    expect(screen.getByText('All Tasks')).toBeInTheDocument()
  })

  it('muestra las tareas en las columnas correctas', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText('To Do')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
      expect(screen.getByText('Done')).toBeInTheDocument()
    })
  })

  it('muestra el título con la fecha cuando se proporciona una fecha', async () => {
    render(
      <MemoryRouter>
        <Dashboard selectedDate={new Date('2023-05-15')} />
      </MemoryRouter>
    )
    
    expect(screen.getByText(/Tasks for/)).toBeInTheDocument()
  })
})