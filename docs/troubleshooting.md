# Troubleshooting Guide

Common issues and solutions for your Local Knowledge Base.

## 🚨 Service Issues

### Docker Services Won't Start

**Symptoms:**
- Error when running `docker-compose up -d`
- Services show as "Exited" in `docker-compose ps`

**Solutions:**
```bash
# Check Docker is running
docker version

# Check port conflicts
lsof -i :3000  # Open WebUI port
lsof -i :6333  # Qdrant port
lsof -i :11434 # Ollama port

# Stop conflicting services
sudo lsof -t -i:3000 | xargs kill -9

# Reset Docker services
docker-compose down
docker-compose up -d
```

### Services Start But Can't Connect

**Symptoms:**
- Services show "Up" but web interface doesn't load
- Connection refused errors

**Solutions:**
```bash
# Check service logs
docker-compose logs open-webui
docker-compose logs qdrant

# Verify network connectivity
docker-compose exec open-webui ping qdrant
docker-compose exec open-webui ping host.docker.internal

# Restart with clean state
docker-compose down -v
docker-compose up -d
```

## 🤖 Ollama Issues  

### Models Not Downloading

**Symptoms:**
- Ollama install succeeds but models fail to download
- "Model not found" errors

**Solutions:**
```bash
# Check Ollama service
ollama list

# Manually download models
ollama pull llama3.1:8b
ollama pull deepseek-coder:6.7b  
ollama pull nomic-embed-text

# Check disk space
df -h

# Restart Ollama service
brew services restart ollama  # macOS
sudo systemctl restart ollama # Linux
```

### Model Loading Errors

**Symptoms:**
- Models download but fail to load
- Timeout errors when asking questions

**Solutions:**
```bash
# Check available memory
free -h  # Linux
vm_stat # macOS

# Reduce concurrent model loading
# Edit docker-compose.yml, add:
# environment:
#   - OLLAMA_MAX_LOADED_MODELS=1

# Use smaller models if memory limited
ollama pull llama3.1:4b  # Instead of 8b
```

## 📄 Document Processing Issues

### Documents Not Processing

**Symptoms:**
- Files upload but stay in "Processing" state
- No content appears in search results

**Solutions:**
```bash
# Check processing logs
docker-compose logs open-webui | grep -i process

# Verify file formats
# Supported: PDF, MD, TXT, DOCX
# Try with simple .txt file first

# Check Qdrant connection
curl http://localhost:6333/collections

# Restart processing service
docker-compose restart open-webui
```

### Poor Search Results

**Symptoms:**
- Questions return "No relevant documents found"
- Results don't match uploaded content

**Solutions:**
```bash
# Verify documents were indexed
curl http://localhost:6333/collections/default/points/count

# Check embedding model
# In docker-compose.yml, verify:
# RAG_EMBEDDING_MODEL=nomic-embed-text

# Adjust search parameters
# Reduce RAG_TOP_K from 8 to 5
# Increase CHUNK_SIZE from 1000 to 1500

# Re-upload problematic documents
```

## 🔐 Authentication Issues

### Crawling Protected Sites Fails

**Symptoms:**
- Authenticated crawler returns empty results
- "Authentication required" in logs

**Solutions:**
```bash
# Check .env file exists and has values
cat .env | grep -E "(COOKIES|AUTH)"

# Verify token format
# Should be: SITE_COOKIES="cookie1=value1; cookie2=value2"
# Should be: SITE_AUTH="Bearer token123"

# Test tokens manually
curl -H "Cookie: $CONFLUENCE_COOKIES" \
     -H "Authorization: $CONFLUENCE_AUTH" \
     https://your-site.com/test-page

# Refresh expired tokens
# Re-extract from browser DevTools → Network
```

### Token Extraction Problems

**Symptoms:**
- Can't find authentication tokens
- Copied cURL doesn't work

**Step-by-step token extraction:**
1. **Login** to your site normally
2. **Open DevTools** (F12)
3. **Go to Network tab**
4. **Clear network log**
5. **Refresh the page**
6. **Find any request** to your domain
7. **Right-click request** → Copy → Copy as cURL
8. **Extract from cURL**:
   ```bash
   # From: curl 'https://site.com/page' -H 'Cookie: SESSION=abc123; TOKEN=xyz789'
   # Use: SITE_COOKIES="SESSION=abc123; TOKEN=xyz789"
   ```

## 🔍 Crawling Issues

### Crawler Returns No Results

