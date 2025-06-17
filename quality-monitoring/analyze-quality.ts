#!/usr/bin/env tsx

import QualityTracker from './quality-tracker';
import SmartModelSelector from './smart-model-selector';

async function main() {
  console.log('📊 Local Knowledge Base - Quality Analysis');
  console.log('==========================================');
  console.log('');
  
  const tracker = new QualityTracker();
  const selector = new SmartModelSelector();
  
  // Run quality analysis
  console.log('🔍 Analyzing Query Quality...');
  tracker.analyzeQuality();
  
  console.log('\n' + '='.repeat(50));
  
  // Run pattern analysis
  console.log('\n🤖 Analyzing Model Selection Patterns...');
  selector.analyzePatterns();
  
  console.log('\n' + '='.repeat(50));
  
  // Get recommendations
  console.log('\n💡 Getting Improvement Recommendations...');
  tracker.getRecommendations();
  
  console.log('\n' + '='.repeat(50));
  
  // Export data
  console.log('\n📤 Exporting Data...');
  tracker.exportToCsv();
  
  console.log('\n✅ Analysis complete!');
  console.log('\n📋 Next Steps:');
  console.log('=============');
  console.log('1. Review the recommendations above');
  console.log('2. Add more documentation for poorly performing topics');
  console.log('3. Use the smart model selector for better results');
  console.log('4. Continue logging queries to improve accuracy');
  console.log('');
  console.log('💡 Pro Tips:');
  console.log('============');
  console.log('• Log every query you make: tsx quality-monitoring/quality-tracker.ts log "question" "model" rating');
  console.log('• Check model recommendations: tsx quality-monitoring/smart-model-selector.ts select "question"');
  console.log('• Run this analysis weekly to track improvements');
}

main().catch(console.error);