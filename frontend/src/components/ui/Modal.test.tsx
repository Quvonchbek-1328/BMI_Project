import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Modal from './Modal'

describe('Modal', () => {
  it('renders nothing when open is false', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Test">
        <p>Content</p>
      </Modal>
    )
    expect(screen.queryByText('Test')).not.toBeInTheDocument()
  })

  it('renders title and children when open is true', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="My Modal">
        <p>Modal body</p>
      </Modal>
    )
    expect(screen.getByText('My Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal body')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()
    render(
      <Modal open={true} onClose={handleClose} title="Close Test">
        <p>Body</p>
      </Modal>
    )
    // The close button has an SVG inside it
    const closeButton = screen.getByText('Close Test').parentElement!.querySelector('button')!
    await user.click(closeButton)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
