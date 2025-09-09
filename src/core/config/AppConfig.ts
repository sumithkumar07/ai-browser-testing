/**
 * Enhanced Application Configuration
 * Centralized configuration management with environment-specific settings
 */

export interface APIConfig {
  groq: {
    apiKey: string
    baseUrl: string
    timeout: number
    maxRetries: number
    defaultModel: string
    fallbackModel: string
  }
  endpoints: {
    search: string
    products: string
    bookmarks: string
    history: string
  }
}

export interface UIConfig {
  theme: 'light' | 'dark' | 'auto'
  animations: boolean
  sidebar: {
    defaultWidth: number
    minWidth: number
    maxWidth: number
  }
  tabs: {
    maxTabs: number
    showFavicons: boolean
    enablePreview: boolean
  }
}

export interface PerformanceConfig {
  cache: {
    maxSize: number
    ttl: number
  }
  database: {
    connectionPool: number
    queryTimeout: number
  }
  networking: {
    timeout: number
    retryAttempts: number
    concurrentRequests: number
  }
}

export interface SecurityConfig {
  contentSecurity: {
    allowedDomains: string[]
    sanitizeHtml: boolean
    blockMixedContent: boolean
  }
  privacy: {
    trackingProtection: boolean
    cookiePolicy: 'strict' | 'lax' | 'none'
    localStorageEncryption: boolean
  }
}

export interface AppConfig {
  version: string
  environment: 'development' | 'production' | 'test'
  api: APIConfig
  ui: UIConfig
  performance: PerformanceConfig
  security: SecurityConfig
  features: {
    enableBookmarks: boolean
    enableHistory: boolean
    enableAI: boolean
    enableExtensions: boolean
    enableAnalytics: boolean
  }
}

class ConfigManager {
  private static instance: ConfigManager
  private config: AppConfig | null = null

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  /**
   * Initialize configuration
   */
  async initialize(): Promise<void> {
    this.config = await this.loadConfig()
    console.log('⚙️ Configuration loaded:', this.config.environment)
  }

  /**
   * Load configuration based on environment
   */
  private async loadConfig(): Promise<AppConfig> {
    const environment = (process.env.NODE_ENV as any) || 'development'
    
    const baseConfig: AppConfig = {
      version: process.env.APP_VERSION || '2.0.0',
      environment,
      api: {
        groq: {
          apiKey: process.env.GROQ_API_KEY || '',
          baseUrl: process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1',
          timeout: 30000,
          maxRetries: 3,
          defaultModel: 'llama-3.3-70b-versatile',
          fallbackModel: 'llama3-8b-8192'
        },
        endpoints: {
          search: '/api/search',
          products: '/api/products',
          bookmarks: '/api/bookmarks',
          history: '/api/history'
        }
      },
      ui: {
        theme: 'auto',
        animations: true,
        sidebar: {
          defaultWidth: 400,
          minWidth: 300,
          maxWidth: 600
        },
        tabs: {
          maxTabs: 20,
          showFavicons: true,
          enablePreview: true
        }
      },
      performance: {
        cache: {
          maxSize: 100 * 1024 * 1024, // 100MB
          ttl: 3600000 // 1 hour
        },
        database: {
          connectionPool: 5,
          queryTimeout: 5000
        },
        networking: {
          timeout: 10000,
          retryAttempts: 3,
          concurrentRequests: 6
        }
      },
      security: {
        contentSecurity: {
          allowedDomains: [
            'localhost',
            '*.google.com',
            '*.github.com',
            '*.stackoverflow.com'
          ],
          sanitizeHtml: true,
          blockMixedContent: true
        },
        privacy: {
          trackingProtection: true,
          cookiePolicy: 'lax',
          localStorageEncryption: false
        }
      },
      features: {
        enableBookmarks: true,
        enableHistory: true,
        enableAI: true,
        enableExtensions: false,
        enableAnalytics: false
      }
    }

    // Environment-specific overrides
    if (environment === 'production') {
      baseConfig.ui.animations = true
      baseConfig.performance.cache.maxSize = 200 * 1024 * 1024 // 200MB
      baseConfig.security.privacy.localStorageEncryption = true
      baseConfig.features.enableAnalytics = true
    } else if (environment === 'development') {
      baseConfig.performance.networking.timeout = 30000
      baseConfig.features.enableExtensions = true
    }

    return baseConfig
  }

  /**
   * Get current configuration
   */
  getConfig(): AppConfig {
    if (!this.config) {
      throw new Error('Configuration not initialized. Call initialize() first.')
    }
    return this.config
  }

  /**
   * Get specific configuration section
   */
  get<T extends keyof AppConfig>(section: T): AppConfig[T] {
    return this.getConfig()[section]
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<AppConfig>): void {
    if (!this.config) {
      throw new Error('Configuration not initialized')
    }

    this.config = {
      ...this.config,
      ...updates
    }

    console.log('⚙️ Configuration updated')
  }

  /**
   * Get environment-specific setting
   */
  isDevelopment(): boolean {
    return this.getConfig().environment === 'development'
  }

  isProduction(): boolean {
    return this.getConfig().environment === 'production'
  }

  isTest(): boolean {
    return this.getConfig().environment === 'test'
  }

  /**
   * Validate configuration
   */
  validate(): boolean {
    const config = this.getConfig()
    
    // Check required settings
    if (!config.api.groq.apiKey) {
      console.error('❌ GROQ API key is required')
      return false
    }

    if (!config.version) {
      console.error('❌ App version is required')
      return false
    }

    // Validate URLs
    try {
      new URL(config.api.groq.baseUrl)
    } catch {
      console.error('❌ Invalid GROQ API base URL')
      return false
    }

    console.log('✅ Configuration validation passed')
    return true
  }

  /**
   * Export configuration for debugging
   */
  exportConfig(): string {
    const config = this.getConfig()
    
    // Sanitize sensitive data
    const sanitized = {
      ...config,
      api: {
        ...config.api,
        groq: {
          ...config.api.groq,
          apiKey: config.api.groq.apiKey ? '***REDACTED***' : ''
        }
      }
    }

    return JSON.stringify(sanitized, null, 2)
  }
}

// Create singleton instance
export const configManager = ConfigManager.getInstance()

export default configManager