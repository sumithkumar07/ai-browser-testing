import React from 'react'
import './AIWelcome.css'

export const AIWelcome: React.FC = () => {
  return (
    <div className="ai-welcome">
      <div className="welcome-icon">🤖</div>
      <h2>Welcome to KAiro Browser!</h2>
      <p>I'm your AI assistant, ready to help you browse the web.</p>
      
      <div className="suggestions">
        <h3>Try asking me:</h3>
        <ul>
          <li>"What's the weather like today?"</li>
          <li>"Find the best restaurants nearby"</li>
          <li>"Help me research this topic"</li>
          <li>"Book a flight to New York"</li>
        </ul>
      </div>
      
      <div className="features">
        <h3>I can help you with:</h3>
        <div className="feature-grid">
          <div className="feature">
            <span className="feature-icon">🌐</span>
            <span>Web browsing</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🔍</span>
            <span>Search & research</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📝</span>
            <span>Content analysis</span>
          </div>
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <span>Quick tasks</span>
          </div>
        </div>
      </div>
    </div>
  )
}
