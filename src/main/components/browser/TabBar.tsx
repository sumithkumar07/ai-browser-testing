import React from 'react'
import { useBrowser } from '../../hooks/useBrowser'
import './TabBar.css'

export const TabBar: React.FC = () => {
  const { tabs, handleNewTab, handleCloseTab, handleTabClick } = useBrowser()

  return (
    <div className="tab-bar">
      <div className="tab-list">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${tab.isActive ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            <span className="tab-title">{tab.title}</span>
            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation()
                handleCloseTab(tab.id)
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button className="new-tab-btn" onClick={handleNewTab}>
        +
      </button>
    </div>
  )
}
