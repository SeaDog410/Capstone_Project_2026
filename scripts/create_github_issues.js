const fs = require('fs');
const path = require('path');
const https = require('https');

// --- Configuration ---
const REPO = 'SeaDog410/Capstone_Project_2026';
const ISSUES_DIR = path.join(__dirname, '../Docs/issues');
const TOKEN = process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is missing.');
  console.error('Usage: GITHUB_TOKEN="your_pat_here" node scripts/create_github_issues.js');
  process.exit(1);
}

const HEADERS = {
  'User-Agent': 'NodeJS-GitHub-Issue-Importer',
  'Authorization': `token ${TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'Content-Type': 'application/json'
};

// --- Helper Functions ---
function apiRequest(method, endpoint, payload = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: HEADERS
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body || '{}'));
        } else {
          reject(new Error(`API Error ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (payload) {
      req.write(JSON.stringify(payload));
    }
    req.end();
  });
}

// --- Main Logic ---
async function run() {
  console.log(`Starting GitHub Issue Sync for ${REPO}...`);

  try {
    // 1. Fetch existing open issues to avoid duplicates
    console.log('Fetching existing issues...');
    const existingIssues = await apiRequest('GET', `/repos/${REPO}/issues?state=open&per_page=100`);
    const existingTitles = new Set(existingIssues.map(issue => issue.title.trim()));
    
    // 2. Fetch existing milestones
    console.log('Fetching existing milestones...');
    const existingMilestonesApi = await apiRequest('GET', `/repos/${REPO}/milestones?state=open&per_page=100`);
    const milestoneMap = new Map(); // Name -> Number
    for (const m of existingMilestonesApi) {
      milestoneMap.set(m.title.trim(), m.number);
    }

    // 3. Read markdown files
    if (!fs.existsSync(ISSUES_DIR)) {
      console.log(`No issues directory found at ${ISSUES_DIR}`);
      return;
    }

    const files = fs.readdirSync(ISSUES_DIR).filter(f => f.endsWith('.md'));
    console.log(`Found ${files.length} issue file(s) to process.`);

    for (const file of files) {
      const filePath = path.join(ISSUES_DIR, file);
      let content = fs.readFileSync(filePath, 'utf-8');

      // Extract Frontmatter
      let milestoneName = null;
      const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
      const match = content.match(frontmatterRegex);
      
      if (match) {
        const frontmatter = match[1];
        const milestoneMatch = frontmatter.match(/Milestone:\s*(.+)/i);
        if (milestoneMatch) {
          milestoneName = milestoneMatch[1].trim();
        }
        // Remove frontmatter from the body uploaded to GitHub
        content = content.replace(frontmatterRegex, '').trim();
      }

      // Extract Title (first H1)
      let title = `Issue from ${file}`;
      const titleRegex = /^#\s+(.+)/m;
      const titleMatch = content.match(titleRegex);
      if (titleMatch) {
        title = titleMatch[1].trim();
        // Remove title from body to avoid redundancy
        content = content.replace(titleRegex, '').trim();
      }

      // Check Idempotency
      if (existingTitles.has(title)) {
        console.log(`[SKIP] Issue already exists: "${title}"`);
        continue;
      }

      // Handle Milestone
      let milestoneNumber = null;
      if (milestoneName) {
        if (!milestoneMap.has(milestoneName)) {
          console.log(`[CREATE] Milestone: "${milestoneName}"`);
          const newMilestone = await apiRequest('POST', `/repos/${REPO}/milestones`, { title: milestoneName });
          milestoneMap.set(milestoneName, newMilestone.number);
        }
        milestoneNumber = milestoneMap.get(milestoneName);
      }

      // Create Issue
      console.log(`[CREATE] Issue: "${title}"`);
      await apiRequest('POST', `/repos/${REPO}/issues`, {
        title: title,
        body: content,
        milestone: milestoneNumber
      });
      
      // Small delay to respect rate limits
      await new Promise(r => setTimeout(r, 500));
    }

    console.log('Sync Complete!');

  } catch (err) {
    console.error('Script failed:', err.message);
  }
}

run();
