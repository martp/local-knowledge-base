import fs from 'fs';

interface ModelRule {
  patterns: string[];
  model: string;
  description: string;
}

class SmartModelSelector {
  private rules: ModelRule[] = [
    {
      patterns: [
        'code', 'implement', 'debug', 'error', 'function', 'syntax',
        'programming', 'algorithm', 'variable', 'class', 'method',
        'bug', 'fix', 'compile', 'runtime', 'exception', 'typescript',
        'javascript', 'python', 'java', 'c++', 'sql', 'html', 'css',
        'api', 'endpoint', 'database', 'query', 'schema', 'optimization',
        'performance', 'refactor', 'testing', 'unit test', 'integration',
        'deployment', 'build', 'ci/cd', 'docker', 'kubernetes'
      ],
      model: 'deepseek-coder:6.7b',
      description: 'Code-related questions and debugging'
    },
    {
      patterns: [
        'architecture', 'design', 'pattern', 'best practice', 'principle',
        'microservices', 'monolith', 'scalability', 'system design',
        'requirements', 'specification', 'planning', 'strategy',
        'overview', 'concept', 'theory', 'philosophy', 'methodology',
        'approach', 'framework', 'structure', 'organization',
        'workflow', 'process', 'documentation', 'explain', 'what is',
        'how does', 'difference between', 'comparison', 'pros and cons'
      ],
      model: 'llama3.1:8b',
      description: 'Architecture, concepts, and general questions'
    }
  ];
  
  private modelStats: Record<string, { total: number; avgRating: number }> = {};
  
