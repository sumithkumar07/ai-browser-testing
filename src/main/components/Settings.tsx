// src/main/components/Settings.tsx
import React, { useState, useEffect } from 'react'
import { useAI } from '../hooks/useAI'
import { useBrowser } from '../hooks/useBrowser'

interface SettingsState {
  aiSettings: {
    model: string
    temperature: number
    maxTokens: number
    autoSummarize: boolean
    smartSuggestions: boolean
  }
  browserSettings: {
    defaultSearchEngine: string
    homepage: string
    autoComplete: boolean
    darkMode: boolean
    privacyMode: boolean
  }
  advancedSettings: {
    enableShoppingAssistant: boolean
    enableContentAnalysis: boolean
    enableTaskAutomation: boolean
    enableSmartSearch: boolean
  }
}

const Settings: React.FC = () => {
  const { context, refreshContext } = useAI()
  const { getCurrentUrl } = useBrowser()
  
  const [settings, setSettings] = useState<SettingsState>({
    aiSettings: {
      model: 'llama-3.1-70b-versatile',
      temperature: 0.7,
      maxTokens: 1000,
      autoSummarize: true,
      smartSuggestions: true
    },
    browserSettings: {
      defaultSearchEngine: 'google',
      homepage: 'https://www.google.com',
      autoComplete: true,
      darkMode: true,
      privacyMode: false
    },
    advancedSettings: {
      enableShoppingAssistant: true,
      enableContentAnalysis: true,
      enableTaskAutomation: true,
      enableSmartSearch: true
    }
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'ai' | 'browser' | 'advanced' | 'privacy'>('ai')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const result = await window.electronAPI.getSettings()
      
      if (result.success && result.settings) {
        setSettings(prev => ({ ...prev, ...result.settings }))
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async (newSettings: Partial<SettingsState>) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const updatedSettings = { ...settings, ...newSettings }
      setSettings(updatedSettings)
      
      const result = await window.electronAPI.saveSettings(updatedSettings)
      
      if (!result.success) {
        setError(result.error || 'Failed to save settings')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAISettingChange = (key: keyof SettingsState['aiSettings'], value: any) => {
    const newAISettings = { ...settings.aiSettings, [key]: value }
    saveSettings({ aiSettings: newAISettings })
  }

  const handleBrowserSettingChange = (key: keyof SettingsState['browserSettings'], value: any) => {
    const newBrowserSettings = { ...settings.browserSettings, [key]: value }
    saveSettings({ browserSettings: newBrowserSettings })
  }

  const handleAdvancedSettingChange = async (key: keyof SettingsState['advancedSettings'], value: boolean) => {
    const newAdvancedSettings = { ...settings.advancedSettings, [key]: value }
    saveSettings({ advancedSettings: newAdvancedSettings })
    
    // Enable/disable corresponding features
    const featureMap: Record<string, string> = {
      enableShoppingAssistant: 'shopping_assistant',
      enableContentAnalysis: 'content_analyzer',
      enableTaskAutomation: 'task_automation',
      enableSmartSearch: 'smart_search'
    }
    
    const featureId = featureMap[key]
    if (featureId) {
      if (value) {
        await enableFeature(featureId)
      } else {
        await disableFeature(featureId)
      }
    }
  }

  const handleSetHomepage = async () => {
    const currentUrl = await getCurrentUrl()
    if (currentUrl) {
      handleBrowserSettingChange('homepage', currentUrl)
    }
  }

  const handleTestAIConnection = async () => {
    try {
      await refreshContext()
      setError(null)
    } catch (error) {
      setError('AI connection test failed')
    }
  }

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      loadSettings()
    }
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>⚙️ Settings</h2>
        <div className="settings-tabs">
          <button 
            className={activeTab === 'ai' ? 'active' : ''}
            onClick={() => setActiveTab('ai')}
          >
            🤖 AI Settings
          </button>
          <button 
            className={activeTab === 'browser' ? 'active' : ''}
            onClick={() => setActiveTab('browser')}
          >
            🌐 Browser Settings
          </button>
          <button 
            className={activeTab === 'advanced' ? 'active' : ''}
            onClick={() => setActiveTab('advanced')}
          >
            🚀 Advanced Features
          </button>
          <button 
            className={activeTab === 'privacy' ? 'active' : ''}
            onClick={() => setActiveTab('privacy')}
          >
            🔒 Privacy & Security
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="settings-content">
        {activeTab === 'ai' && (
          <div className="settings-section">
            <h3>AI Assistant Configuration</h3>
            
            <div className="setting-group">
              <label>AI Model:</label>
              <select
                value={settings.aiSettings.model}
                onChange={(e) => handleAISettingChange('model', e.target.value)}
                disabled={isLoading}
              >
                <option value="llama-3.1-70b-versatile">Llama 3.1 70B Versatile</option>
                <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant</option>
                <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
              </select>
            </div>

            <div className="setting-group">
              <label>Temperature: {settings.aiSettings.temperature}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.aiSettings.temperature}
                onChange={(e) => handleAISettingChange('temperature', parseFloat(e.target.value))}
                disabled={isLoading}
              />
              <small>Lower values = more focused, Higher values = more creative</small>
            </div>

            <div className="setting-group">
              <label>Max Tokens: {settings.aiSettings.maxTokens}</label>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={settings.aiSettings.maxTokens}
                onChange={(e) => handleAISettingChange('maxTokens', parseInt(e.target.value))}
                disabled={isLoading}
              />
            </div>

            <div className="setting-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.aiSettings.autoSummarize}
                  onChange={(e) => handleAISettingChange('autoSummarize', e.target.checked)}
                  disabled={isLoading}
                />
                Auto-summarize pages
              </label>
            </div>

            <div className="setting-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.aiSettings.smartSuggestions}
                  onChange={(e) => handleAISettingChange('smartSuggestions', e.target.checked)}
                  disabled={isLoading}
                />
                Enable smart suggestions
              </label>
            </div>

            <div className="setting-group">
              <button onClick={handleTestAIConnection} disabled={isLoading}>
                🔗 Test AI Connection
              </button>
              {context && (
                <div className="ai-status">
                  <p>✅ Connected to {context.model}</p>
                  <p>Agents: {context.agentCount}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'browser' && (
          <div className="settings-section">
            <h3>Browser Configuration</h3>
            
            <div className="setting-group">
              <label>Default Search Engine:</label>
              <select
                value={settings.browserSettings.defaultSearchEngine}
                onChange={(e) => handleBrowserSettingChange('defaultSearchEngine', e.target.value)}
                disabled={isLoading}
              >
                <option value="google">Google</option>
                <option value="bing">Bing</option>
                <option value="duckduckgo">DuckDuckGo</option>
                <option value="yahoo">Yahoo</option>
              </select>
            </div>

            <div className="setting-group">
              <label>Homepage:</label>
              <div className="homepage-setting">
                <input
                  type="url"
                  value={settings.browserSettings.homepage}
                  onChange={(e) => handleBrowserSettingChange('homepage', e.target.value)}
                  disabled={isLoading}
                  placeholder="https://www.google.com"
                />
                <button onClick={handleSetHomepage} disabled={isLoading}>
                  Use Current Page
                </button>
              </div>
            </div>

            <div className="setting-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.browserSettings.autoComplete}
                  onChange={(e) => handleBrowserSettingChange('autoComplete', e.target.checked)}
                  disabled={isLoading}
                />
                Enable address bar autocomplete
              </label>
            </div>

            <div className="setting-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.browserSettings.darkMode}
                  onChange={(e) => handleBrowserSettingChange('darkMode', e.target.checked)}
                  disabled={isLoading}
                />
                Dark mode
              </label>
            </div>

            <div className="setting-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.browserSettings.privacyMode}
                  onChange={(e) => handleBrowserSettingChange('privacyMode', e.target.checked)}
                  disabled={isLoading}
                />
                Enhanced privacy mode
              </label>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="settings-section">
            <h3>Advanced Features</h3>
            
            <div className="features-list">
              {features.map(feature => (
                <div key={feature.id} className="feature-setting">
                  <div className="feature-info">
                    <h4>{feature.name}</h4>
                    <p>{feature.description}</p>
                    <div className="feature-capabilities">
                      {feature.capabilities.map(capability => (
                        <span key={capability} className="capability-tag">
                          {capability.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="feature-toggle">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={feature.isEnabled}
                        onChange={(e) => {
                          if (e.target.checked) {
                            enableFeature(feature.id)
                          } else {
                            disableFeature(feature.id)
                          }
                        }}
                        disabled={isLoading}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="settings-section">
            <h3>Privacy & Security</h3>
            
            <div className="privacy-actions">
              <button onClick={() => window.electronAPI.clearBrowsingData()} disabled={isLoading}>
                🗑️ Clear Browsing Data
              </button>
              <button onClick={() => window.electronAPI.clearCookies()} disabled={isLoading}>
                🍪 Clear Cookies
              </button>
              <button onClick={() => window.electronAPI.clearCache()} disabled={isLoading}>
                💾 Clear Cache
              </button>
              <button onClick={() => window.electronAPI.clearDownloads()} disabled={isLoading}>
                📥 Clear Downloads
              </button>
            </div>

            <div className="privacy-info">
              <h4>Data Collection</h4>
              <p>KAiro Browser collects minimal data to provide AI services:</p>
              <ul>
                <li>Page content for AI analysis (processed locally when possible)</li>
                <li>Search queries for improving suggestions</li>
                <li>Usage statistics for app improvement</li>
              </ul>
              <p>No personal data is shared with third parties.</p>
            </div>
          </div>
        )}
      </div>

      <div className="settings-footer">
        <button onClick={handleResetSettings} disabled={isLoading}>
          🔄 Reset to Defaults
        </button>
        {isLoading && <span className="loading-indicator">Saving...</span>}
      </div>
    </div>
  )
}

export default Settings
