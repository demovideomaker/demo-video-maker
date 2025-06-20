const fs = require('fs');
const path = require('path');

/**
 * Configuration Loader for Demo Video Maker
 * Loads and validates demo.json files from feature directories
 */

class ConfigLoader {
  constructor() {
    this.defaultConfig = {
      name: "Untitled Feature",
      description: "Auto-generated demo",
      entry: {
        url: "/",
        selector: null,
        waitTime: 2000
      },
      interactions: [],
      effects: {
        cameraFollow: true,
        zoomLevel: 1.6,
        clickAnimations: true,
        mouseMoveSpeed: 60
      },
      recording: {
        duration: 30000,
        skipErrors: true,
        outputName: null
      },
      timings: {
        waitBeforeMove: 1000,
        waitAfterClick: 1500,
        waitBetweenSteps: 800,
        pageLoadWait: 2000
      }
    };
  }

  /**
   * Load configuration from a demo.json file
   * @param {string} configPath - Path to demo.json file
   * @returns {Object} Parsed and validated configuration
   */
  loadConfig(configPath) {
    try {
      // Validate path to prevent directory traversal
      const normalizedPath = path.resolve(configPath);
      
      // Only enforce path validation for relative paths with dangerous patterns
      if (configPath.includes('..') && !configPath.startsWith('/')) {
        console.error(`❌ Path traversal attempt detected: ${configPath}`);
        return this.defaultConfig;
      }

      if (!fs.existsSync(normalizedPath)) {
        console.warn(`⚠️  Config file not found: ${configPath}`);
        return this.defaultConfig;
      }

      const rawConfig = fs.readFileSync(normalizedPath, 'utf8');
      
      // Validate JSON size to prevent DoS
      if (rawConfig.length > 1024 * 1024) { // 1MB limit
        console.error(`❌ Config file too large: ${configPath}`);
        return this.defaultConfig;
      }
      
      const config = JSON.parse(rawConfig);
      
      // Sanitize to prevent prototype pollution
      const sanitizedConfig = this.sanitizeObject(config);
      
      return this.validateAndMergeConfig(sanitizedConfig);
    } catch (error) {
      console.error(`❌ Error loading config from ${configPath}:`, error.message);
      return this.defaultConfig;
    }
  }

  /**
   * Find all demo.json files in a directory tree
   * @param {string} rootDir - Root directory to search
   * @returns {Array} Array of config objects with their paths
   */
  findAllConfigs(rootDir) {
    const configs = [];
    const maxDepth = 10; // Prevent infinite recursion
    const visitedDirs = new Set(); // Prevent circular directory references
    
    const searchDirectory = (dir, depth = 0) => {
      if (depth > maxDepth) {
        console.warn(`⚠️  Maximum directory depth reached: ${dir}`);
        return;
      }
      
      // Validate and normalize directory path
      const normalizedDir = path.resolve(dir);
      const rootDirNormalized = path.resolve(rootDir);
      
      // Prevent directory traversal
      if (!normalizedDir.startsWith(rootDirNormalized)) {
        console.warn(`⚠️  Directory traversal attempt blocked: ${dir}`);
        return;
      }
      
      // Prevent circular directory traversal
      if (visitedDirs.has(normalizedDir)) {
        return;
      }
      visitedDirs.add(normalizedDir);
      
      if (!fs.existsSync(normalizedDir)) return;
      
      try {
        const items = fs.readdirSync(normalizedDir);
        
        for (const item of items) {
          // Sanitize item name to prevent path injection
          if (item.includes('..') || item.includes('/') || item.includes('\\') || 
              item.includes('\0') || item.length > 255) {
            console.warn(`⚠️  Suspicious filename skipped: ${item}`);
            continue;
          }
          
          const fullPath = path.join(normalizedDir, item);
          
          try {
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && 
                item !== 'node_modules' && item !== '.git') {
              searchDirectory(fullPath, depth + 1);
            } else if (item === 'demo.json') {
              const config = this.loadConfig(fullPath);
              configs.push({
                config,
                path: fullPath,
                directory: normalizedDir
              });
            }
          } catch (statError) {
            console.warn(`⚠️  Cannot access ${fullPath}: ${statError.message}`);
          }
        }
      } catch (readError) {
        console.warn(`⚠️  Cannot read directory ${normalizedDir}: ${readError.message}`);
      }
    };
    