  /**
   * Select the best model for a given question
   */
  selectModel(question: string): { model: string; confidence: number; reason: string } {
    const lowerQuestion = question.toLowerCase();
    
    let bestMatch = { model: 'llama3.1:8b', confidence: 0, reason: 'Default general model' };
    
    for (const rule of this.rules) {
      const matches = rule.patterns.filter(pattern => 
        lowerQuestion.includes(pattern.toLowerCase())
      );
      
      if (matches.length > 0) {
        const confidence = Math.min(matches.length / 3, 1); // Normalize to 0-1
        
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            model: rule.model,
            confidence,
            reason: `Matched ${matches.length} patterns: ${matches.slice(0, 3).join(', ')}`
          };
        }
      }
    }
    
    // Consider historical performance if available
    this.loadModelStats();
    if (this.modelStats[bestMatch.model]) {
      const stats = this.modelStats[bestMatch.model];
      if (stats.avgRating < 3.0 && stats.total > 5) {
        // Switch to alternative if this model performs poorly
        const alternative = bestMatch.model === 'deepseek-coder:6.7b' ? 'llama3.1:8b' : 'deepseek-coder:6.7b';
        bestMatch = {
          model: alternative,
          confidence: bestMatch.confidence * 0.8,
          reason: `Switched from ${bestMatch.model} due to poor performance (${stats.avgRating.toFixed(1)}/5.0)`
        };
      }
    }
    
    return bestMatch;
  }
  
  /**
   * Load model performance statistics
   */
  private loadModelStats(): void {
    const logFile = './logs/quality-log.jsonl';
    
    if (!fs.existsSync(logFile)) {
      return;
    }
    
    try {
      const logs = fs.readFileSync(logFile, 'utf8')
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
      
      this.modelStats = logs.reduce((stats, log) => {
        if (!stats[log.model]) {
          stats[log.model] = { total: 0, avgRating: 0 };
        }
        
        const currentTotal = stats[log.model].total;
        const currentAvg = stats[log.model].avgRating;
        
        stats[log.model].total = currentTotal + 1;
        stats[log.model].avgRating = ((currentAvg * currentTotal) + log.rating) / (currentTotal + 1);
        
        return stats;
      }, {} as Record<string, { total: number; avgRating: number }>);
      
    } catch (error) {
      console.warn('Failed to load model statistics:', error.message);
    }
  }
  
  /**
   * Get model recommendations based on question patterns
   */
  getRecommendations(question: string): string {
    const selection = this.selectModel(question);
    
    const recommendations = [];
    
    recommendations.push(`🤖 Recommended model: **${selection.model}**`);
    recommendations.push(`🎯 Confidence: ${(selection.confidence * 100).toFixed(0)}%`);
    recommendations.push(`💡 Reason: ${selection.reason}`);
    
    if (this.modelStats[selection.model]) {
      const stats = this.modelStats[selection.model];
      recommendations.push(`📊 Historical performance: ${stats.avgRating.toFixed(1)}/5.0 (${stats.total} queries)`);
    }
    
    // Alternative suggestions
    const alternative = selection.model === 'deepseek-coder:6.7b' ? 'llama3.1:8b' : 'deepseek-coder:6.7b';
    recommendations.push('');
    recommendations.push(`🔄 Alternative: Try **${alternative}** if results are unsatisfactory`);
    
    return recommendations.join('\n');
  }
  
  /**
   * Analyze question patterns to improve model selection
   */
  analyzePatterns(): void {
    const logFile = './logs/quality-log.jsonl';
    
    if (!fs.existsSync(logFile)) {
      console.log('⚠️  No quality logs found. Start logging queries to analyze patterns.');
      return;
    }
    
    try {
      const logs = fs.readFileSync(logFile, 'utf8')
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
      
      console.log('\n🔍 Pattern Analysis');
      console.log('==================');
      
      // Analyze model performance by detected patterns
      const patternAnalysis: Record<string, { correct: number; total: number; avgRating: number }> = {};
      
      logs.forEach(log => {
        const selection = this.selectModel(log.question);
        const wasCorrect = selection.model === log.model;
        const key = `${selection.model} (${selection.confidence > 0.5 ? 'high' : 'low'} confidence)`;
        
        if (!patternAnalysis[key]) {
          patternAnalysis[key] = { correct: 0, total: 0, avgRating: 0 };
        }
        
        patternAnalysis[key].total++;
        patternAnalysis[key].avgRating = 
          ((patternAnalysis[key].avgRating * (patternAnalysis[key].total - 1)) + log.rating) / 
          patternAnalysis[key].total;
        
        if (wasCorrect) {
          patternAnalysis[key].correct++;
        }
      });
      
      Object.entries(patternAnalysis).forEach(([key, stats]) => {
        const accuracy = (stats.correct / stats.total) * 100;
        console.log(`• ${key}: ${accuracy.toFixed(1)}% accuracy, ${stats.avgRating.toFixed(1)}/5.0 avg rating (${stats.total} queries)`);
      });
      
      // Identify misclassified queries
      const misclassified = logs.filter(log => {
        const selection = this.selectModel(log.question);
        return selection.model !== log.model && log.rating <= 2;
      });
      
      if (misclassified.length > 0) {
        console.log('\n❌ Potential Misclassifications:');
        console.log('==============================');
        misclassified.slice(0, 5).forEach((log, index) => {
          const selection = this.selectModel(log.question);
          console.log(`${index + 1}. Question: "${log.question}"`);
          console.log(`   Used: ${log.model} | Suggested: ${selection.model} | Rating: ${log.rating}/5`);
          console.log(`   Reason: ${selection.reason}`);
          console.log('');
        });
      }
      
    } catch (error) {
      console.error('Error analyzing patterns:', error.message);
    }
  }
}

// CLI usage
if (require.main === module) {
  const selector = new SmartModelSelector();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'select':
      const question = process.argv[3];
      if (!question) {
        console.log('Usage: tsx smart-model-selector.ts select "your question"');
        process.exit(1);
      }
      
      const selection = selector.selectModel(question);
      console.log('🤖 Smart Model Selection');
      console.log('========================');
      console.log(`Question: "${question}"`);
      console.log('');
      console.log(selector.getRecommendations(question));
      break;
      
    case 'analyze':
      selector.analyzePatterns();
      break;
      
    default:
      console.log('🤖 Smart Model Selector');
      console.log('=======================');
      console.log('Commands:');
      console.log('• select "question" - Get model recommendation for a question');
      console.log('• analyze - Analyze historical pattern accuracy');
      console.log('');
      console.log('Example:');
      console.log('tsx smart-model-selector.ts select "How do I implement JWT authentication?"');
  }
}

export default SmartModelSelector;