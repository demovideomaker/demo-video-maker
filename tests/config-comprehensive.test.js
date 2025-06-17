/**
 * Comprehensive tests for all demo.json configuration options
 */

const fs = require('fs');
const path = require('path');
const ConfigLoader = require('../lib/configLoader');

// Mock fs for testing
jest.mock('fs');

describe('Comprehensive Configuration Tests', () => {
  let configLoader;
  let mockFs;

  beforeEach(() => {
    configLoader = new ConfigLoader();
    mockFs = fs;
    jest.clearAllMocks();
  });

  describe('Complete Configuration with All Options', () => {
    it('should load and validate a configuration with every possible option', () => {
      const fullConfig = {
        name: "Complete Feature Demo",
        description: "Testing all configuration options",
        entry: {
          url: "/dashboard",
          selector: "[data-testid='dashboard'], .dashboard-container",
          waitTime: 3000
        },
        interactions: [
          // Click interaction with all options
          {
            type: "click",
            selector: "[data-testid='button'], button.primary",
            waitBeforeMove: 1200,
            waitAfterClick: 2000,
            skipIfNotFound: true,
            zoomLevel: 2.0,
            description: "Click primary button"
          },
          // Hover interaction
          {
            type: "hover",
            selector: ".tooltip-trigger",
            waitBeforeMove: 800,
            waitAfterClick: 1500,
            skipIfNotFound: false,
            zoomLevel: 1.8,
            description: "Hover to show tooltip"
          },
          // Scroll interaction
          {
            type: "scroll",
            selector: "#content-section",
            waitBeforeMove: 600,
            waitAfterClick: 1000,
            skipIfNotFound: true,
            description: "Scroll to content"
          },
          // Type interaction
          {
            type: "type",
            selector: "input[name='search']",
            text: "Test search query",
            waitBeforeMove: 500,
            waitAfterClick: 800,
            skipIfNotFound: false,
            zoomLevel: 2.5,
            description: "Type in search box"
          },
          // Wait interaction
          {
            type: "wait",
            waitTime: 2000,
            description: "Wait for animations"
          },
          // Navigate interaction
          {
            type: "navigate",
            url: "/settings",
            waitBeforeMove: 1000,
            waitAfterClick: 2500,
            description: "Navigate to settings"
          }
        ],
        effects: {
          cameraFollow: false,
          zoomLevel: 1.8,
          glowEffects: false,
          clickAnimations: true,
          mouseMoveSpeed: 100,
          spotlightEffect: false
        },
        recording: {
          duration: 45000,
          skipErrors: false,
          outputName: "custom-demo-name"
        },
        timings: {
          waitBeforeMove: 1100,
          waitAfterClick: 1600,
          waitBetweenSteps: 900,
          pageLoadWait: 2500
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(fullConfig));

      const result = configLoader.loadConfig('/path/to/demo.json');

      // Verify all top-level properties
      expect(result.name).toBe("Complete Feature Demo");
      expect(result.description).toBe("Testing all configuration options");

      // Verify entry configuration
      expect(result.entry.url).toBe("/dashboard");
      expect(result.entry.selector).toBe("[data-testid='dashboard'], .dashboard-container");
      expect(result.entry.waitTime).toBe(3000);

      // Verify interactions
      expect(result.interactions).toHaveLength(6);
      
      // Click interaction
      expect(result.interactions[0].type).toBe("click");
      expect(result.interactions[0].selector).toBe("[data-testid='button'], button.primary");
      expect(result.interactions[0].waitBeforeMove).toBe(1200);
      expect(result.interactions[0].waitAfterClick).toBe(2000);
      expect(result.interactions[0].skipIfNotFound).toBe(true);
      expect(result.interactions[0].zoomLevel).toBe(2.0);
      expect(result.interactions[0].description).toBe("Click primary button");

      // Type interaction
      expect(result.interactions[3].type).toBe("type");
      expect(result.interactions[3].text).toBe("Test search query");

      // Wait interaction
      expect(result.interactions[4].type).toBe("wait");
      expect(result.interactions[4].waitTime).toBe(2000);

      // Navigate interaction
      expect(result.interactions[5].type).toBe("navigate");
      expect(result.interactions[5].url).toBe("/settings");

      // Verify effects
      expect(result.effects.cameraFollow).toBe(false);
      expect(result.effects.zoomLevel).toBe(1.8);
      expect(result.effects.glowEffects).toBe(false);
      expect(result.effects.clickAnimations).toBe(true);
      expect(result.effects.mouseMoveSpeed).toBe(100);
      expect(result.effects.spotlightEffect).toBe(false);

      // Verify recording
      expect(result.recording.duration).toBe(45000);
      expect(result.recording.skipErrors).toBe(false);
      expect(result.recording.outputName).toBe("custom-demo-name");

      // Verify timings
      expect(result.timings.waitBeforeMove).toBe(1100);
      expect(result.timings.waitAfterClick).toBe(1600);
      expect(result.timings.waitBetweenSteps).toBe(900);
      expect(result.timings.pageLoadWait).toBe(2500);
    });
  });

  describe('Entry Configuration Validation', () => {
    it('should handle entry with absolute URL', () => {
      const config = {
        name: "External URL Demo",
        entry: {
          url: "https://example.com/app",
          selector: ".app-container",
          waitTime: 5000
        },
        interactions: []
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = configLoader.loadConfig('/path/to/demo.json');
      
      expect(result.entry.url).toBe("https://example.com/app");
      expect(result.entry.waitTime).toBe(5000);
    });

    it('should handle entry with multiple selectors', () => {
      const config = {
        name: "Multi-selector Demo",
        entry: {
          url: "/",
          selector: "#app, .app-root, [data-app-root]",
          waitTime: 1500
        },
        interactions: []
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = configLoader.loadConfig('/path/to/demo.json');
      
      expect(result.entry.selector).toBe("#app, .app-root, [data-app-root]");
    });

    it('should reject entry with dangerous selectors', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const config = {
        name: "Dangerous Selector Demo",
        entry: {
          url: "/",
          selector: "<script>alert('xss')</script>",
          waitTime: 1000
        },
        interactions: []
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = configLoader.loadConfig('/path/to/demo.json');
      
      expect(result.entry.selector).toBe(null); // Should be sanitized
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should reject entry with invalid waitTime', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const config = {
        name: "Invalid Wait Demo",
        entry: {
          url: "/",
          waitTime: -1000 // negative value
        },
        interactions: []
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = configLoader.loadConfig('/path/to/demo.json');
      
      expect(result.entry.waitTime).toBe(2000); // Should use default
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should reject entry waitTime over maximum', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const config = {
        name: "Long Wait Demo",
        entry: {
          url: "/",
          waitTime: 400000 // over 5 minutes
        },
        interactions: []
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = configLoader.loadConfig('/path/to/demo.json');
      
      expect(result.entry.waitTime).toBe(2000); // Should use default
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Interaction Type Validation', () => {
    it('should validate all interaction types', () => {
      const validTypes = ['click', 'hover', 'scroll', 'type', 'wait', 'navigate'];
      
      validTypes.forEach(type => {
        const interaction = {
          type: type,
          selector: type === 'wait' ? undefined : '.element',
          text: type === 'type' ? 'test text' : undefined,
          url: type === 'navigate' ? '/page' : undefined,
          waitTime: type === 'wait' ? 1000 : undefined
        };

        const result = configLoader.validateInteraction(interaction);
        expect(result.type).toBe(type);
      });
    });

    it('should default invalid interaction types to click', () => {
      const invalidTypes = ['tap', 'swipe', 'doubleclick', 'rightclick', ''];
      
      invalidTypes.forEach(type => {
        const interaction = {
          type: type,
          selector: '.element'
        };

        const result = configLoader.validateInteraction(interaction);
        expect(result.type).toBe('click');
      });
    });
  });

  describe('Text Sanitization', () => {
    it('should sanitize text with HTML tags', () => {
      const interaction = {
        type: "type",
        selector: "input",
        text: "Hello <script>alert('xss')</script> World"
      };

      const result = configLoader.validateInteraction(interaction);
      expect(result.text).toBe("Hello  World");
    });

    it('should handle very long text', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const interaction = {
        type: "type",
        selector: "input",
        text: "a".repeat(11000) // Over 10000 char limit
      };

      const result = configLoader.validateInteraction(interaction);
      expect(result.text).toBe(""); // Should be cleared
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should preserve special characters in text', () => {
      const interaction = {
        type: "type",
        selector: "input",
        text: "user@example.com & password!123"
      };

      const result = configLoader.validateInteraction(interaction);
      expect(result.text).toBe("user@example.com & password!123");
    });
  });

  describe('URL Validation', () => {
    it('should accept valid URLs for navigate', () => {
      const validUrls = [
        "/page",
        "/page/subpage",
        "/page?query=test",
        "/page#section",
        "https://example.com",
        "http://localhost:3000/app"
      ];

      validUrls.forEach(url => {
        const interaction = {
          type: "navigate",
          url: url
        };

        const result = configLoader.validateInteraction(interaction);
        expect(result.url).toBe(url);
      });
    });

    it('should reject invalid URLs', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const invalidUrls = [
        "javascript:alert('xss')",
        "data:text/html,<script>alert('xss')</script>",
        "file:///etc/passwd",
        "ftp://example.com"
      ];

      invalidUrls.forEach(url => {
        const interaction = {
          type: "navigate",
          url: url
        };

        const result = configLoader.validateInteraction(interaction);
        expect(result.url).toBe(""); // Should be cleared
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Effects Boundary Validation', () => {
    it('should clamp zoom levels to valid range', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const effects = {
        zoomLevel: 10.0 // Too high
      };

      const result = configLoader.validateEffects(effects);
      expect(result.zoomLevel).toBe(1.6); // Default

      effects.zoomLevel = 0.5; // Too low
      const result2 = configLoader.validateEffects(effects);
      expect(result2.zoomLevel).toBe(1.6); // Default

      consoleSpy.mockRestore();
    });

    it('should clamp mouse speed to valid range', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const effects = {
        mouseMoveSpeed: 300 // Too high
      };

      const result = configLoader.validateEffects(effects);
      expect(result.mouseMoveSpeed).toBe(60); // Default

      effects.mouseMoveSpeed = 5; // Too low
      const result2 = configLoader.validateEffects(effects);
      expect(result2.mouseMoveSpeed).toBe(60); // Default

      consoleSpy.mockRestore();
    });

    it('should handle all boolean effect flags', () => {
      const effects = {
        cameraFollow: "true", // String instead of boolean
        glowEffects: 1, // Number instead of boolean
        clickAnimations: null, // Null
        spotlightEffect: undefined // Undefined
      };

      const result = configLoader.validateEffects(effects);
      
      expect(result.cameraFollow).toBe(true); // Converted
      expect(result.glowEffects).toBe(true); // Converted
      expect(result.clickAnimations).toBe(true); // Default
      expect(result.spotlightEffect).toBe(true); // Default
    });
  });

  describe('Timing Validation', () => {
    it('should validate all timing values', () => {
      const timings = {
        waitBeforeMove: 2000,
        waitAfterClick: 3000,
        waitBetweenSteps: 1500,
        pageLoadWait: 4000
      };

      const result = configLoader.validateTimings(timings);
      
      expect(result.waitBeforeMove).toBe(2000);
      expect(result.waitAfterClick).toBe(3000);
      expect(result.waitBetweenSteps).toBe(1500);
      expect(result.pageLoadWait).toBe(4000);
    });

    it('should reject negative timing values', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const timings = {
        waitBeforeMove: -500,
        waitAfterClick: -1000,
        waitBetweenSteps: -200,
        pageLoadWait: -3000
      };

      const result = configLoader.validateTimings(timings);
      
      // All should use defaults
      expect(result.waitBeforeMove).toBe(1000);
      expect(result.waitAfterClick).toBe(1500);
      expect(result.waitBetweenSteps).toBe(800);
      expect(result.pageLoadWait).toBe(2000);

      expect(consoleSpy).toHaveBeenCalledTimes(4);
      consoleSpy.mockRestore();
    });

    it('should handle non-numeric timing values', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const timings = {
        waitBeforeMove: "fast",
        waitAfterClick: true,
        waitBetweenSteps: null,
        pageLoadWait: {}
      };

      const result = configLoader.validateTimings(timings);
      
      // All should use defaults
      expect(result.waitBeforeMove).toBe(1000);
      expect(result.waitAfterClick).toBe(1500);
      expect(result.waitBetweenSteps).toBe(800);
      expect(result.pageLoadWait).toBe(2000);

      consoleSpy.mockRestore();
    });
  });

  describe('Recording Configuration', () => {
    it('should validate recording options', () => {
      const recording = {
        duration: 60000,
        skipErrors: false,
        outputName: "my-custom-demo"
      };

      const config = {
        name: "Recording Test",
        interactions: [],
        recording: recording
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = configLoader.loadConfig('/path/to/demo.json');
      
      expect(result.recording.duration).toBe(60000);
      expect(result.recording.skipErrors).toBe(false);
      expect(result.recording.outputName).toBe("my-custom-demo");
    });

    it('should handle invalid recording duration', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const recording = {
        duration: -5000 // Negative
      };

      const config = {
        name: "Invalid Duration Test",
        interactions: [],
        recording: recording
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = configLoader.loadConfig('/path/to/demo.json');
      
      expect(result.recording.duration).toBe(30000); // Default
      consoleSpy.mockRestore();
    });
  });

  describe('Security Validations', () => {
    it('should prevent prototype pollution', () => {
      const config = {
        name: "Prototype Pollution Test",
        "__proto__": { "isAdmin": true },
        "constructor": { "prototype": { "isAdmin": true } },
        interactions: []
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = configLoader.loadConfig('/path/to/demo.json');
      
      // Check that dangerous properties were not added
      expect(result.hasOwnProperty('__proto__')).toBe(false);
      expect(result.hasOwnProperty('constructor')).toBe(false);
      expect(result.hasOwnProperty('prototype')).toBe(false);
    });

    it('should validate selector length', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const interaction = {
        type: "click",
        selector: "a".repeat(1001) // Over 1000 char limit
      };

      const result = configLoader.validateInteraction(interaction);
      expect(result.selector).toBe(""); // Should be cleared
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should reject selectors with javascript:', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const interaction = {
        type: "click",
        selector: "a[href='javascript:alert(1)']"
      };

      const result = configLoader.validateInteraction(interaction);
      expect(result.selector).toBe(""); // Should be cleared
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Interaction-specific Validations', () => {
    it('should require selector for non-wait interactions', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const types = ['click', 'hover', 'scroll', 'type', 'navigate'];
      
      types.forEach(type => {
        const interaction = {
          type: type,
          // Missing selector
          text: type === 'type' ? 'test' : undefined,
          url: type === 'navigate' ? '/page' : undefined
        };

        const result = configLoader.validateInteraction(interaction);
        expect(result.selector).toBeDefined(); // Should have a selector (empty string)
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should not require selector for wait interactions', () => {
      const interaction = {
        type: "wait",
        waitTime: 2000
        // No selector needed
      };

      const result = configLoader.validateInteraction(interaction);
      expect(result.type).toBe("wait");
      expect(result.waitTime).toBe(2000);
      expect(result.selector).toBeUndefined();
    });

    it('should require text for type interactions', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const interaction = {
        type: "type",
        selector: "input",
        // Missing text
      };

      const result = configLoader.validateInteraction(interaction);
      expect(result.text).toBe(""); // Should have empty text
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should require url for navigate interactions', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const interaction = {
        type: "navigate",
        // Missing url
      };

      const result = configLoader.validateInteraction(interaction);
      expect(result.url).toBe(""); // Should have empty url
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty configuration file', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('{}');

      const result = configLoader.loadConfig('/path/to/empty.json');
      
      expect(result.name).toBe("Untitled Feature");
      expect(result.interactions).toEqual([]);
      expect(result.effects.cameraFollow).toBe(true);
    });

    it('should handle configuration with only interactions', () => {
      const config = {
        interactions: [
          { type: "click", selector: ".button" },
          { type: "wait", waitTime: 1000 }
        ]
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = configLoader.loadConfig('/path/to/minimal.json');
      
      expect(result.name).toBe("Untitled Feature");
      expect(result.interactions).toHaveLength(2);
      expect(result.effects).toBeDefined();
      expect(result.timings).toBeDefined();
    });

    it('should handle deeply nested invalid configuration', () => {
      const config = {
        name: "Nested Test",
        effects: {
          nested: {
            invalid: {
              property: "value"
            }
          }
        },
        interactions: [
          {
            type: "click",
            selector: ".button",
            nested: {
              invalid: "property"
            }
          }
        ]
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      const result = configLoader.loadConfig('/path/to/nested.json');
      
      // Should still load valid parts
      expect(result.name).toBe("Nested Test");
      expect(result.interactions[0].type).toBe("click");
      expect(result.interactions[0].selector).toBe(".button");
    });
  });
});