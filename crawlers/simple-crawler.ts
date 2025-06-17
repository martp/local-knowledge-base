import { PlaywrightCrawler } from 'crawlee';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

// Configuration - edit this for your sites
const CRAWL_TARGETS = [
  {
    name: 'React Documentation',
    startUrls: ['https://react.dev/learn'],
    patterns: ['**/learn/**', '**/reference/**'],
    exclude: ['**/blog/**', '**/community/**'],
    maxPages: 50
  },
  {
    name: 'TypeScript Handbook',
    startUrls: ['https://www.typescriptlang.org/docs/'],
    patterns: ['**/docs/**'],
    exclude: ['**/playground/**', '**/download/**'],
    maxPages: 40
  },
  {
    name: 'MDN Web Docs',
    startUrls: ['https://developer.mozilla.org/en-US/docs/Web/JavaScript'],
    patterns: ['**/docs/Web/JavaScript/**', '**/docs/Web/API/**'],
    exclude: ['**/docs/Web/JavaScript/Guide/Introduction/**'],
    maxPages: 30
  }
  // Add your own sites here:
  // {
  //   name: 'Company Docs',
  //   startUrls: ['https://docs.company.com/engineering/'],
  //   patterns: ['**/engineering/**', '**/api/**'],
  //   exclude: ['**/legacy/**', '**/deprecated/**'],
  //   maxPages: 50
  // }
];

interface CrawlTarget {
  name: string;
  startUrls: string[];
  patterns: string[];
  exclude: string[];
  maxPages: number;
}

async function crawlSite(target: CrawlTarget): Promise<void> {
  console.log(`🔄 Crawling ${target.name}...`);
  
  const outputDir = './crawled-content';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let pageCount = 0;
  
  const crawler = new PlaywrightCrawler({
    maxRequestsPerCrawl: target.maxPages,
    
    async requestHandler({ request, page }) {
      try {
        const url = request.url;
        
        // Skip if doesn't match patterns
        if (target.patterns.length > 0) {
          const matches = target.patterns.some(pattern => 
            new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*')).test(url)
          );
          if (!matches) {
            console.log(`⏭️  Skipping ${url} (doesn't match patterns)`);
            return;
          }
        }
        
        // Skip excluded patterns
        if (target.exclude.some(pattern => 
          new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*')).test(url)
        )) {
          console.log(`⏭️  Skipping ${url} (excluded)`);
          return;
        }
        
        // Wait for page to load
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // Extract main content
        const title = await page.title();
        
        // Try multiple selectors for content extraction
        const contentSelectors = [
          'main',
          '.content',
          'article',
          '.documentation',
          '#content',
          '.main-content',
          'body'
        ];
        
        let content = '';
        for (const selector of contentSelectors) {
          try {
            const element = await page.$(selector);
            if (element) {
              content = await element.textContent() || '';
              if (content.length > 100) break;
            }
          } catch (error) {
            // Continue to next selector
          }
        }
        
        if (!content || content.length < 100) {
          console.log(`⚠️  Skipping ${url} (insufficient content: ${content.length} chars)`);
          return;
        }
        
        // Clean up content
        content = content
          .replace(/\s+/g, ' ')
          .replace(/\n\s+/g, '\n')
          .trim();
        
        // Create filename
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        const filename = `${target.name.replace(/\s+/g, '_')}_${pathParts.join('_')}_${Date.now()}.txt`;
        
        // Save to file for upload
        const fileContent = `Title: ${title}
URL: ${url}
Source: ${target.name}
Crawled: ${new Date().toISOString()}

${content}`;
        
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, fileContent);
        
        pageCount++;
        console.log(`✅ Saved (${pageCount}/${target.maxPages}): ${filename}`);
        
      } catch (error) {
        console.error(`❌ Error processing ${request.url}:`, error.message);
      }
    },
    
    async errorHandler({ request, error }) {
      console.error(`❌ Failed to crawl ${request.url}:`, error.message);
    }
  });
  
  await crawler.run(target.startUrls);
  console.log(`✅ Finished crawling ${target.name} (${pageCount} pages)`);
}

async function main(): Promise<void> {
  console.log('🚀 Starting Simple Crawler');
  console.log('========================');
  console.log('');
  
  // Create output directory
  const outputDir = './crawled-content';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Clear old content
  const existingFiles = fs.readdirSync(outputDir);
  if (existingFiles.length > 0) {
    console.log(`🧹 Clearing ${existingFiles.length} old files...`);
    existingFiles.forEach(file => {
      fs.unlinkSync(path.join(outputDir, file));
    });
  }
  
  let totalPages = 0;
  
  // Crawl each target
  for (const target of CRAWL_TARGETS) {
    try {
      const startTime = Date.now();
      await crawlSite(target);
      const endTime = Date.now();
      console.log(`⏱️  ${target.name} completed in ${((endTime - startTime) / 1000).toFixed(1)}s`);
      console.log('');
    } catch (error) {
      console.error(`❌ Error crawling ${target.name}:`, error.message);
    }
  }
  
  // Summary
  const finalFiles = fs.readdirSync(outputDir);
  totalPages = finalFiles.length;
  
  console.log('🎉 Crawling Complete!');
  console.log('==================');
  console.log(`📊 Total pages crawled: ${totalPages}`);
  console.log(`📁 Files saved to: ${outputDir}`);
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Visit http://localhost:3000/documents');
  console.log('2. Click "Add Docs" or drag and drop files');
  console.log('3. Bulk upload all files from ./crawled-content/');
  console.log('4. Wait for processing to complete');
  console.log('5. Start asking questions!');
  
  if (totalPages === 0) {
    console.log('');
    console.log('⚠️  No pages were crawled. This might be due to:');
    console.log('   • Network connectivity issues');
    console.log('   • Sites blocking automated requests');
    console.log('   • Pattern matching issues');
    console.log('   • Content extraction failures');
    console.log('');
    console.log('💡 Try adjusting the CRAWL_TARGETS configuration above');
  }
}

// Run the crawler
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});