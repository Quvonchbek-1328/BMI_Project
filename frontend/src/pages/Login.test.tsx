import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Login from './Login'

// Mock the auth context
const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}))

// Mock authApi
const mockAuthLogin = vi.fn()
vi.mock('../api/authApi', () => ({
  authApi: {
    login: (...args: unknown[]) => mockAuthLogin(...args),
  },
}))

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form', () => {
    renderLogin()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders link to register page', () => {
    renderLogin()
    expect(screen.getByText(/create one/i)).toBeInTheDocument()
  })

  it('shows RiskWatchAI branding', () => {
    renderLogin()
    expect(screen.getByText('RiskWatch')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('submits form with email and password', async () => {
    const user = userEvent.setup()
    mockAuthLogin.mockResolvedValue({
      data: {
        success: true,
        data: {
          userId: '1',
          fullName: 'User',
          email: 'test@test.com',
          token: 'tok',
          roles: ['User'],
          expiresAt: '2099-01-01',
        },
      },
    })

    renderLogin()

    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockAuthLogin).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      })
    })
    expect(mockLogin).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  it('shows error on failed login', async () => {
    const user = userEvent.setup()
    mockAuthLogin.mockResolvedValue({
      data: { success: false, message: 'Invalid credentials' },
    })

    renderLogin()

    await user.type(screen.getByLabelText('Email'), 'bad@test.com')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument()
  })

  it('shows error on network failure', async () => {
    const user = userEvent.setup()
    mockAuthLogin.mockRejectedValue({
      response: { data: { message: 'Server error' } },
    })

    renderLogin()

    await user.type(screen.getByLabelText('Email'), 'test@test.com')
    await user.type(screen.getByLabelText('Password'), 'pass')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText('Server error')).toBeInTheDocument()
  })
})
