# Stage 2: Automated Content Setup

Transform your knowledge base from manual uploads to automated content collection. This stage sets up crawlers that automatically gather documentation from your key sources.

## ⏱️ Time Estimate: 1-2 Hours

- **Public site crawling**: 30 minutes
- **Authentication setup**: 45 minutes  
- **Testing and validation**: 30 minutes

## 🎯 What You'll Achieve

By the end of Stage 2, your system will:
- ✅ Automatically crawl public documentation sites
- ✅ Access protected company resources (Confluence, Jira, etc.)
- ✅ Keep content fresh with scheduled updates
- ✅ Handle authentication token management

## 📋 Prerequisites

✅ **Stage 1 Complete**: Working knowledge base at http://localhost:3000  
✅ **Dependencies Installed**: `npm install` completed  
✅ **Target Sites Identified**: List of docs you want to crawl

## 🚀 Part 1: Public Site Crawling (30 minutes)

### Step 1: Configure Your Targets (15 minutes)

Edit the crawler configuration to match your needs:

```bash
# Open the crawler config
code crawlers/simple-crawler.ts
```

**Replace the default targets** (lines 10-40) with your sites:

```typescript
const CRAWL_TARGETS = [
  // Keep these popular ones if useful
  {
    name: 'React Documentation',
    startUrls: ['https://react.dev/learn'],
    patterns: ['**/learn/**', '**/reference/**'],
    exclude: ['**/blog/**', '**/community/**'],
    maxPages: 50
  },
  
  // Add your company/project specific docs
  {
    name: 'Your API Docs',
    startUrls: ['https://api.yourcompany.com/docs/'],
    patterns: ['**/docs/**', '**/api/**'],
    exclude: ['**/changelog/**', '**/deprecated/**'],
    maxPages: 100
  },
  
  {
    name: 'Framework Docs',
    startUrls: ['https://docs.framework.com/'],
    patterns: ['**/guides/**', '**/tutorials/**'],
    exclude: ['**/examples/**'],
    maxPages: 50
  }
];
```

**Pattern Guide:**
- `**` = Match any subdirectories  
- `*` = Match any characters (excluding `/`)
- `**/api/**` = Any path containing `/api/`
- `exclude` = Skip these patterns entirely

### Step 2: Test Crawling (15 minutes)

**Run your first crawl:**
```bash
npm run crawl
```

**Expected output:**
```
🚀 Starting Simple Crawler
========================

🔄 Crawling React Documentation...
✅ Saved (1/50): React_Documentation_learn_thinking-in-react_1701234567.txt
✅ Saved (2/50): React_Documentation_learn_state-management_1701234568.txt
...
✅ Finished crawling React Documentation (45 pages)

🎉 Crawling Complete!
==================
📊 Total pages crawled: 123
📁 Files saved to: ./crawled-content
```

**Verify the results:**
```bash
# Check what was crawled
ls -la ./crawled-content/
head ./crawled-content/*.txt
```

Each file should contain:
- Clean, readable content
- Source URL and metadata
- Proper formatting for upload

## 🔐 Part 2: Authentication Setup (45 minutes)

### Step 1: Environment Setup (10 minutes)

```bash
# Copy the environment template
cp .env.example .env

# Edit your environment file
code .env
```

### Step 2: Extract Authentication Tokens (25 minutes)

**For each protected site you want to crawl:**

#### Method 1: Browser DevTools (Recommended)

1. **Login** to your site (Confluence, Jira, etc.) in Chrome/Firefox
2. **Open DevTools** (F12 or Cmd+Option+I)
3. **Go to Network tab**
4. **Clear the network log** (🚫 button)
5. **Refresh the page** (Cmd+R or F5)
6. **Find any request** to your domain in the network list
7. **Right-click the request** → Copy → Copy as cURL (bash)

**Example cURL output:**
```bash
curl 'https://company.atlassian.net/wiki/spaces/TECH/overview' \
  -H 'authority: company.atlassian.net' \
  -H 'cookie: ajs_user_id=abc123; ajs_group_id=def456; cloud.session.token=xyz789' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**Extract to .env:**
```bash
# From the cookie header
CONFLUENCE_COOKIES="ajs_user_id=abc123; ajs_group_id=def456; cloud.session.token=xyz789"

# From the authorization header  
CONFLUENCE_AUTH="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Add the base URL
CONFLUENCE_BASE_URL="https://company.atlassian.net"
```

#### Method 2: Manual Token Generation

**For APIs with token support:**

```bash
# Jira/Confluence API tokens
JIRA_AUTH="Basic $(echo -n 'email@company.com:your_api_token' | base64)"

# GitHub (if crawling private repos)
GITHUB_AUTH="token ghp_your_github_token"

