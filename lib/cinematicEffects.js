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
      will-change: transform, left, top;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    `;
  
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
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
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
      this.cursor.style.left = x + 'px';
      this.cursor.style.top = y + 'px';
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
      
      // Remove from window
      delete window.cinematicControl;
    }
    };
    
    // Initialize cursor position
    window.cinematicControl.moveCursor(960, 540);
    
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
    
    // Observe body for child list changes
    observer.observe(document.body, {
      childList: true,
      subtree: false
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
})();