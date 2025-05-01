import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Login } from '../pages/Login'
import { MemoryRouter } from 'react-router-dom'


vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn()
  }
})


vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('Login Component', () => {
  const mockSetIsAuthenticated = vi.fn()

  beforeEach(() => {
    vi.resetAllMocks()
    
    
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})
    
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'fake-token' })
    })
  })

  it('renderiza correctamente el formulario de login', () => {
    render(
      <MemoryRouter>
        <Login setIsAuthenticated={mockSetIsAuthenticated} />
      </MemoryRouter>
    )
    
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it.skip('maneja correctamente un login exitoso', async () => {
    render(
      <MemoryRouter>
        <Login setIsAuthenticated={mockSetIsAuthenticated} />
      </MemoryRouter>
    )
    
    
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } })
    
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'password' })
      })
    })
    
    
    expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true)
    
    
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token')
  })

  it('muestra un mensaje de error para credenciales inválidas', async () => {
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Invalid credentials' })
    })
    
    render(
      <MemoryRouter>
        <Login setIsAuthenticated={mockSetIsAuthenticated} />
      </MemoryRouter>
    )
    
    
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'wronguser' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpass' } })
    
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
    
    
    const { toast } = await import('sonner')
    expect(toast.error).toHaveBeenCalledWith('Login failed', expect.any(Object))
    
    
    expect(mockSetIsAuthenticated).not.toHaveBeenCalled()
  })
})
