// 📊 INTELLIGENT DATA EXTRACTOR
// Advanced data extraction from web pages

class IntelligentDataExtractor {
  constructor() {
    this.extractors = new Map();
    this.dataPatterns = new Map();
    this.comparisonRules = new Map();
    this.initializeExtractors();
  }

  async initialize() {
    console.log('📊 Initializing Intelligent Data Extractor...');
    this.initializeExtractors();
    this.initializeDataPatterns();
    this.initializeComparisonRules();
  }

  initializeExtractors() {
    // Product/E-commerce extractors
    this.extractors.set('product', {
      title: {
        selectors: ['h1', '.product-title', '.item-title', '[data-title]'],
        required: true,
        multiple: false
      },
      price: {
        selectors: ['.price', '[data-price]', '.cost', '.amount', '.price-current'],
        required: true,
        multiple: false,
        transform: 'extractPrice'
      },
      originalPrice: {
        selectors: ['.original-price', '.was-price', '.price-original', '.msrp'],
        required: false,
        multiple: false,
        transform: 'extractPrice'
      },
      rating: {
        selectors: ['.rating', '.stars', '[data-rating]', '.review-rating'],
        required: false,
        multiple: false,
        transform: 'extractRating'
      },
      reviews: {
        selectors: ['.reviews', '.review-count', '[data-reviews]'],
        required: false,
        multiple: false,
        transform: 'extractNumber'
      },
      description: {
        selectors: ['.description', '.product-description', '.item-description'],
        required: false,
        multiple: false
      },
      images: {
        selectors: ['.product-image img', '.item-image img', '[data-image]'],
        required: false,
        multiple: true,
        attribute: 'src'
      },
      availability: {
        selectors: ['.availability', '.stock', '.in-stock', '[data-stock]'],
        required: false,
        multiple: false
      },
      brand: {
        selectors: ['.brand', '.manufacturer', '[data-brand]'],
        required: false,
        multiple: false
      },
      specifications: {
        selectors: ['.specs', '.specifications', '.features'],
        required: false,
        multiple: true
      }
    });

    // Article/News extractors
    this.extractors.set('article', {
      headline: {
        selectors: ['h1', '.headline', '.title', 'article h1'],
        required: true,
        multiple: false
      },
      author: {
        selectors: ['.author', '.byline', '[rel="author"]', '.writer'],
        required: false,
        multiple: false
      },
      date: {
        selectors: ['.date', '.published', 'time', '[datetime]'],
        required: false,
        multiple: false,
        transform: 'extractDate'
      },
      content: {
        selectors: ['.content', '.article-body', '.post-content', 'article p'],
        required: true,
        multiple: true
      },
      tags: {
        selectors: ['.tags', '.categories', '.topics', '.tag'],
        required: false,
        multiple: true
      },
      readingTime: {
        selectors: ['.reading-time', '.read-time'],
        required: false,
        multiple: false,
        transform: 'extractReadingTime'
      }
    });

    // Search result extractors
    this.extractors.set('search_results', {
      results: {
        selectors: ['.result', '.search-result', '[data-result]', '.g'],
        required: true,
        multiple: true,
        nested: {
          title: {
            selectors: ['h3', '.result-title', 'a h3'],
            required: true
          },
          url: {
            selectors: ['a[href]', '.result-url'],
            required: true,
            attribute: 'href'
          },
          snippet: {
            selectors: ['.snippet', '.description', '.result-description'],
            required: false
          },
          meta: {
            selectors: ['.meta', '.result-meta', '.url-meta'],
            required: false
          }
        }
      }
    });

    // Contact information extractors
    this.extractors.set('contact', {
      emails: {
        selectors: ['[href^="mailto:"]', '.email'],
        required: false,
        multiple: true,
        transform: 'extractEmails'
      },
      phones: {
        selectors: ['[href^="tel:"]', '.phone'],
        required: false,
        multiple: true,
        transform: 'extractPhones'
      },
      addresses: {
        selectors: ['.address', '.location', '[data-address]'],
        required: false,
        multiple: true
      },
      socialLinks: {
        selectors: ['[href*="facebook"]', '[href*="twitter"]', '[href*="linkedin"]', '[href*="instagram"]'],
        required: false,
        multiple: true,
        attribute: 'href'
      }
    });
  }

