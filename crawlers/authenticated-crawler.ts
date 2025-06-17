import { PlaywrightCrawler } from 'crawlee';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

// Authentication configuration for different sites
const AUTHENTICATED_SITES: Record<string, {
  cookies?: string;
  headers?: Record<string, string>;
  loginRequired?: boolean;
}> = {
  'atlassian.net': {
    cookies: process.env.CONFLUENCE_COOKIES,
    headers: {
      'Authorization': process.env.CONFLUENCE_AUTH || ''
    }
  },
  'atlassian.com': {
    cookies: process.env.JIRA_COOKIES,
    headers: {
      'Authorization': process.env.JIRA_AUTH || ''
    }
  }
  // Add your custom authenticated sites here:
  // 'docs.company.com': {
  //   cookies: process.env.CUSTOM_SITE_COOKIES,
  //   headers: {
  //     'Authorization': process.env.CUSTOM_SITE_AUTH || ''
  //   }
  // }
};

// Crawl targets for authenticated sites
const AUTHENTICATED_CRAWL_TARGETS = [
  {
    name: 'Confluence Documentation',
    startUrls: [
      // Replace with your actual Confluence URLs
      'https://yourcompany.atlassian.net/wiki/spaces/DOCS/overview'
    ],
    patterns: ['**/wiki/**', '**/spaces/**'],
    exclude: ['**/labels/**', '**/people/**'],
    maxPages: 25,
    requiresAuth: true
  }
  // Add more authenticated sites as needed
];

interface AuthenticatedCrawlTarget {
  name: string;
  startUrls: string[];
  patterns: string[];
  exclude: string[];
  maxPages: number;
  requiresAuth: boolean;
}

async function setupAuthentication(page: any, url: string): Promise<void> {
  const hostname = new URL(url).hostname;
  
  // Find matching authentication configuration
  const authConfig = Object.entries(AUTHENTICATED_SITES).find(([domain, config]) => 
    hostname.includes(domain)
  )?.[1];
  
  if (!authConfig) {
    return;
  }
  
  console.log(`🔐 Setting up authentication for ${hostname}`);
  
  // Set cookies if provided
  if (authConfig.cookies) {
    const cookies = authConfig.cookies.split(';').map(cookie => {
      const [name, ...valueParts] = cookie.trim().split('=');
      const value = valueParts.join('=');
      return {
        name: name.trim(),
        value: value.trim(),
        domain: hostname,
        path: '/'
      };
    });
    
    await page.context().addCookies(cookies);
    console.log(`✅ Added ${cookies.length} cookies for ${hostname}`);
  }
  
  // Set headers if provided
  if (authConfig.headers) {
    await page.setExtraHTTPHeaders(authConfig.headers);
    console.log(`✅ Added headers for ${hostname}`);
  }
}