# Custom APIs
CUSTOM_API_AUTH="ApiKey your_api_key"
```

### Step 3: Configure Protected Site Targets (10 minutes)

Edit `crawlers/authenticated-crawler.ts` to add your protected sites:

```typescript
const AUTHENTICATED_TARGETS = [
  {
    name: 'Company Confluence',
    baseUrl: process.env.CONFLUENCE_BASE_URL!,
    startUrls: [
      'https://company.atlassian.net/wiki/spaces/TECH/overview',
      'https://company.atlassian.net/wiki/spaces/API/overview'
    ],
    patterns: ['**/wiki/spaces/TECH/**', '**/wiki/spaces/API/**'],
    exclude: ['**/wiki/spaces/TECH/blog/**'],
    maxPages: 100,
    cookies: process.env.CONFLUENCE_COOKIES,
    headers: {
      'Authorization': process.env.CONFLUENCE_AUTH
    }
  },
  
  {
    name: 'Internal API Docs',
    baseUrl: 'https://internal-api.company.com',
    startUrls: ['https://internal-api.company.com/docs/'],
    patterns: ['**/docs/**'],
    exclude: ['**/docs/legacy/**'],
    maxPages: 50,
    headers: {
      'Authorization': process.env.INTERNAL_API_AUTH,
      'X-API-Key': process.env.INTERNAL_API_KEY
    }
  }
];
```

## 🧪 Part 3: Testing & Validation (30 minutes)

### Step 1: Test Public Crawling (10 minutes)

```bash
# Test with a small target first
npm run crawl

# Verify content quality
head -20 ./crawled-content/*.txt
```

**Quality checklist:**
- [ ] Content is readable (not HTML tags)
- [ ] Each file has title, URL, and content
- [ ] File sizes are reasonable (>500 chars)
- [ ] No error messages in content

### Step 2: Test Authenticated Crawling (15 minutes)

```bash
# Test authenticated sites
npm run crawl:auth

# Check for authentication success
grep -r "authentication\|unauthorized\|forbidden" ./crawled-content/
```

**Success indicators:**
- [ ] Files created for protected content
- [ ] No "login required" text in files
- [ ] Content matches what you see when logged in
- [ ] No 401/403 error messages

### Step 3: Upload and Verify (5 minutes)

```bash
# Count total files
ls ./crawled-content/ | wc -l

# Quick content check
echo "Sample content from crawled files:"
head -5 ./crawled-content/*.txt | head -20
```

**Upload to knowledge base:**
1. Visit http://localhost:3000/documents
2. Click "Add Docs"
3. **Drag entire folder**: Select all files from `./crawled-content/`
4. **Wait for processing**: Each file shows "Processed" when ready
5. **Test search**: Ask a question that should use the new content

## ⚡ Part 4: Automation Setup (Bonus - 15 minutes)

### Schedule Regular Updates

```bash
# Set up automated crawling
./setup/setup-cron.sh
```

**Choose your schedule:**
- **Daily**: For rapidly changing content
- **Weekly**: For documentation and guides (recommended)
- **Custom**: Set your own interval

**Manual updates:**
```bash
# Update all content
./update-knowledge-base.sh

# Check update logs
tail -f ./logs/update.log
```

## 📊 Success Validation

### Test These Scenarios

**1. Public content working:**
```
Question: "How do I handle React state updates?"
Expected: Answers using React documentation you crawled
```

**2. Protected content working:**
```
Question: "What's our API authentication flow?"  
Expected: Answers using internal API docs you crawled
```

**3. Mixed content search:**
```
Question: "How do we implement JWT auth in our React app?"
Expected: Combines public React docs + internal API docs
```

## 🔧 Troubleshooting

### Common Issues

**❌ "No pages crawled"**
```bash
# Check network connectivity
ping the-site-you-want-to-crawl.com

# Verify patterns match
# Edit patterns in simple-crawler.ts to be more permissive:
patterns: ['**']  // Allow everything temporarily
```

**❌ "Authentication failed"**
```bash
# Test your tokens manually
curl -H "Cookie: $CONFLUENCE_COOKIES" \
     -H "Authorization: $CONFLUENCE_AUTH" \
     https://your-site.com/test-page

# Refresh expired tokens (they usually expire after 24-48 hours)
# Re-extract from browser DevTools
```

**❌ "Empty or poor content"**
```bash
# Check content selectors in the crawler
# Edit authenticated-crawler.ts, add debug logging:
console.log('Page title:', await page.title());
console.log('Content length:', content.length);
```

**❌ "Rate limited/blocked"**
```bash
# Reduce crawling speed
# In crawler config, add:
maxRequestsPerCrawl: 10,  // Reduce from default
requestHandlerTimeout: 30000,  // Increase timeout
```

### Getting Help

**Debug commands:**
```bash
# Detailed crawler logs
npm run crawl 2>&1 | tee crawler-debug.log

# Check authentication
env | grep -E "(COOKIES|AUTH|TOKEN)"

# Verify file permissions
ls -la ./crawled-content/
```

## 🎉 Stage 2 Complete!

You now have automated content collection that:
- ✅ Crawls public documentation sites
- ✅ Accesses your protected company resources  
- ✅ Runs on schedule with minimal maintenance
- ✅ Provides fresh, relevant content for queries

**📈 Quality metrics to track:**
- Number of pages successfully crawled
- Content freshness (last updated dates)
- Query coverage (% of questions that find relevant docs)

**🚀 Ready for Stage 3?** → Continue to [Quality Monitoring](./quality-monitoring.md)

**💡 Pro Tips:**
- **Token maintenance**: Set calendar reminder to refresh auth tokens monthly
- **Content curation**: Remove outdated crawled content quarterly  
- **Pattern tuning**: Adjust patterns based on which content gets used most
- **Performance monitoring**: Use `npm run quality:analyze` weekly to track improvements

---

**⏱️ Total time invested: ~2 hours**  
**🎯 Value delivered: Automated, always-fresh knowledge base**