// 📄 RESULT COMPILER
// Compiles automation results into comprehensive AI tabs

class ResultCompiler {
  constructor(browserManager) {
    this.manager = browserManager;
    this.templates = new Map();
    this.formatters = new Map();
    this.initializeTemplates();
  }

  async initialize() {
    console.log('📄 Initializing Result Compiler...');
    this.initializeTemplates();
    this.initializeFormatters();
  }

  initializeTemplates() {
    // Research result template
    this.templates.set('research', {
      title: 'Research Report: {topic}',
      sections: [
        'executive_summary',
        'key_findings',
        'detailed_analysis',
        'sources',
        'recommendations',
        'next_steps'
      ],
      format: 'markdown'
    });

    // Shopping comparison template
    this.templates.set('shopping', {
      title: 'Shopping Analysis: {query}',
      sections: [
        'comparison_summary',
        'best_deals',
        'product_comparison',
        'price_analysis',
        'user_reviews',
        'buying_recommendations'
      ],
      format: 'markdown'
    });

    // Analysis report template
    this.templates.set('analysis', {
      title: 'Content Analysis: {subject}',
      sections: [
        'analysis_overview',
        'key_insights',
        'data_summary',
        'visualizations',
        'conclusions',
        'action_items'
      ],
      format: 'markdown'
    });

    // Navigation summary template
    this.templates.set('navigation', {
      title: 'Site Analysis: {domain}',
      sections: [
        'site_overview',
        'page_structure',
        'content_highlights',
        'technical_details',
        'recommendations'
      ],
      format: 'markdown'
    });

    // Communication template
    this.templates.set('communication', {
      title: 'Communication Report: {type}',
      sections: [
        'summary',
        'generated_content',
        'templates_used',
        'optimization_suggestions',
        'follow_up_actions'
      ],
      format: 'markdown'
    });

    // Automation summary template
    this.templates.set('automation', {
      title: 'Automation Report: {task}',
      sections: [
        'execution_summary',
        'completed_actions',
        'results_achieved',
        'performance_metrics',
        'optimization_opportunities',
        'schedule_recommendations'
      ],
      format: 'markdown'
    });
  }

  initializeFormatters() {
    // Markdown formatters
    this.formatters.set('markdown', {
      header: (level, text) => `${'#'.repeat(level)} ${text}\n\n`,
      bold: (text) => `**${text}**`,
      italic: (text) => `*${text}*`,
      list: (items) => items.map(item => `- ${item}`).join('\n') + '\n\n',
      numberedList: (items) => items.map((item, i) => `${i + 1}. ${item}`).join('\n') + '\n\n',
      table: (headers, rows) => {
        let table = `| ${headers.join(' | ')} |\n`;
        table += `| ${headers.map(() => '---').join(' | ')} |\n`;
        rows.forEach(row => {
          table += `| ${row.join(' | ')} |\n`;
        });
        return table + '\n';
      },
      code: (code, language = '') => `\`\`\`${language}\n${code}\n\`\`\`\n\n`,
      quote: (text) => `> ${text}\n\n`,
      link: (text, url) => `[${text}](${url})`,
      divider: () => '\n---\n\n'
    });

    // HTML formatters
    this.formatters.set('html', {
      header: (level, text) => `<h${level}>${text}</h${level}>`,
      bold: (text) => `<strong>${text}</strong>`,
      italic: (text) => `<em>${text}</em>`,
      list: (items) => `<ul>\n${items.map(item => `  <li>${item}</li>`).join('\n')}\n</ul>`,
      numberedList: (items) => `<ol>\n${items.map(item => `  <li>${item}</li>`).join('\n')}\n</ol>`,
      table: (headers, rows) => {
        let table = '<table>\n<thead>\n<tr>\n';
        headers.forEach(header => table += `    <th>${header}</th>\n`);
        table += '</tr>\n</thead>\n<tbody>\n';
        rows.forEach(row => {
          table += '<tr>\n';
          row.forEach(cell => table += `    <td>${cell}</td>\n`);
          table += '</tr>\n';
        });
        table += '</tbody>\n</table>';
        return table;
      },
      code: (code, language = '') => `<pre><code class="${language}">${code}</code></pre>`,
      quote: (text) => `<blockquote>${text}</blockquote>`,
      link: (text, url) => `<a href="${url}">${text}</a>`,
      divider: () => '<hr>'
    });
  }

