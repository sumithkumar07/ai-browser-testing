import React, { useState } from 'react'
import { useThemeStore, Theme } from '../../stores/themeStore'
import './ThemeSelector.css'

export const ThemeSelector: React.FC = () => {
  const { currentTheme, themes, setTheme, isHighContrast, toggleHighContrast } = useThemeStore()
  const [isOpen, setIsOpen] = useState(false)

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId)
    setIsOpen(false)
  }

  const getThemePreview = (theme: Theme) => {
    return (
      <div 
        className="theme-preview" 
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
          borderColor: theme.colors.border
        }}
      >
        <div 
          className="theme-accent" 
          style={{ backgroundColor: theme.colors.accent }}
        />
        <div 
          className="theme-text" 
          style={{ backgroundColor: theme.colors.text }}
        />
      </div>
    )
  }

  const currentThemeData = themes.find(t => t.id === currentTheme)

  return (
    <div className="theme-selector">
      <button 
        className="theme-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Select theme"
      >
        <span className="theme-icon">🎨</span>
        <span className="theme-name">{currentThemeData?.name || 'Theme'}</span>
        <span className="theme-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="theme-dropdown">
          <div className="theme-section">
            <h4 className="theme-section-title">Color Themes</h4>
            <div className="theme-grid">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                  onClick={() => handleThemeSelect(theme.id)}
                  title={theme.description}
                >
                  {getThemePreview(theme)}
                  <div className="theme-info">
                    <span className="theme-name">{theme.name}</span>
                    <span className="theme-description">{theme.description}</span>
                  </div>
                  {currentTheme === theme.id && (
                    <span className="theme-check">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="theme-section">
            <h4 className="theme-section-title">Accessibility</h4>
            <button
              className={`accessibility-option ${isHighContrast ? 'active' : ''}`}
              onClick={toggleHighContrast}
            >
              <span className="accessibility-icon">🔍</span>
              <span className="accessibility-text">High Contrast</span>
              <span className="accessibility-status">{isHighContrast ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <div className="theme-footer">
            <span className="theme-tip">
              💡 Themes are automatically saved and will persist between sessions
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
