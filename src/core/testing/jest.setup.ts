/**
 * Jest Setup
 * Global test configuration and mocks
 */

import { setupTest } from './TestUtils'

// Setup globals before each test
beforeEach(() => {
  setupTest()
})

// Mock console methods to reduce noise in tests
const originalConsole = { ...console }

beforeAll(() => {
  console.log = jest.fn()
  console.info = jest.fn()
  console.warn = jest.fn()
  console.error = jest.fn()
  console.debug = jest.fn()
})

afterAll(() => {
  Object.assign(console, originalConsole)
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
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
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
})

// Global test timeout
jest.setTimeout(10000)