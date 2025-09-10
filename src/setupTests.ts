// Jest setup file for testing configuration
import '@testing-library/jest-dom'

// Mock Electron API globally
const mockElectronAPI = {
  testConnection: jest.fn().mockResolvedValue({ success: true, data: { connected: true } }),
  sendAIMessage: jest.fn().mockResolvedValue({ success: true, result: 'Test response' }),
  getAgentStatus: jest.fn().mockResolvedValue({ success: true, status: { status: 'ready' } }),
  createNewTab: jest.fn().mockResolvedValue({ success: true }),
  closeTab: jest.fn().mockResolvedValue({ success: true }),
  switchTab: jest.fn().mockResolvedValue({ success: true }),
  navigateToUrl: jest.fn().mockResolvedValue({ success: true }),
  goBack: jest.fn().mockResolvedValue({ success: true }),
  goForward: jest.fn().mockResolvedValue({ success: true }),
  refreshPage: jest.fn().mockResolvedValue({ success: true }),
  openUrl: jest.fn().mockResolvedValue({ success: true })
}

Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to hide specific log levels during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    ...window.performance,
    memory: {
      usedJSHeapSize: 10000000,
      totalJSHeapSize: 20000000,
      jsHeapSizeLimit: 100000000
    },
    timing: {
      navigationStart: Date.now() - 1000,
      loadEventEnd: Date.now() - 100,
      domContentLoadedEventEnd: Date.now() - 500
    },
    navigation: {
      type: 0,
      redirectCount: 0
    }
  },
  writable: true
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(), 
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  sessionStorageMock.getItem.mockClear()
  sessionStorageMock.setItem.mockClear()
})