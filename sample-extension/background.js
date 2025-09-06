// sample-extension/background.js
// Background script for KAiro Browser Sample Extension

console.log('🚀 KAiro Sample Extension Background Script Loaded');

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('📦 Extension installed:', details);
  
  if (details.reason === 'install') {
    // First time installation
    console.log('🎉 First time installation');
    
    // Set default settings
    chrome.storage.sync.set({
      extensionEnabled: true,
      aiAssistance: true,
      notifications: true,
      theme: 'dark'
    });
    
    // Create context menu
    chrome.contextMenus.create({
      id: 'kairo-analyze',
      title: 'Analyze with KAiro AI',
      contexts: ['selection', 'page']
    });
    
    chrome.contextMenus.create({
      id: 'kairo-summarize',
      title: 'Summarize Page',
      contexts: ['page']
    });
    
    chrome.contextMenus.create({
      id: 'kairo-research',
      title: 'Research Topic',
      contexts: ['selection']
    });
  }
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('🖱️ Context menu clicked:', info.menuItemId);
  
  switch (info.menuItemId) {
    case 'kairo-analyze':
      analyzeContent(info, tab);
      break;
    case 'kairo-summarize':
      summarizePage(tab);
      break;
    case 'kairo-research':
      researchTopic(info, tab);
      break;
  }
});

// Tab update handler
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('📄 Page loaded:', tab.url);
    
    // Send message to content script
    chrome.tabs.sendMessage(tabId, {
      action: 'pageLoaded',
      url: tab.url,
      title: tab.title
    }).catch(() => {
      // Ignore errors for pages that don't have content script
    });
  }
});

// Message handler from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Message received:', request);
  
  switch (request.action) {
    case 'analyzePage':
      handlePageAnalysis(request.data, sender.tab);
      break;
    case 'getSettings':
      getSettings(sendResponse);
      return true; // Keep message channel open
    case 'updateSettings':
      updateSettings(request.data, sendResponse);
      return true; // Keep message channel open
    case 'showNotification':
      showNotification(request.data);
      break;
  }
});

// Analyze content function
async function analyzeContent(info, tab) {
  try {
    const data = {
      type: 'analyze',
      content: info.selectionText || 'page',
      url: tab.url,
      title: tab.title
    };
    
    // Send to AI service
    const response = await sendToAI(data);
    
    // Show result in popup or notification
    chrome.tabs.sendMessage(tab.id, {
      action: 'showAnalysis',
      data: response
    });
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    showNotification({
      title: 'Analysis Failed',
      message: 'Could not analyze content. Please try again.',
      type: 'error'
    });
  }
}

// Summarize page function
async function summarizePage(tab) {
  try {
    const data = {
      type: 'summarize',
      url: tab.url,
      title: tab.title
    };
    
    const response = await sendToAI(data);
    
    chrome.tabs.sendMessage(tab.id, {
      action: 'showSummary',
      data: response
    });
    
  } catch (error) {
    console.error('❌ Summarization failed:', error);
  }
}

// Research topic function
async function researchTopic(info, tab) {
  try {
    const data = {
      type: 'research',
      topic: info.selectionText,
      context: tab.url
    };
    
    const response = await sendToAI(data);
    
    chrome.tabs.sendMessage(tab.id, {
      action: 'showResearch',
      data: response
    });
    
  } catch (error) {
    console.error('❌ Research failed:', error);
  }
}

// Send data to AI service
async function sendToAI(data) {
  // This would integrate with KAiro Browser's AI service
  // For now, return mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        result: `AI analysis of: ${data.type}`,
        timestamp: Date.now(),
        data: data
      });
    }, 1000);
  });
}

// Handle page analysis
function handlePageAnalysis(data, tab) {
  console.log('🔍 Page analysis requested:', data);
  
  // Process analysis request
  chrome.tabs.sendMessage(tab.id, {
    action: 'analysisComplete',
    data: {
      summary: 'Page analyzed successfully',
      keyPoints: ['Point 1', 'Point 2', 'Point 3'],
      sentiment: 'positive',
      topics: ['technology', 'ai', 'browser']
    }
  });
}

// Get extension settings
function getSettings(sendResponse) {
  chrome.storage.sync.get([
    'extensionEnabled',
    'aiAssistance',
    'notifications',
    'theme'
  ], (result) => {
    sendResponse({
      success: true,
      settings: result
    });
  });
}

// Update extension settings
function updateSettings(data, sendResponse) {
  chrome.storage.sync.set(data, () => {
    sendResponse({
      success: true,
      message: 'Settings updated successfully'
    });
  });
}

// Show notification
function showNotification(data) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: data.title || 'KAiro Extension',
    message: data.message || 'Notification from KAiro Extension'
  });
}

// Extension startup
console.log('✅ KAiro Sample Extension Background Script Ready');

