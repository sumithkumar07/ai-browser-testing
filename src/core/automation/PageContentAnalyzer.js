// 📊 INTELLIGENT PAGE CONTENT ANALYZER
// Advanced content analysis for browser automation

class PageContentAnalyzer {
  constructor() {
    this.analysisRules = new Map();
    this.contentPatterns = new Map();
    this.initializeAnalysisRules();
  }

  async initialize() {
    console.log('🔍 Initializing Page Content Analyzer...');
    this.initializeAnalysisRules();
    this.initializeContentPatterns();
  }

  initializeAnalysisRules() {
    // E-commerce analysis rules
    this.analysisRules.set('ecommerce', {
      selectors: {
        price: ['.price', '[data-price]', '.cost', '.amount'],
        title: ['h1', '.product-title', '.item-title'],
        description: ['.description', '.product-description'],
        rating: ['.rating', '.stars', '[data-rating]'],
        reviews: ['.reviews', '.review-count'],
        availability: ['.availability', '.stock', '.in-stock']
      },
      extraction: {
        price: text => this.extractPrice(text),
        rating: text => this.extractRating(text),
        reviews: text => this.extractNumber(text)
      }
    });

    // News article analysis rules
    this.analysisRules.set('news', {
      selectors: {
        headline: ['h1', '.headline', '.title'],
        author: ['.author', '.byline', '[rel="author"]'],
        date: ['.date', '.published', 'time'],
        content: ['.content', '.article-body', '.post-content'],
        tags: ['.tags', '.categories', '.topics']
      },
      extraction: {
        date: text => this.extractDate(text),
        readingTime: content => this.estimateReadingTime(content)
      }
    });

    // Search results analysis rules
    this.analysisRules.set('search', {
      selectors: {
        results: ['.result', '.search-result', '[data-result]'],
        title: ['h3', '.result-title'],
        snippet: ['.snippet', '.description'],
        url: ['a[href]', '.result-url'],
        meta: ['.meta', '.result-meta']
      },
      extraction: {
        relevanceScore: (title, snippet) => this.calculateRelevance(title, snippet)
      }
    });
  }

  initializeContentPatterns() {
    // Common content patterns for extraction
    this.contentPatterns.set('price', [
      /\$\d+(?:\.\d{2})?/g,
      /\d+(?:\.\d{2})?\s*(?:USD|EUR|GBP)/gi,
      /Price:\s*\$?\d+(?:\.\d{2})?/gi
    ]);

    this.contentPatterns.set('email', [
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    ]);

    this.contentPatterns.set('phone', [
      /\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g
    ]);

    this.contentPatterns.set('date', [
      /\d{4}-\d{2}-\d{2}/g,
      /\d{1,2}\/\d{1,2}\/\d{4}/g,
      /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/gi
    ]);
  }

  async analyzeContent(content, analysisType, options = {}) {
    try {
      console.log(`🔍 Analyzing content: ${analysisType}`);

      let analysis = {};

      switch (analysisType) {
        case 'ecommerce':
          analysis = await this.analyzeEcommerce(content, options);
          break;
        case 'news':
          analysis = await this.analyzeNews(content, options);
          break;
        case 'search':
          analysis = await this.analyzeSearchResults(content, options);
          break;
        case 'general':
          analysis = await this.analyzeGeneral(content, options);
          break;
        case 'sentiment':
          analysis = await this.analyzeSentiment(content, options);
          break;
        case 'keywords':
          analysis = await this.analyzeKeywords(content, options);
          break;
        default:
          analysis = await this.analyzeGeneral(content, options);
      }

      console.log(`✅ Content analysis completed: ${analysisType}`);
      return analysis;

    } catch (error) {
      console.error('❌ Content analysis failed:', error);
      return { success: false, error: error.message };
    }
  }

