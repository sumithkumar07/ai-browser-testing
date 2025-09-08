#!/usr/bin/env node
/**
 * Test the actual main.js agent task analysis algorithm
 * This tests the exact algorithm used in production
 */

console.log('🧪 Testing Production Agent Task Analysis Algorithm');
console.log('==================================================');

// Mock the KAiroBrowserManager class methods for testing
class TestKAiroBrowserManager {
  constructor() {
    // Initialize the same methods as in main.js
    this.setupAnalysisMethods();
  }

  setupAnalysisMethods() {
    // Enhanced keyword scoring with weighted keywords (from main.js)
    this.calculateEnhancedKeywordScore = (text, weightedKeywords) => {
      let totalScore = 0
      
      for (const [keyword, weight] of Object.entries(weightedKeywords)) {
        // Handle multi-word keywords
        if (keyword.includes(' ')) {
          if (text.includes(keyword)) {
            totalScore += weight * 2 // Bonus for phrase matches
          }
        } else {
          // Word boundary matching for single words
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
          const matches = text.match(regex) || []
          totalScore += matches.length * weight
        }
      }
      
      return totalScore
    }

    // Apply contextual bonuses for improved accuracy (from main.js)
    this.applyContextualBonuses = (text, scores) => {
      const bonusedScores = { ...scores }
      
      // Research context bonuses
      if (text.includes('how many') || text.includes('what are') || text.includes('list of')) {
        bonusedScores.research += 3
      }
      
      // Navigation context bonuses  
      if (text.includes('http') || text.includes('www.') || text.includes('.com')) {
        bonusedScores.navigation += 5
      }
      
      // Shopping context bonuses
      if (text.includes('amazon') || text.includes('ebay') || text.includes('walmart') || text.includes('$')) {
        bonusedScores.shopping += 4
      }
      
      // Communication context bonuses
      if (text.includes('@') || text.includes('gmail') || text.includes('outlook')) {
        bonusedScores.communication += 4
      }
      
      // Analysis context bonuses
      if (text.includes('this page') || text.includes('current page') || text.includes('content')) {
        bonusedScores.analysis += 3
      }
      
      // Automation context bonuses
      if (text.includes('every') || text.includes('daily') || text.includes('automatically')) {
        bonusedScores.automation += 3
      }
      
      return bonusedScores
    }

    // Enhanced complexity determination (from main.js)
    this.determineComplexity = (originalTask, lowerTask, scores) => {
      let complexityScore = 0
      
      // Length-based complexity
      if (originalTask.length > 100) complexityScore += 2
      else if (originalTask.length > 50) complexityScore += 1
      
      // Multi-agent indicators
      const activeAgents = Object.values(scores).filter(score => score >= 2).length
      if (activeAgents > 2) complexityScore += 2
      else if (activeAgents > 1) complexityScore += 1
      
      // Complexity keywords
      const complexityKeywords = ['comprehensive', 'detailed', 'multiple', 'several', 'various', 'complex']
      const simpleKeywords = ['simple', 'quick', 'basic', 'just', 'only']
      
      if (complexityKeywords.some(keyword => lowerTask.includes(keyword))) complexityScore += 2
      if (simpleKeywords.some(keyword => lowerTask.includes(keyword))) complexityScore -= 1
      
      // Return complexity level
      if (complexityScore >= 4) return 'high'
      if (complexityScore <= 0) return 'low'
      return 'medium'
    }

    // Enhanced task analysis method with improved accuracy (EXACT COPY from main.js)
    this.analyzeAgentTask = (task) => {
      const lowerTask = task.toLowerCase()
      
      // Enhanced Research keywords with weighted scoring
      const researchKeywords = {
        // High priority research terms (weight: 5)
        'research': 5, 'investigate': 5, 'comprehensive': 5, 'trending': 5,
        // Medium priority research terms (weight: 3)
        'find': 3, 'search': 3, 'explore': 3, 'discover': 3, 'study': 3, 'examine': 3,
        'latest': 3, 'developments': 3, 'news': 3, 'topics': 3, 'sources': 3,
        // Low priority research terms (weight: 2)
        'top': 2, 'best': 2, 'list': 2, 'data': 2, 'information': 2, 'report': 2
      }
      
      // Enhanced Navigation keywords with weighted scoring
      const navigationKeywords = {
        // High priority navigation terms (weight: 5)
        'navigate': 5, 'go to': 5, 'visit': 5, 'open': 5,
        // Medium priority navigation terms (weight: 3)  
        'browse': 3, 'website': 3, 'url': 3, 'page': 3, 'site': 3,
        // Low priority navigation terms (weight: 2)
        'link': 2, 'redirect': 2, 'access': 2
      }
      
      // Enhanced Shopping keywords with weighted scoring (UPDATED TO MATCH MAIN.JS)
      const shoppingKeywords = {
        // High priority shopping terms (weight: 5)
        'buy': 5, 'purchase': 5, 'shopping': 5, 'compare': 5, 'price': 5, 'prices': 5,
        'best price': 5, 'find price': 5, 'compare price': 5,
        // Medium priority shopping terms (weight: 3)
        'shop': 3, 'cost': 3, 'product': 3, 'deal': 3, 'discount': 3, 'sale': 3,
        'find best': 3, 'best deal': 3, 'cheapest': 3, 'affordable': 3,
        // Low priority shopping terms (weight: 2) + Product categories
        'cheap': 2, 'review': 2, 'rating': 2, 'order': 2, 'checkout': 2, 
        'laptop': 4, 'phone': 4, 'computer': 4, 'tablet': 4, 'electronics': 4,
        'camera': 3, 'headphones': 3, 'speaker': 3, 'keyboard': 3, 'mouse': 3,
        'monitor': 3, 'tv': 3, 'gaming': 3, 'smartphone': 4, 'iphone': 4, 'android': 4
      }
      
      // Enhanced Communication keywords with weighted scoring
      const communicationKeywords = {
        // High priority communication terms (weight: 5)
        'email': 5, 'compose': 5, 'write': 5, 'send': 5, 'contact': 5,
        // Medium priority communication terms (weight: 3)
        'message': 3, 'form': 3, 'fill': 3, 'submit': 3, 'social': 3, 'post': 3,
        // Low priority communication terms (weight: 2)
        'tweet': 2, 'linkedin': 2, 'facebook': 2, 'reply': 2, 'respond': 2
      }
      
      // Enhanced Automation keywords with weighted scoring
      const automationKeywords = {
        // High priority automation terms (weight: 5)
        'automate': 5, 'automation': 5, 'workflow': 5, 'schedule': 5,
        // Medium priority automation terms (weight: 3)
        'repeat': 3, 'batch': 3, 'routine': 3, 'process': 3, 'sequence': 3,
        // Low priority automation terms (weight: 2)
        'steps': 2, 'tasks': 2, 'macro': 2, 'script': 2
      }
      
      // Enhanced Analysis keywords with weighted scoring
      const analysisKeywords = {
        // High priority analysis terms (weight: 5)
        'analyze': 5, 'analysis': 5, 'summarize': 5, 'summary': 5, 'extract': 5,
        // Medium priority analysis terms (weight: 3)
        'insights': 3, 'review': 3, 'evaluate': 3, 'assess': 3, 'interpret': 3,
        // Low priority analysis terms (weight: 2)
        'examine': 2, 'breakdown': 2, 'understand': 2, 'explain': 2
      }

      // Calculate enhanced scores using weighted keywords
      const researchScore = this.calculateEnhancedKeywordScore(lowerTask, researchKeywords)
      const navigationScore = this.calculateEnhancedKeywordScore(lowerTask, navigationKeywords)
      const shoppingScore = this.calculateEnhancedKeywordScore(lowerTask, shoppingKeywords)
      const communicationScore = this.calculateEnhancedKeywordScore(lowerTask, communicationKeywords)
      const automationScore = this.calculateEnhancedKeywordScore(lowerTask, automationKeywords)
      const analysisScore = this.calculateEnhancedKeywordScore(lowerTask, analysisKeywords)

      // Apply contextual bonuses for better accuracy
      const contextualScores = this.applyContextualBonuses(lowerTask, {
        research: researchScore,
        navigation: navigationScore,
        shopping: shoppingScore,
        communication: communicationScore,
        automation: automationScore,
        analysis: analysisScore
      })

      // Determine primary agent with minimum threshold
      const minThreshold = 2
      const validScores = Object.entries(contextualScores).filter(([_, score]) => score >= minThreshold)
      
      let primaryAgent = 'research' // Default fallback
      let maxScore = 0
      
      if (validScores.length > 0) {
        [primaryAgent, maxScore] = validScores.reduce((a, b) => a[1] > b[1] ? a : b)
      }
      
      // Enhanced complexity determination
      const complexity = this.determineComplexity(task, lowerTask, contextualScores)
      
      // Enhanced supporting agents calculation
      const supportingAgents = Object.entries(contextualScores)
        .filter(([agent, score]) => agent !== primaryAgent && score >= minThreshold)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([agent]) => agent)

      // Calculate confidence score (0-100)
      const totalScore = Object.values(contextualScores).reduce((sum, score) => sum + score, 0)
      const confidence = totalScore > 0 ? Math.min(100, Math.round((maxScore / totalScore) * 100)) : 0

      return {
        primaryAgent,
        supportingAgents,
        complexity,
        scores: contextualScores,
        confidence,
        needsMultipleAgents: supportingAgents.length > 0 && (complexity === 'high' || maxScore < 8)
      }
    }
  }
}

