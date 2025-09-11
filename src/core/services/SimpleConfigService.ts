// Simple Configuration Service - Lightweight & Robust
// Replaces complex ConfigManager with essential functionality only

interface SimpleConfig {
  groqApiKey: string
  appName: string
  version: string
  environment: 'development' | 'production' | 'test'
  defaultHomePage: string
}

class SimpleConfigService {
  private static instance: SimpleConfigService
  private config: SimpleConfig

  private constructor() {
    this.config = this.loadConfig()
  }

  static getInstance(): SimpleConfigService {
    if (!SimpleConfigService.instance) {
      SimpleConfigService.instance = new SimpleConfigService()
    }
    return SimpleConfigService.instance
  }

  private loadConfig(): SimpleConfig {
    return {
      groqApiKey: process.env.GROQ_API_KEY || '',
      appName: process.env.APP_NAME || 'KAiro Desktop Browser',
      version: process.env.APP_VERSION || '2.0.0',
      environment: (process.env.NODE_ENV as any) || 'development',
      defaultHomePage: process.env.DEFAULT_HOME_PAGE || 'https://www.google.com'
    }
  }

  get<K extends keyof SimpleConfig>(key: K): SimpleConfig[K] {
    return this.config[key]
  }

  getAll(): SimpleConfig {
    return { ...this.config }
  }

  isProduction(): boolean {
    return this.config.environment === 'production'
  }

  isDevelopment(): boolean {
    return this.config.environment === 'development'
  }

  hasGroqApiKey(): boolean {
    return !!this.config.groqApiKey && !this.config.groqApiKey.startsWith('your_')
  }
}

export const simpleConfig = SimpleConfigService.getInstance()
export default simpleConfig