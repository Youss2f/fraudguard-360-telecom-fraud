import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DemoTour, TourTrigger } from '@/components/demo-tour'

// Mock the dialog components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => 
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => 
    <h2 data-testid="dialog-title">{children}</h2>,
}))

describe('DemoTour', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  it('renders when open', () => {
    render(<DemoTour isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
    expect(screen.getByText('Welcome to FraudGuard 360°')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<DemoTour isOpen={false} onClose={mockOnClose} />)
    
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
  })

  it('shows progress indicator', () => {
    render(<DemoTour isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByText('1 / 8')).toBeInTheDocument()
  })

  it('navigates to next step', async () => {
    render(<DemoTour isOpen={true} onClose={mockOnClose} />)
    
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText('2 / 8')).toBeInTheDocument()
      expect(screen.getByText('Subscriber Search')).toBeInTheDocument()
    })
  })

  it('navigates to previous step', async () => {
    render(<DemoTour isOpen={true} onClose={mockOnClose} />)
    
    // Go to next step first
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText('2 / 8')).toBeInTheDocument()
    })
    
    // Go back to previous step
    const prevButton = screen.getByText('Previous')
    fireEvent.click(prevButton)
    
    await waitFor(() => {
      expect(screen.getByText('1 / 8')).toBeInTheDocument()
      expect(screen.getByText('Welcome to FraudGuard 360°')).toBeInTheDocument()
    })
  })

  it('disables previous button on first step', () => {
    render(<DemoTour isOpen={true} onClose={mockOnClose} />)
    
    const prevButton = screen.getByText('Previous')
    expect(prevButton).toBeDisabled()
  })

  it('shows finish button on last step', async () => {
    render(<DemoTour isOpen={true} onClose={mockOnClose} />)
    
    // Navigate to last step
    const nextButton = screen.getByText('Next')
    for (let i = 0; i < 7; i++) {
      fireEvent.click(nextButton)
      await waitFor(() => {})
    }
    
    expect(screen.getByText('Finish')).toBeInTheDocument()
  })

  it('calls onClose when finish is clicked', async () => {
    render(<DemoTour isOpen={true} onClose={mockOnClose} />)
    
    // Navigate to last step
    const nextButton = screen.getByText('Next')
    for (let i = 0; i < 7; i++) {
      fireEvent.click(nextButton)
      await waitFor(() => {})
    }
    
    const finishButton = screen.getByText('Finish')
    fireEvent.click(finishButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose when skip tour is clicked', () => {
    render(<DemoTour isOpen={true} onClose={mockOnClose} />)
    
    const skipButton = screen.getByText('Skip Tour')
    fireEvent.click(skipButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows action hints for relevant steps', () => {
    render(<DemoTour isOpen={true} onClose={mockOnClose} />)
    
    // Navigate to search step
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)
    
    expect(screen.getByText('Try entering: +1234567890')).toBeInTheDocument()
  })
})

describe('TourTrigger', () => {
  it('renders the trigger button', () => {
    render(<TourTrigger />)
    
    expect(screen.getByText('Start Demo Tour')).toBeInTheDocument()
  })

  it('opens tour when clicked', async () => {
    render(<TourTrigger />)
    
    const triggerButton = screen.getByText('Start Demo Tour')
    fireEvent.click(triggerButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument()
    })
  })

  it('has proper styling classes', () => {
    render(<TourTrigger />)
    
    const triggerButton = screen.getByText('Start Demo Tour')
    expect(triggerButton).toHaveClass('fixed', 'bottom-6', 'right-6')
  })
})