  initializeDataPatterns() {
    this.dataPatterns.set('price', [
      /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g,
      /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|EUR|GBP)/gi,
      /Price:\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/gi
    ]);

    this.dataPatterns.set('rating', [
      /(\d+(?:\.\d+)?)\s*(?:out of|\/)\s*(\d+)(?:\s*stars?)?/gi,
      /(\d+(?:\.\d+)?)\s*star/gi,
      /Rating:\s*(\d+(?:\.\d+)?)/gi
    ]);

    this.dataPatterns.set('email', [
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    ]);

    this.dataPatterns.set('phone', [
      /\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
      /\(\d{3}\)\s*\d{3}-\d{4}/g
    ]);

    this.dataPatterns.set('date', [
      /\d{4}-\d{2}-\d{2}/g,
      /\d{1,2}\/\d{1,2}\/\d{4}/g,
      /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/gi
    ]);
  }

  initializeComparisonRules() {
    this.comparisonRules.set('price', {
      type: 'numeric',
      direction: 'lower_better', // lower prices are better
      format: 'currency'
    });

    this.comparisonRules.set('rating', {
      type: 'numeric',
      direction: 'higher_better', // higher ratings are better
      format: 'rating'
    });

    this.comparisonRules.set('reviews', {
      type: 'numeric',
      direction: 'higher_better', // more reviews generally better
      format: 'count'
    });
  }

  async extractData(webContents, extractors) {
    try {
      console.log(`📊 Extracting data using extractors: ${extractors.join(', ')}`);

      const extractedData = {};

      for (const extractorName of extractors) {
        try {
          const extractorConfig = this.extractors.get(extractorName);
          if (!extractorConfig) {
            console.warn(`⚠️ Unknown extractor: ${extractorName}`);
            continue;
          }

          const data = await this.extractWithConfig(webContents, extractorConfig);
          extractedData[extractorName] = data;

        } catch (extractorError) {
          console.error(`❌ Extractor ${extractorName} failed:`, extractorError);
          extractedData[extractorName] = { success: false, error: extractorError.message };
        }
      }

      console.log(`✅ Data extraction completed: ${Object.keys(extractedData).length} extractors`);
      return extractedData;

    } catch (error) {
      console.error('❌ Data extraction failed:', error);
      return { success: false, error: error.message };
    }
  }

  async extractWithConfig(webContents, config) {
    const extractedData = {};

    for (const [fieldName, fieldConfig] of Object.entries(config)) {
      try {
        const fieldData = await this.extractField(webContents, fieldConfig);
        
        if (fieldConfig.required && (!fieldData || fieldData.length === 0)) {
          throw new Error(`Required field missing: ${fieldName}`);
        }

        extractedData[fieldName] = fieldData;

      } catch (fieldError) {
        console.warn(`⚠️ Field extraction failed: ${fieldName}`, fieldError);
        extractedData[fieldName] = fieldConfig.required ? null : undefined;
      }
    }

    return extractedData;
  }

  async extractField(webContents, fieldConfig) {
    try {
      let extractedValues = [];

      // Try each selector until we find data
      for (const selector of fieldConfig.selectors) {
        const values = await this.extractFromSelector(webContents, selector, fieldConfig);
        if (values && values.length > 0) {
          extractedValues = values;
          break;
        }
      }

      // Handle nested extraction (e.g., for search results)
      if (fieldConfig.nested && extractedValues.length > 0) {
        const nestedResults = [];
        
        for (const element of extractedValues) {
          const nestedData = {};
          
          for (const [nestedField, nestedConfig] of Object.entries(fieldConfig.nested)) {
            try {
              // Extract nested field within the context of the parent element
              const nestedValues = await this.extractNestedField(webContents, element, nestedConfig);
              nestedData[nestedField] = nestedConfig.multiple ? nestedValues : nestedValues[0];
            } catch (nestedError) {
              console.warn(`⚠️ Nested field extraction failed: ${nestedField}`, nestedError);
            }
          }
          
          nestedResults.push(nestedData);
        }
        
        return nestedResults;
      }

      // Apply transformation if specified
      if (fieldConfig.transform && extractedValues.length > 0) {
        extractedValues = extractedValues.map(value => this.applyTransformation(value, fieldConfig.transform));
      }

      // Return single value or array based on multiple flag
      return fieldConfig.multiple ? extractedValues : extractedValues[0];

    } catch (error) {
      throw new Error(`Field extraction failed: ${error.message}`);
    }
  }

  async extractFromSelector(webContents, selector, fieldConfig) {
    try {
      const result = await webContents.executeJavaScript(`
        (function() {
          try {
            const elements = document.querySelectorAll('${selector}');
            const values = [];
            
            elements.forEach(element => {
              let value;
              
              if ('${fieldConfig.attribute}' && '${fieldConfig.attribute}' !== 'undefined') {
                value = element.getAttribute('${fieldConfig.attribute}');
              } else {
                value = element.textContent || element.innerText || '';
              }
              
              if (value && value.trim()) {
                values.push(value.trim());
              }
            });
            
            return values;
          } catch (error) {
            return [];
          }
        })()
      `);

      return result || [];

    } catch (error) {
      return [];
    }
  }

  async extractNestedField(webContents, parentElement, nestedConfig) {
    // Mock implementation - in real scenario, would extract from within parent element context
    return [];
  }

  applyTransformation(value, transformationType) {
    try {
      switch (transformationType) {
        case 'extractPrice':
          return this.extractPrice(value);
          
        case 'extractRating':
          return this.extractRating(value);
          
        case 'extractNumber':
          return this.extractNumber(value);
          
        case 'extractDate':
          return this.extractDate(value);
          
        case 'extractEmails':
          return this.extractEmails(value);
          
        case 'extractPhones':
          return this.extractPhones(value);
          
        case 'extractReadingTime':
          return this.extractReadingTime(value);
          
        default:
          return value;
      }
    } catch (error) {
      console.warn(`⚠️ Transformation failed: ${transformationType}`, error);
      return value;
    }
  }

  async compareData(results, comparisonRules) {
    try {
      console.log(`📊 Comparing data across ${results.length} results`);

      const comparison = {
        comparisons: [],
        recommendations: [],
        bestOptions: {},
        summary: {}
      };

      // Extract comparable data points
      const comparableFields = this.identifyComparableFields(results);
      
      for (const field of comparableFields) {
        const rule = comparisonRules[field] || this.comparisonRules.get(field);
        if (!rule) continue;

        const fieldComparison = await this.compareField(results, field, rule);
        comparison.comparisons.push(fieldComparison);

        // Identify best option for this field
        if (fieldComparison.bestValue !== undefined) {
          comparison.bestOptions[field] = fieldComparison.bestValue;
        }
      }

      // Generate overall recommendations
      comparison.recommendations = this.generateRecommendations(comparison.comparisons);
      comparison.summary = this.generateComparisonSummary(comparison);

      console.log(`✅ Data comparison completed: ${comparison.comparisons.length} fields compared`);
      return comparison;

    } catch (error) {
      console.error('❌ Data comparison failed:', error);
      return { success: false, error: error.message };
    }
  }

  identifyComparableFields(results) {
    const fieldCounts = {};
    
    results.forEach(result => {
      if (result.result && result.result.data) {
        Object.keys(result.result.data).forEach(extractor => {
          const extractorData = result.result.data[extractor];
          if (extractorData && typeof extractorData === 'object') {
            Object.keys(extractorData).forEach(field => {
              fieldCounts[field] = (fieldCounts[field] || 0) + 1;
            });
          }
        });
      }
    });

    // Only compare fields that appear in at least half of the results
    const threshold = Math.ceil(results.length / 2);
    return Object.keys(fieldCounts).filter(field => fieldCounts[field] >= threshold);
  }

  async compareField(results, field, rule) {
    const values = [];
    const sources = [];

    results.forEach((result, index) => {
      if (result.result && result.result.data) {
        Object.values(result.result.data).forEach(extractorData => {
          if (extractorData[field] !== undefined && extractorData[field] !== null) {
            values.push(extractorData[field]);
            sources.push(index);
          }
        });
      }
    });

    if (values.length === 0) {
      return { field, values: [], bestValue: undefined, comparison: 'no_data' };
    }

    let bestValue;
    let bestIndex;

    if (rule.type === 'numeric') {
      const numericValues = values.map(v => this.parseNumericValue(v)).filter(v => !isNaN(v));
      
      if (numericValues.length > 0) {
        if (rule.direction === 'lower_better') {
          bestValue = Math.min(...numericValues);
          bestIndex = values.findIndex(v => this.parseNumericValue(v) === bestValue);
        } else {
          bestValue = Math.max(...numericValues);
          bestIndex = values.findIndex(v => this.parseNumericValue(v) === bestValue);
        }
      }
    }

    return {
      field,
      values,
      sources,
      bestValue,
      bestIndex,
      rule,
      statistics: this.calculateFieldStatistics(values, rule)
    };
  }

  parseNumericValue(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove currency symbols and formatting
      const cleaned = value.replace(/[$,\s]/g, '');
      return parseFloat(cleaned);
    }
    return NaN;
  }

  calculateFieldStatistics(values, rule) {
    if (rule.type !== 'numeric') return {};

    const numericValues = values.map(v => this.parseNumericValue(v)).filter(v => !isNaN(v));
    
    if (numericValues.length === 0) return {};

    return {
      min: Math.min(...numericValues),
      max: Math.max(...numericValues),
      average: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
      count: numericValues.length,
      range: Math.max(...numericValues) - Math.min(...numericValues)
    };
  }

  generateRecommendations(comparisons) {
    const recommendations = [];

    comparisons.forEach(comparison => {
      if (comparison.bestValue !== undefined) {
        recommendations.push({
          type: 'best_value',
          field: comparison.field,
          value: comparison.bestValue,
          source: comparison.sources[comparison.bestIndex],
          reason: `Best ${comparison.field} based on ${comparison.rule.direction} criteria`
        });
      }
    });

    return recommendations;
  }

  generateComparisonSummary(comparison) {
    return {
      totalComparisons: comparison.comparisons.length,
      fieldsCompared: comparison.comparisons.map(c => c.field),
      recommendationsCount: comparison.recommendations.length,
      bestOptionsCount: Object.keys(comparison.bestOptions).length
    };
  }

  // 🛠️ TRANSFORMATION METHODS

  extractPrice(text) {
    if (!text || typeof text !== 'string') return null;
    
    const patterns = this.dataPatterns.get('price');
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const price = parseFloat(match[1] || match[0].replace(/[^0-9.]/g, ''));
        return isNaN(price) ? null : price;
      }
    }
    return null;
  }

  extractRating(text) {
    if (!text || typeof text !== 'string') return null;
    
    const patterns = this.dataPatterns.get('rating');
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        // Check if pattern captures both rating and maximum (e.g., "4.5 out of 5")
        if (match[2]) {
          const rating = parseFloat(match[1]);
          const maxRating = parseFloat(match[2]);
          // Normalize to 5-star scale
          return maxRating === 5 ? rating : (rating / maxRating) * 5;
        } else {
          // Direct rating (e.g., "4.5 star")
          const rating = parseFloat(match[1]);
          return isNaN(rating) ? null : Math.min(5, Math.max(0, rating));
        }
      }
    }
    return null;
  }

  extractNumber(text) {
    if (!text || typeof text !== 'string') return null;
    
    const numberMatch = text.match(/(\d+(?:,\d{3})*)/);
    if (numberMatch) {
      const number = parseInt(numberMatch[1].replace(/,/g, ''));
      return isNaN(number) ? null : number;
    }
    return null;
  }

  extractDate(text) {
    if (!text || typeof text !== 'string') return null;
    
    const patterns = this.dataPatterns.get('date');
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const date = new Date(match[0]);
        return isNaN(date.getTime()) ? null : date.toISOString();
      }
    }
    return null;
  }

  extractEmails(text) {
    if (!text || typeof text !== 'string') return [];
    
    const emailPattern = this.dataPatterns.get('email')[0];
    const matches = text.match(emailPattern);
    return matches || [];
  }

  extractPhones(text) {
    if (!text || typeof text !== 'string') return [];
    
    const phonePatterns = this.dataPatterns.get('phone');
    const phones = [];
    
    phonePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        phones.push(...matches);
      }
    });
    
    return [...new Set(phones)]; // Remove duplicates
  }

  extractReadingTime(text) {
    if (!text || typeof text !== 'string') return null;
    
    const timeMatch = text.match(/(\d+)\s*(?:min|minute)/i);
    if (timeMatch) {
      return parseInt(timeMatch[1]);
    }
    
    // Estimate reading time if not explicitly stated
    const wordCount = text.split(' ').length;
    return Math.ceil(wordCount / 200); // 200 words per minute
  }
}

module.exports = { IntelligentDataExtractor };