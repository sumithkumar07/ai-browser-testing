// Test the enhanced agent task analysis accuracy
console.log('🧪 Testing Enhanced Agent Task Analysis Accuracy...\n')

// Import the enhanced methods (simulate the implementation)
function calculateEnhancedKeywordScore(text, weightedKeywords) {
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

function applyContextualBonuses(text, scores) {
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

function analyzeAgentTaskEnhanced(task) {
  const lowerTask = task.toLowerCase()
  
  // Enhanced keyword dictionaries with weights
  const researchKeywords = {
    'research': 5, 'investigate': 5, 'comprehensive': 5, 'trending': 5,
    'find': 3, 'search': 3, 'explore': 3, 'discover': 3, 'study': 3, 'examine': 3,
    'latest': 3, 'developments': 3, 'news': 3, 'topics': 3, 'sources': 3,
    'top': 2, 'best': 2, 'list': 2, 'data': 2, 'information': 2, 'report': 2
  }
  
  const navigationKeywords = {
    'navigate': 5, 'go to': 5, 'visit': 5, 'open': 5,
    'browse': 3, 'website': 3, 'url': 3, 'page': 3, 'site': 3,
    'link': 2, 'redirect': 2, 'access': 2
  }
  
  const shoppingKeywords = {
    'buy': 5, 'purchase': 5, 'shopping': 5, 'compare': 5, 'price': 5,
    'shop': 3, 'cost': 3, 'product': 3, 'deal': 3, 'discount': 3, 'sale': 3,
    'cheap': 2, 'review': 2, 'rating': 2, 'order': 2, 'checkout': 2
  }
  
  const communicationKeywords = {
    'email': 5, 'compose': 5, 'write': 5, 'send': 5, 'contact': 5,
    'message': 3, 'form': 3, 'fill': 3, 'submit': 3, 'social': 3, 'post': 3,
    'tweet': 2, 'linkedin': 2, 'facebook': 2, 'reply': 2, 'respond': 2
  }
  
  const automationKeywords = {
    'automate': 5, 'automation': 5, 'workflow': 5, 'schedule': 5,
    'repeat': 3, 'batch': 3, 'routine': 3, 'process': 3, 'sequence': 3,
    'steps': 2, 'tasks': 2, 'macro': 2, 'script': 2
  }
  
  const analysisKeywords = {
    'analyze': 5, 'analysis': 5, 'summarize': 5, 'summary': 5, 'extract': 5,
    'insights': 3, 'review': 3, 'evaluate': 3, 'assess': 3, 'interpret': 3,
    'examine': 2, 'breakdown': 2, 'understand': 2, 'explain': 2
  }

  // Calculate enhanced scores
  const scores = {
    research: calculateEnhancedKeywordScore(lowerTask, researchKeywords),
    navigation: calculateEnhancedKeywordScore(lowerTask, navigationKeywords),
    shopping: calculateEnhancedKeywordScore(lowerTask, shoppingKeywords),
    communication: calculateEnhancedKeywordScore(lowerTask, communicationKeywords),
    automation: calculateEnhancedKeywordScore(lowerTask, automationKeywords),
    analysis: calculateEnhancedKeywordScore(lowerTask, analysisKeywords)
  }

  // Apply contextual bonuses
  const contextualScores = applyContextualBonuses(lowerTask, scores)

  // Determine primary agent with minimum threshold
  const minThreshold = 2
  const validScores = Object.entries(contextualScores).filter(([_, score]) => score >= minThreshold)
  
  let primaryAgent = 'research' // Default fallback
  let maxScore = 0
  
  if (validScores.length > 0) {
    [primaryAgent, maxScore] = validScores.reduce((a, b) => a[1] > b[1] ? a : b)
  }

  // Calculate confidence score (0-100)
  const totalScore = Object.values(contextualScores).reduce((sum, score) => sum + score, 0)
  const confidence = totalScore > 0 ? Math.min(100, Math.round((maxScore / totalScore) * 100)) : 0

  return {
    primaryAgent,
    scores: contextualScores,
    confidence,
    maxScore
  }
}

// Test cases with expected results
const testCases = [
  { task: "research latest AI developments", expected: "research" },
  { task: "navigate to google.com", expected: "navigation" },
  { task: "buy laptop on amazon", expected: "shopping" },
  { task: "compose email to client", expected: "communication" },
  { task: "automate daily report workflow", expected: "automation" },
  { task: "analyze this page content", expected: "analysis" },
  { task: "find best laptops under $1000", expected: "research" },
  { task: "go to www.github.com", expected: "navigation" },
  { task: "compare prices on walmart and target", expected: "shopping" },  
  { task: "write social media post", expected: "communication" },
  { task: "schedule automated backups", expected: "automation" },
  { task: "summarize current article", expected: "analysis" },
  { task: "research comprehensive AI trends and developments in 2024", expected: "research" },
  { task: "open multiple tech news websites", expected: "navigation" },
  { task: "shopping for best deals on electronics", expected: "shopping" }
]

let correctPredictions = 0
let totalTests = testCases.length

console.log('🎯 Testing Enhanced Algorithm:\n')

testCases.forEach((testCase, index) => {
  const result = analyzeAgentTaskEnhanced(testCase.task)
  const isCorrect = result.primaryAgent === testCase.expected
  
  if (isCorrect) correctPredictions++
  
  console.log(`Test ${index + 1}: ${isCorrect ? '✅' : '❌'}`)
  console.log(`Task: "${testCase.task}"`)
  console.log(`Expected: ${testCase.expected}, Got: ${result.primaryAgent}`)
  console.log(`Confidence: ${result.confidence}%, Max Score: ${result.maxScore}`)
  console.log(`Scores:`, result.scores)
  console.log('')
})

const accuracy = Math.round((correctPredictions / totalTests) * 100)
console.log(`📊 ENHANCED ALGORITHM RESULTS:`)
console.log(`✅ Correct Predictions: ${correctPredictions}/${totalTests}`)
console.log(`📈 Accuracy: ${accuracy}%`)
console.log(`🎯 Target: 80%+ accuracy`)
console.log(`${accuracy >= 80 ? '🎉 TARGET ACHIEVED!' : '⚠️ Needs further refinement'}`)