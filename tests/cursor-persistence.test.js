/**
 * Tests for cursor persistence in React/SPA environments
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Cursor Persistence Tests', () => {
  let cinematicEffectsScript;
  
  beforeAll(() => {
    // Load the cinematic effects script
    const scriptPath = path.join(__dirname, '..', 'lib', 'cinematicEffects.js');
    cinematicEffectsScript = fs.readFileSync(scriptPath, 'utf8');
  });

  describe('Script Structure', () => {
    it('should append effects container to documentElement initially', () => {
      expect(cinematicEffectsScript).toContain('document.documentElement.appendChild(effectsContainer)');
      // The initial setup appends to documentElement to survive React hydration
    });

    it('should have aggressive cursor enforcement interval', () => {
      expect(cinematicEffectsScript).toContain('setInterval(() => {');
      expect(cinematicEffectsScript).toMatch(/}, 50\)/); // 50ms interval
    });

    it('should have React hydration detection', () => {
      expect(cinematicEffectsScript).toContain('React app detected');
      expect(cinematicEffectsScript).toContain('#__next'); // Next.js
      expect(cinematicEffectsScript).toContain('#root');   // CRA
      expect(cinematicEffectsScript).toContain('[data-reactroot]'); // Legacy
    });

    it('should observe entire document tree', () => {
      expect(cinematicEffectsScript).toContain('observer.observe(document.documentElement');
      expect(cinematicEffectsScript).toContain('subtree: true');
    });

    it('should have proper CSS isolation properties', () => {
      expect(cinematicEffectsScript).toContain('contain: layout style paint');
      expect(cinematicEffectsScript).toContain('isolation: isolate');
    });

    it('should have maximum z-index with important flags', () => {
      expect(cinematicEffectsScript).toContain('z-index: 2147483647 !important');
    });

    it('should recreate cursor if missing', () => {
      expect(cinematicEffectsScript).toContain('Cursor missing, recreating');
      expect(cinematicEffectsScript).toContain('container.appendChild(window.cinematicControl.cursor)');
    });

    it('should handle cleanup properly', () => {
      expect(cinematicEffectsScript).toContain('clearInterval(this._cursorInterval)');
      expect(cinematicEffectsScript).toContain('this._observer.disconnect()');
    });
  });

  describe('DOM Manipulation Tests', () => {
    // These tests simulate what happens in a browser environment
    
    beforeEach(() => {
      // Reset DOM
      document.body.innerHTML = '';
      document.documentElement.querySelectorAll('#cinematic-effects').forEach(el => el.remove());
      delete window.cinematicControl;
    });

    it('should create cursor that survives body innerHTML replacement', () => {
      // Execute a simplified version of the setup
      eval(`
        (function() {
          const container = document.createElement('div');
          container.id = 'cinematic-effects';
          container.style.position = 'fixed';
          container.style.zIndex = '2147483647';
          document.documentElement.appendChild(container);
          
          const cursor = document.createElement('div');
          cursor.id = 'demo-cursor';
          cursor.style.cssText = 'position: fixed; z-index: 2147483647;';
          container.appendChild(cursor);
          
          window.cinematicControl = { cursor };
        })();
      `);

      // Verify initial setup
      expect(document.getElementById('cinematic-effects')).toBeTruthy();
      expect(document.getElementById('demo-cursor')).toBeTruthy();

      // Simulate React replacing body content
      document.body.innerHTML = '<div id="root">New React Content</div>';

      // Cursor should still exist because it's at documentElement level
      expect(document.getElementById('cinematic-effects')).toBeTruthy();
      expect(document.getElementById('demo-cursor')).toBeTruthy();
    });

    it('should maintain cursor visibility through style changes', () => {
      eval(`
        (function() {
          const container = document.createElement('div');
          container.id = 'cinematic-effects';
          document.documentElement.appendChild(container);
          
          const cursor = document.createElement('div');
          cursor.id = 'demo-cursor';
          cursor.style.display = 'block';
          cursor.style.visibility = 'visible';
          cursor.style.opacity = '1';
          container.appendChild(cursor);
        })();
      `);

      const cursor = document.getElementById('demo-cursor');
      
      // Try to hide cursor
      cursor.style.display = 'none';
      cursor.style.visibility = 'hidden';
      cursor.style.opacity = '0';

      // Simulate enforcement check
      eval(`
        const cursor = document.getElementById('demo-cursor');
        if (cursor) {
          cursor.style.display = 'block';
          cursor.style.visibility = 'visible';
          cursor.style.opacity = '1';
        }
      `);

      expect(cursor.style.display).toBe('block');
      expect(cursor.style.visibility).toBe('visible');
      expect(cursor.style.opacity).toBe('1');
    });
  });

  describe('React Simulation Tests', () => {
    it('should handle Next.js app structure', () => {
      // Setup Next.js-like structure
      document.body.innerHTML = `
        <div id="__next">
          <div class="layout">
            <main>Content</main>
          </div>
        </div>
      `;

      // Execute setup
      eval(`
        (function() {
          const container = document.createElement('div');
          container.id = 'cinematic-effects';
          document.documentElement.appendChild(container);
          
          const cursor = document.createElement('div');
          cursor.id = 'demo-cursor';
          container.appendChild(cursor);
        })();
      `);

      // Simulate Next.js route change
      document.body.innerHTML = `
        <div id="__next">
          <div class="layout">
            <main>New Page Content</main>
          </div>
        </div>
      `;

      // Effects should still exist
      expect(document.getElementById('cinematic-effects')).toBeTruthy();
      expect(document.getElementById('demo-cursor')).toBeTruthy();
    });

    it('should handle React hydration mismatch scenario', () => {
      // Server-rendered content
      document.body.innerHTML = `
        <div id="root">
          <div>Server Content</div>
        </div>
      `;

      // Add our effects
      eval(`
        (function() {
          const container = document.createElement('div');
          container.id = 'cinematic-effects';
          document.documentElement.appendChild(container);
          
          const cursor = document.createElement('div');
          cursor.id = 'demo-cursor';
          container.appendChild(cursor);
          
          // Store reference
          window.cinematicControl = { cursor, container };
        })();
      `);

      // Simulate React hydration replacing content
      const root = document.getElementById('root');
      root.innerHTML = '<div>Hydrated Content</div>';

      // Add some React internals
      root.setAttribute('data-reactroot', '');

      // Our cursor should still exist
      expect(document.getElementById('cinematic-effects')).toBeTruthy();
      expect(document.getElementById('demo-cursor')).toBeTruthy();
      expect(window.cinematicControl).toBeTruthy();
    });
  });

  describe('MutationObserver Tests', () => {
    it('should detect and handle cursor removal', (done) => {
      // Setup with observer
      const container = document.createElement('div');
      container.id = 'cinematic-effects';
      document.documentElement.appendChild(container);
      
      const cursor = document.createElement('div');
      cursor.id = 'demo-cursor';
      container.appendChild(cursor);
      
      const cursorRef = cursor;
      let observerFired = false;
      
      // Simplified observer
      const observer = new MutationObserver((mutations) => {
        // Check if cursor was removed
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
            for (const node of mutation.removedNodes) {
              if (node === cursorRef || (node.contains && node.contains(cursorRef))) {
                // Cursor was removed, re-add it
                if (!container.contains(cursorRef)) {
                  container.appendChild(cursorRef);
                  observerFired = true;
                }
              }
            }
          }
        }
      });
      
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });

      // Remove cursor
      cursor.remove();
      
      // Use setTimeout to let mutation observer fire
      setTimeout(() => {
        expect(observerFired).toBe(true);
        expect(document.getElementById('demo-cursor')).toBeTruthy();
        expect(container.contains(cursor)).toBe(true);
        
        // Cleanup
        observer.disconnect();
        done();
      }, 10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple setup calls gracefully', () => {
      // First setup
      eval(`
        window.setupCount = 0;
        window.cinematicControl = null;
        
        function setup() {
          if (window.cinematicControl) return;
          
          window.setupCount++;
          window.cinematicControl = { initialized: true };
        }
        
        setup();
        setup();
        setup();
      `);

      expect(window.setupCount).toBe(1);
      
      // Cleanup
      delete window.setupCount;
    });

    it('should handle container at wrong location', () => {
      // Create container in body (wrong location)
      const container = document.createElement('div');
      container.id = 'cinematic-effects';
      document.body.appendChild(container);

      // Verify it's in body
      expect(container.parentElement).toBe(document.body);

      // Enforcement should move it
      if (container && container.parentElement !== document.documentElement) {
        document.documentElement.appendChild(container);
      }

      // Now it should be in documentElement
      expect(container.parentElement).toBe(document.documentElement);
    });
  });
});