  async compileResults(results, plan) {
    try {
      console.log(`📄 Compiling results for plan: ${plan.title}`);

      // Determine the appropriate template based on plan type
      const templateName = this.determineTemplate(plan);
      const template = this.templates.get(templateName);
      
      if (!template) {
        console.warn(`⚠️ No template found for type: ${templateName}, using default`);
        return await this.compileGenericResults(results, plan);
      }

      // Extract key variables for template
      const variables = this.extractTemplateVariables(results, plan);
      
      // Generate title
      const title = this.formatTitle(template.title, variables);

      // Compile content sections
      const content = await this.compileSections(results, template.sections, variables, template.format);

      console.log(`✅ Results compiled: ${title}`);

      return {
        title,
        content,
        template: templateName,
        format: template.format,
        compiledAt: new Date().toISOString(),
        variables
      };

    } catch (error) {
      console.error('❌ Result compilation failed:', error);
      return await this.compileGenericResults(results, plan);
    }
  }

  determineTemplate(plan) {
    const planType = plan.type?.toLowerCase() || '';
    const planTitle = plan.title?.toLowerCase() || '';

    // Match based on plan type
    if (planType.includes('research') || planTitle.includes('research')) return 'research';
    if (planType.includes('shopping') || planTitle.includes('shop') || planTitle.includes('buy')) return 'shopping';
    if (planType.includes('analysis') || planTitle.includes('analyz')) return 'analysis';
    if (planType.includes('navigation') || planTitle.includes('navigat')) return 'navigation';
    if (planType.includes('communication') || planTitle.includes('email') || planTitle.includes('message')) return 'communication';
    if (planType.includes('automation') || planTitle.includes('automat')) return 'automation';

    // Default to research template
    return 'research';
  }

  extractTemplateVariables(results, plan) {
    const variables = {
      topic: plan.title || 'Unknown',
      query: plan.query || plan.title || '',
      type: plan.type || 'task',
      task: plan.title || 'automation task',
      subject: plan.title || 'analysis',
      domain: this.extractDomain(results),
      timestamp: new Date().toISOString(),
      executionTime: this.calculateExecutionTime(results),
      successRate: this.calculateSuccessRate(results)
    };

    return variables;
  }

