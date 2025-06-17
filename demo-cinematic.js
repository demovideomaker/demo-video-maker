#!/usr/bin/env node

/**
 * Cinematic Demo Generator - Professional quality with zoom, glow, and camera effects
 */

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const ConfigLoader = require('./lib/configLoader');

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🎬 Cinematic Demo Generator                             ║
║                                                           ║
║  Professional demos with zoom, glow & camera effects     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    init: false,
    port: 3003,
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
          console.warn('⚠️  Invalid port number, using default 3003');
        }
      } else {
        console.warn('⚠️  Port flag requires a value, using default 3003');
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
Usage: cinematic-demo [options] [project-path] [base-url]

Options:
  --init              Create a sample demo.json configuration file
  --port, -p <port>   Port number where your app is running (default: 3003)
  --help, -h          Show this help message

Examples:
  cinematic-demo --init                    # Create sample config
  cinematic-demo --port 3000               # Run demo on port 3000
  cinematic-demo -p 8080 ./my-app          # Custom port and project path
  cinematic-demo ./project http://localhost:4000  # Full custom setup
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
  
  try {
    browser = await chromium.launch({
      headless: false,
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
  
  // Current mouse position
  let mouseX = 960;
  let mouseY = 540;
  
  // Load and inject cinematic effects script securely
  try {
    const cinematicEffectsScript = fs.readFileSync(
      path.join(__dirname, 'lib', 'cinematicEffects.js'), 
      'utf8'
    );
    
    // Validate script content for security
    const dangerousPatterns = ['eval(', 'Function(', 'setTimeout(', 'setInterval(', 'document.write'];
    const hasUnsafeContent = dangerousPatterns.some(pattern => 
      cinematicEffectsScript.includes(pattern)
    );
    
    if (hasUnsafeContent) {
      throw new Error('Unsafe content detected in cinematic effects script');
    }
    
    await page.addInitScript(cinematicEffectsScript);
  } catch (error) {
    console.error('❌ Failed to load cinematic effects:', error.message);
    throw error;
  }

  // Legacy inline script (remove after testing)
  await page.addInitScript(() => {
    // Wait for DOM
    if (document.readyState !== 'loading') {
      setupCinematicEffects();
    } else {
      document.addEventListener('DOMContentLoaded', setupCinematicEffects);
    }
    
    function setupCinematicEffects() {
      // Create container for all effects
      const effectsContainer = document.createElement('div');
      effectsContainer.id = 'cinematic-effects';
      effectsContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 2147483640;
      `;
      document.body.appendChild(effectsContainer);
      
      // Create glowing cursor
      const cursor = document.createElement('div');
      cursor.id = 'demo-cursor';
      cursor.innerHTML = `
        <div class="cursor-glow"></div>
        <div class="cursor-glow-large"></div>
        <svg width="32" height="32" viewBox="0 0 32 32" class="cursor-arrow">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="2" dy="2" stdDeviation="2" flood-opacity="0.3"/>
            </filter>
          </defs>
          <path d="M6 6 L24 13 L16 16 L13 24 Z" 
                fill="white" 
                stroke="#ff3366" 
                stroke-width="2" 
                filter="url(#glow) url(#shadow)"/>
        </svg>
      `;
      
      cursor.style.cssText = `
        position: fixed;
        width: 32px;
        height: 32px;
        pointer-events: none;
        z-index: 2147483647;
        left: 960px;
        top: 540px;
        transform: translate(-4px, -4px);
      `;
      
      effectsContainer.appendChild(cursor);
      
      // Create spotlight effect
      const spotlight = document.createElement('div');
      spotlight.id = 'spotlight';
      spotlight.style.cssText = `
        position: fixed;
        width: 100%;
        height: 100%;
        pointer-events: none;
        background: radial-gradient(circle at 960px 540px, 
          transparent 100px, 
          rgba(0,0,0,0.3) 300px, 
          rgba(0,0,0,0.6) 100%);
        z-index: 2147483641;
        transition: none;
      `;
      effectsContainer.appendChild(spotlight);
      
      // Add zoom container
      const zoomContainer = document.createElement('div');
      zoomContainer.id = 'zoom-container';
      zoomContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform-origin: center center;
        transform: scale(1);
        transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      `;
      
      // Move all page content into zoom container
      while (document.body.firstChild && document.body.firstChild.id !== 'cinematic-effects') {
        zoomContainer.appendChild(document.body.firstChild);
      }
      document.body.insertBefore(zoomContainer, effectsContainer);
      
      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        body {
          overflow: hidden !important;
          background: #0a0a0a !important;
        }
        
        .cursor-glow {
          position: absolute;
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, rgba(255,51,102,0.3) 0%, transparent 70%);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 2s ease-in-out infinite;
        }
        
        .cursor-glow-large {
          position: absolute;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(255,51,102,0.1) 0%, transparent 70%);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse-large 3s ease-in-out infinite;
        }
        
        .cursor-arrow {
          position: relative;
          z-index: 10;
          filter: drop-shadow(0 0 10px rgba(255,51,102,0.8));
          animation: glow-pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.4; }
        }
        
        @keyframes pulse-large {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.2; }
        }
        
        @keyframes glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(255,51,102,0.8)); }
          50% { filter: drop-shadow(0 0 20px rgba(255,51,102,1)); }
        }
        
        @keyframes click-wave {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
            border-width: 4px;
          }
          100% {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
            border-width: 1px;
          }
        }
        
        .click-effect {
          position: fixed;
          width: 60px;
          height: 60px;
          border: 4px solid #3b82f6;
          border-radius: 50%;
          pointer-events: none;
          z-index: 2147483648;
          animation: click-wave 0.8s ease-out;
        }
        
        /* Smooth transitions for zoom */
        #zoom-container > * {
          transition: filter 0.3s ease;
        }
        
        .zoomed #zoom-container > *:not(.no-blur) {
          /* blur removed for sharp rendering */
        }
        
        .highlight-element {
          filter: none !important;
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.5) !important;
          position: relative;
          z-index: 100;
        }
      `;
      document.head.appendChild(style);
      
      // Global cinematic control
      window.cinematicControl = {
        cursor: cursor,
        spotlight: spotlight,
        zoomContainer: zoomContainer,
        currentZoom: 1,
        mouseX: 960,
        mouseY: 540,
        
        moveCursor: function(x, y) {
          this.mouseX = x;
          this.mouseY = y;
          this.cursor.style.left = x + 'px';
          this.cursor.style.top = y + 'px';
          
          // Update spotlight
          this.spotlight.style.background = `radial-gradient(circle at ${x}px ${y}px, 
            transparent 100px, 
            rgba(0,0,0,0.3) 300px, 
            rgba(0,0,0,0.6) 100%)`;
        },
        
        zoomTo: function(scale, centerX, centerY, duration = 800) {
          this.currentZoom = scale;
          const offsetX = (window.innerWidth / 2 - centerX) * (scale - 1);
          const offsetY = (window.innerHeight / 2 - centerY) * (scale - 1);
          
          this.zoomContainer.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
          this.zoomContainer.style.transform = `scale(${scale}) translate(${offsetX/scale}px, ${offsetY/scale}px)`;
          
          if (scale > 1.5) {
            document.body.classList.add('zoomed');
          } else {
            document.body.classList.remove('zoomed');
          }
        },
        
        highlightElement: function(element) {
          // Remove previous highlights
          document.querySelectorAll('.highlight-element').forEach(el => {
            el.classList.remove('highlight-element');
          });
          
          if (element) {
            element.classList.add('highlight-element');
          }
        },
        
        animateClick: function() {
          const click = document.createElement('div');
          click.className = 'click-effect';
          click.style.left = this.mouseX + 'px';
          click.style.top = this.mouseY + 'px';
          this.cursor.parentElement.appendChild(click);
          setTimeout(() => click.remove(), 800);
          
          // Pulse cursor
          this.cursor.querySelector('.cursor-arrow').style.transform = 'scale(0.8)';
          setTimeout(() => {
            this.cursor.querySelector('.cursor-arrow').style.transform = 'scale(1)';
          }, 150);
        },
        
        resetZoom: function(duration = 1000) {
          this.zoomTo(1, window.innerWidth / 2, window.innerHeight / 2, duration);
        },
        
        enableCameraFollow: function(enabled = true, zoomLevel = 1.8) {
          this.cameraFollowEnabled = enabled;
          this.cameraFollowZoom = zoomLevel;
          console.log(`🎥 Camera follow ${enabled ? 'enabled' : 'disabled'} with zoom ${zoomLevel}`);
          if (enabled) {
            this.zoomTo(zoomLevel, this.mouseX, this.mouseY, 800);
          } else {
            this.resetZoom();
          }
        },
        
        updateCameraFollow: function() {
          if (this.cameraFollowEnabled) {
            // Smoother, more frequent updates
            this.zoomContainer.style.transition = 'transform 150ms ease-out';
            this.zoomTo(this.cameraFollowZoom, this.mouseX, this.mouseY, 150);
          }
        }
      };
      
      // Initialize
      window.cinematicControl.moveCursor(960, 540);
    }
  });
  
  // Helper functions for cinematic effects with memory management
  async function cinematicMove(targetX, targetY, duration = 1000) {
    const steps = 60;
    const stepDelay = duration / steps;
    const timeouts = []; // Track timeouts for cleanup
    
    try {
      for (let i = 0; i <= steps; i++) {
        // Check if page is still alive
        if (page.isClosed()) {
          console.warn('⚠️  Page closed during animation, stopping cinematicMove');
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
          await page.evaluate(({ x, y }) => {
            if (window.cinematicControl) {
              window.cinematicControl.moveCursor(x, y);
              window.cinematicControl.updateCameraFollow();
            }
          }, { x, y });
          
          await page.mouse.move(x, y);
          await page.waitForTimeout(stepDelay);
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
      const element = await page.$(selector);
      if (element) {
        const box = await element.boundingBox();
        if (box) {
          const centerX = box.x + box.width / 2;
          const centerY = box.y + box.height / 2;
          
          console.log(`   🔍 Zooming to ${selector} (${scale}x)`);
          
          await page.evaluate(({ scale, centerX, centerY, selector }) => {
            const el = document.querySelector(selector);
            if (window.cinematicControl && el) {
              window.cinematicControl.highlightElement(el);
              window.cinematicControl.zoomTo(scale, centerX, centerY);
            }
          }, { scale, centerX, centerY, selector });
          
          await page.waitForTimeout(1000);
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
      const element = await page.waitForSelector(selector, { 
        state: 'visible', 
        timeout: 5000 
      });
      
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
          await page.waitForTimeout(300);
          
          // Click animation
          await page.evaluate(() => {
            if (window.cinematicControl) {
              window.cinematicControl.animateClick();
            }
          });
          
          // Actual click
          await element.click();
          await page.waitForTimeout(600);
          
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
      await page.waitForTimeout(500);
      
      // Clear existing text
      await page.keyboard.down('Control');
      await page.keyboard.press('A');
      await page.keyboard.up('Control');
      await page.waitForTimeout(100);
      await page.keyboard.press('Delete');
      await page.waitForTimeout(300);
      
      // Type with variable speed
      for (const char of text) {
        await page.keyboard.type(char);
        await page.waitForTimeout(80 + Math.random() * 120);
      }
      
      await page.waitForTimeout(500);
      
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
    
    try {
      // Wait before moving cursor
      if (interaction.waitBeforeMove) {
        await page.waitForTimeout(interaction.waitBeforeMove);
      }
      
      switch (interaction.type) {
        case 'click':
          console.log(`${stepPrefix} Clicking ${interaction.selector}`);
          const success = await cinematicClick(
            interaction.selector, 
            interaction.description || `Click ${interaction.selector}`,
            { zoom: interaction.zoomLevel || config.effects.zoomLevel }
          );
          if (!success && !interaction.skipIfNotFound) {
            throw new Error(`Element not found: ${interaction.selector}`);
          }
          break;
          
        case 'hover':
          console.log(`${stepPrefix} Hovering ${interaction.selector}`);
          try {
            const element = await page.locator(interaction.selector).first();
            const box = await element.boundingBox();
            if (box) {
              await cinematicMove(box.x + box.width / 2, box.y + box.height / 2);
              await page.evaluate((selector) => {
                const el = document.querySelector(selector);
                if (el) window.cinematicControl?.highlightElement(el);
              }, interaction.selector);
            } else if (!interaction.skipIfNotFound) {
              throw new Error(`Element not found: ${interaction.selector}`);
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
          console.log(`${stepPrefix} Scrolling to ${interaction.selector}`);
          try {
            const element = await page.locator(interaction.selector).first();
            await element.scrollIntoView({ behavior: 'smooth' });
            const box = await element.boundingBox();
            if (box) {
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
          await page.goto(safeUrl, { waitUntil: 'networkidle' });
          await page.waitForTimeout(config.timings.pageLoadWait);
          break;
          
        default:
          console.warn(`⚠️  ${stepPrefix} Unknown interaction type: ${interaction.type}`);
      }
      
      // Wait after action
      if (interaction.waitAfterClick) {
        await page.waitForTimeout(interaction.waitAfterClick);
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

  } catch (setupError) {
    console.error('\n❌ Error during browser setup:', setupError.message);
    throw setupError;
  }

  // Start the demo
  try {
    // Navigate to entry point with URL validation
    const entryUrl = validateAndSanitizeUrl(baseUrl, config.entry.url);
    console.log(`🌐 Navigating to: ${entryUrl}`);
    await page.goto(entryUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(config.entry.waitTime || config.timings.pageLoadWait);
    
    console.log(`🎬 Starting demo: ${config.name}`);
    if (config.description) {
      console.log(`📝 ${config.description}`);
    }
    
    // Initialize position and configure effects
    await page.evaluate((effects) => {
      if (window.cinematicControl) {
        window.cinematicControl.moveCursor(960, 200);
        if (effects.cameraFollow) {
          window.cinematicControl.enableCameraFollow(true, effects.zoomLevel);
        }
      }
    }, config.effects);
    
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
    }
    
    // Opening attention pattern (optional)
    if (config.interactions.length > 0) {
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
    if (config.interactions.length > 0) {
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
        console.log('   • Glowing mouse cursor with pulse effect');
        console.log('   • Dynamic zoom in/out on interactions');
        console.log('   • Smooth camera panning following mouse');
        console.log('   • Spotlight effect highlighting cursor area');
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