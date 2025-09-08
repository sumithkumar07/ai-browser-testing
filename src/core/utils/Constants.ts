/**
 * Application Constants
 * Centralized constants for the KAiro Browser
 */

export const APP_CONSTANTS = {
  // Application Info
  APP_NAME: 'KAiro Browser',
  APP_VERSION: '2.0.0',
  
  // Layout Constants (LOCKED - DO NOT MODIFY)
  LAYOUT: {
    TAB_BAR_HEIGHT: 40,
    NAVIGATION_BAR_HEIGHT: 60,
    HEADER_TOTAL_HEIGHT: 100, // TAB_BAR_HEIGHT + NAVIGATION_BAR_HEIGHT
    BROWSER_WINDOW_WIDTH_PERCENT: 70,
    AI_SIDEBAR_WIDTH_PERCENT: 30,
    MIN_WINDOW_WIDTH: 800,
    MIN_WINDOW_HEIGHT: 600,
    DEFAULT_WINDOW_WIDTH: 1400,
    DEFAULT_WINDOW_HEIGHT: 900
  },
  
  // Tab Constants
  TABS: {
    MIN_WIDTH: 150,
    MAX_WIDTH: 200,
    HEIGHT: 32,
    DEFAULT_TITLE: 'New Tab',
    MAX_TITLE_LENGTH: 50
  },
  
  // AI Constants
  AI: {
    MAX_MESSAGE_LENGTH: 5000,
    MAX_TOKENS: 2048,
    DEFAULT_TEMPERATURE: 0.7,
    TYPING_INDICATOR_DELAY: 100,
    CONNECTION_TIMEOUT: 10000
  },
  
  // Browser Constants
  BROWSER: {
    DEFAULT_URL: 'https://www.google.com',
    SEARCH_URL: 'https://www.google.com/search?q=',
    MAX_HISTORY_ITEMS: 1000,
    MAX_BOOKMARKS: 500
  },
  
  // Agent Constants
  AGENTS: {
    MAX_CONCURRENT_TASKS: 3,
    TASK_TIMEOUT: 300000, // 5 minutes
    STATUS_UPDATE_INTERVAL: 1000,
    MAX_RESEARCH_SITES: 5
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    TABS: 'kairo_tabs',
    BOOKMARKS: 'kairo_bookmarks',
    HISTORY: 'kairo_history',
    SETTINGS: 'kairo_settings',
    AI_CONVERSATIONS: 'kairo_ai_conversations'
  },
  
  // Event Names
  EVENTS: {
    TAB_CREATED: 'tab-created',
    TAB_CLOSED: 'tab-closed',
    TAB_SWITCHED: 'tab-switched',
    AI_MESSAGE: 'ai-message',
    AGENT_UPDATE: 'agent-update',
    BROWSER_NAVIGATE: 'browser-navigate'
  },
  
  // File Extensions
  SUPPORTED_FILES: {
    IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    DOCUMENTS: ['.pdf', '.doc', '.docx', '.txt', '.md'],
    ARCHIVES: ['.zip', '.rar', '.7z', '.tar', '.gz']
  },
  
  // Timeouts & Intervals
  TIMEOUTS: {
    NAVIGATION: 30000,
    AI_RESPONSE: 30000,
    AGENT_TASK: 300000,
    AUTO_SAVE: 1000,
    CONNECTION_CHECK: 5000
  },

  // Validation Limits
  LIMITS: {
    MAX_TASK_LENGTH: 10000,
    MAX_URL_LENGTH: 2048,
    MAX_TAB_ID_LENGTH: 100,
    MAX_MESSAGE_CONTENT_LENGTH: 50000,
    MIN_TASK_LENGTH: 1
  }
} as const

// Type for getting constant values
export type AppConstants = typeof APP_CONSTANTS

// Utility functions for constants
export const getLayoutConstants = () => APP_CONSTANTS.LAYOUT
export const getTabConstants = () => APP_CONSTANTS.TABS
export const getAIConstants = () => APP_CONSTANTS.AI
export const getBrowserConstants = () => APP_CONSTANTS.BROWSER