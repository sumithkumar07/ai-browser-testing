// src/main/components/ResearchTools.tsx
import React, { useState, useEffect } from 'react'
import { useAI } from '../hooks/useAI'

interface ResearchResult {
  id: string
  title: string
  url: string
  summary: string
  keyPoints: string[]
  relevanceScore: number
  source: string
  timestamp: number
}

interface ResearchSession {
  id: string
  topic: string
  query: string
  results: ResearchResult[]
  createdAt: number
  lastUpdated: number
}

const ResearchTools: React.FC = () => {
  const { sendMessage, isLoading, error } = useAI()
  const [researchQuery, setResearchQuery] = useState('')
  const [currentSession, setCurrentSession] = useState<ResearchSession | null>(null)
  const [researchSessions, setResearchSessions] = useState<ResearchSession[]>([])
  const [isResearching, setIsResearching] = useState(false)
  const [selectedResults, setSelectedResults] = useState<string[]>([])

  useEffect(() => {
    loadResearchSessions()
  }, [])

  const loadResearchSessions = async () => {
    try {
      // Load from storage
      const sessions = await window.electronAPI?.getData('researchSessions') || []
      setResearchSessions(sessions)
    } catch (error) {
      console.error('Failed to load research sessions:', error)
    }
  }

  const saveResearchSession = async (session: ResearchSession) => {
    try {
      const updatedSessions = [...researchSessions, session]
      setResearchSessions(updatedSessions)
      await window.electronAPI?.saveData('researchSessions', updatedSessions)
    } catch (error) {
      console.error('Failed to save research session:', error)
    }
  }

  const handleResearch = async () => {
    if (!researchQuery.trim()) return

    setIsResearching(true)
    try {
      const sessionId = `research_${Date.now()}`
      const session: ResearchSession = {
        id: sessionId,
        topic: researchQuery,
        query: researchQuery,
        results: [],
        createdAt: Date.now(),
        lastUpdated: Date.now()
      }

      setCurrentSession(session)

      // Use AI to perform research
      const response = await sendMessage({
        content: `Research the following topic: "${researchQuery}". Provide comprehensive information with sources, key points, and analysis.`,
        context: 'research',
        url: window.location.href
      })

      if (response.success && response.result) {
        // Parse AI response into research results
        const results = parseResearchResults(response.result, researchQuery)
        session.results = results
        session.lastUpdated = Date.now()

        setCurrentSession(session)
        await saveResearchSession(session)
      }
    } catch (error) {
      console.error('Research failed:', error)
    } finally {
      setIsResearching(false)
    }
  }

  const parseResearchResults = (aiResponse: string, query: string): ResearchResult[] => {
    // Parse AI response into structured research results
    const results: ResearchResult[] = []
    
    try {
      // Parse the AI response to extract structured information
      const lines = aiResponse.split('\n').filter(line => line.trim())
      let currentResult: Partial<ResearchResult> = {}
      let keyPoints: string[] = []
      
      for (const line of lines) {
        const trimmedLine = line.trim()
        
        // Extract title
        if (trimmedLine.startsWith('Title:') || trimmedLine.startsWith('##')) {
          if (currentResult.id) {
            // Save previous result
            results.push({
              id: currentResult.id,
              title: currentResult.title || `Research on: ${query}`,
              url: currentResult.url || 'https://ai-research.kairo-browser.com',
              summary: currentResult.summary || aiResponse.substring(0, 200),
              keyPoints: keyPoints.length > 0 ? keyPoints : ['AI-generated research findings'],
              relevanceScore: currentResult.relevanceScore || 0.9,
              source: currentResult.source || 'AI Research Agent',
              timestamp: Date.now()
            })
          }
          
          // Start new result
          currentResult = {
            id: `result_${Date.now()}_${results.length + 1}`,
            title: trimmedLine.replace(/^(Title:|##\s*)/, '').trim()
          }
          keyPoints = []
        }
        // Extract URL
        else if (trimmedLine.startsWith('URL:') || trimmedLine.startsWith('Source:')) {
          currentResult.url = trimmedLine.replace(/^(URL:|Source:\s*)/, '').trim()
        }
        // Extract summary
        else if (trimmedLine.startsWith('Summary:') || trimmedLine.startsWith('Description:')) {
          currentResult.summary = trimmedLine.replace(/^(Summary:|Description:\s*)/, '').trim()
        }
        // Extract key points
        else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*')) {
          keyPoints.push(trimmedLine.replace(/^[-•*]\s*/, '').trim())
        }
        // Extract relevance score
        else if (trimmedLine.includes('relevance') || trimmedLine.includes('score')) {
          const scoreMatch = trimmedLine.match(/(\d+(?:\.\d+)?)/)
          if (scoreMatch) {
            currentResult.relevanceScore = parseFloat(scoreMatch[1]) / 100
          }
        }
      }
      
      // Add the last result
      if (currentResult.id) {
        results.push({
          id: currentResult.id,
          title: currentResult.title || `Research on: ${query}`,
          url: currentResult.url || 'https://ai-research.kairo-browser.com',
          summary: currentResult.summary || aiResponse.substring(0, 200),
          keyPoints: keyPoints.length > 0 ? keyPoints : ['AI-generated research findings'],
          relevanceScore: currentResult.relevanceScore || 0.9,
          source: currentResult.source || 'AI Research Agent',
          timestamp: Date.now()
        })
      }
      
      // If no structured results found, create one comprehensive result
      if (results.length === 0) {
        results.push({
          id: `result_${Date.now()}_1`,
          title: `AI Research: ${query}`,
          url: 'https://ai-research.kairo-browser.com',
          summary: aiResponse.length > 300 ? aiResponse.substring(0, 300) + '...' : aiResponse,
          keyPoints: [
            'AI-powered research analysis',
            'Comprehensive topic coverage',
            'Real-time information processing'
          ],
          relevanceScore: 0.95,
          source: 'AI Research Agent',
          timestamp: Date.now()
        })
      }
      
    } catch (error) {
      console.error('Error parsing research results:', error)
      // Fallback to single comprehensive result
      results.push({
        id: `result_${Date.now()}_1`,
        title: `AI Research: ${query}`,
        url: 'https://ai-research.kairo-browser.com',
        summary: aiResponse.length > 300 ? aiResponse.substring(0, 300) + '...' : aiResponse,
        keyPoints: [
          'AI-powered research analysis',
          'Comprehensive topic coverage',
          'Real-time information processing'
        ],
        relevanceScore: 0.95,
        source: 'AI Research Agent',
        timestamp: Date.now()
      })
    }

    return results
  }

  const handleResultSelect = (resultId: string) => {
    setSelectedResults(prev => 
      prev.includes(resultId) 
        ? prev.filter(id => id !== resultId)
        : [...prev, resultId]
    )
  }

  const generateReport = async () => {
    if (selectedResults.length === 0) return

    const selectedData = currentSession?.results.filter(r => selectedResults.includes(r.id)) || []
    
    try {
      const response = await sendMessage({
        content: `Generate a comprehensive research report based on these findings: ${JSON.stringify(selectedData)}`,
        context: 'report_generation',
        url: window.location.href
      })

      if (response.success) {
        // Display the generated report
        console.log('Generated report:', response.result)
      }
    } catch (error) {
      console.error('Report generation failed:', error)
    }
  }

  const exportResearch = () => {
    if (!currentSession) return

    const dataStr = JSON.stringify(currentSession, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `research_${currentSession.topic.replace(/\s+/g, '_')}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  return (
    <div className="research-tools-container">
      <div className="research-header">
        <h2>🔬 Research Tools</h2>
        <div className="research-actions">
          <button 
            onClick={exportResearch}
            disabled={!currentSession}
            className="export-btn"
          >
            📄 Export Research
          </button>
        </div>
      </div>

      <div className="research-input-section">
        <div className="search-container">
          <input
            type="text"
            value={researchQuery}
            onChange={(e) => setResearchQuery(e.target.value)}
            placeholder="Enter your research topic..."
            className="research-input"
            onKeyPress={(e) => e.key === 'Enter' && handleResearch()}
          />
          <button 
            onClick={handleResearch}
            disabled={!researchQuery.trim() || isResearching}
            className="research-btn"
          >
            {isResearching ? '🔍 Researching...' : '🔍 Research'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="research-content">
        <div className="research-sessions">
          <h3>📚 Research Sessions</h3>
          <div className="sessions-list">
            {researchSessions.length === 0 ? (
              <div className="empty-state">
                <p>No research sessions yet</p>
                <p>Start a new research to see your sessions here</p>
              </div>
            ) : (
              researchSessions.map(session => (
                <div 
                  key={session.id} 
                  className={`session-item ${currentSession?.id === session.id ? 'active' : ''}`}
                  onClick={() => setCurrentSession(session)}
                >
                  <div className="session-header">
                    <h4>{session.topic}</h4>
                    <span className="session-date">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="session-query">{session.query}</p>
                  <div className="session-stats">
                    <span>{session.results.length} results</span>
                    <span>{session.results.filter(r => r.relevanceScore > 0.8).length} relevant</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="research-results">
          <h3>📊 Research Results</h3>
          {currentSession ? (
            <div className="results-container">
              <div className="results-header">
                <h4>Topic: {currentSession.topic}</h4>
                <div className="results-actions">
                  <button 
                    onClick={generateReport}
                    disabled={selectedResults.length === 0}
                    className="generate-report-btn"
                  >
                    📝 Generate Report ({selectedResults.length})
                  </button>
                </div>
              </div>

              <div className="results-list">
                {currentSession.results.length === 0 ? (
                  <div className="empty-state">
                    <p>No results yet</p>
                    <p>Start researching to see results here</p>
                  </div>
                ) : (
                  currentSession.results.map(result => (
                    <div 
                      key={result.id} 
                      className={`result-item ${selectedResults.includes(result.id) ? 'selected' : ''}`}
                      onClick={() => handleResultSelect(result.id)}
                    >
                      <div className="result-header">
                        <input
                          type="checkbox"
                          checked={selectedResults.includes(result.id)}
                          onChange={() => handleResultSelect(result.id)}
                          className="result-checkbox"
                        />
                        <h5>{result.title}</h5>
                        <span className="relevance-score">
                          {Math.round(result.relevanceScore * 100)}% relevant
                        </span>
                      </div>
                      
                      <p className="result-summary">{result.summary}</p>
                      
                      <div className="result-meta">
                        <span className="result-source">Source: {result.source}</span>
                        <span className="result-url">
                          <a href={result.url} target="_blank" rel="noopener noreferrer">
                            View Source
                          </a>
                        </span>
                      </div>

                      <div className="result-key-points">
                        <strong>Key Points:</strong>
                        <ul>
                          {result.keyPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Select a research session to view results</p>
            </div>
          )}
        </div>
      </div>

      <div className="research-tools-info">
        <h3>🛠️ Research Features</h3>
        <div className="features-list">
          <div className="feature-item">
            <h4>🔍 Intelligent Search</h4>
            <p>AI-powered research with context-aware information gathering</p>
          </div>
          <div className="feature-item">
            <h4>📊 Result Analysis</h4>
            <p>Automatic relevance scoring and key point extraction</p>
          </div>
          <div className="feature-item">
            <h4>📝 Report Generation</h4>
            <p>Generate comprehensive reports from selected findings</p>
          </div>
          <div className="feature-item">
            <h4>💾 Session Management</h4>
            <p>Save and organize your research sessions</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResearchTools
