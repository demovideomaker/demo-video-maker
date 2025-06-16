const fs = require('fs');
const path = require('path');
const ConfigLoader = require('../lib/configLoader');

// Mock fs for testing
jest.mock('fs');

describe('ConfigLoader', () => {
  let configLoader;
  let mockFs;

  beforeEach(() => {
    configLoader = new ConfigLoader();
    mockFs = fs;
    jest.clearAllMocks();
  });

  describe('loadConfig', () => {
    it('should load and validate a valid configuration', () => {
      const validConfig = {
        name: "Test Feature",
        description: "Test description", 
        entry: {
          url: "/test",
          selector: "[data-testid='test']",
          waitTime: 1000
        },
        interactions: [
          {
            type: "click",
            selector: "[data-testid='button']",
            waitBeforeMove: 500,
            waitAfterClick: 1000,
            zoomLevel: 1.8
          }
        ]
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(validConfig));

      const result = configLoader.loadConfig('/path/to/demo.json');

      expect(result.name).toBe("Test Feature");
      expect(result.interactions).toHaveLength(1);
      expect(result.interactions[0].type).toBe("click");
      expect(result.effects.cameraFollow).toBe(true); // default value
    });

    it('should return default config when file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      
      const result = configLoader.loadConfig('/nonexistent/demo.json');
      
      expect(result.name).toBe("Untitled Feature");
      expect(result.effects.cameraFollow).toBe(true);
    });

    it('should handle invalid JSON gracefully', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('invalid json{');
      
      const result = configLoader.loadConfig('/path/to/invalid.json');
      
      expect(result.name).toBe("Untitled Feature"); // fallback to default
    });

    it('should merge user config with defaults', () => {
      const partialConfig = {
        name: "Partial Test",
        interactions: [
          {
            type: "hover",
            selector: "[data-testid='hover-target']"
          }
        ]
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(partialConfig));

      const result = configLoader.loadConfig('/path/to/partial.json');

      expect(result.name).toBe("Partial Test");
      expect(result.effects.cameraFollow).toBe(true); // default preserved
      expect(result.interactions[0].waitBeforeMove).toBe(1000); // default applied
    });
  });

  describe('validateInteraction', () => {
    it('should validate click interaction correctly', () => {
      const interaction = {
        type: "click",
        selector: "[data-testid='button']",
        zoomLevel: 2.0
      };

      const result = configLoader.validateInteraction(interaction);

      expect(result.type).toBe("click");
      expect(result.selector).toBe("[data-testid='button']");
      expect(result.zoomLevel).toBe(2.0);
      expect(result.waitBeforeMove).toBe(1000); // default applied
      expect(result.skipIfNotFound).toBe(false); // default applied
    });

    it('should default invalid interaction types', () => {
      const interaction = {
        type: "invalid-type",
        selector: "[data-testid='button']"
      };

      const result = configLoader.validateInteraction(interaction);

      expect(result.type).toBe("click"); // defaulted
    });

    it('should handle missing selector for non-wait interactions', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const interaction = {
        type: "click"
        // missing selector
      };

      const result = configLoader.validateInteraction(interaction);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Missing selector'));
      consoleSpy.mockRestore();
    });

    it('should validate wait interaction without selector', () => {
      const interaction = {
        type: "wait",
        waitTime: 5000
      };

      const result = configLoader.validateInteraction(interaction);

      expect(result.type).toBe("wait");
      expect(result.waitTime).toBe(5000);
    });
  });

  describe('validateEffects', () => {
    it('should validate effects within bounds', () => {
      const effects = {
        zoomLevel: 2.5,
        mouseMoveSpeed: 80,
        cameraFollow: false
      };

      const result = configLoader.validateEffects(effects);

      expect(result.zoomLevel).toBe(2.5);
      expect(result.mouseMoveSpeed).toBe(80);
      expect(result.cameraFollow).toBe(false);
    });

    it('should correct invalid zoom level', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const effects = {
        zoomLevel: 10.0 // too high
      };

      const result = configLoader.validateEffects(effects);

      expect(result.zoomLevel).toBe(1.6); // corrected to default
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid zoom level'));
      consoleSpy.mockRestore();
    });

    it('should correct invalid mouse speed', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const effects = {
        mouseMoveSpeed: 500 // too high
      };

      const result = configLoader.validateEffects(effects);

      expect(result.mouseMoveSpeed).toBe(60); // corrected to default
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid mouse move speed'));
      consoleSpy.mockRestore();
    });
  });

  describe('validateTimings', () => {
    it('should validate positive timing values', () => {
      const timings = {
        waitBeforeMove: 800,
        waitAfterClick: 1200,
        waitBetweenSteps: 600,
        pageLoadWait: 3000
      };

      const result = configLoader.validateTimings(timings);

      expect(result.waitBeforeMove).toBe(800);
      expect(result.waitAfterClick).toBe(1200);
      expect(result.waitBetweenSteps).toBe(600);
      expect(result.pageLoadWait).toBe(3000);
    });

    it('should correct negative timing values', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const timings = {
        waitBeforeMove: -100,
        waitAfterClick: "invalid"
      };

      const result = configLoader.validateTimings(timings);

      expect(result.waitBeforeMove).toBe(1000); // corrected to default
      expect(result.waitAfterClick).toBe(1500); // corrected to default
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      consoleSpy.mockRestore();
    });
  });

  describe('findAllConfigs', () => {
    it('should find demo.json files in directory tree', () => {
      // Mock directory structure
      const rootDir = '/test/root';
      const feature1Dir = path.join(rootDir, 'feature1');
      const feature2Dir = path.join(rootDir, 'feature2');
      const nodeModulesDir = path.join(rootDir, 'node_modules');
      
      mockFs.existsSync.mockImplementation((filePath) => {
        return [rootDir, feature1Dir, feature2Dir, nodeModulesDir].includes(filePath) ||
               filePath.endsWith('demo.json');
      });
      
      mockFs.readdirSync.mockImplementation((dir) => {
        if (dir === rootDir) {
          return ['feature1', 'feature2', 'node_modules'];
        } else if (dir === feature1Dir) {
          return ['demo.json', 'component.tsx'];
        } else if (dir === feature2Dir) {
          return ['demo.json', 'styles.css'];
        } else if (dir === nodeModulesDir) {
          return ['package.json'];
        }
        return [];
      });

      mockFs.statSync.mockImplementation((filePath) => {
        const isDir = [rootDir, feature1Dir, feature2Dir, nodeModulesDir].includes(filePath) ||
                     (!filePath.includes('.') && !filePath.endsWith('demo.json'));
        return { isDirectory: () => isDir };
      });

      mockFs.readFileSync.mockReturnValue(JSON.stringify({
        name: "Test Feature",
        interactions: []
      }));

      const result = configLoader.findAllConfigs(rootDir);

      expect(result).toHaveLength(2);
      expect(result[0].config.name).toBe("Test Feature");
    });

    it('should handle non-existent root directory', () => {
      mockFs.existsSync.mockReturnValue(false);
      
      const result = configLoader.findAllConfigs('/nonexistent');
      
      expect(result).toHaveLength(0);
    });
  });

  describe('generateSampleConfig', () => {
    it('should write a sample configuration file', () => {
      const outputPath = '/test/demo.json';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      configLoader.generateSampleConfig(outputPath);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        outputPath,
        expect.stringContaining('"name": "Dashboard Feature Demo"')
      );
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Sample demo.json created'));
      consoleSpy.mockRestore();
    });
  });

  describe('deepMerge', () => {
    it('should merge nested objects correctly', () => {
      const target = {
        a: 1,
        b: {
          c: 2,
          d: 3
        },
        e: [1, 2]
      };

      const source = {
        b: {
          d: 4,
          f: 5
        },
        e: [3, 4],
        g: 6
      };

      const result = configLoader.deepMerge(target, source);

      expect(result.a).toBe(1);
      expect(result.b.c).toBe(2);
      expect(result.b.d).toBe(4);
      expect(result.b.f).toBe(5);
      expect(result.e).toEqual([3, 4]);
      expect(result.g).toBe(6);
    });
  });
});

