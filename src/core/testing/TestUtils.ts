/**
 * Test Utilities
 * Common testing helpers and mocks
 */

import { Tab, AgentStatus, AIMessage } from '../types'

// Mock Data Factories
export const createMockTab = (overrides: Partial<Tab> = {}): Tab => ({
  id: `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  title: 'Mock Tab',
  url: 'https://example.com',
  isLoading: false,
  isActive: false,
  type: 'browser',
  createdBy: 'user',
  ...overrides
})

export const createMockAITab = (overrides: Partial<Tab> = {}): Tab => ({
  id: `ai_tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  title: 'AI Research',
  url: 'ai://content',
  isLoading: false,
  isActive: false,
  type: 'ai',
  content: '# AI Content\n\nSample content...',
  createdBy: 'agent',
  ...overrides
})

export const createMockAgentStatus = (overrides: Partial<AgentStatus> = {}): AgentStatus => ({
  id: 'test-agent',
  name: 'Test Agent',
  status: 'idle',
  progress: 0,
  details: [],
  ...overrides
})

export const createMockAIMessage = (overrides: Partial<AIMessage> = {}): AIMessage => ({
  id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  content: 'Test message',
  timestamp: Date.now(),
  isUser: false,
  ...overrides
})

// Mock Electron API
export const createMockElectronAPI = () => ({
  // Browser Management
  createTab: jest.fn().mockResolvedValue({ success: true, tabId: 'mock-tab-id' }),
  closeTab: jest.fn().mockResolvedValue({ success: true }),
  switchTab: jest.fn().mockResolvedValue({ success: true }),
  navigateTo: jest.fn().mockResolvedValue({ success: true }),
  goBack: jest.fn().mockResolvedValue({ success: true }),
  goForward: jest.fn().mockResolvedValue({ success: true }),
  reload: jest.fn().mockResolvedValue({ success: true }),
  getCurrentUrl: jest.fn().mockResolvedValue({ success: true, url: 'https://example.com' }),
  getPageTitle: jest.fn().mockResolvedValue({ success: true, title: 'Example Page' }),

  // AI Service
  sendAIMessage: jest.fn().mockResolvedValue({ 
    success: true, 
    result: 'Mock AI response',
    actions: [] 
  }),
  summarizePage: jest.fn().mockResolvedValue({ 
    success: true, 
    data: 'Mock page summary' 
  }),
  analyzeContent: jest.fn().mockResolvedValue({ 
    success: true, 
    data: 'Mock content analysis' 
  }),
  testConnection: jest.fn().mockResolvedValue({ success: true }),

  // Agent System
  executeAgentTask: jest.fn().mockResolvedValue({ 
    success: true, 
    result: { type: 'task_completed', message: 'Mock task completed' } 
  }),
  getAgentStatus: jest.fn().mockResolvedValue({ 
    success: true, 
    status: createMockAgentStatus() 
  }),

  // AI Tabs
  createAITab: jest.fn().mockResolvedValue({ 
    success: true, 
    tabId: 'mock-ai-tab-id' 
  }),
  saveAITabContent: jest.fn().mockResolvedValue({ success: true }),
  loadAITabContent: jest.fn().mockResolvedValue({ 
    success: true, 
    content: 'Mock AI content' 
  }),

  // Event Listeners
  onBrowserEvent: jest.fn(),
  onAgentUpdate: jest.fn(),
  onMenuAction: jest.fn()
})

// Test Helpers
export const waitFor = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms))

export const waitForCondition = async (
  condition: () => boolean, 
  timeout: number = 5000,
  interval: number = 100
): Promise<void> => {
  const start = Date.now()
  
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error(`Condition not met within ${timeout}ms`)
    }
    await waitFor(interval)
  }
}

export const simulateBrowserEvent = (type: string, data: any = {}) => ({
  type,
  timestamp: Date.now(),
  ...data
})

// Component Test Helpers
export const getElementByTestId = (container: HTMLElement, testId: string): HTMLElement | null =>
  container.querySelector(`[data-testid="${testId}"]`)

export const getAllElementsByTestId = (container: HTMLElement, testId: string): HTMLElement[] =>
  Array.from(container.querySelectorAll(`[data-testid="${testId}"]`))

// Performance Testing
export const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now()
  renderFn()
  await waitFor(0) // Let React flush
  const end = performance.now()
  return end - start
}

// Error Testing
export const expectToThrow = (fn: () => void, expectedError?: string | RegExp): void => {
  let thrown = false
  let error: Error | undefined

  try {
    fn()
  } catch (e) {
    thrown = true
    error = e as Error
  }

  if (!thrown) {
    throw new Error('Expected function to throw an error, but it did not')
  }

  if (expectedError) {
    if (typeof expectedError === 'string') {
      if (!error?.message.includes(expectedError)) {
        throw new Error(`Expected error message to contain "${expectedError}", got "${error?.message}"`)
      }
    } else if (expectedError instanceof RegExp) {
      if (!expectedError.test(error?.message || '')) {
        throw new Error(`Expected error message to match ${expectedError}, got "${error?.message}"`)
      }
    }
  }
}

// Setup/Teardown Helpers
export const setupTest = () => {
  // Set up mock window.electronAPI
  Object.defineProperty(window, 'electronAPI', {
    value: createMockElectronAPI(),
    writable: true
  })

  // Mock performance API if not available
  if (!window.performance) {
    Object.defineProperty(window, 'performance', {
      value: {
        now: jest.fn(() => Date.now()),
        mark: jest.fn(),
        measure: jest.fn()
      }
    })
  }
}

export const teardownTest = () => {
  // Clean up mocks
  jest.clearAllMocks()
  
  // Reset window properties
  delete (window as any).electronAPI
}

// Snapshot Testing
export const normalizeSnapshot = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(normalizeSnapshot)
  }

  const normalized: any = {}
  for (const [key, value] of Object.entries(obj)) {
    // Remove dynamic values that change between test runs
    if (['id', 'timestamp', 'createdAt', 'updatedAt'].includes(key)) {
      normalized[key] = '<dynamic>'
    } else {
      normalized[key] = normalizeSnapshot(value)
    }
  }

  return normalized
}