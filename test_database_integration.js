// Test script to verify database integration is working
const { DatabaseService } = require('./src/backend/DatabaseService');
const path = require('path');

async function testDatabaseIntegration() {
  try {
    console.log('🗄️ Testing Database Integration...');
    
    // Initialize database
    const dbService = new DatabaseService({
      path: './data/test_kairo_browser.db',
      maxSize: 100 * 1024 * 1024,
      backupEnabled: true
    });
    
    await dbService.initialize();
    console.log('✅ Database initialized successfully');
    
    // Test bookmark operations
    console.log('📚 Testing bookmark operations...');
    const testBookmark = {
      id: `bookmark_test_${Date.now()}`,
      title: 'Test Bookmark',
      url: 'https://example.com',
      description: 'A test bookmark',
      tags: ['test', 'integration'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      visitCount: 1,
      lastVisited: Date.now(),
      favicon: null,
      category: 'test'
    };
    
    await dbService.saveBookmark(testBookmark);
    console.log('✅ Bookmark saved successfully');
    
    const bookmarks = await dbService.getBookmarks(10);
    console.log(`✅ Retrieved ${bookmarks.length} bookmarks`);
    
    // Test history operations
    console.log('📜 Testing history operations...');
    const testHistory = {
      id: `history_test_${Date.now()}`,
      url: 'https://example.com',
      title: 'Test Page',
      visitedAt: Date.now(),
      duration: 30000,
      pageType: 'general',
      exitType: 'navigation',
      referrer: null,
      searchQuery: null
    };
    
    await dbService.saveHistoryEntry(testHistory);
    console.log('✅ History entry saved successfully');
    
    const history = await dbService.getHistory(10);
    console.log(`✅ Retrieved ${history.length} history entries`);
    
    // Test agent memory operations
    console.log('🧠 Testing agent memory operations...');
    const testMemory = {
      id: `memory_test_${Date.now()}`,
      agentId: 'research_agent',
      type: 'task_outcome',
      content: { result: 'test successful', confidence: 0.95 },
      importance: 8,
      tags: ['test', 'research'],
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      relatedMemories: [],
      metadata: { testRun: true }
    };
    
    await dbService.saveAgentMemory(testMemory);
    console.log('✅ Agent memory saved successfully');
    
    const memories = await dbService.getAgentMemories('research_agent', { limit: 10 });
    console.log(`✅ Retrieved ${memories.length} agent memories`);
    
    // Close database
    await dbService.close();
    
    console.log('\n🎉 Database Integration Test: SUCCESS');
    console.log('📊 All database operations working correctly');
    return true;
    
  } catch (error) {
    console.error('❌ Database Integration Test Failed:', error.message);
    console.error(error);
    return false;
  }
}

// Run the test
testDatabaseIntegration().then(success => {
  process.exit(success ? 0 : 1);
});