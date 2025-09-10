// AISidebar Component Tests
// Comprehensive test suite for AI sidebar functionality

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import AISidebar from '../AISidebar'

// Mock the electron API
const mockElectronAPI = {
  testConnection: jest.fn(),
  sendAIMessage: jest.fn(),
  getAgentStatus: jest.fn()
}

// Mock window.electronAPI
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true
})

// Mock the enhanced logger
jest.mock('../../../core/logger/EnhancedLogger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  })
}))

describe('AISidebar', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockElectronAPI.testConnection.mockResolvedValue({
      success: true,
      data: { connected: true }
    })
    mockElectronAPI.getAgentStatus.mockResolvedValue({
      success: true,
      status: { status: 'ready' }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the AI sidebar with proper header', () => {
    render(<AISidebar onClose={mockOnClose} />)
    
    expect(screen.getByText('🤖 KAiro AI')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /close ai sidebar/i })).toBeInTheDocument()
  })

  it('displays welcome message on initialization', async () => {
    render(<AISidebar onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome! I'm your intelligent browsing companion/)).toBeInTheDocument()
    })
  })

  it('shows connection status', async () => {
    render(<AISidebar onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('AI Connected')).toBeInTheDocument()
    })
  })

  it('handles connection failure gracefully', async () => {
    mockElectronAPI.testConnection.mockResolvedValue({
      success: false,
      error: 'Connection failed'
    })

    render(<AISidebar onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('AI Disconnected')).toBeInTheDocument()
    })
  })

  it('displays quick action buttons', async () => {
    render(<AISidebar onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('📄 Summarize Page')).toBeInTheDocument()
      expect(screen.getByText('🔍 Research Topic')).toBeInTheDocument()
      expect(screen.getByText('📊 Analyze Content')).toBeInTheDocument()
      expect(screen.getByText('🌐 Smart Navigation')).toBeInTheDocument()
    })
  })

  it('allows user to input and send messages', async () => {
    const user = userEvent.setup()
    mockElectronAPI.sendAIMessage.mockResolvedValue({
      success: true,
      result: 'AI response message'
    })

    render(<AISidebar onClose={mockOnClose} />)
    
    // Wait for component to initialize
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask me anything/)).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText(/Ask me anything/)
    const sendButton = screen.getByRole('button', { name: /send message/i })

    // Type a message
    await user.type(input, 'Test message')
    expect(input).toHaveValue('Test message')

    // Send the message
    await user.click(sendButton)

    // Verify API was called
    await waitFor(() => {
      expect(mockElectronAPI.sendAIMessage).toHaveBeenCalledWith('Test message')
    })
  })

  it('handles message sending with Enter key', async () => {
    const user = userEvent.setup()
    mockElectronAPI.sendAIMessage.mockResolvedValue({
      success: true,
      result: 'AI response'
    })

    render(<AISidebar onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask me anything/)).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText(/Ask me anything/)
    
    await user.type(input, 'Test message{enter}')

    await waitFor(() => {
      expect(mockElectronAPI.sendAIMessage).toHaveBeenCalledWith('Test message')
    })
  })

  it('allows line breaks with Shift+Enter', async () => {
    const user = userEvent.setup()

    render(<AISidebar onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask me anything/)).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText(/Ask me anything/)
    
    await user.type(input, 'Line 1{shift}{enter}Line 2')
    
    expect(input).toHaveValue('Line 1\nLine 2')
    expect(mockElectronAPI.sendAIMessage).not.toHaveBeenCalled()
  })

  it('displays AI responses correctly', async () => {
    const user = userEvent.setup()
    mockElectronAPI.sendAIMessage.mockResolvedValue({
      success: true,
      result: 'This is an AI response'
    })

    render(<AISidebar onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask me anything/)).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText(/Ask me anything/)
    await user.type(input, 'Test message{enter}')

    await waitFor(() => {
      expect(screen.getByText('This is an AI response')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()
    mockElectronAPI.sendAIMessage.mockResolvedValue({
      success: false,
      error: 'API Error occurred'
    })

    render(<AISidebar onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask me anything/)).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText(/Ask me anything/)
    await user.type(input, 'Test message{enter}')

    await waitFor(() => {
      expect(screen.getByText(/Error.*API Error occurred/)).toBeInTheDocument()
    })
  })

  it('disables input when not connected', async () => {
    mockElectronAPI.testConnection.mockResolvedValue({
      success: false,
      error: 'Not connected'
    })

    render(<AISidebar onClose={mockOnClose} />)
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/AI service not available/)
      expect(input).toBeDisabled()
    })

    const sendButton = screen.getByRole('button', { name: /send message/i })
    expect(sendButton).toBeDisabled()
  })

  it('validates input length', async () => {
    const user = userEvent.setup()

    render(<AISidebar onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask me anything/)).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText(/Ask me anything/) as HTMLInputElement
    
    // Try to input very long text (over 5000 characters)
    const longText = 'a'.repeat(6000)
    await user.type(input, longText)
    
    // Should be limited to 5000 characters
    expect(input.value.length).toBeLessThanOrEqual(5000)
  })

  it('handles quick action clicks', async () => {
    const user = userEvent.setup()
    mockElectronAPI.sendAIMessage.mockResolvedValue({
      success: true,
      result: 'Quick action response'
    })

    render(<AISidebar onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('📄 Summarize Page')).toBeInTheDocument()
    })

    const summarizeButton = screen.getByText('📄 Summarize Page')
    await user.click(summarizeButton)

    await waitFor(() => {
      expect(mockElectronAPI.sendAIMessage).toHaveBeenCalledWith('Summarize this page')
    })
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()

    render(<AISidebar onClose={mockOnClose} />)
    
    const closeButton = screen.getByRole('button', { name: /close ai sidebar/i })
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('performs periodic connection checks', async () => {
    jest.useFakeTimers()

    render(<AISidebar onClose={mockOnClose} />)
    
    // Fast-forward time to trigger connection checks
    jest.advanceTimersByTime(15000) // 15 seconds
    
    await waitFor(() => {
      expect(mockElectronAPI.testConnection).toHaveBeenCalledTimes(2) // Initial + periodic
    })

    jest.useRealTimers()
  })

  it('cleans up resources on unmount', () => {
    const { unmount } = render(<AISidebar onClose={mockOnClose} />)
    
    // Should not throw any errors
    expect(() => unmount()).not.toThrow()
  })
})