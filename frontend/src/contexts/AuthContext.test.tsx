import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'
import type { AuthResponse } from '../types/auth'

// Mock the authApi module
vi.mock('../api/authApi', () => ({
  authApi: {
    getProfile: vi.fn().mockRejectedValue(new Error('No token')),
  },
}))

// Helper component to access auth context
function AuthConsumer() {
  const { user, token, isAuthenticated, roles, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="is-auth">{String(isAuthenticated)}</span>
      <span data-testid="user">{user?.fullName ?? 'null'}</span>
      <span data-testid="token">{token ?? 'null'}</span>
      <span data-testid="roles">{roles.join(',') || 'none'}</span>
      <button
        onClick={() =>
          login({
            userId: '1',
            fullName: 'Test User',
            email: 'test@test.com',
            token: 'abc123',
            roles: ['User'],
            expiresAt: '2099-01-01',
          } as AuthResponse)
        }
      >
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('throws error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<AuthConsumer />)).toThrow('useAuth must be used within AuthProvider')
    spy.mockRestore()
  })

  it('provides default unauthenticated state', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )
    // Wait for isLoading to become false
    expect(await screen.findByTestId('is-auth')).toHaveTextContent('false')
    expect(screen.getByTestId('user')).toHaveTextContent('null')
    expect(screen.getByTestId('token')).toHaveTextContent('null')
  })

  it('updates state when login is called', async () => {
    const { getByText, getByTestId } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )
    await act(async () => {
      getByText('Login').click()
    })
    expect(getByTestId('is-auth')).toHaveTextContent('true')
    expect(getByTestId('user')).toHaveTextContent('Test User')
    expect(getByTestId('token')).toHaveTextContent('abc123')
    expect(getByTestId('roles')).toHaveTextContent('User')
    expect(localStorage.getItem('token')).toBe('abc123')
  })

  it('clears state when logout is called', async () => {
    const { getByText, getByTestId } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )
    await act(async () => {
      getByText('Login').click()
    })
    expect(getByTestId('is-auth')).toHaveTextContent('true')

    await act(async () => {
      getByText('Logout').click()
    })
    expect(getByTestId('is-auth')).toHaveTextContent('false')
    expect(getByTestId('user')).toHaveTextContent('null')
    expect(localStorage.getItem('token')).toBeNull()
  })
})
