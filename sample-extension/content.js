// sample-extension/content.js
// Content script for KAiro Browser Sample Extension

console.log('🚀 KAiro Sample Extension Content Script Loaded');

// Extension state
let extensionEnabled = true;
let aiAssistance = true;
let currentPageData = null;

// Initialize extension
function initializeExtension() {
  console.log('🔧 Initializing KAiro Extension on page');
  
  // Get page data
  currentPageData = {
    url: window.location.href,
    title: document.title,
    domain: window.location.hostname,
    timestamp: Date.now()
  };
  
  // Inject AI assistance features
  if (aiAssistance) {
    injectAIFeatures();
  }
  
  // Add page analysis
  analyzePageContent();
  
  // Setup event listeners
  setupEventListeners();
}

// Inject AI features into the page
function injectAIFeatures() {
  console.log('🤖 Injecting AI features');
  
  // Create AI assistant button
  const aiButton = createAIButton();
  document.body.appendChild(aiButton);
  
  // Add AI-powered search enhancement
  enhanceSearchBoxes();
  
  // Add content analysis overlay
  addContentAnalysisOverlay();
}

// Create AI assistant button
function createAIButton() {
  const button = document.createElement('div');
  button.id = 'kairo-ai-button';
  button.innerHTML = '🤖 KAiro AI';
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 25px;
    cursor: pointer;
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    z-index: 10000;
    transition: all 0.3s ease;
    user-select: none;
  `;
  
  button.addEventListener('click', () => {
    showAIPanel();
  });
  
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
  });
  
  return button;
}

// Enhance search boxes with AI
function enhanceSearchBoxes() {
  const searchInputs = document.querySelectorAll('input[type="search"], input[name*="search"], input[placeholder*="search" i]');
  
  searchInputs.forEach(input => {
    if (!input.dataset.kairoEnhanced) {
      input.dataset.kairoEnhanced = 'true';
      
      // Add AI search suggestion
      input.addEventListener('focus', () => {
        showAISearchSuggestions(input);
      });
    }
  });
}

// Show AI search suggestions
function showAISearchSuggestions(input) {
  const suggestions = document.createElement('div');
  suggestions.id = 'kairo-search-suggestions';
  suggestions.style.cssText = `
    position: absolute;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    padding: 8px 0;
    min-width: 200px;
    z-index: 10001;
    font-family: Arial, sans-serif;
    font-size: 14px;
  `;
  
  suggestions.innerHTML = `
    <div style="padding: 8px 12px; color: #667eea; font-weight: bold; border-bottom: 1px solid #eee;">
      🤖 AI Suggestions
    </div>
    <div style="padding: 8px 12px; cursor: pointer; hover:background: #f5f5f5;" onclick="this.parentElement.remove()">
      💡 Smart search: "${input.value}"
    </div>
    <div style="padding: 8px 12px; cursor: pointer; hover:background: #f5f5f5;" onclick="this.parentElement.remove()">
      🔍 Related topics
    </div>
    <div style="padding: 8px 12px; cursor: pointer; hover:background: #f5f5f5;" onclick="this.parentElement.remove()">
      📊 Analyze results
    </div>
  `;
  
  // Position suggestions
  const rect = input.getBoundingClientRect();
  suggestions.style.top = (rect.bottom + window.scrollY) + 'px';
  suggestions.style.left = rect.left + 'px';
  
  document.body.appendChild(suggestions);
  
  // Remove suggestions when clicking outside
  setTimeout(() => {
    document.addEventListener('click', () => {
      if (suggestions.parentElement) {
        suggestions.remove();
      }
    }, { once: true });
  }, 100);
}

// Add content analysis overlay
function addContentAnalysisOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'kairo-analysis-overlay';
  overlay.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: rgba(102, 126, 234, 0.9);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    font-size: 12px;
    max-width: 300px;
    z-index: 10000;
    backdrop-filter: blur(10px);
  `;
  
  overlay.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 4px;">🤖 KAiro Analysis</div>
    <div>Page analyzed • ${document.querySelectorAll('p').length} paragraphs • ${document.querySelectorAll('img').length} images</div>
    <div style="margin-top: 4px; font-size: 11px; opacity: 0.8;">Click to get AI insights</div>
  `;
  
  overlay.addEventListener('click', () => {
    showAIPanel();
  });
  
  document.body.appendChild(overlay);
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (overlay.parentElement) {
      overlay.style.opacity = '0';
      overlay.style.transform = 'translateY(20px)';
      setTimeout(() => overlay.remove(), 300);
    }
  }, 5000);
}

// Analyze page content
function analyzePageContent() {
  console.log('🔍 Analyzing page content');
  
  const analysis = {
    url: window.location.href,
    title: document.title,
    wordCount: document.body.innerText.split(/\s+/).length,
    paragraphCount: document.querySelectorAll('p').length,
    imageCount: document.querySelectorAll('img').length,
    linkCount: document.querySelectorAll('a').length,
    headingCount: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
    timestamp: Date.now()
  };
  
  // Send analysis to background script
  chrome.runtime.sendMessage({
    action: 'analyzePage',
    data: analysis
  });
}

// Show AI panel
function showAIPanel() {
  const panel = document.createElement('div');
  panel.id = 'kairo-ai-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    width: 400px;
    max-height: 500px;
    z-index: 10002;
    font-family: Arial, sans-serif;
    overflow: hidden;
  `;
  
  panel.innerHTML = `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px; text-align: center;">
      <h3 style="margin: 0; font-size: 18px;">🤖 KAiro AI Assistant</h3>
    </div>
    <div style="padding: 20px;">
      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #333;">Page Analysis</h4>
        <p style="margin: 0; color: #666; font-size: 14px;">
          This page contains ${document.querySelectorAll('p').length} paragraphs and ${document.querySelectorAll('img').length} images.
        </p>
      </div>
      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #333;">AI Features</h4>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #667eea; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">Summarize</button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #4ade80; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">Research</button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #f87171; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">Analyze</button>
        </div>
      </div>
      <div style="text-align: center;">
        <button onclick="this.parentElement.parentElement.remove()" style="background: #6b7280; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Close</button>
      </div>
    </div>
  `;
  
  // Add backdrop
  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 10001;
  `;
  
  backdrop.addEventListener('click', () => {
    backdrop.remove();
    panel.remove();
  });
  
  document.body.appendChild(backdrop);
  document.body.appendChild(panel);
}

// Setup event listeners
function setupEventListeners() {
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Content script received message:', request);
    
    switch (request.action) {
      case 'pageLoaded':
        handlePageLoaded(request);
        break;
      case 'showAnalysis':
        showAnalysisResult(request.data);
        break;
      case 'showSummary':
        showSummaryResult(request.data);
        break;
      case 'showResearch':
        showResearchResult(request.data);
        break;
      case 'analysisComplete':
        showAnalysisComplete(request.data);
        break;
    }
  });
}

// Handle page loaded event
function handlePageLoaded(data) {
  console.log('📄 Page loaded event:', data);
  currentPageData = data;
}

// Show analysis result
function showAnalysisResult(data) {
  console.log('📊 Analysis result:', data);
  // Implementation for showing analysis results
}

// Show summary result
function showSummaryResult(data) {
  console.log('📝 Summary result:', data);
  // Implementation for showing summary results
}

// Show research result
function showResearchResult(data) {
  console.log('🔍 Research result:', data);
  // Implementation for showing research results
}

// Show analysis complete
function showAnalysisComplete(data) {
  console.log('✅ Analysis complete:', data);
  // Update UI with analysis results
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

console.log('✅ KAiro Sample Extension Content Script Ready');

