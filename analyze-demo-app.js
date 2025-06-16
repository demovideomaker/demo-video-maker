#!/usr/bin/env node

/**
 * Analyze Demo App - Find all interactive elements and create interaction plans
 */

const { chromium } = require('@playwright/test');

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🔍 Demo App Analyzer                                    ║
║                                                           ║
║  Finding interactive elements for demo planning          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

async function analyzePage(page, pageName, url) {
  console.log(`\n📄 Analyzing ${pageName} (${url})...`);
  
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Find all interactive elements
  const elements = await page.evaluate(() => {
    const results = [];
    
    // Find all elements with data-testid
    document.querySelectorAll('[data-testid]').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        results.push({
          testId: el.getAttribute('data-testid'),
          tag: el.tagName.toLowerCase(),
          text: el.textContent?.trim().substring(0, 50),
          type: el.getAttribute('type'),
          placeholder: el.getAttribute('placeholder'),
          href: el.getAttribute('href'),
          clickable: el.tagName === 'BUTTON' || el.tagName === 'A' || el.onclick !== null,
          position: { x: rect.x + rect.width/2, y: rect.y + rect.height/2 }
        });
      }
    });
    
    // Find buttons without data-testid
    document.querySelectorAll('button:not([data-testid])').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && el.textContent) {
        results.push({
          selector: `button:has-text("${el.textContent.trim()}")`,
          tag: 'button',
          text: el.textContent.trim(),
          clickable: true,
          position: { x: rect.x + rect.width/2, y: rect.y + rect.height/2 }
        });
      }
    });
    
    // Find inputs
    document.querySelectorAll('input:not([data-testid]), select:not([data-testid])').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        results.push({
          selector: el.name ? `[name="${el.name}"]` : `${el.tagName.toLowerCase()}[type="${el.type}"]`,
          tag: el.tagName.toLowerCase(),
          type: el.type,
          name: el.name,
          placeholder: el.placeholder,
          position: { x: rect.x + rect.width/2, y: rect.y + rect.height/2 }
        });
      }
    });
    
    return results;
  });
  
  console.log(`   Found ${elements.length} interactive elements:`);
  
  // Group by type
  const buttons = elements.filter(e => e.tag === 'button' || e.clickable);
  const inputs = elements.filter(e => e.tag === 'input' || e.tag === 'select');
  const links = elements.filter(e => e.tag === 'a');
  
  if (buttons.length > 0) {
    console.log(`\n   🔘 Buttons (${buttons.length}):`);
    buttons.forEach(b => {
      console.log(`      - ${b.testId || b.selector} "${b.text || 'No text'}"`);
    });
  }
  
  if (inputs.length > 0) {
    console.log(`\n   📝 Inputs (${inputs.length}):`);
    inputs.forEach(i => {
      console.log(`      - ${i.testId || i.selector} (${i.type}) "${i.placeholder || i.name || 'No label'}"`);
    });
  }
  
  if (links.length > 0) {
    console.log(`\n   🔗 Links (${links.length}):`);
    links.forEach(l => {
      console.log(`      - ${l.testId || l.selector} "${l.text}" -> ${l.href}`);
    });
  }
  
  return elements;
}

async function createInteractionPlan(elements, pageName) {
  const plan = {
    page: pageName,
    steps: []
  };
  
  // Prioritize interactions
  const priority = {
    'time-range-selector': 100,
    'refresh': 90,
    'export': 85,
    'search': 80,
    'filter': 75,
    'add': 70,
    'save': 65,
    'toggle': 60,
    'input': 50
  };
  
  // Score and sort elements
  const scoredElements = elements.map(el => {
    let score = 0;
    const id = (el.testId || el.text || '').toLowerCase();
    
    for (const [key, value] of Object.entries(priority)) {
      if (id.includes(key)) {
        score = Math.max(score, value);
      }
    }
    
    // Add base score by type
    if (el.tag === 'button') score += 20;
    if (el.tag === 'a') score += 15;
    if (el.tag === 'input') score += 10;
    
    return { ...el, score };
  }).sort((a, b) => b.score - a.score);
  
  // Create interaction steps
  scoredElements.slice(0, 6).forEach(el => {
    if (el.tag === 'input' || el.tag === 'select') {
      plan.steps.push({
        action: 'type',
        selector: el.testId ? `[data-testid="${el.testId}"]` : el.selector,
        value: generateSampleValue(el),
        description: `Fill in ${el.placeholder || el.name || el.type}`
      });
    } else if (el.clickable || el.tag === 'button' || el.tag === 'a') {
      plan.steps.push({
        action: 'click',
        selector: el.testId ? `[data-testid="${el.testId}"]` : el.selector,
        description: `Click ${el.text || el.testId}`
      });
    }
  });
  
  return plan;
}

function generateSampleValue(element) {
  const { type, placeholder, name } = element;
  const lower = (placeholder || name || '').toLowerCase();
  
  if (lower.includes('email')) return 'demo@example.com';
  if (lower.includes('search')) return 'Product search';
  if (lower.includes('name')) return 'John Smith';
  if (lower.includes('app')) return 'My Demo Application';
  if (type === 'number') return '42';
  if (type === 'date') return '2024-01-15';
  
  return 'Sample text';
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const pages = [
    { name: 'Home', url: 'http://localhost:3000' },
    { name: 'Dashboard', url: 'http://localhost:3000/dashboard' },
    { name: 'Analytics', url: 'http://localhost:3000/analytics' },
    { name: 'Users', url: 'http://localhost:3000/users' },
    { name: 'Settings', url: 'http://localhost:3000/settings' }
  ];
  
  const plans = {};
  
  for (const pageInfo of pages) {
    try {
      const elements = await analyzePage(page, pageInfo.name, pageInfo.url);
      plans[pageInfo.name] = await createInteractionPlan(elements, pageInfo.name);
    } catch (error) {
      console.error(`   ❌ Error analyzing ${pageInfo.name}: ${error.message}`);
    }
  }
  
  // Save plans
  const fs = require('fs');
  fs.writeFileSync('demo-interaction-plans.json', JSON.stringify(plans, null, 2));
  
  console.log('\n\n✅ Analysis complete!');
  console.log('📋 Interaction plans saved to: demo-interaction-plans.json');
  
  await browser.close();
}

// Check if demo app is running
const http = require('http');
http.get('http://localhost:3000', (res) => {
  if (res.statusCode === 200 || res.statusCode === 404) {
    main().catch(console.error);
  }
}).on('error', () => {
  console.error('\n❌ Demo app is not running');
  console.error('   Please start it with: cd demo-app && npm run dev\n');
});