describe('Configuration Integration Tests', () => {
  let configLoader;
  const tempDir = '/tmp/demo-test';

  beforeEach(() => {
    configLoader = new ConfigLoader();
    
    // Mock the filesystem for integration tests
    jest.resetAllMocks();
  });

  it('should handle complex real-world configuration', () => {
    const complexConfig = {
      name: "E-commerce Checkout Flow",
      description: "Complete checkout process demonstration",
      entry: {
        url: "/cart",
        selector: "[data-testid='cart-container']",
        waitTime: 3000
      },
      interactions: [
        {
          type: "click",
          selector: "[data-testid='proceed-checkout']",
          waitBeforeMove: 1500,
          waitAfterClick: 2000,
          zoomLevel: 1.9,
          description: "Start checkout process"
        },
        {
          type: "type",
          selector: "[data-testid='email-input']",
          text: "customer@example.com",
          waitBeforeMove: 800,
          waitAfterClick: 1000,
          zoomLevel: 2.2,
          description: "Enter email address"
        },
        {
          type: "type",
          selector: "[data-testid='address-input']",
          text: "123 Main St, City, State 12345",
          waitBeforeMove: 600,
          waitAfterClick: 1200,
          description: "Enter shipping address"
        },
        {
          type: "click",
          selector: "[data-testid='payment-method-card']",
          waitBeforeMove: 1000,
          waitAfterClick: 1500,
          zoomLevel: 1.8,
          description: "Select credit card payment"
        },
        {
          type: "wait",
          waitTime: 2000,
          description: "Wait for payment form to load"
        },
        {
          type: "click",
          selector: "[data-testid='place-order']",
          waitBeforeMove: 1200,
          waitAfterClick: 3000,
          zoomLevel: 2.0,
          description: "Place the order"
        }
      ],
      effects: {
        cameraFollow: true,
        zoomLevel: 1.7,
        glowEffects: true,
        clickAnimations: true,
        mouseMoveSpeed: 50,
        spotlightEffect: true
      },
      recording: {
        duration: 60000,
        skipErrors: false,
        outputName: "ecommerce-checkout-flow"
      },
      timings: {
        waitBeforeMove: 1000,
        waitAfterClick: 1400,
        waitBetweenSteps: 900,
        pageLoadWait: 3000
      }
    };

    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(complexConfig));

    const result = configLoader.loadConfig('/test/ecommerce-demo.json');

    expect(result.name).toBe("E-commerce Checkout Flow");
    expect(result.interactions).toHaveLength(6);
    expect(result.interactions[0].type).toBe("click");
    expect(result.interactions[1].type).toBe("type");
    expect(result.interactions[1].text).toBe("customer@example.com");
    expect(result.interactions[4].type).toBe("wait");
    expect(result.effects.mouseMoveSpeed).toBe(50);
    expect(result.recording.outputName).toBe("ecommerce-checkout-flow");
  });
});