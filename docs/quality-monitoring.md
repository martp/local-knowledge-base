# Stage 3: Quality Monitoring & Optimization

Transform your knowledge base from "working" to "excellent" by tracking query quality, optimizing model selection, and continuously improving based on real usage patterns.

## ⏱️ Time Estimate: Ongoing (15 minutes setup)

- **Initial setup**: 15 minutes
- **Daily usage**: 2 minutes per session
- **Weekly analysis**: 10 minutes
- **Monthly optimization**: 30 minutes

## 🎯 What You'll Achieve

By implementing Stage 3, your system will:
- ✅ Track query quality with 1-5 ratings
- ✅ Automatically recommend the best model for each question
- ✅ Identify knowledge gaps and content opportunities
- ✅ Provide data-driven optimization recommendations
- ✅ Export analytics for reporting and trend analysis

## 📋 Prerequisites

✅ **Stage 1 Complete**: Working knowledge base  
✅ **Stage 2 Complete**: Automated content crawling  
✅ **Real Usage**: You've been asking questions and getting answers  
✅ **TypeScript/Node**: Basic familiarity for running scripts

## 🚀 Part 1: Quality Tracking Setup (10 minutes)

### Step 1: Start Logging Your Queries (5 minutes)

**Every time you ask a question in your knowledge base:**

```bash
# After getting an answer, rate it 1-5:
npx tsx quality-monitoring/quality-tracker.ts log "How do I implement JWT auth?" "deepseek-coder:6.7b" 4

# With additional context:
npx tsx quality-monitoring/quality-tracker.ts log "Debug React useEffect infinite loop" "deepseek-coder:6.7b" 5 --notes "Perfect solution with examples" --category "debugging"
```

**Rating scale:**
- **5** = Perfect answer, exactly what I needed
- **4** = Very helpful, minor gaps or could be clearer  
- **3** = Useful but incomplete or partially wrong
- **2** = Some relevant info but mostly unhelpful
- **1** = Wrong, irrelevant, or no useful information

### Step 2: Create a Quick Rating Alias (5 minutes)

Add to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
# Quick quality logging
alias rate="npx tsx /path/to/local-knowledge-base/quality-monitoring/quality-tracker.ts log"

# Usage examples:
# rate "question" "model" 4
# rate "How to deploy with Docker?" "llama3.1:8b" 3 --notes "Missing production config"
```

**Reload your shell:**
```bash
source ~/.zshrc  # or ~/.bashrc
```

## 🤖 Part 2: Smart Model Selection (5 minutes)

### Get Model Recommendations

**Before asking questions:**
```bash
# Get model recommendation
npx tsx quality-monitoring/smart-model-selector.ts select "How do I debug this React error?"
# → Recommends: deepseek-coder:6.7b (confidence: 85%)

npx tsx quality-monitoring/smart-model-selector.ts select "What are microservices best practices?"
# → Recommends: llama3.1:8b (confidence: 78%)
```

**Create a quick alias:**
```bash
alias model="npx tsx /path/to/local-knowledge-base/quality-monitoring/smart-model-selector.ts select"

# Usage:
# model "your question here"
```

### Understanding the Recommendations

**Code/Debug Questions → deepseek-coder:6.7b**
- Keywords: `code`, `implement`, `debug`, `error`, `function`, `bug`
- Languages: `javascript`, `python`, `typescript`, `sql`, etc.
- Technical: `api`, `database`, `performance`, `testing`

**Architecture/Concept Questions → llama3.1:8b**  
- Keywords: `architecture`, `design`, `pattern`, `best practice`
- Conceptual: `explain`, `what is`, `how does`, `overview`
- Strategic: `planning`, `approach`, `methodology`

## 📊 Part 3: Quality Analysis (Weekly - 10 minutes)

### Run Comprehensive Analysis

```bash
# Complete quality report
npm run quality:analyze
```

**Sample output:**
```
📊 Local Knowledge Base - Quality Analysis
==========================================

🔍 Analyzing Query Quality...
📈 Query Quality Summary:
   Total queries: 47
   Average rating: 3.8/5
   Excellent (5): 23 queries (49%)
   Good (4): 12 queries (26%)
   Fair (3): 8 queries (17%)
   Poor (1-2): 4 queries (8%)

📊 Model Performance:
   deepseek-coder:6.7b: 4.2/5 avg (23 queries)
   llama3.1:8b: 3.4/5 avg (24 queries)

📉 Lowest Rated Queries:
   1. "How to configure SSL?" (1/5) - Missing infrastructure docs
   2. "Team coding standards" (2/5) - Need internal documentation
   3. "Deployment pipeline steps" (2/5) - Missing DevOps content

🤖 Analyzing Model Selection Patterns...
✅ Code questions: 92% correctly used deepseek-coder
❌ Architecture questions: 34% incorrectly used deepseek-coder

💡 Getting Improvement Recommendations...
🎯 Top Recommendations:
   1. Add infrastructure/DevOps documentation
   2. Upload team coding standards and processes  
   3. Use llama3.1:8b for architecture questions
   4. Consider adding security-focused content

📤 Exporting Data...
✅ Data exported to: ./logs/quality-export-2024-01-15.csv
```

### Understanding Your Analytics

**Quality Metrics to Track:**
- **Overall average**: Target 4.0+ for production use
- **Model performance**: Which model works best for which topics
- **Low-rated patterns**: What content gaps exist
- **Trend over time**: Are answers improving?

**Red flags:**
- Average rating below 3.0 = Major content gaps
- One model consistently underperforming = Wrong model selection
- Same topics repeatedly scoring low = Missing documentation

## 🎯 Part 4: Optimization Actions (Monthly - 30 minutes)

### Based on Analysis Results

**1. Content Gap Analysis**
```bash
# Review low-rated queries
grep -A2 -B1 '"rating": [12]' ./logs/quality-log.jsonl

