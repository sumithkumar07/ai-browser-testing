import React, { useState } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'
import './SettingsPanel.css'

export const SettingsPanel: React.FC = () => {
  const {
    settings,
    isSettingsOpen,
    updateSettings,
    resetSettings,
    closeSettings,
    exportSettings,
    importSettings
  } = useSettingsStore()
  
  const [activeTab, setActiveTab] = useState('general')
  const [importText, setImportText] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)

  if (!isSettingsOpen) return null

  const handleExport = () => {
    const settingsJson = exportSettings()
    const blob = new Blob([settingsJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'kairo-settings.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    if (importSettings(importText)) {
      setShowImportModal(false)
      setImportText('')
    } else {
      alert('Failed to import settings. Please check the JSON format.')
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
    { id: 'performance', label: 'Performance', icon: '🚀' },
    { id: 'ai', label: 'AI Settings', icon: '🤖' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'advanced', label: 'Advanced', icon: '🔧' }
  ]

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        {/* Header */}
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={closeSettings}>
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="settings-section">
              <h3>General Settings</h3>
              
              <div className="setting-group">
                <label>Default Search Engine</label>
                <select
                  value={settings.defaultSearchEngine}
                  onChange={(e) => updateSettings({ defaultSearchEngine: e.target.value })}
                >
                  <option value="https://www.google.com/search?q=">Google</option>
                  <option value="https://www.bing.com/search?q=">Bing</option>
                  <option value="https://duckduckgo.com/?q=">DuckDuckGo</option>
                  <option value="https://www.baidu.com/s?wd=">Baidu</option>
                </select>
              </div>

              <div className="setting-group">
                <label>Homepage</label>
                <input
                  type="url"
                  value={settings.homepage}
                  onChange={(e) => updateSettings({ homepage: e.target.value })}
                  placeholder="https://www.google.com"
                />
              </div>

              <div className="setting-group">
                <label>New Tab Page</label>
                <select
                  value={settings.newTabPage}
                  onChange={(e) => updateSettings({ newTabPage: e.target.value as any })}
                >
                  <option value="blank">Blank Page</option>
                  <option value="homepage">Homepage</option>
                  <option value="custom">Custom URL</option>
                </select>
              </div>

              {settings.newTabPage === 'custom' && (
                <div className="setting-group">
                  <label>Custom New Tab URL</label>
                  <input
                    type="url"
                    value={settings.customNewTabUrl}
                    onChange={(e) => updateSettings({ customNewTabUrl: e.target.value })}
                    placeholder="https://www.google.com"
                  />
                </div>
              )}
            </div>
          )}

          {/* Privacy & Security */}
          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h3>Privacy & Security</h3>
              
              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.blockAds}
                    onChange={(e) => updateSettings({ blockAds: e.target.checked })}
                  />
                  Block Ads
                </label>
              </div>

              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.blockTrackers}
                    onChange={(e) => updateSettings({ blockTrackers: e.target.checked })}
                  />
                  Block Trackers
                </label>
              </div>

              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.enableIncognito}
                    onChange={(e) => updateSettings({ enableIncognito: e.target.checked })}
                  />
                  Enable Incognito Mode
                </label>
              </div>

              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.clearDataOnExit}
                    onChange={(e) => updateSettings({ clearDataOnExit: e.target.checked })}
                  />
                  Clear Data on Exit
                </label>
              </div>

              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.allowCookies}
                    onChange={(e) => updateSettings({ allowCookies: e.target.checked })}
                  />
                  Allow Cookies
                </label>
              </div>
            </div>
          )}

          {/* Performance */}
          {activeTab === 'performance' && (
            <div className="settings-section">
              <h3>Performance</h3>
              
              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.enableHardwareAcceleration}
                    onChange={(e) => updateSettings({ enableHardwareAcceleration: e.target.checked })}
                  />
                  Enable Hardware Acceleration
                </label>
              </div>

              <div className="setting-group">
                <label>Maximum Tabs</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.maxTabs}
                  onChange={(e) => updateSettings({ maxTabs: parseInt(e.target.value) })}
                />
              </div>

              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.autoCloseInactiveTabs}
                    onChange={(e) => updateSettings({ autoCloseInactiveTabs: e.target.checked })}
                  />
                  Auto-close Inactive Tabs
                </label>
              </div>

              {settings.autoCloseInactiveTabs && (
                <div className="setting-group">
                  <label>Inactive Tab Timeout (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={settings.inactiveTabTimeout}
                    onChange={(e) => updateSettings({ inactiveTabTimeout: parseInt(e.target.value) })}
                  />
                </div>
              )}
            </div>
          )}

          {/* AI Settings */}
          {activeTab === 'ai' && (
            <div className="settings-section">
              <h3>AI Settings</h3>
              
              <div className="setting-group">
                <label>AI Model</label>
                <select
                  value={settings.aiModel}
                  onChange={(e) => updateSettings({ aiModel: e.target.value })}
                >
                  <option value="gemma2-9b-it">Gemma2 9B (Fast)</option>
                  <option value="llama3-8b-8192">Llama3 8B (Balanced)</option>
                  <option value="mixtral-8x7b-32768">Mixtral 8x7B (Powerful)</option>
                </select>
              </div>

              <div className="setting-group">
                <label>AI Temperature: {settings.aiTemperature}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.aiTemperature}
                  onChange={(e) => updateSettings({ aiTemperature: parseFloat(e.target.value) })}
                />
              </div>

              <div className="setting-group">
                <label>Max Tokens</label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={settings.aiMaxTokens}
                  onChange={(e) => updateSettings({ aiMaxTokens: parseInt(e.target.value) })}
                />
              </div>

              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.enableVoiceCommands}
                    onChange={(e) => updateSettings({ enableVoiceCommands: e.target.checked })}
                  />
                  Enable Voice Commands
                </label>
              </div>

              <div className="setting-group">
                <label>Voice Language</label>
                <select
                  value={settings.voiceLanguage}
                  onChange={(e) => updateSettings({ voiceLanguage: e.target.value })}
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                </select>
              </div>

              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.autoSummarizePages}
                    onChange={(e) => updateSettings({ autoSummarizePages: e.target.checked })}
                  />
                  Auto-summarize Pages
                </label>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h3>Appearance</h3>
              
              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.showBookmarksBar}
                    onChange={(e) => updateSettings({ showBookmarksBar: e.target.checked })}
                  />
                  Show Bookmarks Bar
                </label>
              </div>

              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.showTabBar}
                    onChange={(e) => updateSettings({ showTabBar: e.target.checked })}
                  />
                  Show Tab Bar
                </label>
              </div>

              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.showNavigationBar}
                    onChange={(e) => updateSettings({ showNavigationBar: e.target.checked })}
                  />
                  Show Navigation Bar
                </label>
              </div>

              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.compactMode}
                    onChange={(e) => updateSettings({ compactMode: e.target.checked })}
                  />
                  Compact Mode
                </label>
              </div>

              <div className="setting-group">
                <label>Font Size</label>
                <select
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: e.target.value as any })}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          )}

          {/* Advanced */}
          {activeTab === 'advanced' && (
            <div className="settings-section">
              <h3>Advanced</h3>
              
              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.enableExtensions}
                    onChange={(e) => updateSettings({ enableExtensions: e.target.checked })}
                  />
                  Enable Extensions
                </label>
              </div>

              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.enableDeveloperTools}
                    onChange={(e) => updateSettings({ enableDeveloperTools: e.target.checked })}
                  />
                  Enable Developer Tools
                </label>
              </div>

              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.enableLogging}
                    onChange={(e) => updateSettings({ enableLogging: e.target.checked })}
                  />
                  Enable Logging
                </label>
              </div>

              <div className="setting-group">
                <label>Custom User Agent</label>
                <input
                  type="text"
                  value={settings.customUserAgent}
                  onChange={(e) => updateSettings({ customUserAgent: e.target.value })}
                  placeholder="Leave empty for default"
                />
              </div>

              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.proxySettings.enabled}
                    onChange={(e) => updateSettings({ 
                      proxySettings: { ...settings.proxySettings, enabled: e.target.checked }
                    })}
                  />
                  Enable Proxy
                </label>
              </div>

              {settings.proxySettings.enabled && (
                <>
                  <div className="setting-group">
                    <label>Proxy Host</label>
                    <input
                      type="text"
                      value={settings.proxySettings.host}
                      onChange={(e) => updateSettings({ 
                        proxySettings: { ...settings.proxySettings, host: e.target.value }
                      })}
                      placeholder="proxy.example.com"
                    />
                  </div>

                  <div className="setting-group">
                    <label>Proxy Port</label>
                    <input
                      type="number"
                      min="1"
                      max="65535"
                      value={settings.proxySettings.port}
                      onChange={(e) => updateSettings({ 
                        proxySettings: { ...settings.proxySettings, port: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <div className="settings-actions">
            <button className="action-btn export-btn" onClick={handleExport}>
              Export Settings
            </button>
            <button className="action-btn import-btn" onClick={() => setShowImportModal(true)}>
              Import Settings
            </button>
            <button className="action-btn reset-btn" onClick={resetSettings}>
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Import Settings</h3>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste your settings JSON here..."
              rows={10}
            />
            <div className="modal-actions">
              <button onClick={handleImport}>Import</button>
              <button onClick={() => setShowImportModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
