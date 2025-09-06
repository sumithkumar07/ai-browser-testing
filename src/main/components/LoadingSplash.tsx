/**
 * Enhanced Loading Splash Screen
 * Shows detailed startup progress with animations
 */

import React, { useState, useEffect } from 'react'
import { appEvents } from '../../core/utils/EventEmitter'
import './LoadingSplash.css'

interface StartupProgress {
  currentTask: string
  completedTasks: number
  totalTasks: number
  progress: number
  timeElapsed: number
  estimatedTimeRemaining: number
}

interface LoadingSplashProps {
  onComplete?: () => void
  minDisplayTime?: number
}

const LoadingSplash: React.FC<LoadingSplashProps> = ({ 
  onComplete, 
  minDisplayTime = 2000 
}) => {
  const [progress, setProgress] = useState<StartupProgress>({
    currentTask: 'Initializing...',
    completedTasks: 0,
    totalTasks: 1,
    progress: 0,
    timeElapsed: 0,
    estimatedTimeRemaining: 0
  })
  
  const [isVisible, setIsVisible] = useState(true)
  const [startTime] = useState(Date.now())
  const [tips] = useState([
    '💡 Use Ctrl+T to create new tabs quickly',
    '🤖 Ask the AI assistant for help with any task',
    '🔍 The address bar doubles as a search box',
    '⭐ Use the quick sites dropdown for faster navigation',
    '📊 Monitor performance with the dashboard',
    '🔄 AI agents can automate complex workflows',
    '🛒 Shopping agent compares prices automatically',
    '📧 Communication agent helps write emails',
    '🔬 Research agent gathers information from multiple sources'
  ])
  const [currentTipIndex, setCurrentTipIndex] = useState(0)

  useEffect(() => {
    // Listen for startup progress events
    const handleProgress = (progressData: StartupProgress) => {
      setProgress(progressData)
    }

    const handleComplete = () => {
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime)
      
      setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          onComplete?.()
        }, 500) // Wait for fade out animation
      }, remainingTime)
    }

    const handleFailed = (data: { error: Error }) => {
      console.error('Startup failed:', data.error)
      // Still complete the splash, let error handling take over
      handleComplete()
    }

    appEvents.on('startup:progress', handleProgress)
    appEvents.on('startup:complete', handleComplete)
    appEvents.on('startup:failed', handleFailed)

    // Rotate tips every 3 seconds
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length)
    }, 3000)

    return () => {
      appEvents.off('startup:progress', handleProgress)
      appEvents.off('startup:complete', handleComplete)
      appEvents.off('startup:failed', handleFailed)
      clearInterval(tipInterval)
    }
  }, [startTime, minDisplayTime, onComplete, tips.length])

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  if (!isVisible) {
    return (
      <div className="loading-splash fade-out">
        <div className="splash-content">
          <div className="logo-container">
            <div className="logo">🌐</div>
            <h1>KAiro Browser</h1>
          </div>
          <div className="startup-complete">
            <div className="success-icon">✅</div>
            <p>Ready to browse intelligently!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="loading-splash">
      <div className="splash-content">
        {/* Logo and Title */}
        <div className="logo-container">
          <div className="logo pulse">🌐</div>
          <h1>KAiro Browser</h1>
          <p className="tagline">AI-Powered Intelligent Browsing</p>
        </div>

        {/* Progress Section */}
        <div className="progress-section">
          <div className="progress-info">
            <div className="current-task">
              <span className="task-icon">⚡</span>
              <span className="task-text">{progress.currentTask}</span>
            </div>
            
            <div className="progress-stats">
              <span>{progress.completedTasks} of {progress.totalTasks} tasks</span>
              <span className="separator">•</span>
              <span>{Math.round(progress.progress)}% complete</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${progress.progress}%` }}
            >
              <div className="progress-shine"></div>
            </div>
          </div>

          {/* Time Information */}
          <div className="time-info">
            <span>Elapsed: {formatTime(progress.timeElapsed)}</span>
            {progress.estimatedTimeRemaining > 0 && (
              <>
                <span className="separator">•</span>
                <span>~{formatTime(progress.estimatedTimeRemaining)} remaining</span>
              </>
            )}
          </div>
        </div>

        {/* Features Preview */}
        <div className="features-preview">
          <h3>🚀 Enhanced Features</h3>
          <div className="feature-grid">
            <div className="feature-item">
              <span className="feature-icon">🤖</span>
              <span>6 AI Agents</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔍</span>
              <span>Smart Research</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛒</span>
              <span>Price Comparison</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Automation</span>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="tips-section">
          <div className="tip-container">
            <div key={currentTipIndex} className="tip fade-in">
              {tips[currentTipIndex]}
            </div>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="loading-animation">
          <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      </div>

      {/* Background Animation */}
      <div className="background-animation">
        <div className="floating-icon" style={{ animationDelay: '0s' }}>🌐</div>
        <div className="floating-icon" style={{ animationDelay: '2s' }}>🤖</div>
        <div className="floating-icon" style={{ animationDelay: '4s' }}>⚡</div>
        <div className="floating-icon" style={{ animationDelay: '6s' }}>🔍</div>
      </div>
    </div>
  )
}

export default LoadingSplash