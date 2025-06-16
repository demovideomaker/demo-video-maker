const fs = require('fs');
const path = require('path');

/**
 * Configuration Loader for Demo Video Automation
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
        glowEffects: true,
        clickAnimations: true,
        mouseMoveSpeed: 60,
        spotlightEffect: true
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
      if (!fs.existsSync(configPath)) {
        console.warn(`⚠️  Config file not found: ${configPath}`);
        return this.defaultConfig;
      }

      const rawConfig = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(rawConfig);
      
      return this.validateAndMergeConfig(config);
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
    
    const searchDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          searchDirectory(fullPath);
        } else if (item === 'demo.json') {
          const config = this.loadConfig(fullPath);
          configs.push({
            config,
            path: fullPath,
            directory: dir
          });
        }
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
    
    return config;
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
    
    if (interaction.type !== 'wait' && !interaction.selector) {
      console.warn(`⚠️  Missing selector for ${interaction.type} interaction`);
    }
    
    // Apply default timings
    interaction.waitBeforeMove = interaction.waitBeforeMove || this.defaultConfig.timings.waitBeforeMove;
    interaction.waitAfterClick = interaction.waitAfterClick || this.defaultConfig.timings.waitAfterClick;
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
          waitAfterClick: 1500,
          zoomLevel: 2.0,
          description: "Click on the stats card to view details"
        },
        {
          type: "hover",
          selector: "[data-testid='chart-element']",
          waitBeforeMove: 800,
          waitAfterClick: 0,
          description: "Hover over chart to show tooltip"
        },
        {
          type: "type",
          selector: "[data-testid='search-input']",
          text: "Sample search query",
          waitBeforeMove: 500,
          waitAfterClick: 2000,
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
        glowEffects: true,
        clickAnimations: true,
        mouseMoveSpeed: 60,
        spotlightEffect: true
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