async function crawlAuthenticatedSite(target: AuthenticatedCrawlTarget): Promise<void> {
  console.log(`🔄 Crawling ${target.name} (authenticated)...`);
  
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
        
        // Setup authentication for this request
        if (target.requiresAuth) {
          await setupAuthentication(page, url);
        }
        
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
        
        // Navigate to the page
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        
        // Check if we're logged in (look for common login indicators)
        const loginIndicators = [
          'input[type="password"]',
          'button[type="submit"]:has-text("Login")',
          'a:has-text("Sign in")',
          '.login-form'
        ];
        
        const needsLogin = await Promise.all(
          loginIndicators.map(selector => page.$(selector))
        ).then(results => results.some(element => element !== null));
        
        if (needsLogin) {
          console.log(`⚠️  ${url} requires login - skipping (authentication may have expired)`);
          return;
        }
        
        // Extract main content
        const title = await page.title();
        
        // Confluence-specific selectors first, then fallback to generic
        const contentSelectors = [
          '#main-content',
          '.wiki-content',
          '.page-content',
          '.aui-page-panel-content',
          'main',
          '.content',
          'article',
          '.documentation',
          '#content',
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
          .replace(/Table of Contents[^\\n]*/g, '')
          .replace(/Edit this page[^\\n]*/g, '')
          .replace(/Share[^\\n]*/g, '')
          .trim();
        
        // Create filename
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        const filename = `${target.name.replace(/\s+/g, '_')}_${pathParts.join('_')}_${Date.now()}.txt`;
        
        // Extract metadata
        let metadata = '';
        try {
          // Try to get page metadata
          const lastModified = await page.$eval('meta[name="last-modified"]', el => el.getAttribute('content')).catch(() => null);
          const author = await page.$eval('meta[name="author"]', el => el.getAttribute('content')).catch(() => null);
          
          if (lastModified) metadata += `Last Modified: ${lastModified}\n`;
          if (author) metadata += `Author: ${author}\n`;
        } catch (error) {
          // Metadata extraction is optional
        }
        
        // Save to file for upload
        const fileContent = `Title: ${title}
URL: ${url}
Source: ${target.name}
Crawled: ${new Date().toISOString()}
${metadata}
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
  console.log('🔐 Starting Authenticated Crawler');
  console.log('=================================');
  console.log('');
  
  // Check if authentication is configured
  const hasAuthConfig = Object.values(AUTHENTICATED_SITES).some(config => 
    config.cookies || (config.headers && Object.keys(config.headers).length > 0)
  );
  
  if (!hasAuthConfig) {
    console.log('⚠️  No authentication configuration found in environment variables.');
    console.log('');
    console.log('📋 To crawl authenticated sites:');
    console.log('1. Copy .env.example to .env');
    console.log('2. Login to your sites in a browser');
    console.log('3. Open DevTools (F12) → Network tab');
    console.log('4. Refresh the page');
    console.log('5. Find any request to your site');
    console.log('6. Right-click → Copy → Copy as cURL');
    console.log('7. Extract cookies and headers from the cURL command');
    console.log('8. Update your .env file with the authentication data');
    console.log('');
    console.log('Example:');
    console.log('CONFLUENCE_COOKIES="JSESSIONID=abc123; atlassian.xsrf.token=xyz789"');
    console.log('CONFLUENCE_AUTH="Bearer your_token_here"');
    console.log('');
    process.exit(1);
  }
  
  // Create output directory
  const outputDir = './crawled-content';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  let totalPages = 0;
  
  // Crawl each authenticated target
  for (const target of AUTHENTICATED_CRAWL_TARGETS) {
    if (target.startUrls.some(url => url.includes('yourcompany'))) {
      console.log(`⏭️  Skipping ${target.name} - please update startUrls with your actual URLs`);
      continue;
    }
    
    try {
      const startTime = Date.now();
      await crawlAuthenticatedSite(target);
      const endTime = Date.now();
      console.log(`⏱️  ${target.name} completed in ${((endTime - startTime) / 1000).toFixed(1)}s`);
      console.log('');
    } catch (error) {
      console.error(`❌ Error crawling ${target.name}:`, error.message);
    }
  }
  
  // Summary
  const finalFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.txt'));
  totalPages = finalFiles.length;
  
  console.log('🎉 Authenticated Crawling Complete!');
  console.log('==================================');
  console.log(`📊 Total pages crawled: ${totalPages}`);
  console.log(`📁 Files saved to: ${outputDir}`);
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Visit http://localhost:3000/documents');
  console.log('2. Bulk upload all files from ./crawled-content/');
  console.log('3. Wait for processing to complete');
  console.log('4. Test with questions about your internal documentation');
  
  if (totalPages === 0) {
    console.log('');
    console.log('⚠️  No pages were crawled. This might be due to:');
    console.log('   • Authentication tokens expired');
    console.log('   • Invalid URLs in AUTHENTICATED_CRAWL_TARGETS');
    console.log('   • Network connectivity issues');
    console.log('   • Sites blocking automated requests');
    console.log('');
    console.log('💡 Try refreshing your authentication tokens');
  }
}

// Run the authenticated crawler
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});