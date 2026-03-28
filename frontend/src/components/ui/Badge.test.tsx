import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Badge, { getRiskBadgeVariant, getStatusBadgeVariant, getPriorityBadgeVariant } from './Badge'

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies default variant classes', () => {
    render(<Badge>Default</Badge>)
    expect(screen.getByText('Default')).toHaveClass('bg-slate-100')
  })

  it('applies success variant classes', () => {
    render(<Badge variant="success">Done</Badge>)
    expect(screen.getByText('Done')).toHaveClass('bg-emerald-50')
  })

  it('applies danger variant classes', () => {
    render(<Badge variant="danger">Error</Badge>)
    expect(screen.getByText('Error')).toHaveClass('bg-red-50')
  })

  it('applies custom className', () => {
    render(<Badge className="ml-2">Custom</Badge>)
    expect(screen.getByText('Custom')).toHaveClass('ml-2')
  })
})

describe('getRiskBadgeVariant', () => {
  it('returns danger for High', () => {
    expect(getRiskBadgeVariant('High')).toBe('danger')
  })

  it('returns warning for Medium', () => {
    expect(getRiskBadgeVariant('Medium')).toBe('warning')
  })

  it('returns success for Low', () => {
    expect(getRiskBadgeVariant('Low')).toBe('success')
  })

  it('returns default for unknown', () => {
    expect(getRiskBadgeVariant('Unknown')).toBe('default')
  })
})

describe('getStatusBadgeVariant', () => {
  it('returns success for Completed', () => {
    expect(getStatusBadgeVariant('Completed')).toBe('success')
  })

  it('returns info for InProgress', () => {
    expect(getStatusBadgeVariant('InProgress')).toBe('info')
  })

  it('returns warning for Blocked', () => {
    expect(getStatusBadgeVariant('Blocked')).toBe('warning')
  })

  it('returns danger for Cancelled', () => {
    expect(getStatusBadgeVariant('Cancelled')).toBe('danger')
  })
})

describe('getPriorityBadgeVariant', () => {
  it('returns danger for Critical', () => {
    expect(getPriorityBadgeVariant('Critical')).toBe('danger')
  })

  it('returns warning for High', () => {
    expect(getPriorityBadgeVariant('High')).toBe('warning')
  })

  it('returns default for Low', () => {
    expect(getPriorityBadgeVariant('Low')).toBe('default')
  })
})
