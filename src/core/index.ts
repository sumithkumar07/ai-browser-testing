/**
 * Core Advanced Intelligence Systems Export
 * Single entry point for all advanced systems
 */

// Advanced System Integrator (main entry point)
export { default as AdvancedSystemIntegrator } from './integration/AdvancedSystemIntegrator.js'

// Individual Advanced Systems
export { default as AdvancedAnalyticsDashboard } from './analytics/AdvancedAnalyticsDashboard.js'
export { default as SmartTabOrganizer } from './intelligence/SmartTabOrganizer.js'
export { default as PredictiveNavigationEngine } from './navigation/PredictiveNavigationEngine.js'
export { default as NLPContentIntelligence } from './intelligence/NLPContentIntelligence.js'
export { default as UltraIntelligentSearchEngine } from './services/UltraIntelligentSearchEngine.js'
export { default as SmartBookmarkManager } from './bookmarks/SmartBookmarkManager.js'
export { default as DynamicContextSuggestions } from './suggestions/DynamicContextSuggestions.js'
export { default as AdaptiveConfigurationManager } from './config/AdaptiveConfigurationManager.js'

// Logger
export { createLogger, EnhancedLogger } from './logger/EnhancedLogger'

// Initialize all advanced systems
export async function initializeAdvancedIntelligence() {
  const AdvancedSystemIntegrator = require('./integration/AdvancedSystemIntegrator.js')
  const integrator = AdvancedSystemIntegrator.getInstance()
  return await integrator.initialize()
}

// Get system integrator instance
export function getAdvancedSystemIntegrator() {
  const AdvancedSystemIntegrator = require('./integration/AdvancedSystemIntegrator.js')
  return AdvancedSystemIntegrator.getInstance()
}