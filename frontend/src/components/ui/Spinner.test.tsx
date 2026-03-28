import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Spinner from './Spinner'

describe('Spinner', () => {
  it('renders with default size', () => {
    const { container } = render(<Spinner />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('h-8', 'w-8')
  })

  it('renders with sm size', () => {
    const { container } = render(<Spinner size="sm" />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-5', 'w-5')
  })

  it('renders with lg size', () => {
    const { container } = render(<Spinner size="lg" />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-12', 'w-12')
  })

  it('applies custom className', () => {
    const { container } = render(<Spinner className="mt-4" />)
    expect(container.firstChild).toHaveClass('mt-4')
  })
})
