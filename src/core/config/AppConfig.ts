/**
 * Application Configuration
 * Centralized configuration management for KAiro Browser
 */

export interface AppConfig {
  app: {
    name: string
    version: string
    environment: 'development' | 'production' | 'test'
  }
  window: {
    width: number
    height: number
    minWidth: number
    minHeight: number
  }
  layout: {
    tabBarHeight: number
    navigationBarHeight: number
    sidebarWidth: number
    browserWidth: number
  }
  ai: {
    provider: string
    maxTokens: number
    temperature: number
    defaultModel: string
  }
  browser: {
    defaultUrl: string
    userAgent: string
    enableDevTools: boolean
  }
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error'
    enableFileLogging: boolean
    maxLogFiles: number
  }
}

const config: AppConfig = {
  app: {
    name: 'KAiro Browser',
    version: '2.0.0',
    environment: process.env.NODE_ENV as any || 'development'
  },
  window: {
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600
  },
  layout: {
    tabBarHeight: 40,
    navigationBarHeight: 60,
    sidebarWidth: 30, // percentage
    browserWidth: 70  // percentage
  },
  ai: {
    provider: 'groq',
    maxTokens: 2048,
    temperature: 0.7,
    defaultModel: 'llama3-8b-8192'
  },
  browser: {
    defaultUrl: 'https://www.google.com',
    userAgent: 'KAiro Browser/2.0.0',
    enableDevTools: process.env.NODE_ENV === 'development'
  },
  logging: {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    enableFileLogging: true,
    maxLogFiles: 5
  }
}

export default config