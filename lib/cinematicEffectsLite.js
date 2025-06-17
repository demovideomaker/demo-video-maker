/**
 * Cinematic Effects Lite - Focused on effects without cursor
 * This version handles zoom, highlighting, and camera follow
 * while letting Playwright handle the cursor
 */

(function() {
  console.log('[CinematicEffects Lite] Initializing...');
  
  if (window.cinematicControl) {
    console.log('[CinematicEffects Lite] Already initialized');
    return;
  }

  function setupEffects() {
    console.log('[CinematicEffects Lite] Setting up effects...');
    
    // Create effects container for highlights and overlays
    const effectsContainer = document.createElement('div');
    effectsContainer.id = 'cinematic-effects-lite';
    effectsContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2147483646;
    `;
    document.documentElement.appendChild(effectsContainer);

    // Create zoom container for camera effects
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
    
    // Move existing body content into zoom container
    while (document.body.firstChild) {
      zoomContainer.appendChild(document.body.firstChild);
    }
    document.body.appendChild(zoomContainer);

    // Add styles for effects
    const style = document.createElement('style');
    style.textContent = `
      .highlight-element {
        position: relative !important;
        z-index: 1000 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5),
                    0 0 0 6px rgba(59, 130, 246, 0.3),
                    0 0 20px rgba(59, 130, 246, 0.4) !important;
        border-radius: 4px;
        transition: box-shadow 0.3s ease !important;
      }
      
      .click-ripple {
        position: fixed;
        width: 40px;
        height: 40px;
        border: 2px solid rgba(59, 130, 246, 0.8);
        border-radius: 50%;
        pointer-events: none;
        z-index: 2147483647;
        animation: ripple 0.6s ease-out forwards;
        transform: translate(-50%, -50%);
      }
      
      @keyframes ripple {
        0% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
        100% {
          transform: translate(-50%, -50%) scale(3);
          opacity: 0;
        }
      }
      
      .focus-vignette {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        background: radial-gradient(ellipse at var(--x, 50%) var(--y, 50%), 
          transparent 20%, 
          rgba(0,0,0,0.1) 50%, 
          rgba(0,0,0,0.3) 100%);
        z-index: 2147483645;
        transition: opacity 0.3s ease;
        opacity: 0;
      }
      
      .focus-vignette.active {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);

    // Create vignette for focus effect
    const vignette = document.createElement('div');
    vignette.className = 'focus-vignette';
    effectsContainer.appendChild(vignette);

    // Control API
    window.cinematicControl = {
      currentZoom: 1,
      zoomContainer: zoomContainer,
      effectsContainer: effectsContainer,
      vignette: vignette,
      
      // Zoom to specific point
      zoomTo: function(scale, centerX, centerY, duration = 800) {
        this.currentZoom = scale;
        const offsetX = (window.innerWidth / 2 - centerX) * (scale - 1);
        const offsetY = (window.innerHeight / 2 - centerY) * (scale - 1);
        
        this.zoomContainer.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        this.zoomContainer.style.transform = `scale(${scale}) translate(${offsetX/scale}px, ${offsetY/scale}px)`;
        
        // Add vignette effect when zoomed
        if (scale > 1.2) {
          this.vignette.style.setProperty('--x', `${(centerX / window.innerWidth) * 100}%`);
          this.vignette.style.setProperty('--y', `${(centerY / window.innerHeight) * 100}%`);
          this.vignette.classList.add('active');
        } else {
          this.vignette.classList.remove('active');
        }
      },
      
      // Reset zoom
      resetZoom: function(duration = 1000) {
        this.zoomTo(1, window.innerWidth / 2, window.innerHeight / 2, duration);
      },
      
      // Highlight element
      highlightElement: function(element) {
        // Remove previous highlights
        document.querySelectorAll('.highlight-element').forEach(el => {
          el.classList.remove('highlight-element');
        });
        
        if (element && typeof element === 'string') {
          element = document.querySelector(element);
        }
        
        if (element) {
          element.classList.add('highlight-element');
          
          // Auto-scroll element into view if needed
          const rect = element.getBoundingClientRect();
          const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;
          if (!isInView) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      },
      
      // Click animation at position
      animateClick: function(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        this.effectsContainer.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      },
      
      // Camera follow (simplified for mouse position)
      enableCameraFollow: function(enabled = true, zoomLevel = 1.5) {
        if (enabled) {
          // Will be controlled by playwright mouse position
          this.cameraFollowEnabled = true;
          this.cameraFollowZoom = zoomLevel;
        } else {
          this.cameraFollowEnabled = false;
          this.resetZoom();
        }
      },
      
      // Update camera based on mouse position
      updateCameraFollow: function(x, y) {
        if (this.cameraFollowEnabled) {
          this.zoomTo(this.cameraFollowZoom, x, y, 150);
        }
      },
      
      // Stubs for cursor-related functions (handled by Playwright)
      moveCursor: function() {},
      cursor: { style: {} }
    };
    
    console.log('[CinematicEffects Lite] Setup complete');
  }

  // Run setup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEffects);
  } else {
    setupEffects();
  }
  
  // Make it globally available
  window.setupCinematicEffectsLite = setupEffects;
})();