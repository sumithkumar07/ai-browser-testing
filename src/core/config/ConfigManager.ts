// Enhanced Configuration Management System
// Runtime configuration with validation and persistence

import { z } from 'zod'

// Configuration schemas
const GroqConfigSchema = z.object({
  apiKey: z.string().min(1, 'GROQ API key is required'),
  apiUrl: z.string().url('Invalid GROQ API URL'),
  model: z.string().default('llama-3.3-70b-versatile'),
  timeout: z.number().min(1000).max(120000).default(30000),
  maxRetries: z.number().min(1).max(10).default(3),
  rateLimitWindow: z.number().min(1000).default(60000),
  maxRequestsPerWindow: z.number().min(1).default(100)
})

const DatabaseConfigSchema = z.object({
  path: z.string().min(1, 'Database path is required'),
  maxSize: z.number().min(1024 * 1024).default(100 * 1024 * 1024), // 100MB default
  backupEnabled: z.boolean().default(true),
  backupInterval: z.number().min(60000).default(3600000), // 1 hour default
  maxBackups: z.number().min(1).default(10),
  healthCheckInterval: z.number().min(30000).default(60000) // 1 minute default
})

const UIConfigSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  sidebarWidth: z.number().min(200).max(800).default(400),
  enableAnimations: z.boolean().default(true),
  enableGlassMorphism: z.boolean().default(true),
  fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
  language: z.string().default('en')
})

const PerformanceConfigSchema = z.object({
  enableMonitoring: z.boolean().default(true),
  monitoringInterval: z.number().min(30000).default(300000), // 5 minutes default
  maxMetricsHistory: z.number().min(100).default(1000),
  enableBackgroundTasks: z.boolean().default(true),
  maxConcurrentTasks: z.number().min(1).max(10).default(3)
})

const LoggingConfigSchema = z.object({
  level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  enableConsole: z.boolean().default(true),
  enablePersistence: z.boolean().default(true),
  maxLogEntries: z.number().min(100).default(1000),
  flushInterval: z.number().min(10000).default(30000) // 30 seconds default
})

const AppConfigSchema = z.object({
  appName: z.string().default('KAiro Desktop Browser'),
  version: z.string().default('2.0.0'),
  environment: z.enum(['development', 'production', 'test']).default('development'),
  debug: z.boolean().default(false),
  defaultHomePage: z.string().url().default('https://www.google.com'),
  defaultSearchEngine: z.string().url().default('https://www.google.com/search?q=')
})

// Main configuration schema
const ConfigSchema = z.object({
  groq: GroqConfigSchema,
  database: DatabaseConfigSchema,
  ui: UIConfigSchema,
  performance: PerformanceConfigSchema,
  logging: LoggingConfigSchema,
  app: AppConfigSchema
})

export type AppConfig = z.infer<typeof ConfigSchema>
export type GroqConfig = z.infer<typeof GroqConfigSchema>
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>

interface ConfigValidationError {
  path: string
  message: string
  code: string
}

interface ConfigChangeListener {
  (newConfig: AppConfig, oldConfig: AppConfig, changedKeys: string[]): void
}

export class ConfigManager {
  private static instance: ConfigManager
  private config: AppConfig
  private listeners: ConfigChangeListener[] = []
  private isInitialized = false