# Common patterns in failed queries
cat ./logs/quality-export-*.csv | grep -E "(1|2)," | cut -d',' -f2
```

**Action:** Upload documentation covering these topics

**2. Model Selection Optimization**
```bash
# Check model misuse patterns
npx tsx quality-monitoring/smart-model-selector.ts analyze
```

**Actions:**
- Train yourself to use model selector before asking
- Update model selection patterns if needed
- Switch models mid-conversation when question type changes

**3. Content Quality Improvement**
```bash
# Find which sources produce best answers
# (requires manual correlation with uploaded docs)
```

**Actions:**
- Remove outdated or duplicate content
- Prioritize high-quality documentation sources
- Update crawl targets based on usage patterns

## 🔧 Advanced Usage

### Custom Rating Categories

```bash
# Track different question types
npx tsx quality-monitoring/quality-tracker.ts log "API endpoint docs" "llama3.1:8b" 4 --category "api-docs"
npx tsx quality-monitoring/quality-tracker.ts log "Debug CORS error" "deepseek-coder:6.7b" 5 --category "troubleshooting"
npx tsx quality-monitoring/quality-tracker.ts log "Team process question" "llama3.1:8b" 2 --category "internal-process"
```

**Categories to consider:**
- `api-docs` - API documentation questions
- `troubleshooting` - Debugging and error resolution  
- `internal-process` - Company/team specific processes
- `architecture` - System design and patterns
- `implementation` - How-to coding questions

### Response Time Tracking

```bash
# Track query performance
npx tsx quality-monitoring/quality-tracker.ts log "Complex algorithm question" "deepseek-coder:6.7b" 4 --responseTime 8500 --notes "Slow but accurate"
```

### Bulk Analysis

```bash
# Export for external analysis
cat ./logs/quality-log.jsonl | jq -r '[.timestamp, .question, .model, .rating] | @csv' > analysis.csv

# Import into Excel/Google Sheets for visualization
```

## 📈 Success Metrics & Goals

### Short-term Goals (1 month)
- [ ] **Logging habit**: Rate 80% of queries
- [ ] **Model accuracy**: Use recommended model 90% of time
- [ ] **Quality baseline**: Establish average rating
- [ ] **Gap identification**: Find top 5 content gaps

### Medium-term Goals (3 months)
- [ ] **Quality improvement**: Average rating 4.0+
- [ ] **Content optimization**: Fill identified gaps
- [ ] **Model performance**: Both models averaging 4.0+
- [ ] **Response time**: 95% of queries under 10 seconds

### Long-term Goals (6 months)
- [ ] **Excellence**: 80% of queries rated 4-5
- [ ] **Self-sufficiency**: 90% of work questions answered
- [ ] **Efficiency**: 50% reduction in external doc searching
- [ ] **Knowledge completeness**: Rare content gaps

## 🚨 Troubleshooting

### "Low average ratings across all models"
**Cause**: Content quality or quantity issues
**Fix**: 
- Upload more relevant documentation
- Review and remove outdated content
- Check if questions match uploaded content scope

### "One model consistently underperforming"  
**Cause**: Wrong model selection or model-specific issues
**Fix**:
- Use smart model selector consistently
- Verify Ollama model is properly loaded
- Consider switching to different model variant

### "Quality tracking not working"
**Cause**: Script errors or file permissions
**Fix**:
```bash
# Check logs directory exists and is writable
ls -la ./logs/
chmod 755 ./logs/

# Test logging manually
npx tsx quality-monitoring/quality-tracker.ts log "test" "llama3.1:8b" 3
```

### "No improvement over time"
**Cause**: Not acting on analysis recommendations
**Fix**: 
- Follow through on content gap recommendations
- Actually upload suggested documentation
- Review and update crawl targets monthly

## 🎓 Best Practices

### Daily Usage
1. **Always use model selector** before asking questions
2. **Rate every query** immediately after getting answer
3. **Note patterns** - what works well vs poorly
4. **Switch models** when question type changes mid-conversation

### Weekly Analysis  
1. **Run quality analysis** every Friday
2. **Review low-rated queries** for patterns
3. **Plan content additions** for next week
4. **Check model selection accuracy**

### Monthly Optimization
1. **Deep dive into analytics** exported CSV
2. **Update crawl targets** based on usage
3. **Refresh authentication tokens** for crawlers
4. **Clean up outdated content**

### Quality Rating Guidelines

**Be consistent with ratings:**
- **5**: Saved significant time, answer was complete and actionable
- **4**: Very helpful, maybe needed minor follow-up
- **3**: Pointed in right direction but required additional research  
- **2**: Some useful info but mostly had to find answer elsewhere
- **1**: Wasted time, actively misleading or completely irrelevant

## 🎉 Stage 3 Complete!

You now have a **data-driven optimization system** that:
- ✅ Tracks real usage patterns and quality
- ✅ Provides smart model recommendations  
- ✅ Identifies content gaps automatically
- ✅ Improves over time based on your actual needs
- ✅ Delivers measurable value and ROI

**🏆 You've built a truly intelligent knowledge base that learns and improves!**

**📊 Next level optimization:**
- Set up automated quality alerts (email when avg drops below 3.5)
- Build custom dashboards with your quality data
- Integrate with your team's workflow tools
- Scale to multiple users with shared quality tracking

---

**💡 Pro Tips:**
- **Habit formation**: Rate queries immediately - don't batch them
- **Context matters**: Use notes field to capture why something worked/didn't work
- **Model switching**: Change models mid-conversation when your question type shifts
- **Regular review**: Monthly analysis sessions prevent quality drift

**⏱️ Time to value: Immediate insights, compound improvement over time**