**Symptoms:**
- Crawler runs but creates no files
- "0 pages crawled" message

**Solutions:**
```bash
# Check network connectivity
ping example.com

# Verify crawl targets
# Edit crawlers/simple-crawler.ts
# Check startUrls and patterns

# Test with simple target first
# Add this to CRAWL_TARGETS:
{
  name: 'Test Site',
  startUrls: ['https://httpbin.org/html'],
  patterns: ['**'],
  exclude: [],
  maxPages: 1
}

# Run crawler with debug
npx tsx crawlers/simple-crawler.ts
```

### Crawler Blocked by Sites

**Symptoms:**
- 403/429 errors in logs
- "Blocked by robots.txt" messages

**Solutions:**
```bash
# Add delays between requests
# In crawler config:
maxRequestsPerCrawl: 10,  # Reduce from 50
requestHandlerTimeout: 30000,

# Use different user agents
# Add to crawler:
preNavigationHooks: [
  async ({ page }) => {
    await page.setUserAgent('Mozilla/5.0...');
  }
]

# Respect robots.txt
# Check site's robots.txt first
curl https://site.com/robots.txt
```

## 🎯 Quality Issues

### Poor Answer Quality

**Symptoms:**
- Answers are generic or unhelpful
- Model doesn't use uploaded content

**Solutions:**
```bash
# Use appropriate model
# Code questions → deepseek-coder:6.7b
# General questions → llama3.1:8b

# Improve question phrasing
# ❌ "How to do auth?"
# ✅ "How to implement JWT authentication in Express.js?"

# Check document relevance
# Ensure uploaded docs cover the topic
# Add more specific documentation

# Monitor with quality tracker
npx tsx quality-monitoring/quality-tracker.ts log "question" "model" rating
```

### Model Selection Issues

**Symptoms:**
- Wrong model recommended for question type
- Inconsistent results

**Solutions:**
```bash
# Use smart model selector
npx tsx quality-monitoring/smart-model-selector.ts select "your question"

# Override automatic selection
# Manually switch models in web interface

# Update selection patterns
# Edit quality-monitoring/smart-model-selector.ts
# Add your domain-specific keywords
```

## 🔧 Performance Issues

### Slow Response Times

**Symptoms:**
- Queries take >30 seconds
- Interface becomes unresponsive

**Solutions:**
```bash
# Check system resources
docker stats

# Reduce context size
# In docker-compose.yml:
# RAG_TOP_K=5  # Reduce from 8
# CHUNK_SIZE=800  # Reduce from 1000

# Optimize Qdrant
# Restart Qdrant service
docker-compose restart qdrant

# Use smaller models if needed
ollama pull llama3.1:4b
```

### High Memory Usage

**Symptoms:**
- System becomes slow
- Docker containers getting killed

**Solutions:**
```bash
# Check memory usage
free -h
docker stats

# Limit Docker memory
# Add to docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 4G

# Use one model at a time
# Stop unused Ollama models
ollama stop llama3.1:8b
```

## 📊 Monitoring & Logs

### Check Service Status

```bash
# All services
docker-compose ps

# Specific service logs
docker-compose logs -f open-webui
docker-compose logs -f qdrant
docker-compose logs -f --tail=50 open-webui

# System logs
journalctl -u docker  # Linux
log show --predicate 'process == "Docker"' --last 1h  # macOS
```

### Debug Information

```bash
# Qdrant status
curl http://localhost:6333/
curl http://localhost:6333/collections

# Ollama status  
ollama list
ollama ps

# Open WebUI configuration
docker-compose exec open-webui env | grep RAG
```

## 🆘 Getting Help

### Before Reporting Issues

1. **Check logs** for specific error messages
2. **Try basic connectivity** tests
3. **Verify file permissions** and disk space
4. **Test with minimal configuration**

### Useful Debug Commands

```bash
# Complete system check
./setup/quick-start.sh --check-only

# Export logs for support
docker-compose logs > debug-logs.txt
docker stats --no-stream > debug-stats.txt

# Clean restart
docker-compose down -v
docker system prune -f
./setup/quick-start.sh
```

### Recovery Commands

```bash
# Nuclear option - complete reset
docker-compose down -v
docker system prune -a -f
rm -rf qdrant-data webui-data logs
./setup/quick-start.sh
```

---

**💡 Pro Tip**: Most issues are resolved by restarting services and checking logs. When in doubt, run `docker-compose down && docker-compose up -d`.