  formatTitle(titleTemplate, variables) {
    let title = titleTemplate;
    
    Object.entries(variables).forEach(([key, value]) => {
      title = title.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    return title;
  }

  async compileSections(results, sections, variables, format) {
    const formatter = this.formatters.get(format) || this.formatters.get('markdown');
    let content = '';

    for (const section of sections) {
      try {
        const sectionContent = await this.compileSection(section, results, variables, formatter);
        if (sectionContent) {
          content += sectionContent;
        }
      } catch (sectionError) {
        console.warn(`⚠️ Section compilation failed: ${section}`, sectionError);
      }
    }

    return content;
  }

  async compileSection(sectionType, results, variables, formatter) {
    switch (sectionType) {
      case 'executive_summary':
        return this.compileExecutiveSummary(results, variables, formatter);
        
      case 'key_findings':
        return this.compileKeyFindings(results, variables, formatter);
        
      case 'detailed_analysis':
        return this.compileDetailedAnalysis(results, variables, formatter);
        
      case 'sources':
        return this.compileSources(results, variables, formatter);
        
      case 'recommendations':
        return this.compileRecommendations(results, variables, formatter);
        
      case 'next_steps':
        return this.compileNextSteps(results, variables, formatter);
        
      case 'comparison_summary':
        return this.compileComparisonSummary(results, variables, formatter);
        
      case 'best_deals':
        return this.compileBestDeals(results, variables, formatter);
        
      case 'product_comparison':
        return this.compileProductComparison(results, variables, formatter);
        
      case 'price_analysis':
        return this.compilePriceAnalysis(results, variables, formatter);
        
      case 'execution_summary':
        return this.compileExecutionSummary(results, variables, formatter);
        
      case 'completed_actions':
        return this.compileCompletedActions(results, variables, formatter);
        
      case 'performance_metrics':
        return this.compilePerformanceMetrics(results, variables, formatter);
        
      default:
        return this.compileGenericSection(sectionType, results, variables, formatter);
    }
  }

  compileExecutiveSummary(results, variables, formatter) {
    let summary = formatter.header(2, '📋 Executive Summary');
    
    const successfulResults = results.filter(r => r.result?.success);
    const totalSteps = results.length;
    const successRate = (successfulResults.length / totalSteps * 100).toFixed(1);
    
    summary += `This ${variables.type} operation completed with a **${successRate}% success rate**, `;
    summary += `executing ${totalSteps} steps in ${variables.executionTime}.\n\n`;
    
    if (successfulResults.length > 0) {
      summary += `**Key Achievements:**\n`;
      summary += formatter.list([
        `Successfully processed ${successfulResults.length} out of ${totalSteps} planned actions`,
        `Gathered comprehensive data from multiple sources`,
        `Generated actionable insights and recommendations`,
        `Completed analysis within expected timeframe`
      ]);
    }

    return summary;
  }

  compileKeyFindings(results, variables, formatter) {
    let findings = formatter.header(2, '🔍 Key Findings');
    
    const dataPoints = this.extractDataPoints(results);
    if (dataPoints.length === 0) {
      return findings + 'No significant findings to report.\n\n';
    }

    findings += formatter.list(dataPoints.slice(0, 10)); // Top 10 findings
    
    return findings;
  }

  compileDetailedAnalysis(results, variables, formatter) {
    let analysis = formatter.header(2, '📊 Detailed Analysis');
    
    results.forEach((result, index) => {
      if (result.result?.success && result.result?.data) {
        analysis += formatter.header(3, `Step ${index + 1}: ${result.step?.action || 'Unknown Action'}`);
        
        if (result.step?.description) {
          analysis += `${result.step.description}\n\n`;
        }

        // Add extracted data summary
        const dataEntries = Object.entries(result.result.data);
        if (dataEntries.length > 0) {
          analysis += '**Data Extracted:**\n';
          const dataList = dataEntries.map(([key, value]) => {
            if (typeof value === 'object') {
              return `${key}: ${Object.keys(value).length} items`;
            }
            return `${key}: ${String(value).substring(0, 100)}${String(value).length > 100 ? '...' : ''}`;
          });
          analysis += formatter.list(dataList);
        }
      }
    });

    return analysis;
  }

  compileSources(results, variables, formatter) {
    let sources = formatter.header(2, '📚 Sources');
    
    const sourceList = this.extractSources(results);
    if (sourceList.length === 0) {
      return sources + 'No sources to report.\n\n';
    }

    sources += formatter.numberedList(sourceList);
    
    return sources;
  }

  compileRecommendations(results, variables, formatter) {
    let recommendations = formatter.header(2, '💡 Recommendations');
    
    const recs = this.generateRecommendations(results, variables);
    if (recs.length === 0) {
      return recommendations + 'No specific recommendations at this time.\n\n';
    }

    recommendations += formatter.list(recs);
    
    return recommendations;
  }

  compileNextSteps(results, variables, formatter) {
    let nextSteps = formatter.header(2, '🚀 Next Steps');
    
    const steps = this.generateNextSteps(results, variables);
    if (steps.length === 0) {
      return nextSteps + 'No immediate next steps identified.\n\n';
    }

    nextSteps += formatter.numberedList(steps);
    
    return nextSteps;
  }

  compileComparisonSummary(results, variables, formatter) {
    let summary = formatter.header(2, '📊 Comparison Summary');
    
    const comparisons = this.extractComparisons(results);
    if (!comparisons || comparisons.length === 0) {
      return summary + 'No comparison data available.\n\n';
    }

    summary += `Compared **${comparisons.length}** different options across multiple criteria.\n\n`;
    
    // Create comparison table if we have structured data
    const comparisonTable = this.createComparisonTable(comparisons);
    if (comparisonTable) {
      summary += comparisonTable;
    }

    return summary;
  }

  compileBestDeals(results, variables, formatter) {
    let deals = formatter.header(2, '💰 Best Deals Found');
    
    const bestDeals = this.extractBestDeals(results);
    if (bestDeals.length === 0) {
      return deals + 'No deals identified.\n\n';
    }

    bestDeals.forEach((deal, index) => {
      deals += formatter.header(3, `Deal ${index + 1}: ${deal.title || 'Unknown Product'}`);
      deals += formatter.list([
        `**Price:** ${deal.price || 'Not available'}`,
        `**Source:** ${deal.source || 'Unknown'}`,
        `**Rating:** ${deal.rating || 'Not rated'}`,
        `**Availability:** ${deal.availability || 'Unknown'}`
      ]);
    });

    return deals;
  }

  compileExecutionSummary(results, variables, formatter) {
    let summary = formatter.header(2, '⚡ Execution Summary');
    
    const stats = this.calculateExecutionStats(results);
    
    summary += formatter.list([
      `**Total Steps:** ${stats.totalSteps}`,
      `**Successful Steps:** ${stats.successfulSteps}`,
      `**Failed Steps:** ${stats.failedSteps}`,
      `**Success Rate:** ${stats.successRate}%`,
      `**Execution Time:** ${stats.executionTime}`,
      `**Average Step Duration:** ${stats.averageStepDuration}`
    ]);

    return summary;
  }

  compileCompletedActions(results, variables, formatter) {
    let actions = formatter.header(2, '✅ Completed Actions');
    
    const completedActions = results
      .filter(r => r.result?.success)
      .map(r => ({
        action: r.step?.action || 'Unknown',
        description: r.step?.description || '',
        timestamp: r.timestamp
      }));

    if (completedActions.length === 0) {
      return actions + 'No actions completed successfully.\n\n';
    }

    actions += formatter.numberedList(
      completedActions.map(action => 
        `**${action.action}**: ${action.description}${action.timestamp ? ` (${new Date(action.timestamp).toLocaleTimeString()})` : ''}`
      )
    );

    return actions;
  }

  compilePerformanceMetrics(results, variables, formatter) {
    let metrics = formatter.header(2, '📈 Performance Metrics');
    
    const performanceData = this.calculatePerformanceMetrics(results);
    
    if (Object.keys(performanceData).length === 0) {
      return metrics + 'No performance metrics available.\n\n';
    }

    const metricsList = Object.entries(performanceData).map(([key, value]) => 
      `**${key}**: ${value}`
    );

    metrics += formatter.list(metricsList);
    
    return metrics;
  }

  compileGenericSection(sectionType, results, variables, formatter) {
    const title = sectionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    let section = formatter.header(2, `📋 ${title}`);
    
    section += `This section contains information about ${sectionType.replace(/_/g, ' ')}.\n\n`;
    
    return section;
  }

  async compileGenericResults(results, plan) {
    const formatter = this.formatters.get('markdown');
    
    let content = formatter.header(1, `📋 ${plan.title || 'Automation Results'}`);
    content += `**Completed:** ${new Date().toLocaleString()}\n\n`;
    content += formatter.divider();
    
    content += formatter.header(2, '📊 Summary');
    content += `Executed ${results.length} steps with mixed results.\n\n`;
    
    content += formatter.header(2, '📝 Step Details');
    results.forEach((result, index) => {
      content += formatter.header(3, `Step ${index + 1}`);
      content += formatter.list([
        `**Action:** ${result.step?.action || 'Unknown'}`,
        `**Status:** ${result.result?.success ? '✅ Success' : '❌ Failed'}`,
        `**Timestamp:** ${new Date(result.timestamp).toLocaleString()}`
      ]);
    });

    return {
      title: plan.title || 'Automation Results',
      content,
      template: 'generic',
      format: 'markdown',
      compiledAt: new Date().toISOString()
    };
  }

  async createResultTab(compiledContent, title, options = {}) {
    try {
      console.log(`📄 Creating result tab: ${title}`);

      // Use the browser manager to create an AI tab
      const result = await this.manager.mainWindow?.webContents.send('create-ai-tab', {
        title,
        content: compiledContent,
        type: 'ai',
        ...options
      });

      const tabId = `ai_tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log(`✅ Result tab created: ${tabId}`);

      return {
        success: true,
        tabId,
        title,
        content: compiledContent,
        createdAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Result tab creation failed:', error);
      return { success: false, error: error.message };
    }
  }

  // 🛠️ UTILITY METHODS

  extractDataPoints(results) {
    const dataPoints = [];
    
    results.forEach(result => {
      if (result.result?.success && result.result?.data) {
        Object.entries(result.result.data).forEach(([extractor, data]) => {
          if (typeof data === 'object' && data !== null) {
            Object.entries(data).forEach(([key, value]) => {
              if (value && typeof value === 'string' && value.length > 10) {
                dataPoints.push(`${key}: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
              } else if (typeof value === 'number') {
                dataPoints.push(`${key}: ${value}`);
              }
            });
          }
        });
      }
    });

    return [...new Set(dataPoints)]; // Remove duplicates
  }

  extractSources(results) {
    const sources = [];
    
    results.forEach(result => {
      if (result.result?.success) {
        if (result.result.url) {
          sources.push(`${result.result.title || 'Unknown'} - ${result.result.url}`);
        }
        if (result.step?.url) {
          sources.push(`${result.step.action || 'Unknown'} - ${result.step.url}`);
        }
      }
    });

    return [...new Set(sources)];
  }

  extractComparisons(results) {
    // Look for comparison data in results
    for (const result of results) {
      if (result.result?.comparison) {
        return result.result.comparison.comparisons || [];
      }
    }
    return [];
  }

  extractBestDeals(results) {
    const deals = [];
    
    results.forEach(result => {
      if (result.result?.data) {
        Object.values(result.result.data).forEach(extractorData => {
          if (extractorData && typeof extractorData === 'object') {
            if (extractorData.price && extractorData.title) {
              deals.push({
                title: extractorData.title,
                price: extractorData.price,
                rating: extractorData.rating,
                source: result.result.url || 'Unknown',
                availability: extractorData.availability
              });
            }
          }
        });
      }
    });

    // Sort by price (ascending) and return top deals
    return deals.sort((a, b) => {
      const priceA = typeof a.price === 'number' ? a.price : parseFloat(String(a.price).replace(/[^0-9.]/g, ''));
      const priceB = typeof b.price === 'number' ? b.price : parseFloat(String(b.price).replace(/[^0-9.]/g, ''));
      return priceA - priceB;
    }).slice(0, 5);
  }

  generateRecommendations(results, variables) {
    const recommendations = [];
    
    // Basic recommendations based on execution
    const successRate = this.calculateSuccessRate(results);
    
    if (successRate < 50) {
      recommendations.push('Consider reviewing the automation plan to improve success rate');
    }
    
    if (successRate > 80) {
      recommendations.push('High success rate achieved - consider scheduling regular execution');
    }

    // Add domain-specific recommendations
    if (variables.type?.includes('research')) {
      recommendations.push('Consider setting up monitoring for ongoing research updates');
      recommendations.push('Save important findings to knowledge base for future reference');
    }

    if (variables.type?.includes('shopping')) {
      recommendations.push('Set up price monitoring for identified products');
      recommendations.push('Check for seasonal sales and promotions');
    }

    return recommendations;
  }

  generateNextSteps(results, variables) {
    const steps = [];
    
    // Generic next steps based on results
    const failedResults = results.filter(r => !r.result?.success);
    
    if (failedResults.length > 0) {
      steps.push('Review and retry failed automation steps');
    }

    steps.push('Monitor results for any changes or updates');
    steps.push('Consider creating automated monitoring for ongoing tracking');
    
    // Add specific next steps based on type
    if (variables.type?.includes('research')) {
      steps.push('Create follow-up research goals for deeper investigation');
      steps.push('Share findings with relevant stakeholders');
    }

    return steps;
  }

  calculateExecutionStats(results) {
    const totalSteps = results.length;
    const successfulSteps = results.filter(r => r.result?.success).length;
    const failedSteps = totalSteps - successfulSteps;
    const successRate = totalSteps > 0 ? ((successfulSteps / totalSteps) * 100).toFixed(1) : 0;

    const timestamps = results.map(r => r.timestamp).filter(t => t);
    const executionTime = timestamps.length > 1 ? 
      `${((Math.max(...timestamps) - Math.min(...timestamps)) / 1000).toFixed(1)}s` : 'Unknown';

    const averageStepDuration = timestamps.length > 1 ? 
      `${((Math.max(...timestamps) - Math.min(...timestamps)) / (timestamps.length * 1000)).toFixed(2)}s` : 'Unknown';

    return {
      totalSteps,
      successfulSteps,
      failedSteps,
      successRate,
      executionTime,
      averageStepDuration
    };
  }

  calculatePerformanceMetrics(results) {
    const metrics = {};
    
    // Basic performance metrics
    const successRate = this.calculateSuccessRate(results);
    metrics['Success Rate'] = `${successRate}%`;
    
    const timestamps = results.map(r => r.timestamp).filter(t => t);
    if (timestamps.length > 1) {
      const totalTime = (Math.max(...timestamps) - Math.min(...timestamps)) / 1000;
      metrics['Total Execution Time'] = `${totalTime.toFixed(1)} seconds`;
      metrics['Average Step Time'] = `${(totalTime / results.length).toFixed(2)} seconds`;
    }

    // Data extraction metrics
    const dataExtractions = results.filter(r => r.result?.data && Object.keys(r.result.data).length > 0);
    if (dataExtractions.length > 0) {
      metrics['Data Points Extracted'] = dataExtractions.reduce((sum, r) => 
        sum + Object.keys(r.result.data).length, 0);
    }

    return metrics;
  }

  extractDomain(results) {
    for (const result of results) {
      if (result.result?.url) {
        try {
          return new URL(result.result.url).hostname;
        } catch (error) {
          // Ignore invalid URLs
        }
      }
    }
    return 'Unknown';
  }

  calculateExecutionTime(results) {
    const timestamps = results.map(r => r.timestamp).filter(t => t);
    if (timestamps.length < 2) return 'Unknown';
    
    const duration = (Math.max(...timestamps) - Math.min(...timestamps)) / 1000;
    return `${duration.toFixed(1)} seconds`;
  }

  calculateSuccessRate(results) {
    if (results.length === 0) return 0;
    const successful = results.filter(r => r.result?.success).length;
    return ((successful / results.length) * 100).toFixed(1);
  }

  createComparisonTable(comparisons) {
    if (!comparisons || comparisons.length === 0) return null;

    const formatter = this.formatters.get('markdown');
    
    // Extract fields that have comparison data
    const fields = [...new Set(comparisons.map(c => c.field))];
    if (fields.length === 0) return null;

    // Create table headers
    const headers = ['Source', ...fields];
    const rows = [];

    // Extract unique sources
    const sources = [...new Set(comparisons.flatMap(c => c.sources?.map((_, i) => `Source ${i + 1}`) || []))];
    
    // Build table rows
    sources.forEach(source => {
      const row = [source];
      fields.forEach(field => {
        const comparison = comparisons.find(c => c.field === field);
        if (comparison && comparison.values) {
          const value = comparison.values[0]; // Simplified - would need more complex logic for real data
          row.push(String(value).substring(0, 20));
        } else {
          row.push('N/A');
        }
      });
      rows.push(row);
    });

    return formatter.table(headers, rows);
  }
}

module.exports = { ResultCompiler };