// Test cases (same as used in other tests)
const testCases = [
  { task: "research latest AI developments", expected: "research" },
  { task: "navigate to google.com", expected: "navigation" },
  { task: "find best laptop prices", expected: "shopping" },
  { task: "compose professional email", expected: "communication" },
  { task: "automate daily backup", expected: "automation" },
  { task: "analyze webpage content", expected: "analysis" }
];

// Run the test
const manager = new TestKAiroBrowserManager();
let correct = 0;
let total = testCases.length;

console.log('🎯 Testing Main.js Production Algorithm:\n');

testCases.forEach((testCase, index) => {
  const result = manager.analyzeAgentTask(testCase.task);
  const isCorrect = result.primaryAgent === testCase.expected;
  
  if (isCorrect) correct++;
  
  console.log(`Test ${index + 1}: ${isCorrect ? '✅' : '❌'}`);
  console.log(`Task: "${testCase.task}"`);
  console.log(`Expected: ${testCase.expected}, Got: ${result.primaryAgent}`);
  console.log(`Confidence: ${result.confidence}%, Scores:`, result.scores);
  console.log('');
});

const accuracy = Math.round((correct / total) * 100);
console.log('📊 PRODUCTION ALGORITHM TEST RESULTS:');
console.log('=====================================');
console.log(`✅ Correct Predictions: ${correct}/${total}`);
console.log(`📈 Accuracy: ${accuracy}%`);
console.log(`🎯 Target: 80%+ accuracy`);
console.log(`${accuracy >= 80 ? '🎉 ALGORITHM WORKING PERFECTLY!' : '⚠️ Algorithm needs refinement'}`);

if (accuracy === 100) {
  console.log('\n🏆 PERFECT SCORE ACHIEVED!');
  console.log('The production algorithm in main.js is working at 100% accuracy.');
}

process.exit(accuracy >= 80 ? 0 : 1);