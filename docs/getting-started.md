# Getting Started Guide

This guide walks you through setting up your Local Knowledge Base from scratch to your first successful query.

## ⏱️ Time Commitment
- **Stage 1**: 2 hours → Working system
- **Stage 2**: 1-2 hours → Automated content  
- **Stage 3**: Ongoing → Quality optimization

## 🔧 Prerequisites

### System Requirements
- **OS**: macOS, Linux, or Windows with WSL2
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space for models and data
- **Docker**: Latest version with Docker Compose

### Software Prerequisites
```bash
# Check if you have these installed
docker --version          # Docker 20.0+
docker-compose --version  # Docker Compose 2.0+
node --version           # Node.js 18+
npm --version            # npm 8+
```

If missing any prerequisites:
- **Docker**: https://docs.docker.com/get-docker/
- **Node.js**: https://nodejs.org/ (LTS version)

## 🚀 Stage 1: Basic Working System (2 Hours)

### Step 1: Project Setup (15 minutes)

```bash
# Clone and enter the project
git clone <repository-url>
cd local-knowledge-base

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Step 2: Quick Start (30 minutes)

The fastest way to get everything running:

```bash
./setup/quick-start.sh
```

This script will:
- ✅ Check prerequisites
- ✅ Install Ollama and download models
- ✅ Start Docker services
- ✅ Verify everything is working

**Expected output:**
```
🚀 Local Knowledge Base - Quick Start
=====================================
✅ Docker and Docker Compose are available
📥 Downloading llama3.1:8b (general model)...
📥 Downloading deepseek-coder:6.7b (code model)... 
📥 Downloading nomic-embed-text (embeddings)...
🐳 Starting Local Knowledge Base services...
✅ Services started successfully!

🎉 Your Local Knowledge Base is ready!
📋 Next steps:
1. Visit http://localhost:3000 to access the web interface
2. Create your account on first visit
3. Upload your first documents
```

### Step 3: First Login (15 minutes)

1. **Open your browser** and go to http://localhost:3000
2. **Create account** on first visit
3. **Verify the interface** loads correctly

### Step 4: Upload Your First Documents (30 minutes)

**Priority upload order** (maximum impact):

1. **API documentation** you reference frequently
2. **Internal coding standards** and best practices  
3. **Architecture decisions** and design docs
4. **Troubleshooting guides** and runbooks
5. **Key README files** from important projects

**Upload process:**
1. Click "**Documents**" in sidebar
2. Click "**Add Docs**" button
3. **Drag and drop** files or browse to select
4. **Supported formats**: PDF, MD, TXT, DOCX
5. **Wait for processing** - each file will show "Processed" when ready

**📁 File naming tips:**
- ❌ `document.pdf`
- ✅ `React_Authentication_Guide_2024.pdf`

### Step 5: Test Your Setup (30 minutes)

**Test these questions to verify everything works:**

1. **General question** (use llama3.1:8b):
   ```
   "What are the key principles of microservices architecture?"
   ```

2. **Code question** (switch to deepseek-coder:6.7b):
   ```
   "How do I implement JWT authentication in Express.js?"
   ```

3. **Debug question** (use deepseek-coder:6.7b):
   ```
   "Debug this error: Cannot read property 'map' of undefined"
   ```

**✅ Success criteria:**
- Questions get relevant answers
- System references your uploaded documents
- Code questions work better with deepseek-coder
- Responses are helpful and specific

### Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| **Services won't start** | Docker not running | Start Docker Desktop |
| **Models not downloading** | Network/permissions | Run `ollama pull llama3.1:8b` manually |
| **Port 3000 in use** | Another service running | Change port in docker-compose.yml |
| **No documents processed** | File format issue | Try TXT/MD files first |

## 🎉 Stage 1 Complete!

You now have a working Local Knowledge Base that can:
- ✅ Answer questions using your documents
- ✅ Search through uploaded content semantically
- ✅ Use appropriate models for different question types

**🚀 Ready for Stage 2?** → Continue to [Automated Content Setup](./automated-content.md)

**🐛 Having Issues?** → Check [Troubleshooting Guide](./troubleshooting.md)

---

## Next Steps

### Immediate Actions
1. **Upload more documents** - the more content, the better answers
2. **Test with real questions** you need answers to
3. **Note any gaps** in knowledge for Stage 2 crawling

### Optional Improvements  
1. **Customize crawl targets** in `crawlers/simple-crawler.ts`
2. **Set up quality tracking** to monitor performance
3. **Schedule automated updates** with cron jobs

### Performance Tips
- **Model switching**: Always use deepseek-coder for code questions
- **Question phrasing**: Be specific - "How to implement X in Y?" vs "How to do X?"
- **Content quality**: Remove duplicate or outdated documents
- **Regular maintenance**: Check logs and update authentication tokens monthly

**Time to first useful answer**: < 2 hours ⏱️