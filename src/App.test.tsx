import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the main heading in left panel', () => {
    render(<App />)
    expect(screen.getByText('Commentopolis')).toBeInTheDocument()
  })

  it('does not render the subtitle (removed)', () => {
    render(<App />)
    expect(screen.queryByText('Comment-centric document exploration')).not.toBeInTheDocument()
  })

  it('renders three-panel layout', () => {
    render(<App />)
    
    // Check for panel toggle buttons
    expect(screen.getByTitle('Toggle left panel')).toBeInTheDocument()
    expect(screen.getByTitle('Toggle right panel')).toBeInTheDocument()
    
    // Check for main content
    expect(screen.getByText('Welcome to the Three-Panel Interface')).toBeInTheDocument()
  })

  it('toggles left panel state when button is clicked', () => {
    render(<App />)
    const leftToggle = screen.getByTitle('Toggle left panel')
    
    // Initially should show "Normal" state
    expect(screen.getByText('Normal')).toBeInTheDocument()
    
    // Click to change state
    fireEvent.click(leftToggle)
    
    // Should cycle through states (normal -> focused -> minimized -> normal)
    expect(screen.getByText('Focused')).toBeInTheDocument()
  })

  it('toggles right panel state when button is clicked', () => {
    render(<App />)
    const rightToggle = screen.getByTitle('Toggle right panel')
    
    // Click to change state
    fireEvent.click(rightToggle)
    
    // Should cycle through states
    expect(screen.getByText('Focused')).toBeInTheDocument()
  })
})