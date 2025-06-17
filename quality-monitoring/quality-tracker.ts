import fs from 'fs';
import path from 'path';

interface QueryLog {
  question: string;
  model: string;
  timestamp: number;
  rating: number; // 1-5 scale
  responseTime?: number; // milliseconds
  notes?: string;
  category?: string; // e.g., 'code', 'documentation', 'troubleshooting'
}

class QualityTracker {
  private logFile: string;
  
  constructor(logFile: string = './logs/quality-log.jsonl') {
    this.logFile = logFile;
    this.ensureLogDirectory();
  }
  
  private ensureLogDirectory(): void {
    const dir = path.dirname(this.logFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  /**
   * Log a query with its quality rating
   */
  logQuery(
    question: string, 
    model: string, 
    rating: number, 
    options: {
      responseTime?: number;
      notes?: string;
      category?: string;
    } = {}
  ): void {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    
    const log: QueryLog = {
      question,
      model,
      timestamp: Date.now(),
      rating,
      ...options
    };
    
    fs.appendFileSync(this.logFile, JSON.stringify(log) + '\n');
    console.log(`📊 Logged query: "${question.substring(0, 50)}..." (Rating: ${rating}/5)`);
  }
  
  /**
   * Get all logged queries
   */
  private getAllLogs(): QueryLog[] {
    if (!fs.existsSync(this.logFile)) {
      return [];
    }
    
    return fs.readFileSync(this.logFile, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));
  }
  
  /**
   * Analyze quality metrics
   */
  analyzeQuality(): void {
    const logs = this.getAllLogs();
    
    if (logs.length === 0) {
      console.log('📊 No queries logged yet');
      return;
    }
    
    const avgRating = logs.reduce((sum, log) => sum + log.rating, 0) / logs.length;
    const goodQueries = logs.filter(log => log.rating >= 4);
    const poorQueries = logs.filter(log => log.rating <= 2);
    
    // Model performance
    const modelStats = logs.reduce((stats, log) => {
      if (!stats[log.model]) {
        stats[log.model] = { total: 0, ratings: 0 };
      }
      stats[log.model].total++;
      stats[log.model].ratings += log.rating;
      return stats;
    }, {} as Record<string, { total: number; ratings: number }>);
    
    // Category performance
    const categoryStats = logs.reduce((stats, log) => {
      const category = log.category || 'uncategorized';
      if (!stats[category]) {
        stats[category] = { total: 0, ratings: 0 };
      }
      stats[category].total++;
      stats[category].ratings += log.rating;
      return stats;
    }, {} as Record<string, { total: number; ratings: number }>);
    
    console.log('\n📊 Quality Analysis Report');
    console.log('==========================');
    console.log(`📈 Average Quality: ${avgRating.toFixed(2)}/5.0`);
    console.log(`📋 Total Queries: ${logs.length}`);
    console.log(`✅ Good Queries (4-5★): ${goodQueries.length} (${((goodQueries.length / logs.length) * 100).toFixed(1)}%)`);
    console.log(`❌ Poor Queries (1-2★): ${poorQueries.length} (${((poorQueries.length / logs.length) * 100).toFixed(1)}%)`);
    
    console.log('\n🤖 Model Performance:');
    console.log('====================');
    Object.entries(modelStats).forEach(([model, stats]) => {
      const avgRating = stats.ratings / stats.total;
      console.log(`• ${model}: ${avgRating.toFixed(2)}/5.0 (${stats.total} queries)`);
    });
    
    console.log('\n📚 Category Performance:');
    console.log('=======================');
    Object.entries(categoryStats).forEach(([category, stats]) => {
      const avgRating = stats.ratings / stats.total;
      console.log(`• ${category}: ${avgRating.toFixed(2)}/5.0 (${stats.total} queries)`);
    });
    
    if (poorQueries.length > 0) {
      console.log('\n⚠️  Poor Quality Queries:');
      console.log('========================');
      poorQueries.slice(0, 10).forEach((query, index) => {
        const date = new Date(query.timestamp).toLocaleString();
        console.log(`${index + 1}. [${query.rating}★] ${query.question}`);
        console.log(`   Model: ${query.model} | Date: ${date}`);
        if (query.notes) console.log(`   Notes: ${query.notes}`);
        console.log('');
      });
      
      if (poorQueries.length > 10) {
        console.log(`... and ${poorQueries.length - 10} more poor queries`);
      }
    }
  }
  
  /**
   * Export logs to CSV for external analysis
   */
  exportToCsv(outputFile: string = './logs/quality-export.csv'): void {
    const logs = this.getAllLogs();
    
    if (logs.length === 0) {
      console.log('📊 No logs to export');
      return;
    }
    
    const headers = ['timestamp', 'date', 'question', 'model', 'rating', 'category', 'responseTime', 'notes'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log.timestamp,
        new Date(log.timestamp).toISOString(),
        `"${log.question.replace(/"/g, '""')}"`,
        log.model,
        log.rating,
        log.category || '',
        log.responseTime || '',
        `"${(log.notes || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');
    
    fs.writeFileSync(outputFile, csvContent);
    console.log(`📊 Exported ${logs.length} logs to ${outputFile}`);
  }
  
  /**
   * Get recommendations based on quality analysis
   */
  getRecommendations(): void {
    const logs = this.getAllLogs();
    
    if (logs.length < 10) {
      console.log('\n💡 Recommendations:');
      console.log('==================');
      console.log('• Log more queries to get meaningful insights');
      console.log('• Aim for at least 20-30 queries before analyzing patterns');
      return;
    }
    
    const avgRating = logs.reduce((sum, log) => sum + log.rating, 0) / logs.length;
    const poorQueries = logs.filter(log => log.rating <= 2);
    const modelStats = logs.reduce((stats, log) => {
      if (!stats[log.model]) {
        stats[log.model] = { total: 0, ratings: 0 };
      }
      stats[log.model].total++;
      stats[log.model].ratings += log.rating;
      return stats;
    }, {} as Record<string, { total: number; ratings: number }>);
    
    console.log('\n💡 Recommendations:');
    console.log('==================');
    
    if (avgRating < 3.0) {
      console.log('🔴 Overall quality is low. Consider:');
      console.log('   • Adding more relevant documentation to your knowledge base');
      console.log('   • Improving your question phrasing');
      console.log('   • Trying different models for different question types');
    } else if (avgRating < 4.0) {
      console.log('🟡 Quality is moderate. Consider:');
      console.log('   • Analyzing which topics have poor coverage');
      console.log('   • Adding more specific documentation for problem areas');
    } else {
      console.log('🟢 Quality is good! Keep up the good work.');
    }
    
    // Model recommendations
    const bestModel = Object.entries(modelStats)
      .sort(([,a], [,b]) => (b.ratings/b.total) - (a.ratings/a.total))[0];
    
    if (bestModel) {
      console.log(`• Best performing model: ${bestModel[0]} (${(bestModel[1].ratings/bestModel[1].total).toFixed(2)}/5.0)`);
    }
    
    // Content recommendations
    if (poorQueries.length > 0) {
      const commonIssues = poorQueries
        .filter(q => q.notes)
        .map(q => q.notes!)
        .reduce((issues, note) => {
          const key = note.toLowerCase();
          issues[key] = (issues[key] || 0) + 1;
          return issues;
        }, {} as Record<string, number>);
      
      if (Object.keys(commonIssues).length > 0) {
        console.log('• Common issues to address:');
        Object.entries(commonIssues)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .forEach(([issue, count]) => {
            console.log(`  - ${issue} (${count} occurrences)`);
          });
      }
    }
  }
}

// CLI usage
if (require.main === module) {
  const tracker = new QualityTracker();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'log':
      const question = process.argv[3];
      const model = process.argv[4];
      const rating = parseInt(process.argv[5]);
      const notes = process.argv[6];
      
      if (!question || !model || !rating) {
        console.log('Usage: tsx quality-tracker.ts log "question" "model" rating [notes]');
        process.exit(1);
      }
      
      tracker.logQuery(question, model, rating, { notes });
      break;
      
    case 'analyze':
      tracker.analyzeQuality();
      break;
      
    case 'export':
      const outputFile = process.argv[3];
      tracker.exportToCsv(outputFile);
      break;
      
    case 'recommendations':
      tracker.getRecommendations();
      break;
      
    default:
      console.log('📊 Quality Tracker');
      console.log('==================');
      console.log('Commands:');
      console.log('• log "question" "model" rating [notes] - Log a query');
      console.log('• analyze - Analyze quality metrics');
      console.log('• export [file] - Export logs to CSV');
      console.log('• recommendations - Get improvement recommendations');
      console.log('');
      console.log('Example:');
      console.log('tsx quality-tracker.ts log "How to implement auth?" "deepseek-coder:6.7b" 4 "Good code example"');
  }
}

export default QualityTracker;