// src/main/components/KeyboardShortcuts.tsx
import React, { useState, useEffect } from 'react'

interface Shortcut {
  id: string
  category: string
  name: string
  description: string
  keys: string[]
  action: string
  isEnabled: boolean
}

interface ShortcutCategory {
  name: string
  shortcuts: Shortcut[]
}

const KeyboardShortcuts: React.FC = () => {
  const [shortcuts, setShortcuts] = useState<ShortcutCategory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isEditing, setIsEditing] = useState(false)
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null)

  useEffect(() => {
    loadShortcuts()
    setupGlobalShortcuts()
  }, [])

  const loadShortcuts = async () => {
    try {
      const savedShortcuts = await window.electronAPI?.getData('keyboardShortcuts')
      if (savedShortcuts) {
        setShortcuts(savedShortcuts)
      } else {
        // Load default shortcuts
        setShortcuts(getDefaultShortcuts())
      }
    } catch (error) {
      console.error('Failed to load shortcuts:', error)
      setShortcuts(getDefaultShortcuts())
    }
  }

  const saveShortcuts = async (updatedShortcuts: ShortcutCategory[]) => {
    try {
      setShortcuts(updatedShortcuts)
      await window.electronAPI?.saveData('keyboardShortcuts', updatedShortcuts)
    } catch (error) {
      console.error('Failed to save shortcuts:', error)
    }
  }

  const getDefaultShortcuts = (): ShortcutCategory[] => [
    {
      name: 'Navigation',
      shortcuts: [
        {
          id: 'nav_new_tab',
          category: 'Navigation',
          name: 'New Tab',
          description: 'Open a new browser tab',
          keys: ['Ctrl', 'T'],
          action: 'new-tab',
          isEnabled: true
        },
        {
          id: 'nav_close_tab',
          category: 'Navigation',
          name: 'Close Tab',
          description: 'Close the current tab',
          keys: ['Ctrl', 'W'],
          action: 'close-tab',
          isEnabled: true
        },
        {
          id: 'nav_switch_tab',
          category: 'Navigation',
          name: 'Switch Tab',
          description: 'Switch between tabs',
          keys: ['Ctrl', 'Tab'],
          action: 'switch-tab',
          isEnabled: true
        },
        {
          id: 'nav_reload',
          category: 'Navigation',
          name: 'Reload Page',
          description: 'Reload the current page',
          keys: ['Ctrl', 'R'],
          action: 'reload',
          isEnabled: true
        },
        {
          id: 'nav_back',
          category: 'Navigation',
          name: 'Go Back',
          description: 'Go to previous page',
          keys: ['Alt', '←'],
          action: 'go-back',
          isEnabled: true
        },
        {
          id: 'nav_forward',
          category: 'Navigation',
          name: 'Go Forward',
          description: 'Go to next page',
          keys: ['Alt', '→'],
          action: 'go-forward',
          isEnabled: true
        }
      ]
    },
    {
      name: 'AI Assistant',
      shortcuts: [
        {
          id: 'ai_toggle_sidebar',
          category: 'AI Assistant',
          name: 'Toggle AI Sidebar',
          description: 'Show/hide AI assistant sidebar',
          keys: ['Ctrl', 'Shift', 'A'],
          action: 'toggle-ai-sidebar',
          isEnabled: true
        },
        {
          id: 'ai_quick_ask',
          category: 'AI Assistant',
          name: 'Quick AI Question',
          description: 'Open AI chat for quick questions',
          keys: ['Ctrl', 'Shift', 'Q'],
          action: 'quick-ai-question',
          isEnabled: true
        },
        {
          id: 'ai_analyze_page',
          category: 'AI Assistant',
          name: 'Analyze Current Page',
          description: 'Analyze the current webpage',
          keys: ['Ctrl', 'Shift', 'E'],
          action: 'analyze-page',
          isEnabled: true
        },
        {
          id: 'ai_summarize',
          category: 'AI Assistant',
          name: 'Summarize Content',
          description: 'Summarize page content',
          keys: ['Ctrl', 'Shift', 'S'],
          action: 'summarize-content',
          isEnabled: true
        }
      ]
    },
    {
      name: 'Browser Features',
      shortcuts: [
        {
          id: 'browser_bookmark',
          category: 'Browser Features',
          name: 'Bookmark Page',
          description: 'Bookmark the current page',
          keys: ['Ctrl', 'D'],
          action: 'bookmark-page',
          isEnabled: true
        },
        {
          id: 'browser_history',
          category: 'Browser Features',
          name: 'Show History',
          description: 'Open browsing history',
          keys: ['Ctrl', 'H'],
          action: 'show-history',
          isEnabled: true
        },
        {
          id: 'browser_downloads',
          category: 'Browser Features',
          name: 'Show Downloads',
          description: 'Open downloads manager',
          keys: ['Ctrl', 'J'],
          action: 'show-downloads',
          isEnabled: true
        },
        {
          id: 'browser_settings',
          category: 'Browser Features',
          name: 'Open Settings',
          description: 'Open browser settings',
          keys: ['Ctrl', ','],
          action: 'open-settings',
          isEnabled: true
        },
        {
          id: 'browser_extensions',
          category: 'Browser Features',
          name: 'Manage Extensions',
          description: 'Open extension manager',
          keys: ['Ctrl', 'Shift', 'E'],
          action: 'manage-extensions',
          isEnabled: true
        }
      ]
    },
    {
      name: 'Shopping Assistant',
      shortcuts: [
        {
          id: 'shop_compare',
          category: 'Shopping Assistant',
          name: 'Compare Products',
          description: 'Compare products on current page',
          keys: ['Ctrl', 'Shift', 'C'],
          action: 'compare-products',
          isEnabled: true
        },
        {
          id: 'shop_price_track',
          category: 'Shopping Assistant',
          name: 'Track Price',
          description: 'Start price tracking for product',
          keys: ['Ctrl', 'Shift', 'P'],
          action: 'track-price',
          isEnabled: true
        },
        {
          id: 'shop_add_cart',
          category: 'Shopping Assistant',
          name: 'Add to Cart',
          description: 'Add product to shopping cart',
          keys: ['Ctrl', 'Shift', 'A'],
          action: 'add-to-cart',
          isEnabled: true
        }
      ]
    },
    {
      name: 'Research Tools',
      shortcuts: [
        {
          id: 'research_start',
          category: 'Research Tools',
          name: 'Start Research',
          description: 'Start research session',
          keys: ['Ctrl', 'Shift', 'R'],
          action: 'start-research',
          isEnabled: true
        },
        {
          id: 'research_export',
          category: 'Research Tools',
          name: 'Export Research',
          description: 'Export current research',
          keys: ['Ctrl', 'Shift', 'X'],
          action: 'export-research',
          isEnabled: true
        }
      ]
    },
    {
      name: 'System',
      shortcuts: [
        {
          id: 'system_fullscreen',
          category: 'System',
          name: 'Toggle Fullscreen',
          description: 'Enter/exit fullscreen mode',
          keys: ['F11'],
          action: 'toggle-fullscreen',
          isEnabled: true
        },
        {
          id: 'system_devtools',
          category: 'System',
          name: 'Developer Tools',
          description: 'Open developer tools',
          keys: ['F12'],
          action: 'open-devtools',
          isEnabled: true
        },
        {
          id: 'system_shortcuts',
          category: 'System',
          name: 'Shortcuts Help',
          description: 'Show this shortcuts help',
          keys: ['Ctrl', '?'],
          action: 'show-shortcuts',
          isEnabled: true
        }
      ]
    }
  ]

  const setupGlobalShortcuts = () => {
    // Register global shortcuts with Electron
    if (window.electronAPI?.registerShortcuts) {
      const allShortcuts = shortcuts.flatMap(category => category.shortcuts)
      window.electronAPI.registerShortcuts(allShortcuts)
    }
  }

  const handleShortcutToggle = (shortcutId: string) => {
    const updatedShortcuts = shortcuts.map(category => ({
      ...category,
      shortcuts: category.shortcuts.map(shortcut => 
        shortcut.id === shortcutId 
          ? { ...shortcut, isEnabled: !shortcut.isEnabled }
          : shortcut
      )
    }))
    
    saveShortcuts(updatedShortcuts)
    setupGlobalShortcuts()
  }

  const handleShortcutEdit = (shortcut: Shortcut) => {
    setEditingShortcut(shortcut)
    setIsEditing(true)
  }

  const handleShortcutSave = (updatedShortcut: Shortcut) => {
    const updatedShortcuts = shortcuts.map(category => ({
      ...category,
      shortcuts: category.shortcuts.map(shortcut => 
        shortcut.id === updatedShortcut.id ? updatedShortcut : shortcut
      )
    }))
    
    saveShortcuts(updatedShortcuts)
    setIsEditing(false)
    setEditingShortcut(null)
    setupGlobalShortcuts()
  }

  const resetToDefaults = () => {
    const defaultShortcuts = getDefaultShortcuts()
    saveShortcuts(defaultShortcuts)
    setupGlobalShortcuts()
  }

  const filteredShortcuts = shortcuts.map(category => ({
    ...category,
    shortcuts: category.shortcuts.filter(shortcut => {
      const matchesSearch = shortcut.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           shortcut.keys.join('+').toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || category.name === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  })).filter(category => category.shortcuts.length > 0)

  const formatKeys = (keys: string[]) => {
    return keys.map(key => {
      switch (key) {
        case 'Ctrl': return '⌃'
        case 'Shift': return '⇧'
        case 'Alt': return '⌥'
        case 'Cmd': return '⌘'
        case '←': return '←'
        case '→': return '→'
        case '↑': return '↑'
        case '↓': return '↓'
        default: return key
      }
    }).join(' + ')
  }

  return (
    <div className="keyboard-shortcuts-container">
      <div className="shortcuts-header">
        <h2>⌨️ Keyboard Shortcuts</h2>
        <div className="shortcuts-actions">
          <button 
            onClick={resetToDefaults}
            className="reset-btn"
          >
            🔄 Reset to Defaults
          </button>
        </div>
      </div>

      <div className="shortcuts-controls">
        <div className="search-box">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search shortcuts..."
            className="search-input"
          />
        </div>
        
        <div className="category-filter">
          <label>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="all">All Categories</option>
            {shortcuts.map(category => (
              <option key={category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="shortcuts-content">
        {filteredShortcuts.length === 0 ? (
          <div className="empty-state">
            <p>No shortcuts found</p>
            <p>Try adjusting your search or category filter</p>
          </div>
        ) : (
          filteredShortcuts.map(category => (
            <div key={category.name} className="shortcut-category">
              <h3>{category.name}</h3>
              <div className="shortcuts-list">
                {category.shortcuts.map(shortcut => (
                  <div key={shortcut.id} className="shortcut-item">
                    <div className="shortcut-info">
                      <div className="shortcut-header">
                        <h4>{shortcut.name}</h4>
                        <div className="shortcut-keys">
                          {formatKeys(shortcut.keys)}
                        </div>
                      </div>
                      <p className="shortcut-description">{shortcut.description}</p>
                    </div>
                    
                    <div className="shortcut-actions">
                      <label className="shortcut-toggle">
                        <input
                          type="checkbox"
                          checked={shortcut.isEnabled}
                          onChange={() => handleShortcutToggle(shortcut.id)}
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">
                          {shortcut.isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </label>
                      
                      <button 
                        onClick={() => handleShortcutEdit(shortcut)}
                        className="edit-btn"
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {isEditing && editingShortcut && (
        <div className="edit-shortcut-modal">
          <div className="modal-content">
            <h3>Edit Shortcut</h3>
            <div className="edit-form">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={editingShortcut.name}
                  onChange={(e) => setEditingShortcut({
                    ...editingShortcut,
                    name: e.target.value
                  })}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Description:</label>
                <input
                  type="text"
                  value={editingShortcut.description}
                  onChange={(e) => setEditingShortcut({
                    ...editingShortcut,
                    description: e.target.value
                  })}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Keys:</label>
                <div className="keys-input">
                  {editingShortcut.keys.map((key, index) => (
                    <input
                      key={index}
                      type="text"
                      value={key}
                      onChange={(e) => {
                        const newKeys = [...editingShortcut.keys]
                        newKeys[index] = e.target.value
                        setEditingShortcut({
                          ...editingShortcut,
                          keys: newKeys
                        })
                      }}
                      className="key-input"
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => handleShortcutSave(editingShortcut)}
                className="save-btn"
              >
                Save Changes
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false)
                  setEditingShortcut(null)
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="shortcuts-info">
        <h3>💡 Tips</h3>
        <div className="tips-list">
          <div className="tip-item">
            <strong>Customizable:</strong> You can edit any shortcut to match your preferences
          </div>
          <div className="tip-item">
            <strong>Global:</strong> Shortcuts work throughout the application
          </div>
          <div className="tip-item">
            <strong>Context-aware:</strong> Some shortcuts only work in specific contexts
          </div>
          <div className="tip-item">
            <strong>Reset:</strong> Use "Reset to Defaults" to restore original shortcuts
          </div>
        </div>
      </div>
    </div>
  )
}

export default KeyboardShortcuts
