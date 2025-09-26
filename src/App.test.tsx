import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />)
    expect(screen.getByText('Commentopolis')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<App />)
    expect(screen.getByText('Comment-centric document exploration')).toBeInTheDocument()
  })

  it('increments count when button is clicked', () => {
    render(<App />)
    const button = screen.getByRole('button', { name: /count is/i })
    
    expect(button).toHaveTextContent('Count is 0')
    
    fireEvent.click(button)
    expect(button).toHaveTextContent('Count is 1')
    
    fireEvent.click(button)
    expect(button).toHaveTextContent('Count is 2')
  })

  it('renders technology cards', () => {
    render(<App />)
    expect(screen.getByText('⚡ Vite')).toBeInTheDocument()
    expect(screen.getByText('⚛️ React + TypeScript')).toBeInTheDocument()
    expect(screen.getByText('🎨 Tailwind CSS')).toBeInTheDocument()
  })
})