    searchDirectory(rootDir);
    return configs;
  }

  /**
   * Validate and merge configuration with defaults
   * @param {Object} userConfig - User-provided configuration
   * @returns {Object} Validated configuration
   */
  validateAndMergeConfig(userConfig) {
    const config = this.deepMerge(this.defaultConfig, userConfig);
    
    // Validate entry configuration
    if (config.entry) {
      config.entry = this.validateEntry(config.entry);
    }
    
    // Validate interactions
    if (config.interactions && Array.isArray(config.interactions)) {
      config.interactions = config.interactions.map(interaction => 
        this.validateInteraction(interaction)
      );
    }
    
    // Validate effects
    config.effects = this.validateEffects(config.effects);
    
    // Validate timings
    config.timings = this.validateTimings(config.timings);
    
    // Validate recording
    if (config.recording) {
      config.recording = this.validateRecording(config.recording);
    }
    
    return config;
  }

  /**
   * Validate entry configuration
   * @param {Object} entry - Entry configuration
   * @returns {Object} Validated entry
   */
  validateEntry(entry) {
    const validated = { ...entry };
    
    // Validate entry selector
    if (validated.selector) {
      if (!this.validateSelector(validated.selector)) {
        console.warn(`⚠️  Dangerous selector in entry configuration, removing: ${validated.selector}`);
        validated.selector = null;
      }
    }
    
    // Validate entry waitTime
    if (validated.waitTime !== undefined) {
      const waitTime = Number(validated.waitTime);
      if (isNaN(waitTime) || waitTime < 0 || waitTime > 300000) {
        console.warn(`⚠️  Invalid entry waitTime: ${validated.waitTime}, using default 2000ms`);
        validated.waitTime = 2000;
      } else {
        validated.waitTime = waitTime;
      }
    }
    
    // Validate entry URL
    if (validated.url && !this.validateUrl(validated.url)) {
      console.warn(`⚠️  Invalid entry URL: ${validated.url}, using default /`);
      validated.url = '/';
    }
    
    return validated;
  }

  /**
   * Validate individual interaction configuration
   * @param {Object} interaction - Interaction configuration
   * @returns {Object} Validated interaction
   */
  validateInteraction(interaction) {
    const validTypes = ['click', 'hover', 'scroll', 'type', 'wait', 'navigate'];
    
    if (!interaction.type || !validTypes.includes(interaction.type)) {
      console.warn(`⚠️  Invalid interaction type: ${interaction.type}, defaulting to 'click'`);
      interaction.type = 'click';
    }
    
    // Validate and sanitize selector
    if (interaction.selector) {
      if (!this.validateSelector(interaction.selector)) {
        console.warn(`⚠️  Potentially unsafe selector detected, clearing: ${interaction.selector}`);
        interaction.selector = '';
      }
    }
    
    // Validate text input for type interactions
    if (interaction.type === 'type') {
      if (interaction.text) {
        interaction.text = this.sanitizeText(interaction.text);
      } else {
        console.warn(`⚠️  Missing text for type interaction`);
        interaction.text = '';
      }
    }
    
    // Validate URL for navigate interactions
    if (interaction.type === 'navigate') {
      if (interaction.url) {
        if (!this.validateUrl(interaction.url)) {
          console.warn(`⚠️  Invalid URL detected: ${interaction.url}`);
          interaction.url = '';
        }
      } else {
        console.warn(`⚠️  Missing URL for navigate interaction`);
        interaction.url = '';
      }
    }
    
    // Validate wait time for wait interactions
    if (interaction.type === 'wait' && !interaction.waitTime) {
      console.warn(`⚠️  Missing waitTime for wait interaction, using default 1000ms`);
      interaction.waitTime = 1000;
    }
    
    if (interaction.type !== 'wait' && !interaction.selector) {
      console.warn(`⚠️  Missing selector for ${interaction.type} interaction`);
      interaction.selector = '';
    }
    
    // Apply default timings with bounds checking
    interaction.waitBeforeMove = this.validateTiming(interaction.waitBeforeMove, this.defaultConfig.timings.waitBeforeMove);
    interaction.waitAfterClick = this.validateTiming(interaction.waitAfterClick, this.defaultConfig.timings.waitAfterClick);
    interaction.skipIfNotFound = interaction.skipIfNotFound !== undefined ? interaction.skipIfNotFound : false;
    interaction.zoomLevel = interaction.zoomLevel || this.defaultConfig.effects.zoomLevel;
    
    return interaction;
  }

  /**
   * Validate effects configuration
   * @param {Object} effects - Effects configuration
   * @returns {Object} Validated effects
   */
  validateEffects(effects) {
    const validated = { ...this.defaultConfig.effects, ...effects };
    
    // Ensure zoom level is within reasonable bounds
    if (validated.zoomLevel < 1 || validated.zoomLevel > 5) {
      console.warn(`⚠️  Invalid zoom level ${validated.zoomLevel}, setting to 1.6`);
      validated.zoomLevel = 1.6;
    }
    
    // Ensure mouse move speed is reasonable
    if (validated.mouseMoveSpeed < 10 || validated.mouseMoveSpeed > 200) {
      console.warn(`⚠️  Invalid mouse move speed ${validated.mouseMoveSpeed}, setting to 60`);
      validated.mouseMoveSpeed = 60;
    }
    
    // Convert boolean-like values to actual booleans
    const booleanFields = ['cameraFollow', 'clickAnimations'];
    booleanFields.forEach(field => {
      // Special handling for null and undefined - use default
      if (validated[field] === null || validated[field] === undefined) {
        validated[field] = this.defaultConfig.effects[field];
      } else {
        validated[field] = Boolean(validated[field]);
      }
    });
    
    // Remove deprecated fields if present
    delete validated.glowEffects;
    delete validated.spotlightEffect;
    
    return validated;
  }

  /**
   * Validate timings configuration
   * @param {Object} timings - Timings configuration
   * @returns {Object} Validated timings
   */
  validateTimings(timings) {
    const validated = { ...this.defaultConfig.timings, ...timings };
    
    // Ensure all timings are positive numbers
    Object.keys(validated).forEach(key => {
      if (typeof validated[key] !== 'number' || validated[key] < 0) {
        console.warn(`⚠️  Invalid timing value for ${key}: ${validated[key]}, using default`);
        validated[key] = this.defaultConfig.timings[key];
      }
    });
    
    return validated;
  }

  /**
   * Validate recording configuration
   * @param {Object} recording - Recording configuration
   * @returns {Object} Validated recording
   */
  validateRecording(recording) {
    const validated = { ...recording };
    
    // Validate duration
    if (validated.duration !== undefined) {
      const duration = Number(validated.duration);
      if (isNaN(duration) || duration <= 0) {
        console.warn(`⚠️  Invalid recording duration: ${validated.duration}, using default 30000ms`);
        validated.duration = 30000;
      } else {
        validated.duration = duration;
      }
    }
    
    // Convert skipErrors to boolean
    if (validated.skipErrors !== undefined) {
      validated.skipErrors = Boolean(validated.skipErrors);
    }
    
    return validated;
  }

  /**
   * Deep merge two objects
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object} Merged object
   */
  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Sanitize object to prevent prototype pollution
   * @param {Object} obj - Object to sanitize
   * @returns {Object} Sanitized object
   */
  sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Prevent prototype pollution
      if (['__proto__', 'constructor', 'prototype'].includes(key)) {
        console.warn(`⚠️  Dangerous property '${key}' removed from configuration`);
        continue;
      }
      
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = Array.isArray(value) 
          ? value.map(item => this.sanitizeObject(item))
          : this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Validate CSS selector for security
   * @param {string} selector - CSS selector to validate
   * @returns {boolean} True if selector is safe
   */
  validateSelector(selector) {
    if (typeof selector !== 'string' || selector.length > 1000) return false;
    
    // Check for dangerous patterns
    const dangerous = [
      '<script', 'javascript:', 'data:', 'vbscript:', 'onload=', 'onerror=',
      'eval(', 'Function(', 'setTimeout(', 'setInterval(', '<%', '%>'
    ];
    
    const lowerSelector = selector.toLowerCase();
    return !dangerous.some(pattern => lowerSelector.includes(pattern));
  }

  /**
   * Validate URL for navigation
   * @param {string} url - URL to validate
   * @returns {boolean} True if URL is safe
   */
  validateUrl(url) {
    if (typeof url !== 'string' || url.length > 2000) return false;
    
    // Only allow relative URLs or safe protocols
    if (url.startsWith('/') && !url.includes('..')) return true;
    
    try {
      const parsed = new URL(url, 'http://localhost');
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Sanitize text input
   * @param {string} text - Text to sanitize
   * @returns {string} Sanitized text
   */
  sanitizeText(text) {
    if (typeof text !== 'string') return '';
    
    // Check length first
    if (text.length > 10000) {
      console.warn(`⚠️  Text too long (${text.length} chars), clearing`);
      return '';
    }
    
    // Remove potentially dangerous content
    return text
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags and content
      .replace(/<[^>]*>/g, '') // Remove all other HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/data:/gi, '') // Remove data: protocols
      .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
  }

  /**
   * Validate timing values
   * @param {number} value - Timing value to validate
   * @param {number} defaultValue - Default value to use if invalid
   * @returns {number} Validated timing value
   */
  validateTiming(value, defaultValue) {
    if (typeof value !== 'number' || value < 0 || value > 300000) { // Max 5 minutes
      return defaultValue;
    }
    return value;
  }

  /**
   * Generate a sample demo.json file
   * @param {string} outputPath - Where to write the sample file
   */
  generateSampleConfig(outputPath) {
    const sampleConfig = {
      name: "Dashboard Feature Demo",
      description: "Demonstrates the main dashboard functionality",
      entry: {
        url: "/dashboard",
        selector: "[data-testid='dashboard-container']",
        waitTime: 2000
      },
      interactions: [
        {
          type: "click",
          selector: "[data-testid='stats-card']",
          waitBeforeMove: 1000,
          waitAfter: 1500,  // Time to wait after the action completes
          zoomLevel: 2.0,
          description: "Click on the stats card to view details"
        },
        {
          type: "hover",
          selector: "[data-testid='chart-element']",
          waitBeforeMove: 800,
          waitAfter: 0,  // No wait after hovering
          description: "Hover over chart to show tooltip"
        },
        {
          type: "type",
          selector: "[data-testid='search-input']",
          text: "Sample search query",
          waitBeforeMove: 500,
          waitAfter: 2000,  // Wait after typing completes
          description: "Type in the search field"
        },
        {
          type: "wait",
          waitTime: 3000,
          description: "Wait for animation to complete"
        }
      ],
      effects: {
        cameraFollow: true,
        zoomLevel: 1.8,
        clickAnimations: true,
        mouseMoveSpeed: 60
      },
      recording: {
        duration: 45000,
        skipErrors: false,
        outputName: "dashboard-feature-demo"
      },
      timings: {
        waitBeforeMove: 1000,
        waitAfterClick: 1500,
        waitBetweenSteps: 800,
        pageLoadWait: 2000
      }
    };

    fs.writeFileSync(outputPath, JSON.stringify(sampleConfig, null, 2));
    console.log(`✅ Sample demo.json created at: ${outputPath}`);
  }
}

module.exports = ConfigLoader;