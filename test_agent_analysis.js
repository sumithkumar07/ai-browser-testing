// Test the enhanced agent task analysis accuracy
require('dotenv').config();

// Create a mock KAiro browser manager with just the enhanced analyzeAgentTask method
class TestAnalyzer {
  // ENHANCED: Ultra-High Accuracy Task Analysis Method (Target: 95%+ accuracy)
  analyzeAgentTask(task) {
    const lowerTask = task.toLowerCase().trim()
    const words = lowerTask.split(/\s+/)
    
    // Advanced scoring system with semantic understanding
    const scores = {
      research: 0,
      navigation: 0,
      shopping: 0,
      communication: 0,
      automation: 0,
      analysis: 0
    }

    // PHASE 1: Intent Pattern Recognition with Context Awareness

    // 🔍 RESEARCH AGENT - Enhanced pattern matching
    const researchPatterns = [
      { pattern: /^(research|investigate|study|explore|learn about)/i, score: 95 },
      { pattern: /^(find|search for|look up|discover)/i, score: 88 },
      { pattern: /(latest|recent|current).*(development|trend|news|update)/i, score: 92 },
      { pattern: /(information|data|facts|details) about/i, score: 85 },
      { pattern: /what (is|are|was|were|do|does)/i, score: 82 },
      { pattern: /(comprehensive|detailed|thorough).*(research|study|analysis)/i, score: 95 }
    ]

    // 🌐 NAVIGATION AGENT - Precise URL and navigation detection
    const navigationPatterns = [
      { pattern: /^(go to|navigate to|visit|open)/i, score: 98 },
      { pattern: /^(browse|check out|head to)/i, score: 95 },
      { pattern: /(https?:\/\/|www\.|\.com|\.org|\.net)/i, score: 97 },
      { pattern: /^(show me|take me to|redirect to)/i, score: 93 },
      { pattern: /(website|webpage|site|url|link|page)$/i, score: 90 }
    ]

    // 🛒 SHOPPING AGENT - Advanced commercial intent detection
    const shoppingPatterns = [
      { pattern: /^(buy|purchase|order|get me)/i, score: 98 },
      { pattern: /(price|cost|how much|budget|cheap|expensive)/i, score: 92 },
      { pattern: /(best|top|recommend).*(laptop|phone|computer|tablet|product)/i, score: 96 },
      { pattern: /(deal|discount|sale|offer|coupon)/i, score: 90 },
      { pattern: /^(find|search).*(deal|price|cheap|affordable)/i, score: 94 },
      { pattern: /(compare|versus|vs).*(price|product|model)/i, score: 93 },
      { pattern: /(shop|store|marketplace|retailer|vendor)/i, score: 88 },
      { pattern: /(laptop|computer|phone|tablet|headphone|camera|tv|monitor)/i, score: 85 }
    ]

    // 📧 COMMUNICATION AGENT - Enhanced writing and messaging detection
    const communicationPatterns = [
      { pattern: /^(write|compose|draft|create)/i, score: 95 },
      { pattern: /(email|message|letter|note|memo)/i, score: 93 },
      { pattern: /(send|contact|reach out|get in touch)/i, score: 90 },
      { pattern: /(social media|post|tweet|status|update)/i, score: 88 },
      { pattern: /(professional|business|formal|casual).*(email|letter|message)/i, score: 96 },
      { pattern: /(reply|respond|answer).*(email|message)/i, score: 92 }
    ]

    // 🤖 AUTOMATION AGENT - Workflow and process detection
    const automationPatterns = [
      { pattern: /^(automate|schedule|set up)/i, score: 96 },
      { pattern: /(workflow|process|routine|task)/i, score: 88 },
      { pattern: /(repeat|recurring|regular|daily|weekly)/i, score: 92 },
      { pattern: /(streamline|optimize|efficiency|productivity)/i, score: 85 },
      { pattern: /(batch|bulk|mass).*(operation|process|task)/i, score: 90 }
    ]

    // 📊 ANALYSIS AGENT - Precise analysis and content processing
    const analysisPatterns = [
      { pattern: /^(analyze|analyse|examine|evaluate)/i, score: 98 },
      { pattern: /(this page|current page|page content)/i, score: 96 },
      { pattern: /(summarize|summary|overview|synopsis)/i, score: 93 },
      { pattern: /(review|assess|critique|judge)/i, score: 90 },
      { pattern: /(data analysis|content analysis|text analysis)/i, score: 95 },
      { pattern: /(insight|pattern|trend|correlation)/i, score: 88 },
      { pattern: /(report|breakdown|findings|results)/i, score: 87 }
    ]

    // PHASE 2: Apply Pattern Matching with Weighted Scoring
    const applyPatterns = (patterns, agent) => {
      patterns.forEach(({ pattern, score }) => {
        if (pattern.test(lowerTask)) {
          scores[agent] = Math.max(scores[agent], score)
        }
      })
    }

    applyPatterns(researchPatterns, 'research')
    applyPatterns(navigationPatterns, 'navigation')
    applyPatterns(shoppingPatterns, 'shopping')
    applyPatterns(communicationPatterns, 'communication')
    applyPatterns(automationPatterns, 'automation')
    applyPatterns(analysisPatterns, 'analysis')

    // PHASE 3: Context-Aware Conflict Resolution
    // Handle overlapping patterns with sophisticated logic

    // CRITICAL: Shopping vs Research disambiguation
    const hasShoppingContext = /\b(buy|price|deal|cheap|expensive|cost|purchase|order|store|shop)\b/i.test(lowerTask)
    const hasProductContext = /\b(laptop|phone|computer|tablet|headphone|camera|tv|monitor|product)\b/i.test(lowerTask)
    
    if (hasShoppingContext && hasProductContext) {
      if (lowerTask.includes('find') || lowerTask.includes('best') || lowerTask.includes('compare')) {
        scores.shopping = Math.max(scores.shopping, 94)
        scores.research = Math.max(scores.research - 20, 0) // Reduce research score
      }
    }

    // CRITICAL: Analysis vs Navigation disambiguation
    const hasAnalysisContext = /\b(analyze|analyse|examine|evaluate|summarize|review)\b/i.test(lowerTask)
    const hasPageContext = /\b(page|content|this|current)\b/i.test(lowerTask)
    
    if (hasAnalysisContext && hasPageContext) {
      scores.analysis = Math.max(scores.analysis, 97)
      scores.navigation = Math.max(scores.navigation - 30, 0) // Significantly reduce navigation
    }

    // PHASE 4: Semantic Boost Based on Word Combinations
    const wordCombinations = {
      'find best': { shopping: 15, research: -10 },
      'analyze this': { analysis: 20, navigation: -15 },
      'go to': { navigation: 25, research: -20 },
      'write email': { communication: 20, research: -10 },
      'automate workflow': { automation: 25, research: -15 }
    }

    Object.entries(wordCombinations).forEach(([combo, adjustments]) => {
      if (lowerTask.includes(combo)) {
        Object.entries(adjustments).forEach(([agent, adjustment]) => {
          scores[agent] = Math.max(scores[agent] + adjustment, 0)
        })
      }
    })

    // PHASE 5: Advanced Context Processing
    
    // Boost confidence for clear single-intent tasks
    const maxScore = Math.max(...Object.values(scores))
    const scoresAbove80 = Object.values(scores).filter(s => s >= 80).length
    
    if (scoresAbove80 === 1 && maxScore >= 90) {
      // Clear single intent - boost confidence
      const primaryAgent = Object.keys(scores).find(key => scores[key] === maxScore)
      scores[primaryAgent] = Math.min(scores[primaryAgent] + 5, 100)
    }

    // Multi-agent detection with improved logic
    let needsMultipleAgents = false
    const activeAgents = Object.entries(scores).filter(([_, score]) => score >= 75)
    
    if (activeAgents.length > 1) {
      const [first, second] = activeAgents.sort(([,a], [,b]) => b - a)
      // Only consider multi-agent if the second highest is within 20 points of the highest
      if (first[1] - second[1] <= 20) {
        needsMultipleAgents = true
      }
    }

    // Comprehensive context boost
    if (lowerTask.includes('comprehensive') || lowerTask.includes('complete') || lowerTask.includes('full')) {
      needsMultipleAgents = true
      Object.keys(scores).forEach(key => {
        if (scores[key] >= 60) scores[key] = Math.min(scores[key] + 8, 100)
      })
    }

    // Find the primary agent with highest confidence
    const primaryAgent = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b)
    const confidence = scores[primaryAgent]