  private constructor() {
    this.config = this.getDefaultConfig()
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  private getDefaultConfig(): AppConfig {
    return ConfigSchema.parse({
      groq: {},
      database: {},
      ui: {},
      performance: {},
      logging: {},
      app: {}
    })
  }

  async initialize(): Promise<void> {
    try {
      console.log('🔧 Initializing Configuration Manager...')

      // Load from environment variables
      await this.loadFromEnvironment()

      // Load from persistent storage
      await this.loadFromStorage()

      // Validate configuration
      await this.validateConfig()

      this.isInitialized = true
      console.log('✅ Configuration Manager initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Configuration Manager:', error)
      throw error
    }
  }

  private async loadFromEnvironment(): Promise<void> {
    try {
      const envConfig: Partial<AppConfig> = {}

      // GROQ configuration
      if (process.env.GROQ_API_KEY) {
        envConfig.groq = {
          ...this.config.groq,
          apiKey: process.env.GROQ_API_KEY,
          apiUrl: process.env.GROQ_API_URL || this.config.groq.apiUrl
        }
      }

      // Database configuration
      if (process.env.DB_PATH) {
        envConfig.database = {
          ...this.config.database,
          path: process.env.DB_PATH
        }
      }

      // App configuration
      envConfig.app = {
        ...this.config.app,
        appName: process.env.APP_NAME || this.config.app.appName,
        version: process.env.APP_VERSION || this.config.app.version,
        environment: (process.env.NODE_ENV as any) || this.config.app.environment,
        debug: process.env.DEBUG === 'true',
        defaultHomePage: process.env.DEFAULT_HOME_PAGE || this.config.app.defaultHomePage,
        defaultSearchEngine: process.env.DEFAULT_SEARCH_ENGINE || this.config.app.defaultSearchEngine
      }

      // Merge with existing configuration
      this.config = { ...this.config, ...envConfig }
    } catch (error) {
      console.warn('⚠️ Failed to load environment configuration:', error)
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      if (typeof window === 'undefined') return

      const stored = localStorage.getItem('kairo_config')
      if (stored) {
        const parsedConfig = JSON.parse(stored)
        this.config = { ...this.config, ...parsedConfig }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load configuration from storage:', error)
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      if (typeof window === 'undefined') return

      localStorage.setItem('kairo_config', JSON.stringify(this.config))
    } catch (error) {
      console.error('❌ Failed to save configuration to storage:', error)
    }
  }

  private async validateConfig(): Promise<void> {
    try {
      this.config = ConfigSchema.parse(this.config)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ConfigValidationError[] = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        }))

        console.error('❌ Configuration validation failed:', validationErrors)
        throw new Error(`Configuration validation failed: ${validationErrors.map(e => `${e.path}: ${e.message}`).join(', ')}`)
      }
      throw error
    }
  }

  // Getters
  get<K extends keyof AppConfig>(section: K): AppConfig[K] {
    if (!this.isInitialized) {
      console.warn('⚠️ Configuration Manager not initialized, returning default values')
    }
    return this.config[section]
  }

  getAll(): AppConfig {
    return { ...this.config }
  }

  // Setters
  async set<K extends keyof AppConfig>(section: K, value: Partial<AppConfig[K]>): Promise<void> {
    const oldConfig = { ...this.config }
    const newSectionConfig = { ...this.config[section], ...value }
    
    // Validate the new section configuration
    try {
      const sectionSchema = this.getSectionSchema(section)
      const validatedSection = sectionSchema.parse(newSectionConfig)
      
      this.config[section] = validatedSection
      await this.validateConfig()
      await this.saveToStorage()

      // Notify listeners
      this.notifyListeners(this.config, oldConfig, [section])
    } catch (error) {
      // Rollback on validation error
      this.config = oldConfig
      throw error
    }
  }

  async update(updates: Partial<AppConfig>): Promise<void> {
    const oldConfig = { ...this.config }
    const newConfig = { ...this.config, ...updates }

    try {
      this.config = ConfigSchema.parse(newConfig)
      await this.saveToStorage()

      // Determine changed keys
      const changedKeys = Object.keys(updates)
      this.notifyListeners(this.config, oldConfig, changedKeys)
    } catch (error) {
      // Rollback on validation error
      this.config = oldConfig
      throw error
    }
  }

  private getSectionSchema(section: keyof AppConfig) {
    const schemas = {
      groq: GroqConfigSchema,
      database: DatabaseConfigSchema,
      ui: UIConfigSchema,
      performance: PerformanceConfigSchema,
      logging: LoggingConfigSchema,
      app: AppConfigSchema
    }
    return schemas[section]
  }

  // Listeners
  addChangeListener(listener: ConfigChangeListener): void {
    this.listeners.push(listener)
  }

  removeChangeListener(listener: ConfigChangeListener): void {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  private notifyListeners(newConfig: AppConfig, oldConfig: AppConfig, changedKeys: string[]): void {
    this.listeners.forEach(listener => {
      try {
        listener(newConfig, oldConfig, changedKeys)
      } catch (error) {
        console.error('❌ Configuration change listener error:', error)
      }
    })
  }

  // Utility methods
  reset(): void {
    const oldConfig = { ...this.config }
    this.config = this.getDefaultConfig()
    this.saveToStorage()
    this.notifyListeners(this.config, oldConfig, Object.keys(this.config))
  }

  async reload(): Promise<void> {
    await this.loadFromStorage()
    await this.validateConfig()
  }

  export(): string {
    return JSON.stringify(this.config, null, 2)
  }

  async import(configJson: string): Promise<void> {
    try {
      const importedConfig = JSON.parse(configJson)
      const validatedConfig = ConfigSchema.parse(importedConfig)
      
      const oldConfig = { ...this.config }
      this.config = validatedConfig
      await this.saveToStorage()
      
      this.notifyListeners(this.config, oldConfig, Object.keys(this.config))
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Health check
  async healthCheck(): Promise<{
    isValid: boolean
    errors: ConfigValidationError[]
    warnings: string[]
  }> {
    const warnings: string[] = []
    let isValid = true
    let errors: ConfigValidationError[] = []

    try {
      ConfigSchema.parse(this.config)
    } catch (error) {
      isValid = false
      if (error instanceof z.ZodError) {
        errors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      }
    }

    // Check for potential issues
    if (this.config.groq.apiKey.startsWith('your_')) {
      warnings.push('GROQ API key appears to be a placeholder')
    }

    if (this.config.database.maxSize < 50 * 1024 * 1024) {
      warnings.push('Database max size is quite small (< 50MB)')
    }

    return { isValid, errors, warnings }
  }

  getInitializationStatus(): boolean {
    return this.isInitialized
  }
}

// Convenience functions
export const config = ConfigManager.getInstance()

export function getConfig(): AppConfig {
  return config.getAll()
}

export function getGroqConfig(): GroqConfig {
  return config.get('groq')
}

export function getDatabaseConfig(): DatabaseConfig {
  return config.get('database')
}