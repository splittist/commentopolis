# Copilot Instructions for Commentopolis

## Project Overview

Commentopolis is a modern web application for "comment-centric document exploration" built with React, TypeScript, and Tailwind CSS. The project focuses on document exploration with an emphasis on commenting and interaction features.

## Tech Stack & Architecture

### Core Technologies
- **[Vite](https://vitejs.dev/)** - Lightning fast build tool and dev server  
- **[React 19](https://react.dev/)** - Modern React with concurrent features
- **[TypeScript](https://www.typescriptlang.org/)** - Static type checking for JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Vitest](https://vitest.dev/)** - Fast unit testing framework
- **[Testing Library](https://testing-library.com/)** - Simple and complete testing utilities

### Development Environment
- Node.js 18+ required
- Package management: npm
- Development server: Vite dev server (localhost:5173)
- Build system: TypeScript + Vite
- Linting: ESLint with TypeScript rules

## Project Structure

```
commentopolis/
├── src/
│   ├── App.tsx              # Main application component
│   ├── App.test.tsx         # Main application tests
│   ├── main.tsx            # React application entry point
│   ├── index.css           # Global styles and Tailwind directives
│   └── test/
│       └── setup.ts        # Test setup configuration
├── public/                 # Static assets
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── tsconfig.app.json      # App-specific TypeScript config
├── tsconfig.node.json     # Node-specific TypeScript config
├── eslint.config.js       # ESLint configuration
└── postcss.config.js      # PostCSS configuration
```

## Coding Standards & Conventions

### TypeScript Guidelines
- Use strict TypeScript configuration
- Prefer explicit typing over `any`
- Use functional components with hooks over class components
- Export components as default exports
- Use proper JSX types (`React.FC` when needed, but prefer implicit typing)

### React Patterns
- Use functional components with hooks
- Follow React 19 patterns and concurrent features
- Use `useState` for local component state
- Use proper event handling patterns
- Implement proper error boundaries when needed

### Component Structure
```tsx
import { useState } from 'react'

function ComponentName() {
  const [state, setState] = useState(initialValue)

  const handleEvent = () => {
    // Event handler logic
  }

  return (
    <div className="tailwind-classes">
      {/* Component JSX */}
    </div>
  )
}

export default ComponentName
```

### Styling with Tailwind CSS
- Use Tailwind utility classes for styling
- Follow responsive design patterns (`sm:`, `md:`, `lg:`, `xl:`)
- Use semantic color names from Tailwind palette
- Maintain consistent spacing scale using Tailwind spacing units
- Use Tailwind's component patterns for reusable styles

### Common Tailwind Patterns
```tsx
// Layout
<div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">

// Cards/Components  
<div className="bg-white rounded-lg shadow-lg p-8">

// Buttons
<button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200">

// Typography
<h1 className="text-6xl font-bold text-gray-900 mb-4">
<p className="text-xl text-gray-600 mb-8">

// Grid layouts
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
```

## Testing Standards

### Testing Framework & Utilities
- **Vitest** for unit testing with React Testing Library
- **@testing-library/react** for component testing
- **@testing-library/jest-dom** for additional matchers
- **jsdom** environment for DOM testing

### Testing Patterns
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ComponentName from './ComponentName'

describe('ComponentName', () => {
  it('should render main content', () => {
    render(<ComponentName />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('should handle user interactions', () => {
    render(<ComponentName />)
    const button = screen.getByRole('button', { name: /button text/i })
    
    fireEvent.click(button)
    expect(/* expected result */).toBeTruthy()
  })
})
```

### Testing Guidelines
- Write tests for all components with logic
- Test user interactions, not implementation details
- Use accessible queries (getByRole, getByLabelText) when possible
- Test error states and edge cases
- Keep tests focused and readable

## Development Workflow

### Available Scripts
```bash
npm run dev       # Start development server (localhost:5173)
npm run build     # Build for production (TypeScript + Vite)
npm run preview   # Preview production build locally
npm run test      # Run tests in watch mode
npm run test:run  # Run tests once
npm run test:ui   # Run tests with UI interface
npm run lint      # Run ESLint to check code quality
```

### Development Process
1. Start development server: `npm run dev`
2. Write code following TypeScript and React best practices
3. Style components using Tailwind CSS utilities
4. Write tests for new functionality
5. Run linting: `npm run lint`
6. Run tests: `npm run test:run`
7. Build for production: `npm run build`

### Code Quality
- Follow ESLint configuration (TypeScript + React rules)
- Use Prettier for consistent formatting (if configured)
- Maintain TypeScript strict mode compliance
- Write meaningful commit messages
- Keep components small and focused

## File Naming Conventions
- Components: `ComponentName.tsx` (PascalCase)
- Tests: `ComponentName.test.tsx`
- Utilities: `utilityName.ts` (camelCase)
- Types: Define in component files or separate `types.ts` files
- CSS: Use Tailwind utilities, minimal custom CSS in `index.css`

## Error Handling & Debugging
- Use TypeScript for compile-time error catching
- Implement proper error boundaries for React components
- Use browser dev tools for debugging
- Use Vite's HMR for rapid development
- Check console for runtime errors and warnings

## Performance Considerations
- Use React 19's concurrent features appropriately
- Implement proper key props for list items
- Use React.memo() for expensive re-renders when needed
- Optimize bundle size with Vite's tree shaking
- Use Tailwind's purge feature to minimize CSS bundle size

## Project-Specific Context
- Focus on "comment-centric document exploration" features
- Build user interfaces that emphasize commenting and document interaction
- Maintain responsive design for various screen sizes
- Ensure accessibility compliance with proper ARIA attributes
- Follow modern React patterns for state management and side effects

## Accessibility Guidelines
- Use semantic HTML elements
- Provide proper ARIA labels and descriptions
- Ensure keyboard navigation support
- Maintain proper color contrast ratios
- Test with screen readers when implementing interactive features

## License & Contributing
- Project uses GNU Affero General Public License v3.0
- Maintain license compatibility for any new dependencies
- Follow existing code style and patterns
- Write tests for new features and bug fixes