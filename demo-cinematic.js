#!/usr/bin/env node

/**
 * Cinematic Demo Generator - Professional quality with zoom, glow, and camera effects
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ConfigLoader = require('./lib/configLoader');

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🎬 Cinematic Demo Generator                             ║
║                                                           ║
║  Professional demos with zoom & camera effects          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    init: false,
    port: 3000,
    projectPath: null,
    baseUrl: null,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--init') {
      parsed.init = true;
    } else if (arg === '--port' || arg === '-p') {
      const portValue = args[i + 1];
      if (portValue && !portValue.startsWith('-')) {
        const port = parseInt(portValue, 10);
        if (port > 0 && port < 65536) {
          parsed.port = port;
          i++; // skip next arg as it's the port value
        } else {
          console.warn('⚠️  Invalid port number, using default 3000');
        }
      } else {
        console.warn('⚠️  Port flag requires a value, using default 3000');
      }
    } else if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else if (!arg.startsWith('-')) {
      // Positional arguments
      if (!parsed.projectPath) {
        parsed.projectPath = arg;
      } else if (!parsed.baseUrl) {
        parsed.baseUrl = arg;
      }
    }
  }

  return parsed;
}

const cliArgs = parseArgs();

// Handle --help flag
if (cliArgs.help) {
  console.log(`
Usage: demo-video-maker [options] [project-path] [base-url]

Options:
  --init              Create a sample demo.json configuration file
  --port, -p <port>   Port number where your app is running (default: 3000)
  --help, -h          Show this help message

Examples:
  demo-video-maker --init                    # Create sample config
  demo-video-maker --port 3000               # Run demo on port 3000
  demo-video-maker -p 8080 ./my-app          # Custom port and project path
  demo-video-maker ./project http://localhost:4000  # Full custom setup
`);
  process.exit(0);
}

// Handle --init flag
if (cliArgs.init) {
  console.log('🔧 Creating sample configuration...\n');
  const samplePath = path.join(process.cwd(), 'demo.json');
  const configLoader = new ConfigLoader();
  configLoader.generateSampleConfig(samplePath);
  console.log('✅ Sample demo.json created. Please customize it and run the demo.');
  process.exit(0);
}

function validateProjectPath(inputPath) {
  if (!inputPath) return process.cwd();
  
  try {
    const normalizedPath = path.resolve(inputPath);
    const cwd = process.cwd();
    
    // Ensure path is within reasonable bounds and not attempting traversal
    if (normalizedPath.includes('..') || normalizedPath.length > 1000) {
      console.warn('⚠️  Invalid project path, using current directory');
      return cwd;
    }
    
    return normalizedPath;
  } catch {
    return process.cwd();
  }
}

function validateBaseUrl(inputUrl, defaultPort = 3003) {
  if (!inputUrl) return `http://localhost:${defaultPort}`;
  
  try {
    const url = new URL(inputUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      console.warn('⚠️  Invalid protocol, using default URL');
      return `http://localhost:${defaultPort}`;
    }
    
    // Prevent localhost bypass attacks
    if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1' && !url.hostname.startsWith('192.168.')) {
      console.warn('⚠️  Only localhost and local IPs allowed');
      return `http://localhost:${defaultPort}`;
    }
    
    return url.toString();
  } catch {
    console.warn('⚠️  Invalid URL format, using default');
    return `http://localhost:${defaultPort}`;
  }
}

const projectPath = validateProjectPath(cliArgs.projectPath);
const baseUrl = validateBaseUrl(cliArgs.baseUrl, cliArgs.port);

// Initialize configuration loader
const configLoader = new ConfigLoader();

const outputDir = path.join(process.cwd(), 'demo-output-cinematic');
const videosDir = path.join(outputDir, 'videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

async function createConfigDrivenDemo() {
  console.log('\n🔍 Searching for demo.json configurations...\n');
  
  // Find all demo.json files in the project
  const configs = configLoader.findAllConfigs(projectPath);
  
  if (configs.length === 0) {
    console.log('❌ No demo.json files found. Creating sample configuration...');
    const samplePath = path.join(projectPath, 'demo.json');
    configLoader.generateSampleConfig(samplePath);
    console.log('\n✅ Sample demo.json created. Please customize it and run again.');
    return;
  }
  
  console.log(`✅ Found ${configs.length} demo configuration(s):`);
  configs.forEach((cfg, index) => {
    console.log(`   ${index + 1}. ${cfg.config.name} (${path.relative(projectPath, cfg.path)})`);
  });
  
  // Process each configuration
  for (let i = 0; i < configs.length; i++) {
    const { config, path: configPath } = configs[i];
    console.log(`\n🎬 Creating demo for: ${config.name}`);
    
    await createDemoFromConfig(config, configPath);
  }
}

// URL validation function
function validateAndSanitizeUrl(baseUrl, relativePath) {
  try {
    // Validate base URL
    const base = new URL(baseUrl);
    
    if (!relativePath) return base.toString();
    
    // Sanitize relative path
    if (relativePath.includes('..') || relativePath.includes('//') || 
        relativePath.includes('javascript:') || relativePath.includes('data:') ||
        relativePath.includes('<script') || relativePath.length > 2000) {
      console.warn('⚠️  Invalid URL path detected, using base URL');
      return base.toString();
    }
    
    // Construct safe URL
    const safeUrl = new URL(relativePath, base);
    
    // Ensure protocol and host match base URL
    if (safeUrl.protocol !== base.protocol || safeUrl.host !== base.host) {
      console.warn('⚠️  URL host/protocol mismatch, using base URL');
      return base.toString();
    }
    
    return safeUrl.toString();
  } catch (error) {
    console.error('URL validation failed:', error.message);
    return baseUrl; // Return safe fallback
  }
}

async function createDemoFromConfig(config, configPath) {
  let browser = null;
  let context = null;
  let page = null;
  let mouseX = 960;
  let mouseY = 540;
  
  
  // Helper functions for cinematic effects with memory management
  async function cinematicMove(targetX, targetY, duration = 1000) {
    const steps = 60;
    const stepDelay = duration / steps;
    const timeouts = []; // Track timeouts for cleanup
    
    try {
      for (let i = 0; i <= steps; i++) {
        // Check if page is still alive
        if (!page || page.isClosed()) {
          console.warn('⚠️  Page closed or not initialized during animation, stopping cinematicMove');
          break;
        }
        
        const progress = i / steps;
        // Smooth easing curve
        const ease = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        const x = mouseX + (targetX - mouseX) * ease;
        const y = mouseY + (targetY - mouseY) * ease;
        
        try {
          if (page) {
            // Update camera follow based on mouse position
            await page.evaluate(({ x, y }) => {
              if (window.cinematicControl && window.cinematicControl.updateCameraFollow) {
                window.cinematicControl.updateCameraFollow(x, y);
              }
            }, { x, y });
            
            await page.mouse.move(x, y);
            await page.waitForTimeout(stepDelay);
          }
        } catch (error) {
          if (error.message.includes('Target page, context or browser has been closed')) {
            console.warn('⚠️  Browser closed during animation, stopping cinematicMove');
            break;
          }
          throw error;
        }
      }
      
      mouseX = targetX;
      mouseY = targetY;
    } catch (error) {
      // Clear any pending timeouts on error
      timeouts.forEach(id => clearTimeout(id));
      if (!error.message.includes('closed')) {
        throw error;
      }
    }
  }
  
  async function zoomToElement(selector, scale = 2, padding = 50) {
    try {
      if (!page) return false;
      const element = await page.$(selector);
      if (element) {
        const box = await element.boundingBox();
        if (box) {
          const centerX = box.x + box.width / 2;
          const centerY = box.y + box.height / 2;
          
          console.log(`   🔍 Zooming to ${selector} (${scale}x)`);
          
          if (page) {
            await page.evaluate(({ scale, centerX, centerY, selector }) => {
            const el = document.querySelector(selector);
            if (window.cinematicControl && el) {
              window.cinematicControl.highlightElement(el);
              window.cinematicControl.zoomTo(scale, centerX, centerY);
            }
            }, { scale, centerX, centerY, selector });
            
            await page.waitForTimeout(1000);
          }
          return true;
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Could not zoom to ${selector}`);
    }
    return false;
  }
  
  async function cinematicClick(selector, description, options = {}) {
    console.log(`   → ${description}`);
    
    try {
      if (!page) return false;
      // Try multiple times with increasing timeout
      let element = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          element = await page.waitForSelector(selector, { 
            state: 'visible', 
            timeout: 2000 + (attempt * 1000) 
          });
          if (element) break;
        } catch (e) {
          if (attempt === 2) throw e;
          console.log(`     ⚠️  Retry ${attempt + 1}: Element not found yet`);
          await page.waitForTimeout(500);
        }
      }
      
      if (element) {
        const box = await element.boundingBox();
        if (box) {
          const targetX = box.x + box.width / 2;
          const targetY = box.y + box.height / 2;
          
          // Zoom in if specified
          if (options.zoom) {
            await zoomToElement(selector, options.zoom);
          }
          
          // Move to element with cinematic motion
          await cinematicMove(targetX, targetY);
          if (page) await page.waitForTimeout(300);
          
          // Click animation
          if (page) {
            // Pass coordinates for click animation
            await page.evaluate(({ x, y }) => {
              if (window.cinematicControl && window.cinematicControl.animateClick) {
                window.cinematicControl.animateClick(x, y);
              }
            }, { x: targetX, y: targetY });
          }
          
          // Actual click
          await element.click();
          if (page) await page.waitForTimeout(600);
          
          // Reset zoom if we zoomed in
          if (options.zoom) {
            await page.evaluate(() => {
              if (window.cinematicControl) {
                window.cinematicControl.resetZoom();
                window.cinematicControl.highlightElement(null);
              }
            });
            await page.waitForTimeout(800);
          }
          
          return true;
        }
      }
    } catch (error) {
      console.log(`     ⚠️  Failed: ${error.message}`);
    }
    return false;
  }
  
  async function cinematicType(selector, text, description) {
    console.log(`   → ${description}`);
    
    if (await cinematicClick(selector, `Focusing on ${description}`, { zoom: 2.5 })) {
      if (page) await page.waitForTimeout(500);
      
      // Clear existing text
      if (page) {
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        await page.waitForTimeout(100);
        await page.keyboard.press('Delete');
        await page.waitForTimeout(300);
      }
      
      // Type with variable speed
      for (const char of text) {
        if (page) {
          await page.keyboard.type(char);
          await page.waitForTimeout(80 + Math.random() * 120);
        }
      }
      
      if (page) await page.waitForTimeout(500);
      
      // Reset zoom
      await page.evaluate(() => {
        if (window.cinematicControl) {
          window.cinematicControl.resetZoom();
        }
      });
      
      return true;
    }
    return false;
  }
  
  async function drawAttentionPattern() {
    console.log('   ✨ Drawing attention pattern');
    
    // Create a figure-8 pattern
    const centerX = 960;
    const centerY = 540;
    const radius = 200;
    
    for (let t = 0; t <= Math.PI * 2; t += Math.PI / 20) {
      const x = centerX + Math.sin(t) * radius;
      const y = centerY + Math.sin(t * 2) * radius / 2;
      await cinematicMove(x, y, 50);
    }
    
    await cinematicMove(centerX, centerY, 500);
  }
  
  // Configuration-driven interaction executor
  async function executeInteraction(interaction, index) {
    const stepPrefix = `   Step ${index + 1}:`;
    
    if (!page) {
      console.error(`${stepPrefix} Page not initialized`);
      return;
    }
    
    try {
      // Wait before moving cursor
      if (interaction.waitBeforeMove) {
        await page.waitForTimeout(interaction.waitBeforeMove);
      }
      
      switch (interaction.type) {
        case 'click':
          console.log(`${stepPrefix} Clicking ${interaction.selector}`);
          
          // Store current URL before click
          const urlBeforeClick = page.url();
          
          const success = await cinematicClick(
            interaction.selector, 
            interaction.description || `Click ${interaction.selector}`,
            { zoom: interaction.zoomLevel || config.effects.zoomLevel }
          );
          if (!success && !interaction.skipIfNotFound) {
            throw new Error(`Element not found: ${interaction.selector}`);
          }
          
          // Check if click caused navigation
          if (success) {
            try {
              // Wait a bit to see if navigation starts
              await page.waitForTimeout(500);
              
              // If URL changed, wait for new page to load
              if (page.url() !== urlBeforeClick) {
                console.log(`  ↳ Navigation detected, waiting for page load...`);
                await page.waitForLoadState('load').catch(() => {});
                await page.waitForTimeout(1000);
              }
            } catch (e) {
              // Ignore navigation detection errors
            }
          }
          break;
          
        case 'hover':
          console.log(`${stepPrefix} Hovering ${interaction.selector}`);
          try {
            const element = await page.locator(interaction.selector).first();
            await element.waitFor({ state: 'visible', timeout: 3000 }).catch(() => null);
            const box = await element.boundingBox().catch(() => null);
            if (box && box.width > 0 && box.height > 0) {
              await cinematicMove(box.x + box.width / 2, box.y + box.height / 2);
              await page.evaluate((selector) => {
                const el = document.querySelector(selector);
                if (el) window.cinematicControl?.highlightElement(el);
              }, interaction.selector);
            } else if (!interaction.skipIfNotFound) {
              throw new Error(`Element not found or not visible: ${interaction.selector}`);
            }
          } catch (error) {
            if (!interaction.skipIfNotFound) throw error;
            console.warn(`⚠️  ${stepPrefix} Element not found, skipping: ${interaction.selector}`);
          }
          break;
          
        case 'type':
          console.log(`${stepPrefix} Typing "${interaction.text}" in ${interaction.selector}`);
          const typeSuccess = await cinematicType(
            interaction.selector,
            interaction.text,
            interaction.description || `Type in ${interaction.selector}`
          );
          if (!typeSuccess && !interaction.skipIfNotFound) {
            throw new Error(`Element not found: ${interaction.selector}`);
          }
          break;
          
        case 'scroll':
          if (!interaction.selector) {
            console.warn(`${stepPrefix} Missing selector for scroll interaction`);
            break;
          }
          console.log(`${stepPrefix} Scrolling to ${interaction.selector}`);
          try {
            const element = await page.locator(interaction.selector).first();
            await element.waitFor({ state: 'visible', timeout: 3000 }).catch(() => null);
            await element.scrollIntoViewIfNeeded({ timeout: 3000 });
            await page.waitForTimeout(500); // Wait for scroll animation
            const box = await element.boundingBox().catch(() => null);
            if (box && box.width > 0 && box.height > 0) {
              await cinematicMove(box.x + box.width / 2, box.y + box.height / 2);
            }
          } catch (error) {
            if (!interaction.skipIfNotFound) throw error;
            console.warn(`⚠️  ${stepPrefix} Element not found, skipping: ${interaction.selector}`);
          }
          break;
          
        case 'wait':
          const waitTime = interaction.waitTime || 2000;
          console.log(`${stepPrefix} Waiting ${waitTime}ms`);
          await page.waitForTimeout(waitTime);
          break;
          
        case 'navigate':
          console.log(`${stepPrefix} Navigating to ${interaction.url}`);
          const safeUrl = validateAndSanitizeUrl(baseUrl, interaction.url);
          
          try {
            await page.goto(safeUrl, { 
              waitUntil: 'domcontentloaded',
              timeout: 15000 
            });
            await page.waitForLoadState('load');
          } catch (navError) {
            console.warn(`⚠️  Navigation timeout, continuing anyway`);
          }
          
          await page.waitForTimeout(config.timings.pageLoadWait);
          break;
          
        default:
          console.warn(`⚠️  ${stepPrefix} Unknown interaction type: ${interaction.type}`);
      }
      
      // Wait after action
      if (interaction.waitAfter) {
        await page.waitForTimeout(interaction.waitAfter);
      }
      
      // Wait between steps
      await page.waitForTimeout(config.timings.waitBetweenSteps);
      
    } catch (error) {
      console.error(`❌ ${stepPrefix} Error:`, error.message);
      if (!config.recording.skipErrors) {
        throw error;
      }
    }
  }

  
  try {
    browser = await chromium.launch({
      headless: process.env.CI === 'true' || process.env.HEADLESS === 'true',
      args: [
        '--force-device-scale-factor=1',
        '--disable-gpu-rasterization',
        '--disable-gpu-compositing',
        '--disable-software-rasterizer'
      ]
    });
  
    console.log('\n🎥 Creating cinematic demo with professional effects...\n');
    
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }, // Full HD
      deviceScaleFactor: 1,
      recordVideo: {
        dir: videosDir,
        size: { width: 1920, height: 1080 }
      }
    });
    
    page = await context.newPage();
  
  // Load and inject cinematic effects script securely
  try {
    // Always use lite version (Playwright's native cursor with effects)
    const cinematicEffectsScript = fs.readFileSync(
      path.join(__dirname, 'lib', 'cinematicEffectsLite.js'), 
      'utf8'
    );
    
    // Validate script content for security
    // Allow setTimeout for animations but check for dangerous patterns
    const dangerousPatterns = [
      /eval\s*\(/,
      /new\s+Function\s*\(/,
      /setTimeout\s*\(\s*['"`].*['"`]\s*\)/,  // Only block string-based setTimeout
      /setInterval\s*\(\s*['"`].*['"`]\s*\)/, // Only block string-based setInterval
      /document\.write/
    ];
    const hasUnsafeContent = dangerousPatterns.some(pattern => 
      pattern.test(cinematicEffectsScript)
    );
    
    if (hasUnsafeContent) {
      throw new Error('Unsafe content detected in cinematic effects script');
    }
    
    // Store the script for later injection
    page._cinematicEffectsScript = cinematicEffectsScript;
    console.log('✅ Cinematic effects script prepared');
  } catch (error) {
    console.error('❌ Failed to load cinematic effects:', error.message);
    throw error;
  }

  // Removed legacy inline script - using cinematicEffects.js instead
  
  } catch (setupError) {
    console.error('\n❌ Error during browser setup:', setupError.message);
    throw setupError;
  }

  // Start the demo
  try {
    // Navigate to entry point with URL validation
    const entryUrl = validateAndSanitizeUrl(baseUrl, config.entry.url);
    console.log(`🌐 Navigating to: ${entryUrl}`);
    
    try {
      // Use 'domcontentloaded' instead of 'networkidle' for better SPA compatibility
      await page.goto(entryUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      // Wait for the page to be interactive
      await page.waitForLoadState('load');
      
      // If a specific selector is provided, wait for it
      if (config.entry.selector) {
        try {
          await page.waitForSelector(config.entry.selector, { 
            timeout: 5000,
            state: 'visible' 
          });
        } catch (e) {
          console.warn(`⚠️  Entry selector not found: ${config.entry.selector}`);
        }
      }
      
      // Additional wait for any dynamic content and React hydration
      await page.waitForTimeout(config.entry.waitTime || config.timings.pageLoadWait);
      
      // Extra wait for React apps to complete hydration
      await page.waitForTimeout(1000);
      
    } catch (navError) {
      console.error(`❌ Navigation failed: ${navError.message}`);
      // Try one more time with just basic load
      await page.goto(entryUrl, { waitUntil: 'load', timeout: 15000 });
      await page.waitForTimeout(2000);
    }
    
    // Inject the cinematic effects script after page load
    console.log('💉 Injecting cinematic effects script...');
    await page.evaluate((script) => {
      const scriptEl = document.createElement('script');
      scriptEl.textContent = script;
      document.head.appendChild(scriptEl);
    }, page._cinematicEffectsScript);
    
    // Wait for script to initialize
    await page.waitForTimeout(500);
    
    console.log(`🎬 Starting demo: ${config.name}`);
    if (config.description) {
      console.log(`📝 ${config.description}`);
    }
    
    
    // Wait for cinematicControl to be initialized
    await page.waitForTimeout(500);
    
    // Verify cinematic control is ready
    const controlReady = await page.evaluate(() => {
      return !!window.cinematicControl;
    });
    
    if (!controlReady) {
      console.error('❌ Cinematic control not initialized!');
      throw new Error('Failed to initialize cinematic effects');
    }
    
    console.log('✅ Cinematic control initialized');
    
    // Configure effects
    await page.evaluate((effects) => {
      if (window.cinematicControl) {
        if (effects.cameraFollow) {
          window.cinematicControl.enableCameraFollow(true, effects.zoomLevel);
        }
      }
    }, config.effects);
    
    // Wait for cursor to be visible
    await page.waitForTimeout(500);
    
    
    // Optional entry point interaction
    if (config.entry.selector) {
      console.log(`🎯 Focusing on entry point: ${config.entry.selector}`);
      try {
        const element = await page.locator(config.entry.selector).first();
        const box = await element.boundingBox();
        if (box) {
          await cinematicMove(box.x + box.width / 2, box.y + box.height / 2);
          await page.evaluate((selector) => {
            const el = document.querySelector(selector);
            if (el) window.cinematicControl?.highlightElement(el);
          }, config.entry.selector);
        }
      } catch (error) {
        console.warn(`⚠️  Entry point not found: ${config.entry.selector}`);
      }
    } else {
      console.log('🎯 No entry point selector specified, starting from default position');
      // Make cursor visible with initial movement
      await cinematicMove(960, 540, 1000);
    }
    
    // Ensure DOM is ready for interactions
    await page.evaluate(() => {
      return new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', resolve);
        }
      });
    });
    
    // Opening attention pattern (optional)
    if (config.interactions.length > 0 && config.effects?.attentionPattern !== false) {
      console.log('✨ Drawing opening attention pattern');
      await drawAttentionPattern();
      await page.waitForTimeout(1000);
    }
    
    // Execute configured interactions
    console.log(`\n🎬 Executing ${config.interactions.length} interaction(s):`);
    for (let i = 0; i < config.interactions.length; i++) {
      await executeInteraction(config.interactions[i], i);
    }
    
    // Final flourish (optional closing pattern)
    if (config.interactions.length > 0 && config.effects?.attentionPattern !== false) {
      console.log('\n🎬 Final Scene: Closing');
      await drawAttentionPattern();
      
      // Fade out effect
      await page.evaluate(() => {
        if (window.cinematicControl) {
          window.cinematicControl.zoomTo(0.8, 960, 540, 2000);
        }
      });
      
      await page.waitForTimeout(2500);
    }
    
    console.log(`\n✅ Demo "${config.name}" complete!`);
    
    // Wait for video processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Find and rename video
    const videos = fs.readdirSync(videosDir).filter(f => f.endsWith('.webm'));
    if (videos.length > 0) {
      const latest = videos.sort((a, b) => 
        fs.statSync(path.join(videosDir, b)).mtime - 
        fs.statSync(path.join(videosDir, a)).mtime
      )[0];
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const baseName = config.recording.outputName || 
                       config.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 
                       'demo';
      const finalName = `${baseName}-${timestamp}.webm`;
      
      fs.renameSync(
        path.join(videosDir, latest),
        path.join(videosDir, finalName)
      );
      
      console.log(`\n🎥 Video saved as: ${finalName}`);
      console.log(`📁 Location: ${videosDir}`);
      
      return finalName;
    }
    
    return null;
    
  } catch (error) {
    console.error('\n❌ Error during demo:', error.message);
    return null;
  } finally {
    // Ensure cleanup always happens regardless of success or failure
    try {
      if (page && !page.isClosed()) {
        await page.close();
        page = null;
      }
      if (context) {
        await context.close();
        context = null;
      }
      if (browser && browser.isConnected()) {
        await browser.close();
        browser = null;
      }
    } catch (cleanupError) {
      console.error('❌ Cleanup error:', cleanupError.message);
    }
  }
}

// Check if demo app is running  
const http = require('http');
try {
  http.get(baseUrl, (res) => {
    if (res.statusCode === 200 || res.statusCode === 404) {
      console.log('✅ Demo app detected\n');
      createConfigDrivenDemo().then(() => {
        console.log('\n✨ All demos completed!');
        console.log('\n🎬 Professional effects included:');
        console.log('   • Configuration-driven interactions');
        console.log('   • Native cursor with smooth movement');
        console.log('   • Dynamic zoom in/out on interactions');
        console.log('   • Smooth camera panning following mouse');
        console.log('   • Element highlighting on focus');
        console.log('   • Professional click animations');
        console.log('   • Cinematic transitions between scenes');
      }).catch(console.error);
    }
  }).on('error', () => {
    console.error(`\n❌ Demo app is not running on ${baseUrl}`);
    console.error('   Please start it with: npm run start-demo-app\n');
  });
} catch (error) {
  console.error(`\n❌ Error checking demo app: ${error.message}`);
  console.error('   Please start it with: npm run start-demo-app\n');
}