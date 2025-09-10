/**
 * Service Manager
 * Centralized service management and dependency injection
 */

import { createLogger } from '../logger/EnhancedLogger'
import config from '../config/AppConfig'

const logger = createLogger('ServiceManager')

export interface ServiceConfig {
  singleton?: boolean
  dependencies?: string[]
  lazy?: boolean
}

export interface ServiceDefinition {
  name: string
  factory: (...deps: any[]) => any
  config: ServiceConfig
  instance?: any
}

class ServiceManager {
  private static instance: ServiceManager
  private services = new Map<string, ServiceDefinition>()
  private instances = new Map<string, any>()
  private initializing = new Set<string>()

  private constructor() {}

  static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager()
    }
    return ServiceManager.instance
  }

  /**
   * Register a service
   */
  register<T>(
    name: string,
    factory: (...deps: any[]) => T,
    config: ServiceConfig = { singleton: true }
  ): void {
    if (this.services.has(name)) {
      logger.warn(`Service ${name} already registered, overwriting`)
    }

    this.services.set(name, {
      name,
      factory,
      config
    })

    logger.debug(`Registered service: ${name}`, config)
  }

  /**
   * Resolve a service and its dependencies
   */
  resolve<T>(name: string): T {
    const service = this.services.get(name)
    if (!service) {
      throw new Error(`Service not found: ${name}`)
    }

    // Check for circular dependencies
    if (this.initializing.has(name)) {
      throw new Error(`Circular dependency detected for service: ${name}`)
    }

    // Return existing singleton instance
    if (service.config.singleton && this.instances.has(name)) {
      return this.instances.get(name)
    }

    this.initializing.add(name)

    try {
      // Resolve dependencies
      const dependencies = service.config.dependencies || []
      const resolvedDeps = dependencies.map(dep => this.resolve(dep))

      // Create instance
      const instance = service.factory(...resolvedDeps)

      // Cache singleton instance
      if (service.config.singleton) {
        this.instances.set(name, instance)
      }

      logger.debug(`Resolved service: ${name}`)
      return instance
    } finally {
      this.initializing.delete(name)
    }
  }

  /**
   * Check if service is registered
   */
  has(name: string): boolean {
    return this.services.has(name)
  }

  /**
   * Get all registered service names
   */
  getServiceNames(): string[] {
    return Array.from(this.services.keys())
  }

  /**
   * Clear all services (for testing)
   */
  clear(): void {
    this.services.clear()
    this.instances.clear()
    this.initializing.clear()
  }

  /**
   * Initialize all non-lazy services
   */
  async initializeServices(): Promise<void> {
    logger.info('Initializing services...')
    
    const nonLazyServices = Array.from(this.services.entries())
      .filter(([_, service]) => !service.config.lazy)
      .map(([name]) => name)

    for (const serviceName of nonLazyServices) {
      try {
        await this.resolve(serviceName)
        logger.debug(`Initialized service: ${serviceName}`)
      } catch (error) {
        logger.error(`Failed to initialize service: ${serviceName}`, error)
        throw error
      }
    }

    logger.info(`Initialized ${nonLazyServices.length} services`)
  }
}

// Singleton instance
const serviceManager = ServiceManager.getInstance()

// Convenience functions
export const registerService = serviceManager.register.bind(serviceManager)
export const resolveService = serviceManager.resolve.bind(serviceManager)
export const hasService = serviceManager.has.bind(serviceManager)
export const initializeServices = serviceManager.initializeServices.bind(serviceManager)

export default serviceManager