    // Determine supporting agents with refined threshold
    const supportingAgents = Object.entries(scores)
      .filter(([agent, score]) => agent !== primaryAgent && score >= 65)
      .sort(([,a], [,b]) => b - a)
      .map(([agent, _]) => agent)

    return {
      primaryAgent,
      confidence,
      complexity: confidence >= 90 ? 'high' : (confidence >= 75 ? 'medium' : 'low'),
      needsMultipleAgents,
      supportingAgents,
      allScores: scores,
      // Add debug info for testing
      debugInfo: {
        originalTask: task,
        processedTask: lowerTask,
        topScores: Object.entries(scores).sort(([,a], [,b]) => b - a).slice(0, 3)
      }
    }
  }
}

// Test cases that were previously failing at 66.7% accuracy
const testCases = [
  { task: 'research latest AI developments', expected: 'research' },
  { task: 'navigate to google.com', expected: 'navigation' },
  { task: 'find best laptop deals', expected: 'shopping' },
  { task: 'compose professional email', expected: 'communication' },
  { task: 'automate daily workflow', expected: 'automation' },
  { task: 'analyze this page content', expected: 'analysis' },
  // Additional challenging test cases
  { task: 'buy new headphones', expected: 'shopping' },
  { task: 'go to wikipedia.org', expected: 'navigation' },
  { task: 'write business proposal', expected: 'communication' },
  { task: 'schedule recurring meeting', expected: 'automation' },
  { task: 'research best practices', expected: 'research' },
  { task: 'summarize current document', expected: 'analysis' }
]

console.log('🧪 Testing Enhanced Agent Task Analysis Accuracy...\n')

const analyzer = new TestAnalyzer()
let correctPredictions = 0
let totalTests = testCases.length

testCases.forEach((testCase, index) => {
  const result = analyzer.analyzeAgentTask(testCase.task)
  const isCorrect = result.primaryAgent === testCase.expected
  
  if (isCorrect) {
    correctPredictions++
    console.log(`✅ Test ${index + 1}: "${testCase.task}" → ${result.primaryAgent} (${result.confidence}% confidence)`)
  } else {
    console.log(`❌ Test ${index + 1}: "${testCase.task}" → ${result.primaryAgent} (expected: ${testCase.expected}) (${result.confidence}% confidence)`)
    console.log(`   Top scores: ${result.debugInfo.topScores.map(([agent, score]) => `${agent}: ${score}`).join(', ')}`)
  }
})

const accuracy = (correctPredictions / totalTests * 100).toFixed(1)
console.log(`\n📊 Overall Accuracy: ${accuracy}% (${correctPredictions}/${totalTests} correct)`)
console.log(`🎯 Target: 95%+ accuracy`)

if (parseFloat(accuracy) >= 95) {
  console.log('🎉 SUCCESS: Target accuracy achieved!')
} else {
  console.log(`⚠️ Need ${(95 - parseFloat(accuracy)).toFixed(1)}% improvement to reach target`)
}