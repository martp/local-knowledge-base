# Local Knowledge Base

A practical local LLM + RAG implementation that gets you from zero to a working knowledge base in 2 hours, then incrementally improves based on real usage.

## 🚀 Quick Start (2 Hours to Working System)

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for crawlers)
- 8GB+ RAM recommended

### 1. Setup
```bash
git clone <this-repo>
cd local-knowledge-base

# Quick start - this will install everything
./setup/quick-start.sh
```

### 2. Access Your Knowledge Base
- Visit **http://localhost:3000**
- Create your account
- Start uploading documents!

## 📋 What You Get

### Stage 1: Basic Working System ✅
- **Qdrant** vector database for semantic search
- **Open WebUI** with optimized RAG settings
- **Ollama** with quality models:
  - `llama3.1:8b` - General questions
  - `deepseek-coder:6.7b` - Code & debugging
  - `nomic-embed-text` - Better embeddings

### Stage 2: Automated Content Crawling
```bash
# Crawl public documentation
npm run crawl

# Crawl authenticated sites (after setup)
npm run crawl:auth
```

### Stage 3: Quality Monitoring & Optimization
```bash
# Analyze query quality
npm run quality:analyze

# Get smart model recommendations
npx tsx quality-monitoring/smart-model-selector.ts select "your question"
```

## 📁 Project Structure

```
local-knowledge-base/
├── setup/                    # Installation and configuration
│   ├── quick-start.sh       # One-command setup
│   ├── install-ollama.sh    # Ollama + models
│   └── setup-cron.sh        # Automated updates
├── crawlers/                 # Content extraction
│   ├── simple-crawler.ts    # Public sites
│   └── authenticated-crawler.ts  # Protected sites
├── quality-monitoring/       # Performance tracking
│   ├── quality-tracker.ts   # Query logging
│   ├── smart-model-selector.ts  # Model recommendations
│   └── analyze-quality.ts   # Quality analysis
├── docker-compose.yml        # Services configuration
└── .env.example             # Configuration template
```

## 🛠️ Usage Guide

### Basic Usage
1. **Upload Documents**: Drag PDFs, Markdown, or text files to Open WebUI
2. **Ask Questions**: Use natural language queries
3. **Switch Models**: Use deepseek-coder for code questions, llama3.1 for general

### Advanced Features

#### Automated Crawling
```bash
# Configure crawl targets in crawlers/simple-crawler.ts
npm run crawl

# For authenticated sites, setup .env first
cp .env.example .env
# Add your authentication tokens
npm run crawl:auth
```

#### Quality Tracking
```bash
# Log a query (rate 1-5)
npx tsx quality-monitoring/quality-tracker.ts log "How to implement auth?" "deepseek-coder:6.7b" 4

# Analyze quality trends
npm run quality:analyze
```

#### Smart Model Selection
```bash
# Get model recommendation
npx tsx quality-monitoring/smart-model-selector.ts select "Debug this error: Cannot read property 'map'"
# → Recommends: deepseek-coder:6.7b
```

## 📊 Model Usage Guidelines

| Question Type | Recommended Model | Examples |
|---------------|------------------|----------|
| **Code & Debugging** | `deepseek-coder:6.7b` | Implementation, errors, syntax, APIs |
| **Architecture** | `llama3.1:8b` | Design patterns, best practices, concepts |
| **General Knowledge** | `llama3.1:8b` | Documentation, explanations, overviews |

## 🔧 Configuration

### Environment Variables (.env)
```bash
# RAG Settings
RAG_TOP_K=8                    # Number of context chunks
CHUNK_SIZE=1000               # Size of text chunks
CHUNK_OVERLAP=200             # Overlap between chunks

# Authentication for Crawling
CONFLUENCE_COOKIES="session_id=abc123"
CONFLUENCE_AUTH="Bearer token123"
```

### Docker Services
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down
```

## 📈 Optimization Tips

### Content Strategy
1. **Priority Upload Order**:
   - API documentation you reference frequently
   - Internal coding standards and best practices
   - Architecture decisions and design docs
   - Troubleshooting guides and runbooks

2. **Content Quality**:
   - Use descriptive filenames
   - Remove duplicate or outdated content
   - Add metadata when possible

### Query Optimization
1. **Be Specific**: "How to implement JWT auth in Express.js?" vs "How to do auth?"
2. **Use Context**: "In React components, how do I..." vs "How do I..."
3. **Match Model to Task**: Code questions → deepseek-coder, concepts → llama3.1

## 🔒 Authentication Setup

For crawling protected sites (Confluence, Jira, internal docs):

1. **Login** to your site in browser
2. **Open DevTools** (F12) → Network tab
3. **Refresh** the page
4. **Find request** to your site
5. **Right-click** → Copy → Copy as cURL
6. **Extract** cookies and headers from cURL
7. **Update** `.env` file

Example:
```bash
CONFLUENCE_COOKIES="JSESSIONID=abc123; atlassian.xsrf.token=xyz789"
CONFLUENCE_AUTH="Bearer your_token_here"
```

## ⏰ Automation

### Setup Weekly Crawling
```bash
./setup/setup-cron.sh
# Choose schedule (weekly/daily/custom)
```

### Manual Updates
```bash
# Update and crawl content
./update-knowledge-base.sh

# Check logs
tail -f ./logs/update.log
```

## 🐛 Troubleshooting

### Common Issues

**"No relevant documents found"**
- Add more content covering that topic
- Check if documents were processed correctly

**"Generic/unhelpful answers"** 
- Switch to deepseek-coder for code questions
- Try rephrasing your question more specifically

**"Authentication expired"**
- Refresh tokens in `.env` file (usually expire after 24-48 hours)
- Re-extract from browser DevTools

**"Slow responses"**
- Reduce `RAG_TOP_K` from 8 to 5
- Check if Ollama models are loaded: `ollama list`

### Getting Help
```bash
# Check service status
docker-compose ps

# View all logs
docker-compose logs

# Test Ollama connection
ollama list

# Verify embeddings
curl http://localhost:6333/collections
```

## 📚 Success Metrics

### Stage 1 Success (Working System)
- ✅ Can ask questions and get relevant answers
- ✅ System references your uploaded documents  
- ✅ Code questions work better with deepseek-coder

### Stage 2 Success (Automated Content)
- ✅ New content appears from crawled sites
- ✅ Authenticated sites work with tokens
- ✅ Weekly updates happen automatically

### Stage 3 Success (Optimized Usage)
- ✅ 80%+ of questions get useful answers
- ✅ System knows your specific tools/processes
- ✅ Quality improves over time

## 🎯 When to Stop vs Upgrade

### Stop Here If:
- System answers 70%+ of questions well
- You're saving time vs manual doc searching
- Maintenance is minimal (monthly token refresh)

### Consider Full Enterprise Solution If:
- Need 90%+ accuracy for critical decisions
- Multiple daily users
- Require automated quality monitoring
- Need enterprise security/audit trails

---

**Remember**: A working 80% solution used daily beats a perfect 100% solution that takes months to build. Start simple, prove value, then optimize based on real usage patterns.