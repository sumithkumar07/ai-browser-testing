import React, { useState, useEffect, useCallback } from 'react'
import { useVoiceStore, VoiceCommand } from '../../stores/voiceStore'
import { useBrowser } from '../../hooks/useBrowser'
import { useAI } from '../../hooks/useAI'
import { useThemeStore } from '../../stores/themeStore'
import './VoiceCommands.css'

export const VoiceCommands: React.FC = () => {
  const { 
    isListening, 
    transcript, 
    confidence, 
    isSupported, 
    commands, 
    startListening, 
    stopListening, 
    clearTranscript 
  } = useVoiceStore()
  
  const { handleNavigate, handleGoBack, handleGoForward, handleRefresh, handleNewTab, handleCloseTab } = useBrowser()
  const { handleSendMessage } = useAI()
  const { setTheme, toggleHighContrast } = useThemeStore()
  const [showCommands, setShowCommands] = useState(false)
  const [lastCommand, setLastCommand] = useState<string>('')

  // Process voice commands
  const processVoiceCommand = useCallback((text: string) => {
    const lowerText = text.toLowerCase().trim()
    console.log('Processing voice command:', lowerText)

    // Navigation commands
    if (lowerText.includes('go to') || lowerText.includes('open')) {
      const urlMatch = lowerText.match(/(?:go to|open)\s+(.+)/)
      if (urlMatch) {
        const url = urlMatch[1].trim()
        const formattedUrl = formatUrl(url)
        handleNavigate(formattedUrl)
        setLastCommand(`Navigated to ${formattedUrl}`)
        return
      }
    }

    if (lowerText.includes('search for')) {
      const searchMatch = lowerText.match(/search for\s+(.+)/)
      if (searchMatch) {
        const query = searchMatch[1].trim()
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`
        handleNavigate(searchUrl)
        setLastCommand(`Searched for "${query}"`)
        return
      }
    }

    if (lowerText.includes('go back')) {
      handleGoBack()
      setLastCommand('Went back to previous page')
      return
    }

    if (lowerText.includes('go forward')) {
      handleGoForward()
      setLastCommand('Went forward to next page')
      return
    }

    if (lowerText.includes('refresh')) {
      handleRefresh()
      setLastCommand('Refreshed current page')
      return
    }

    // Browser commands
    if (lowerText.includes('new tab')) {
      handleNewTab()
      setLastCommand('Opened new tab')
      return
    }

    if (lowerText.includes('close tab')) {
      handleCloseTab()
      setLastCommand('Closed current tab')
      return
    }

    // AI commands
    if (lowerText.includes('ask')) {
      const questionMatch = lowerText.match(/ask\s+(.+)/)
      if (questionMatch) {
        const question = questionMatch[1].trim()
        handleSendMessage(question)
        setLastCommand(`Asked AI: "${question}"`)
        return
      }
    }

    if (lowerText.includes('summarize')) {
      handleSendMessage('Please summarize the current page content')
      setLastCommand('Requested page summary')
      return
    }

    if (lowerText.includes('analyze')) {
      handleSendMessage('Please analyze the current page content')
      setLastCommand('Requested page analysis')
      return
    }

    // Theme commands
    if (lowerText.includes('dark mode')) {
      setTheme('dark')
      setLastCommand('Switched to dark mode')
      return
    }

    if (lowerText.includes('light mode')) {
      setTheme('light')
      setLastCommand('Switched to light mode')
      return
    }

    if (lowerText.includes('high contrast')) {
      toggleHighContrast()
      setLastCommand('Toggled high contrast mode')
      return
    }

    // If no specific command matched, send to AI
    if (lowerText.length > 3) {
      handleSendMessage(lowerText)
      setLastCommand(`Sent to AI: "${lowerText}"`)
      return
    }

    setLastCommand('Command not recognized')
  }, [handleNavigate, handleGoBack, handleGoForward, handleRefresh, handleNewTab, handleCloseTab, handleSendMessage, setTheme, toggleHighContrast])

  // Process transcript when it changes
  useEffect(() => {
    if (transcript && !isListening) {
      processVoiceCommand(transcript)
      clearTranscript()
    }
  }, [transcript, isListening, processVoiceCommand, clearTranscript])

  const formatUrl = (input: string): string => {
    if (input.startsWith('http://') || input.startsWith('https://')) {
      return input
    }
    if (input.includes('.') && !input.includes(' ')) {
      return `https://${input}`
    }
    return `https://www.google.com/search?q=${encodeURIComponent(input)}`
  }

  const handleToggleListening = async () => {
    if (isListening) {
      stopListening()
    } else {
      await startListening()
    }
  }

  const getConfidenceColor = () => {
    if (confidence > 0.8) return '#10b981'
    if (confidence > 0.6) return '#f59e0b'
    return '#ef4444'
  }

  if (!isSupported) {
    return (
      <div className="voice-commands">
        <div className="voice-not-supported">
          <span className="voice-icon">🎤</span>
          <p>Voice commands not supported in this browser</p>
          <p className="voice-tip">Try Chrome, Edge, or Safari for voice support</p>
        </div>
      </div>
    )
  }

  return (
    <div className="voice-commands">
      <div className="voice-controls">
        <button
          className={`voice-btn ${isListening ? 'listening' : ''}`}
          onClick={handleToggleListening}
          title={isListening ? 'Stop listening' : 'Start listening'}
        >
          <span className="voice-icon">
            {isListening ? '🔴' : '🎤'}
          </span>
          <span className="voice-text">
            {isListening ? 'Listening...' : 'Voice Commands'}
          </span>
        </button>

        <button
          className="commands-btn"
          onClick={() => setShowCommands(!showCommands)}
          title="Show available commands"
        >
          <span>📋</span>
        </button>
      </div>

      {/* Voice Status */}
      {isListening && (
        <div className="voice-status">
          <div className="voice-transcript">
            <span className="transcript-label">You said:</span>
            <span className="transcript-text">{transcript || 'Listening...'}</span>
          </div>
          {confidence > 0 && (
            <div className="voice-confidence">
              <span className="confidence-label">Confidence:</span>
              <span 
                className="confidence-value"
                style={{ color: getConfidenceColor() }}
              >
                {Math.round(confidence * 100)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Last Command Result */}
      {lastCommand && (
        <div className="voice-result">
          <span className="result-icon">✅</span>
          <span className="result-text">{lastCommand}</span>
        </div>
      )}

      {/* Available Commands */}
      {showCommands && (
        <div className="voice-commands-list">
          <h4 className="commands-title">Available Voice Commands</h4>
          
          <div className="commands-category">
            <h5>🌐 Navigation</h5>
            <div className="commands-grid">
              {commands.filter(cmd => cmd.category === 'navigation').map(cmd => (
                <div key={cmd.id} className="command-item">
                  <span className="command-phrase">"{cmd.command}"</span>
                  <span className="command-desc">{cmd.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="commands-category">
            <h5>🤖 AI Assistant</h5>
            <div className="commands-grid">
              {commands.filter(cmd => cmd.category === 'ai').map(cmd => (
                <div key={cmd.id} className="command-item">
                  <span className="command-phrase">"{cmd.command}"</span>
                  <span className="command-desc">{cmd.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="commands-category">
            <h5>📑 Browser</h5>
            <div className="commands-grid">
              {commands.filter(cmd => cmd.category === 'browser').map(cmd => (
                <div key={cmd.id} className="command-item">
                  <span className="command-phrase">"{cmd.command}"</span>
                  <span className="command-desc">{cmd.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="commands-category">
            <h5>⚙️ System</h5>
            <div className="commands-grid">
              {commands.filter(cmd => cmd.category === 'system').map(cmd => (
                <div key={cmd.id} className="command-item">
                  <span className="command-phrase">"{cmd.command}"</span>
                  <span className="command-desc">{cmd.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="voice-tips">
            <p>💡 <strong>Tips:</strong></p>
            <ul>
              <li>Speak clearly and naturally</li>
              <li>Use "go to" or "open" followed by website name</li>
              <li>Say "ask" followed by your question for AI help</li>
              <li>Try "search for" followed by what you want to find</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
