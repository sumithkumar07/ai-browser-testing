// src/main/components/Extensions.tsx
import React, { useState, useEffect } from 'react'
import { useExtensions } from '../hooks/useExtensions'

const Extensions: React.FC = () => {
  const {
    extensions,
    isLoading,
    error,
    isInitialized,
    installExtension,
    uninstallExtension,
    enableExtension,
    disableExtension,
    updateExtension,
    clearError
  } = useExtensions()

  const [showInstallForm, setShowInstallForm] = useState(false)
  const [installUrl, setInstallUrl] = useState('')
  const [filterEnabled, setFilterEnabled] = useState<'all' | 'enabled' | 'disabled'>('all')

  const filteredExtensions = extensions.filter(ext => {
    if (filterEnabled === 'enabled') return ext.isEnabled
    if (filterEnabled === 'disabled') return !ext.isEnabled
    return true
  })

  const handleInstallFromUrl = async () => {
    if (!installUrl.trim()) return

    try {
      // In a real implementation, this would fetch the manifest from the URL
      const manifest = {
        name: 'Custom Extension',
        version: '1.0.0',
        description: 'Extension installed from URL',
        permissions: ['activeTab', 'storage']
      }

      await installExtension(manifest)
      setInstallUrl('')
      setShowInstallForm(false)
    } catch (error) {
      console.error('Failed to install extension:', error)
    }
  }

  const handleInstallSampleExtension = async () => {
    const sampleManifest = {
      name: 'Sample Extension',
      version: '1.0.0',
      description: 'A sample extension for testing',
      permissions: ['activeTab', 'storage', 'tabs'],
      content_scripts: [{
        matches: ['<all_urls>'],
        js: ['content.js']
      }]
    }

    await installExtension(sampleManifest)
  }

  return (
    <div className="extensions-container">
      <div className="extensions-header">
        <h2>🔌 Extensions</h2>
        <div className="extensions-actions">
          <button 
            onClick={() => setShowInstallForm(!showInstallForm)}
            className="install-btn"
          >
            ➕ Install Extension
          </button>
          <button 
            onClick={handleInstallSampleExtension}
            className="sample-btn"
            disabled={isLoading}
          >
            📦 Install Sample
          </button>
        </div>
      </div>

      {showInstallForm && (
        <div className="install-form">
          <div className="form-group">
            <label>Extension URL or Manifest:</label>
            <input
              type="text"
              value={installUrl}
              onChange={(e) => setInstallUrl(e.target.value)}
              placeholder="https://example.com/extension.zip or manifest.json"
              className="install-input"
            />
          </div>
          <div className="form-actions">
            <button 
              onClick={handleInstallFromUrl}
              disabled={!installUrl.trim() || isLoading}
              className="install-submit-btn"
            >
              Install
            </button>
            <button 
              onClick={() => setShowInstallForm(false)}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="extensions-controls">
        <div className="filter-controls">
          <label>Filter:</label>
          <select
            value={filterEnabled}
            onChange={(e) => setFilterEnabled(e.target.value as 'all' | 'enabled' | 'disabled')}
            className="filter-select"
          >
            <option value="all">All Extensions</option>
            <option value="enabled">Enabled Only</option>
            <option value="disabled">Disabled Only</option>
          </select>
        </div>
        
        <div className="extensions-stats">
          <span>Total: {extensions.length}</span>
          <span>Enabled: {extensions.filter(ext => ext.isEnabled).length}</span>
          <span>Disabled: {extensions.filter(ext => !ext.isEnabled).length}</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
          <button onClick={clearError}>✕</button>
        </div>
      )}

      {isLoading ? (
        <div className="loading">Loading extensions...</div>
      ) : (
        <div className="extensions-list">
          {filteredExtensions.length === 0 ? (
            <div className="empty-state">
              <p>No extensions found</p>
              <p>Install your first extension to get started!</p>
            </div>
          ) : (
            filteredExtensions.map(extension => (
              <div key={extension.id} className="extension-item">
                <div className="extension-info">
                  <div className="extension-header">
                    <h3 className="extension-name">{extension.name}</h3>
                    <span className="extension-version">v{extension.version}</span>
                  </div>
                  <p className="extension-description">{extension.description}</p>
                  
                  <div className="extension-meta">
                    <div className="extension-permissions">
                      <strong>Permissions:</strong>
                      <div className="permissions-list">
                        {extension.permissions.map(permission => (
                          <span key={permission} className="permission-tag">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="extension-dates">
                      <span>Installed: {new Date(extension.installDate).toLocaleDateString()}</span>
                      <span>Updated: {new Date(extension.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="extension-actions">
                  <div className="extension-toggle">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={extension.isEnabled}
                        onChange={(e) => {
                          if (e.target.checked) {
                            enableExtension(extension.id)
                          } else {
                            disableExtension(extension.id)
                          }
                        }}
                        disabled={isLoading}
                      />
                      <span className="slider"></span>
                    </label>
                    <span className="toggle-label">
                      {extension.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  
                  <div className="extension-buttons">
                    <button 
                      onClick={() => updateExtension(extension.id)}
                      className="action-btn update"
                      disabled={isLoading}
                      title="Update extension"
                    >
                      🔄 Update
                    </button>
                    <button 
                      onClick={() => uninstallExtension(extension.id)}
                      className="action-btn uninstall"
                      disabled={isLoading}
                      title="Uninstall extension"
                    >
                      🗑️ Uninstall
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="extensions-info">
        <h3>📚 Extension Development</h3>
        <div className="dev-info">
          <p>To develop extensions for KAiro Browser:</p>
          <ul>
            <li>Create a <code>manifest.json</code> file</li>
            <li>Include required permissions</li>
            <li>Package as a ZIP file</li>
            <li>Install using the "Install Extension" button</li>
          </ul>
          
          <div className="sample-manifest">
            <h4>Sample Manifest:</h4>
            <pre>{`{
  "name": "My Extension",
  "version": "1.0.0",
  "description": "Extension description",
  "permissions": ["activeTab", "storage"],
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }]
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Extensions
