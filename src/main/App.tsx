import React, { useEffect } from 'react'
import { BrowserWindow } from './components/browser/BrowserWindow'
import { useThemeStore } from './stores/themeStore'
import './App.css'

function App() {
  console.log('Phase 5: App component rendering')
  
  const { currentTheme, getCurrentTheme } = useThemeStore()
  
  // Initialize theme on app start
  useEffect(() => {
    const theme = getCurrentTheme()
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme.id)
      document.documentElement.setAttribute('data-dark', theme.isDark.toString())
    }
  }, [currentTheme, getCurrentTheme])
  
  return (
    <div className="App">
      <BrowserWindow />
    </div>
  )
}

export default App
