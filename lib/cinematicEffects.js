/**
 * Cinematic Effects Script - Injected into demo pages
 * This script is validated before injection to prevent code injection attacks
 */

// Immediate setup to ensure cursor is available ASAP
(function() {
  console.log('[CinematicEffects] Initializing...');
  
  // Ensure we only run once
  if (window.cinematicControl) {
    console.log('[CinematicEffects] Already initialized, skipping');
    return;
  }

  function setupCinematicEffects() {
    console.log('[CinematicEffects] Setting up effects...');
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
      z-index: 2147483647;
      isolation: isolate;
    `;
    // Append to documentElement instead of body to survive React hydration
    // This puts it outside React's control
    document.documentElement.appendChild(effectsContainer);
  
    // Create glowing cursor with simpler structure
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.innerHTML = `
      <div class="cursor-glow"></div>
      <div class="cursor-glow-large"></div>
      <div class="cursor-arrow"></div>
    `;
  
    // Use inline styles with maximum specificity
    cursor.style.cssText = `
      position: fixed !important;
      width: 32px !important;
      height: 32px !important;
      pointer-events: none !important;
      z-index: 2147483647 !important;
      left: 960px !important;
      top: 540px !important;
      transform: translate(-4px, -4px) !important;
      will-change: transform, left, top !important;
      backface-visibility: hidden !important;
      -webkit-backface-visibility: hidden !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      contain: layout style paint !important;
      isolation: isolate !important;
    `;
    
    // Also set individual properties to ensure they stick
    Object.assign(cursor.style, {
      position: 'fixed',
      display: 'block',
      visibility: 'visible',
      opacity: '1',
      zIndex: '2147483647'
    });
  
    // Create spotlight effect first (lower layer)
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
      z-index: 1;
      transition: none;
    `;
    effectsContainer.appendChild(spotlight);
    
    // Append cursor last (top layer)
    effectsContainer.appendChild(cursor);
  
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
      z-index: 1;
    `;
    
    // Collect all existing body children except our effects container
    const existingChildren = Array.from(document.body.children).filter(
      child => child.id !== 'cinematic-effects'
    );
    
    // Move existing content into zoom container
    existingChildren.forEach(child => {
      zoomContainer.appendChild(child);
    });
    
    // Insert zoom container before effects container
    document.body.insertBefore(zoomContainer, effectsContainer);
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    body {
      overflow: hidden !important;
      background: #0a0a0a !important;
    }
    
    #demo-cursor {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    
    #demo-cursor * {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
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
      background: radial-gradient(circle, rgba(255,51,102,0.2) 0%, transparent 70%);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: pulse-large 3s ease-in-out infinite;
    }
    
    .cursor-arrow {
      position: absolute;
      width: 0;
      height: 0;
      top: 4px;
      left: 4px;
      border-style: solid;
      border-width: 0 8px 16px 0;
      border-color: transparent #ff3366 transparent transparent;
      transform: rotate(-45deg);
      filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
    }
    
    .cursor-arrow::before {
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      top: 2px;
      left: 2px;
      border-style: solid;
      border-width: 0 6px 12px 0;
      border-color: transparent white transparent transparent;
    }
    
    #zoom-container > * {
      transition: filter 0.3s ease;
    }
    
    .zoomed #zoom-container > *:not(.no-blur) {
      /* blur removed for sharp rendering */
    }
    
    .highlight-element {
      filter: none !important;
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.5) !important;
      z-index: 1000;
      position: relative;
    }
    
    .click-effect {
      position: fixed;
      width: 60px;
      height: 60px;
      border: 3px solid rgba(59, 130, 246, 0.8);
      border-radius: 50%;
      pointer-events: none;
      z-index: 2147483646;
      animation: click-ripple 0.8s ease-out forwards;
      transform: translate(-50%, -50%);
    }
    
    @keyframes pulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
      50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.4; }
    }
    
    @keyframes pulse-large {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
      50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.2; }
    }
    
    @keyframes click-ripple {
      0% {
        transform: translate(-50%, -50%) scale(0.5);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scale(3);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Create global control object with cleanup methods
  window.cinematicControl = {
    mouseX: 960,
    mouseY: 540,
    currentZoom: 1,
    cameraFollowEnabled: false,
    cameraFollowZoom: 1.6,
    cursor: cursor,
    spotlight: spotlight,
    zoomContainer: zoomContainer,
    
    moveCursor: function(x, y) {
      this.mouseX = x;
      this.mouseY = y;
      this.cursor.style.setProperty('left', x + 'px', 'important');
      this.cursor.style.setProperty('top', y + 'px', 'important');
      this.cursor.style.setProperty('display', 'block', 'important');
      this.cursor.style.setProperty('visibility', 'visible', 'important');
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
    },
    
    // Cleanup method to prevent memory leaks
    cleanup: function() {
      console.log('[CinematicEffects] Cleaning up...');
      
      // Disconnect observer
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
      
      // Clear DOM references
      this.cursor = null;
      this.spotlight = null;
      this.zoomContainer = null;
      
      // Remove effects container
      const effectsContainer = document.getElementById('cinematic-effects');
      if (effectsContainer) {
        effectsContainer.remove();
      }
      
      // Clear any intervals/timeouts
      if (this._animationFrame) {
        cancelAnimationFrame(this._animationFrame);
      }
      
      if (this._cursorInterval) {
        clearInterval(this._cursorInterval);
      }
      
      // Remove from window
      delete window.cinematicControl;
    }
    };
    
    // Initialize cursor position
    window.cinematicControl.moveCursor(960, 540);
    
    // Force cursor to be visible
    cursor.style.display = 'block !important';
    cursor.style.visibility = 'visible !important';
    cursor.style.opacity = '1 !important';
    
    // More aggressive cursor enforcement
    let cursorCheckInterval = setInterval(() => {
      const currentCursor = document.getElementById('demo-cursor');
      const container = document.getElementById('cinematic-effects');
      
      if (!currentCursor || !document.documentElement.contains(currentCursor)) {
        console.log('[CinematicEffects] Cursor missing, recreating...');
        
        // Recreate cursor if it's gone
        if (container && window.cinematicControl && window.cinematicControl.cursor) {
          container.appendChild(window.cinematicControl.cursor);
          window.cinematicControl.cursor.style.display = 'block';
          window.cinematicControl.cursor.style.visibility = 'visible';
          window.cinematicControl.cursor.style.opacity = '1';
        }
      } else {
        // Force visibility
        currentCursor.style.display = 'block';
        currentCursor.style.visibility = 'visible';
        currentCursor.style.opacity = '1';
        currentCursor.style.zIndex = '2147483647';
        
        // Ensure it's in the correct container
        if (container && currentCursor.parentElement !== container) {
          container.appendChild(currentCursor);
        }
      }
      
      // Ensure container is at document level
      if (container && container.parentElement !== document.documentElement) {
        document.documentElement.appendChild(container);
      }
    }, 50); // Check more frequently
    
    // Store interval for cleanup
    window.cinematicControl._cursorInterval = cursorCheckInterval;
    
    // Add mutation observer to ensure cursor stays visible
    const observer = new MutationObserver((mutations) => {
      const cursor = document.getElementById('demo-cursor');
      const effectsContainer = document.getElementById('cinematic-effects');
      
      if (!cursor || !document.body.contains(cursor)) {
        console.log('[CinematicEffects] Cursor was removed, re-adding...');
        if (effectsContainer && document.body.contains(effectsContainer)) {
          effectsContainer.appendChild(window.cinematicControl.cursor);
        }
      }
      
      // Ensure effects container is always last child of body
      if (effectsContainer && effectsContainer.parentNode === document.body) {
        const lastChild = document.body.lastElementChild;
        if (lastChild !== effectsContainer) {
          console.log('[CinematicEffects] Moving effects container to top');
          document.body.appendChild(effectsContainer);
        }
      }
    });
    
    // Observe entire document for changes
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    // Store observer reference for cleanup
    window.cinematicControl._observer = observer;
    
    console.log('[CinematicEffects] Setup complete');
  }
  
  // Run setup based on DOM state
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCinematicEffects);
  } else {
    // DOM is already loaded, run immediately
    setupCinematicEffects();
  }
  
  // Also watch for React hydration completion
  // React typically takes a moment after DOMContentLoaded to hydrate
  let hydrationCheckCount = 0;
  const hydrationCheck = setInterval(() => {
    hydrationCheckCount++;
    
    // Check if React root exists (common React indicators)
    const hasReactRoot = document.querySelector('#__next') || // Next.js
                        document.querySelector('#root') ||    // CRA
                        document.querySelector('[data-reactroot]'); // Legacy React
    
    if (hasReactRoot && hydrationCheckCount > 10) { // Give React ~500ms to hydrate
      console.log('[CinematicEffects] React app detected, reinforcing cursor...');
      
      // Ensure our container is still there
      const container = document.getElementById('cinematic-effects');
      if (!container || container.parentElement !== document.documentElement) {
        setupCinematicEffects();
      }
      
      // Force cursor visibility
      const cursor = document.getElementById('demo-cursor');
      if (cursor) {
        cursor.style.cssText = cursor.style.cssText; // Force style recalculation
        cursor.style.display = 'block';
        cursor.style.visibility = 'visible';
        cursor.style.opacity = '1';
      }
      
      clearInterval(hydrationCheck);
    }
    
    // Stop checking after 2 seconds
    if (hydrationCheckCount > 40) {
      clearInterval(hydrationCheck);
    }
  }, 50);
})();