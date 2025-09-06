/**
 * Event Emitter
 * Type-safe event management system
 */

import { createLogger } from '../logger/Logger'

const logger = createLogger('EventEmitter')

export type EventHandler<T = any> = (data: T) => void | Promise<void>

export interface EventSubscription {
  unsubscribe(): void
}

class EventEmitter<EventMap extends Record<string, any> = Record<string, any>> {
  private listeners = new Map<keyof EventMap, Set<EventHandler<any>>>()
  private onceListeners = new Map<keyof EventMap, Set<EventHandler<any>>>()
  private maxListeners = 100

  /**
   * Subscribe to an event
   */
  on<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>
  ): EventSubscription {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    const handlers = this.listeners.get(event)!
    
    if (handlers.size >= this.maxListeners) {
      logger.warn(`Maximum listeners (${this.maxListeners}) exceeded for event: ${String(event)}`)
    }

    handlers.add(handler)

    logger.debug(`Added listener for event: ${String(event)}`)

    return {
      unsubscribe: () => this.off(event, handler)
    }
  }

  /**
   * Subscribe to an event once
   */
  once<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>
  ): EventSubscription {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set())
    }

    const handlers = this.onceListeners.get(event)!
    handlers.add(handler)

    logger.debug(`Added one-time listener for event: ${String(event)}`)

    return {
      unsubscribe: () => {
        handlers.delete(handler)
      }
    }
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>
  ): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.listeners.delete(event)
      }
    }

    const onceHandlers = this.onceListeners.get(event)
    if (onceHandlers) {
      onceHandlers.delete(handler)
      if (onceHandlers.size === 0) {
        this.onceListeners.delete(event)
      }
    }

    logger.debug(`Removed listener for event: ${String(event)}`)
  }

  /**
   * Emit an event
   */
  async emit<K extends keyof EventMap>(
    event: K,
    data: EventMap[K]
  ): Promise<void> {
    const timestamp = Date.now()
    logger.debug(`Emitting event: ${String(event)}`, { timestamp, data })

    // Handle regular listeners
    const handlers = this.listeners.get(event)
    if (handlers) {
      const promises: Promise<void>[] = []
      
      for (const handler of handlers) {
        try {
          const result = handler(data)
          if (result instanceof Promise) {
            promises.push(result)
          }
        } catch (error) {
          logger.error(`Error in event handler for ${String(event)}:`, error as Error)
        }
      }

      // Wait for all async handlers
      if (promises.length > 0) {
        try {
          await Promise.all(promises)
        } catch (error) {
          logger.error(`Error in async event handlers for ${String(event)}:`, error as Error)
        }
      }
    }

    // Handle once listeners
    const onceHandlers = this.onceListeners.get(event)
    if (onceHandlers) {
      const promises: Promise<void>[] = []
      
      // Convert to array to avoid modification during iteration
      const handlersArray = Array.from(onceHandlers)
      onceHandlers.clear() // Clear once listeners immediately

      for (const handler of handlersArray) {
        try {
          const result = handler(data)
          if (result instanceof Promise) {
            promises.push(result)
          }
        } catch (error) {
          logger.error(`Error in once event handler for ${String(event)}:`, error as Error)
        }
      }

      // Wait for all async handlers
      if (promises.length > 0) {
        try {
          await Promise.all(promises)
        } catch (error) {
          logger.error(`Error in async once event handlers for ${String(event)}:`, error as Error)
        }
      }

      // Clean up empty set
      if (onceHandlers.size === 0) {
        this.onceListeners.delete(event)
      }
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount<K extends keyof EventMap>(event: K): number {
    const regular = this.listeners.get(event)?.size || 0
    const once = this.onceListeners.get(event)?.size || 0
    return regular + once
  }

  /**
   * Get all event names that have listeners
   */
  eventNames(): (keyof EventMap)[] {
    const regularEvents = Array.from(this.listeners.keys())
    const onceEvents = Array.from(this.onceListeners.keys())
    return Array.from(new Set([...regularEvents, ...onceEvents]))
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners<K extends keyof EventMap>(event?: K): void {
    if (event) {
      this.listeners.delete(event)
      this.onceListeners.delete(event)
      logger.debug(`Removed all listeners for event: ${String(event)}`)
    } else {
      this.listeners.clear()
      this.onceListeners.clear()
      logger.debug('Removed all listeners for all events')
    }
  }

  /**
   * Set maximum number of listeners per event
   */
  setMaxListeners(max: number): void {
    this.maxListeners = max
  }

  /**
   * Get maximum number of listeners per event
   */
  getMaxListeners(): number {
    return this.maxListeners
  }
}

// Global app event emitter with comprehensive typed events
export interface AppEvents {
  // Core app events
  'app:initialized': { timestamp: number }
  'app:error': { error: Error; context?: string }
  
  // Tab events
  'tab:created': { tabId: string; url: string }
  'tab:closed': { tabId: string }
  'tab:switched': { tabId: string; previousTabId?: string }
  
  // AI events
  'ai:message': { message: string; response: string }
  'ai:context-updated': { content: string }
  
  // Agent events
  'agent:task-started': { taskId: string; description: string }
  'agent:task-completed': { taskId: string; result: any }
  'agent:task-failed': { taskId: string; error: string }
  'agent:update': any // AgentStatus - using any to avoid circular import
  'agent:handoff-completed': { fromAgent: string; toAgent: string; taskId: string }
  'agent:context-updated': { agentId: string; context: any }
  'agent:collaboration-cancelled': { agentIds: string[]; reason: string }
  'agent:collaboration-completed': { agentIds: string[]; result: any }
  
  // Browser events
  'browser:navigate': { tabId: string; url: string }
  'page:loaded': { tabId: string; url: string; title: string }
  
  // Settings events
  'settings:changed': { key: string; value: any }
  
  // Performance events
  'performance:metric': { name: string; value: number; timestamp: number }
  'performance:alert': { type: string; message: string; severity: 'low' | 'medium' | 'high' }
  
  // Memory management events
  'memory:cleanup-complete': { freedMemory: number; timestamp: number }
  
  // Conversation events
  'conversation:started': { conversationId: string; timestamp: number }
  'conversation:context-updated': { conversationId: string; context: any }
  'conversation:message-added': { conversationId: string; message: AIMessage }
  
  // Startup events
  'startup:complete': { duration: number; timestamp: number }
  'startup:failed': { error: Error; timestamp: number }
  'startup:progress': { stage: string; progress: number }
  
  // Error recovery events
  'error:recovered': { error: Error; recovery: string }
  'error:unrecoverable': { error: Error; context: string }
}

export const appEvents = new EventEmitter<AppEvents>()

export default EventEmitter