import React, { useState, useEffect } from 'react';
import './App.css';

// Get backend URL from environment
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [activeGoals, setActiveGoals] = useState([]);
  const [backgroundTasks, setBackgroundTasks] = useState([]);

  // Load system status on mount
  useEffect(() => {
    loadSystemStatus();
    // Update status every 30 seconds
    const interval = setInterval(loadSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemStatus = async () => {
    try {
      // Load system health
      const healthResponse = await fetch(`${BACKEND_URL}/api/system-health`);
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setSystemHealth(healthData.data);
      }

      // Load active goals
      const goalsResponse = await fetch(`${BACKEND_URL}/api/goals`);
      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json();
        setActiveGoals(goalsData.data.active_goals);
      }

      // Load background tasks
      const tasksResponse = await fetch(`${BACKEND_URL}/api/background-tasks`);
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setBackgroundTasks(tasksData.data.running_tasks);
      }
    } catch (error) {
      console.error('Failed to load system status:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage('');
    setIsLoading(true);

    // Add user message to conversation
    setConversation(prev => [...prev, { type: 'user', content: userMessage }]);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: {
            timestamp: Date.now(),
            url: window.location.href
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add AI response to conversation
        setConversation(prev => [...prev, { 
          type: 'ai', 
          content: data.result,
          metadata: data.data
        }]);

        // Update system status after interaction
        setTimeout(loadSystemStatus, 1000);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setConversation(prev => [...prev, { 
        type: 'error', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const performDeepSearch = async (query) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/deep-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        setConversation(prev => [...prev, { 
          type: 'system',
          content: `Deep Search Results for "${query}":

🔍 **Search Summary:**
• Sources searched: ${data.data.sources_searched.join(', ')}
• Results found: ${data.data.results_found}
• Relevance score: ${(data.data.relevance_score * 100).toFixed(1)}%
• Duration: ${data.data.search_duration}s

📊 **Top Results:**
${data.data.top_results.map((result, index) => `
${index + 1}. **${result.title}** (${result.source})
   ${result.snippet}
   Relevance: ${(result.relevance * 100).toFixed(1)}%
`).join('')}

💡 **AI Insights:**
${data.data.ai_insights.map(insight => `• ${insight}`).join('\n')}

---
*Powered by KAiro Deep Search Engine*`
        }]);
      }
    } catch (error) {
      console.error('Deep search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🤖 KAiro Browser - Enhanced AI Demo</h1>
        <p>Maximum Backend Utilization - All Advanced Features Active</p>
      </header>

      <div className="app-container">
        {/* System Status Dashboard */}
        <div className="status-dashboard">
          <div className="status-section">
            <h3>🏥 System Health</h3>
            {systemHealth && (
              <div>
                <div className="health-indicator">
                  Overall: <span className="health-value">{systemHealth.overall_health}%</span>
                </div>
                <div className="service-status">
                  {Object.entries(systemHealth.services).map(([service, status]) => (
                    <div key={service} className="service-item">
                      <span className={`status-dot ${status.status}`}></span>
                      {service.replace('_', ' ')}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="status-section">
            <h3>🎯 Active Goals</h3>
            {activeGoals.map(goal => (
              <div key={goal.id} className="goal-item">
                <div className="goal-title">{goal.title}</div>
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${goal.progress}%`}}></div>
                  </div>
                  <span>{goal.progress}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="status-section">
            <h3>⚡ Background Tasks</h3>
            {backgroundTasks.map(task => (
              <div key={task.id} className="task-item">
                <div className="task-type">{task.type.replace('_', ' ')}</div>
                <div className="task-progress">{task.progress}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="chat-container">
          <div className="chat-messages">
            {conversation.length === 0 && (
              <div className="welcome-message">
                <h2>🚀 Welcome to Enhanced KAiro Browser!</h2>
                <p>I automatically utilize ALL backend services for comprehensive assistance:</p>
                <ul>
                  <li>🧠 <strong>Agent Memory & Learning</strong> - I learn from every interaction</li>
                  <li>🎯 <strong>Autonomous Planning</strong> - I create and manage goals automatically</li>
                  <li>🔍 <strong>Deep Search Engine</strong> - Multi-source research with AI analysis</li>
                  <li>🛡️ <strong>Advanced Security</strong> - Continuous monitoring and protection</li>
                  <li>📊 <strong>Performance Optimization</strong> - System health and speed optimization</li>
                  <li>⚡ <strong>Background Automation</strong> - Tasks run autonomously</li>
                </ul>
                <p><strong>Try asking me anything!</strong> I'll automatically engage multiple services to provide comprehensive assistance.</p>
                
                <div className="quick-actions">
                  <button onClick={() => performDeepSearch('artificial intelligence trends 2024')}>
                    🔍 Demo Deep Search
                  </button>
                  <button onClick={() => setMessage('Show me my autonomous goals and system performance')}>
                    🎯 Show System Status
                  </button>
                  <button onClick={() => setMessage('Create a goal to optimize my productivity')}>
                    🚀 Create Productivity Goal
                  </button>
                </div>
              </div>
            )}

            {conversation.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                <div className="message-content">
                  <pre style={{whiteSpace: 'pre-wrap', fontFamily: 'inherit'}}>
                    {msg.content}
                  </pre>
                  {msg.metadata && (
                    <div className="message-metadata">
                      <small>
                        Services utilized: {msg.metadata.services_utilized} | 
                        Total features: {msg.metadata.total_features_active}
                      </small>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message ai loading">
                <div className="message-content">
                  <div className="loading-indicator">
                    🤖 Processing with multiple AI services...
                    <div className="loading-dots">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input-container">
            <div className="input-wrapper">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything - I'll automatically utilize all backend services to help you..."
                disabled={isLoading}
                rows="3"
              />
              <button 
                onClick={sendMessage} 
                disabled={isLoading || !message.trim()}
                className="send-button"
              >
                {isLoading ? '⏳' : '🚀'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;