  async analyzeEcommerce(content, options) {
    const rules = this.analysisRules.get('ecommerce');
    const analysis = {
      type: 'ecommerce',
      products: [],
      priceRange: null,
      averageRating: null,
      totalReviews: 0
    };

    try {
      // Extract product information
      const productElements = this.extractElements(content.html, rules.selectors);
      
      for (const product of productElements) {
        const productData = {
          title: this.extractText(product, rules.selectors.title),
          price: this.extractPrice(this.extractText(product, rules.selectors.price)),
          rating: this.extractRating(this.extractText(product, rules.selectors.rating)),
          reviews: this.extractNumber(this.extractText(product, rules.selectors.reviews)),
          availability: this.extractText(product, rules.selectors.availability),
          description: this.extractText(product, rules.selectors.description)
        };

        if (productData.title || productData.price) {
          analysis.products.push(productData);
        }
      }

      // Calculate aggregated data
      if (analysis.products.length > 0) {
        const prices = analysis.products.map(p => p.price).filter(p => p);
        const ratings = analysis.products.map(p => p.rating).filter(r => r);
        
        analysis.priceRange = prices.length > 0 ? {
          min: Math.min(...prices),
          max: Math.max(...prices),
          average: prices.reduce((a, b) => a + b, 0) / prices.length
        } : null;

        analysis.averageRating = ratings.length > 0 ? 
          ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

        analysis.totalReviews = analysis.products.reduce((sum, p) => sum + (p.reviews || 0), 0);
      }

      return { success: true, analysis };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async analyzeNews(content, options) {
    const rules = this.analysisRules.get('news');
    const analysis = {
      type: 'news',
      articles: [],
      topics: [],
      sentimentOverall: null
    };

    try {
      // Extract article information
      const headline = this.extractText(content.html, rules.selectors.headline);
      const author = this.extractText(content.html, rules.selectors.author);
      const date = this.extractText(content.html, rules.selectors.date);
      const articleContent = this.extractText(content.html, rules.selectors.content);
      const tags = this.extractMultipleTexts(content.html, rules.selectors.tags);

      if (headline || articleContent) {
        const article = {
          headline,
          author,
          date: this.extractDate(date),
          content: articleContent,
          tags,
          readingTime: this.estimateReadingTime(articleContent),
          wordCount: articleContent ? articleContent.split(' ').length : 0,
          sentiment: await this.analyzeSentiment({ text: articleContent })
        };

        analysis.articles.push(article);
        analysis.topics = [...new Set(tags)];
        analysis.sentimentOverall = article.sentiment;
      }

      return { success: true, analysis };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async analyzeSearchResults(content, options) {
    const rules = this.analysisRules.get('search');
    const analysis = {
      type: 'search',
      results: [],
      totalResults: 0,
      relevanceScores: []
    };

    try {
      const resultElements = this.extractElements(content.html, { results: rules.selectors.results });
      
      for (const resultElement of resultElements.results || []) {
        const result = {
          title: this.extractText(resultElement, rules.selectors.title),
          snippet: this.extractText(resultElement, rules.selectors.snippet),
          url: this.extractAttribute(resultElement, rules.selectors.url, 'href'),
          meta: this.extractText(resultElement, rules.selectors.meta)
        };

        if (result.title) {
          result.relevanceScore = this.calculateRelevance(result.title, result.snippet, options.query);
          analysis.results.push(result);
          analysis.relevanceScores.push(result.relevanceScore);
        }
      }

      analysis.totalResults = analysis.results.length;
      analysis.averageRelevance = analysis.relevanceScores.length > 0 ?
        analysis.relevanceScores.reduce((a, b) => a + b, 0) / analysis.relevanceScores.length : 0;

      return { success: true, analysis };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async analyzeGeneral(content, options) {
    const analysis = {
      type: 'general',
      title: content.title || '',
      url: content.url || '',
      wordCount: 0,
      readingTime: 0,
      headings: [],
      links: [],
      images: [],
      forms: [],
      keyPhrases: []
    };

    try {
      if (content.text) {
        analysis.wordCount = content.text.split(' ').length;
        analysis.readingTime = this.estimateReadingTime(content.text);
        analysis.keyPhrases = this.extractKeyPhrases(content.text);
      }

      if (content.html) {
        analysis.headings = this.extractHeadings(content.html);
        analysis.links = this.extractLinks(content.html);
        analysis.images = this.extractImages(content.html);
        analysis.forms = this.extractForms(content.html);
      }

      return { success: true, analysis };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async analyzeSentiment(content, options) {
    try {
      const text = content.text || content;
      
      // Simple sentiment analysis (can be enhanced with ML models)
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'best', 'awesome', 'fantastic'];
      const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing'];
      
      const words = text.toLowerCase().split(/\s+/);
      let positiveCount = 0;
      let negativeCount = 0;
      
      words.forEach(word => {
        if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
        if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
      });
      
      const total = positiveCount + negativeCount;
      let sentiment = 'neutral';
      let score = 0;
      
      if (total > 0) {
        score = (positiveCount - negativeCount) / total;
        if (score > 0.2) sentiment = 'positive';
        else if (score < -0.2) sentiment = 'negative';
      }
      
      return {
        success: true,
        analysis: {
          sentiment,
          score,
          positiveCount,
          negativeCount,
          confidence: Math.abs(score)
        }
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async analyzeKeywords(content, options) {
    try {
      const text = content.text || content;
      const keywords = this.extractKeyPhrases(text);
      
      // Calculate keyword frequency and importance
      const keywordAnalysis = keywords.map(keyword => ({
        keyword,
        frequency: (text.match(new RegExp(keyword, 'gi')) || []).length,
        length: keyword.split(' ').length,
        importance: this.calculateKeywordImportance(keyword, text)
      }));
      
      // Sort by importance
      keywordAnalysis.sort((a, b) => b.importance - a.importance);
      
      return {
        success: true,
        analysis: {
          keywords: keywordAnalysis.slice(0, 20), // Top 20 keywords
          totalKeywords: keywordAnalysis.length,
          averageImportance: keywordAnalysis.reduce((sum, k) => sum + k.importance, 0) / keywordAnalysis.length
        }
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 🛠️ UTILITY METHODS

  extractElements(html, selectors) {
    // Mock implementation - in real scenario, use DOM parser
    const elements = {};
    for (const [key, selectorList] of Object.entries(selectors)) {
      elements[key] = []; // Would contain actual DOM elements
    }
    return elements;
  }

  extractText(element, selectors) {
    // Mock implementation - would extract text content from DOM element
    return '';
  }

  extractMultipleTexts(html, selectors) {
    // Mock implementation - would extract multiple text contents
    return [];
  }

  extractAttribute(element, selectors, attribute) {
    // Mock implementation - would extract attribute value
    return '';
  }

  extractPrice(text) {
    if (!text) return null;
    const priceMatch = text.match(/\$?(\d+(?:\.\d{2})?)/);
    return priceMatch ? parseFloat(priceMatch[1]) : null;
  }

  extractRating(text) {
    if (!text) return null;
    const ratingMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:out of|\/)\s*(\d+)/);
    if (ratingMatch) {
      return parseFloat(ratingMatch[1]);
    }
    const starMatch = text.match(/(\d+(?:\.\d+)?)\s*star/);
    return starMatch ? parseFloat(starMatch[1]) : null;
  }

  extractNumber(text) {
    if (!text) return null;
    const numberMatch = text.match(/(\d+(?:,\d{3})*)/);
    return numberMatch ? parseInt(numberMatch[1].replace(/,/g, '')) : null;
  }

  extractDate(text) {
    if (!text) return null;
    
    const patterns = this.contentPatterns.get('date');
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const date = new Date(match[0]);
        return isNaN(date.getTime()) ? null : date.toISOString();
      }
    }
    return null;
  }

  estimateReadingTime(text) {
    if (!text) return 0;
    const wordsPerMinute = 200;
    const wordCount = text.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  calculateRelevance(title, snippet, query) {
    if (!query) return 0.5;
    
    const searchTerms = query.toLowerCase().split(' ');
    const titleText = (title || '').toLowerCase();
    const snippetText = (snippet || '').toLowerCase();
    
    let score = 0;
    searchTerms.forEach(term => {
      if (titleText.includes(term)) score += 0.4;
      if (snippetText.includes(term)) score += 0.2;
    });
    
    return Math.min(1, score);
  }

  extractKeyPhrases(text) {
    if (!text) return [];
    
    // Simple key phrase extraction
    const sentences = text.split(/[.!?]+/);
    const phrases = [];
    
    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/);
      if (words.length >= 2 && words.length <= 4) {
        const phrase = words.join(' ').toLowerCase();
        if (phrase.length > 5 && !phrases.includes(phrase)) {
          phrases.push(phrase);
        }
      }
    });
    
    return phrases.slice(0, 50); // Top 50 phrases
  }

  calculateKeywordImportance(keyword, text) {
    const frequency = (text.match(new RegExp(keyword, 'gi')) || []).length;
    const length = keyword.split(' ').length;
    const position = text.toLowerCase().indexOf(keyword.toLowerCase());
    
    let importance = frequency * length;
    
    // Boost importance if appears early in text
    if (position >= 0 && position < text.length * 0.2) {
      importance *= 1.5;
    }
    
    return importance;
  }

  extractHeadings(html) {
    // Mock implementation - would extract all headings
    return [];
  }

  extractLinks(html) {
    // Mock implementation - would extract all links
    return [];
  }

  extractImages(html) {
    // Mock implementation - would extract all images
    return [];
  }

  extractForms(html) {
    // Mock implementation - would extract all forms
    return [];
  }
}

module.exports = { PageContentAnalyzer };