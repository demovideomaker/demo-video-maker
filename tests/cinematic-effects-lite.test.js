/**
 * Tests for Cinematic Effects Lite
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Cinematic Effects Lite Tests', () => {
  let cinematicEffectsScript;
  
  beforeAll(() => {
    // Load the cinematic effects lite script
    const scriptPath = path.join(__dirname, '..', 'lib', 'cinematicEffectsLite.js');
    cinematicEffectsScript = fs.readFileSync(scriptPath, 'utf8');
  });

  describe('Script Structure', () => {
    it('should create effects container at documentElement level', () => {
      expect(cinematicEffectsScript).toContain('document.documentElement.appendChild(effectsContainer)');
    });

    it('should create zoom container for camera effects', () => {
      expect(cinematicEffectsScript).toContain('zoomContainer.id = \'zoom-container\'');
      expect(cinematicEffectsScript).toContain('transform: scale(1)');
    });

    it('should not create any cursor elements', () => {
      expect(cinematicEffectsScript).not.toContain('cursor.id = \'demo-cursor\'');
      expect(cinematicEffectsScript).not.toContain('cursor-glow');
      expect(cinematicEffectsScript).not.toContain('cursor-arrow');
    });

    it('should have highlight element styles', () => {
      expect(cinematicEffectsScript).toContain('.highlight-element');
      expect(cinematicEffectsScript).toContain('box-shadow');
    });

    it('should have click ripple animation', () => {
      expect(cinematicEffectsScript).toContain('.click-ripple');
      expect(cinematicEffectsScript).toContain('@keyframes ripple');
    });

    it('should have focus vignette effect', () => {
      expect(cinematicEffectsScript).toContain('.focus-vignette');
      expect(cinematicEffectsScript).toContain('radial-gradient');
    });
  });

  describe('Control API', () => {
    it('should expose cinematicControl global object', () => {
      expect(cinematicEffectsScript).toContain('window.cinematicControl = {');
    });

    it('should have zoomTo function', () => {
      expect(cinematicEffectsScript).toContain('zoomTo: function(scale, centerX, centerY, duration = 800)');
    });

    it('should have resetZoom function', () => {
      expect(cinematicEffectsScript).toContain('resetZoom: function(duration = 1000)');
    });

    it('should have highlightElement function', () => {
      expect(cinematicEffectsScript).toContain('highlightElement: function(element)');
    });

    it('should have animateClick function with coordinates', () => {
      expect(cinematicEffectsScript).toContain('animateClick: function(x, y)');
    });

    it('should have camera follow functions', () => {
      expect(cinematicEffectsScript).toContain('enableCameraFollow: function(enabled = true, zoomLevel = 1.5)');
      expect(cinematicEffectsScript).toContain('updateCameraFollow: function(x, y)');
    });

    it('should have stub cursor functions for compatibility', () => {
      expect(cinematicEffectsScript).toContain('moveCursor: function() {}');
      expect(cinematicEffectsScript).toContain('cursor: { style: {} }');
    });
  });

  describe('DOM Manipulation Tests', () => {
    beforeEach(() => {
      // Reset DOM
      document.body.innerHTML = '';
      document.documentElement.querySelectorAll('#cinematic-effects-lite').forEach(el => el.remove());
      delete window.cinematicControl;
    });

    it('should set up effects when DOM is ready', () => {
      // Execute the script
      eval(cinematicEffectsScript);
      
      // Check that effects container was created
      expect(document.getElementById('cinematic-effects-lite')).toBeTruthy();
      expect(document.getElementById('zoom-container')).toBeTruthy();
      expect(window.cinematicControl).toBeTruthy();
    });

    it('should handle zoom transformations', () => {
      eval(cinematicEffectsScript);
      
      const zoomContainer = document.getElementById('zoom-container');
      expect(zoomContainer).toBeTruthy();
      
      // Test zoom
      window.cinematicControl.zoomTo(2, 500, 300);
      expect(zoomContainer.style.transform).toContain('scale(2)');
    });

    it('should highlight elements', () => {
      eval(cinematicEffectsScript);
      
      // Create test element
      const testEl = document.createElement('div');
      testEl.id = 'test-element';
      document.body.appendChild(testEl);
      
      // Highlight it
      window.cinematicControl.highlightElement(testEl);
      expect(testEl.classList.contains('highlight-element')).toBe(true);
      
      // Remove highlight
      window.cinematicControl.highlightElement(null);
      expect(testEl.classList.contains('highlight-element')).toBe(false);
    });

    it('should create click animations at specified coordinates', () => {
      eval(cinematicEffectsScript);
      
      const effectsContainer = document.getElementById('cinematic-effects-lite');
      
      // Animate click
      window.cinematicControl.animateClick(100, 200);
      
      const ripple = effectsContainer.querySelector('.click-ripple');
      expect(ripple).toBeTruthy();
      expect(ripple.style.left).toBe('100px');
      expect(ripple.style.top).toBe('200px');
    });

    it('should update camera follow based on mouse position', () => {
      eval(cinematicEffectsScript);
      
      const zoomContainer = document.getElementById('zoom-container');
      
      // Enable camera follow
      window.cinematicControl.enableCameraFollow(true, 1.5);
      
      // Update position
      window.cinematicControl.updateCameraFollow(800, 600);
      
      // Should have zoomed to follow mouse
      expect(zoomContainer.style.transform).toContain('scale(1.5)');
    });

    it('should only run setup once', () => {
      eval(cinematicEffectsScript);
      
      const firstControl = window.cinematicControl;
      
      // Try to run again
      eval(cinematicEffectsScript);
      
      // Should be the same object
      expect(window.cinematicControl).toBe(firstControl);
      expect(document.querySelectorAll('#cinematic-effects-lite').length).toBe(1);
    });
  });

  describe('Compatibility Features', () => {
    it('should have stub cursor methods for backward compatibility', () => {
      eval(cinematicEffectsScript);
      
      // These should not throw errors
      expect(() => window.cinematicControl.moveCursor(100, 200)).not.toThrow();
      expect(window.cinematicControl.cursor).toBeDefined();
      expect(window.cinematicControl.cursor.style).toBeDefined();
    });

    it('should handle string selectors in highlightElement', () => {
      eval(cinematicEffectsScript);
      
      const testEl = document.createElement('div');
      testEl.id = 'test-highlight';
      document.body.appendChild(testEl);
      
      // Should accept string selector
      window.cinematicControl.highlightElement('#test-highlight');
      expect(testEl.classList.contains('highlight-element')).toBe(true);
    });
  });
});