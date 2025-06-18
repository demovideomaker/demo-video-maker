# 🎬 Demo Video Maker

**Create stunning cinematic demo videos automatically from your web applications**

[![npm version](https://badge.fury.io/js/demo-video-maker.svg)](https://www.npmjs.com/package/demo-video-maker)
[![Node.js CI](https://github.com/demovideomaker/demo-video-maker/workflows/Node.js%20CI/badge.svg)](https://github.com/demovideomaker/demo-video-maker/actions)
[![Security Rating](https://img.shields.io/badge/security-A+-green.svg)](https://github.com/demovideomaker/demo-video-maker/security)

Transform your web application into professional demo videos with cinematic mouse movements, dynamic camera following, zoom effects, and gorgeous visual polish. Perfect for product launches, feature demonstrations, marketing materials, and investor presentations.

![Demo Video Example](https://via.placeholder.com/800x450/1a1a1a/ffffff?text=Cinematic+Demo+Video+Example)

## ✨ Features

- 🎯 **Configuration-Driven**: JSON-based demo definitions for precise control
- 📷 **Camera Follow**: Dynamic zoom and pan that follows mouse movement  
- ✨ **Visual Effects**: Click animations, element highlighting, and smooth transitions
- 🎬 **Cinematic Quality**: Professional 1920x1080 HD video output with visible cursor
- 🔧 **Highly Configurable**: Customize timing, effects, interactions, and visual style
- 🖱️ **Visible Cursor**: Custom cursor that appears in video recordings
- 🎭 **Viewport Protection**: Smart zoom bounds prevent showing browser edges
- 🚀 **Multiple Demos**: Create separate demos for different features automatically
- 🛡️ **Enterprise Security**: Path validation, input sanitization, memory management
- 🎯 **Simple CLI**: Just run `demo-video-maker` in your project directory

## 🚀 Quick Start

### 1. Install the Tool

```bash
npm install -g demo-video-maker
```

### 2. Create Your First Demo

```bash
# Navigate to your web app
cd /path/to/your/webapp

# Generate a sample demo.json
demo-video-maker --init

# Edit demo.json to match your app's elements
```

### 3. Run the Demo

```bash
# Start your web app (in a separate terminal)
npm start

# Generate the demo video
demo-video-maker

# If your app runs on a different port
demo-video-maker --port 3000
```

That's it! Your demo video will be saved in `demo-output-cinematic-[timestamp]/`

## 📋 System Requirements

### Required
- **Node.js**: 18.0.0 or higher
- **Operating System**: macOS, Linux, or Windows 10+
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Browser**: Chromium/Chrome (automatically managed by Playwright)

### Optional
- **FFmpeg**: For video format conversion (auto-detected)
- **Git**: For version control integration

### Supported Web Frameworks
- ✅ React (Create React App, Next.js, Vite)
- ✅ Vue.js (Vue CLI, Nuxt.js, Vite)
- ✅ Angular (Angular CLI)
- ✅ Svelte/SvelteKit
- ✅ Plain HTML/JavaScript
- ✅ Any web framework running on localhost

## 📖 Configuration Guide

Demo Video Maker uses `demo.json` files to define interactive demonstrations. Place these files anywhere in your project to create targeted demos.

### Basic Configuration Structure

```json
{
  "name": "Feature Name",
  "description": "What this demo shows",
  "entry": {
    "url": "/feature-page",
    "selector": "[data-testid='main-container']",
    "waitTime": 2000
  },
  "interactions": [
    {
      "type": "click",
      "selector": "[data-testid='button']",
      "waitBeforeMove": 1000,
      "waitAfterClick": 1500,
      "zoomLevel": 2.0,
      "description": "Click the main action button"
    }
  ],
  "effects": {
    "cameraFollow": true,
    "zoomLevel": 1.6,
    "clickAnimations": true
  },
  "recording": {
    "duration": 30000,
    "outputName": "feature-demo"
  }
}
```

### 🎯 Entry Configuration

Controls where the demo starts and initial setup.

```json
{
  "entry": {
    "url": "/dashboard",              // Relative URL to navigate to
    "selector": ".main-content",      // Element to focus on (optional)
    "waitTime": 3000                  // Time to wait after navigation (ms)
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `url` | string | `"/"` | Relative URL path to navigate to |
| `selector` | string | `null` | CSS selector to focus camera on entry |
| `waitTime` | number | `2000` | Milliseconds to wait after page load |

### 🎭 Interaction Types

Define the sequence of user interactions to demonstrate.

#### Click Interaction
```json
{
  "type": "click",
  "selector": "[data-testid='submit-button']",
  "waitBeforeMove": 1000,
  "waitAfter": 1500,  // Time to wait after action completes
  "zoomLevel": 2.0,
  "skipIfNotFound": false,
  "description": "Submit the form"
}
```

**Note:** Each click interaction includes a brief pause (300-800ms) before execution to simulate natural user behavior.

#### Hover Interaction
```json
{
  "type": "hover",
  "selector": ".tooltip-trigger",
  "waitBeforeMove": 800,
  "waitAfter": 1200,  // Time to wait after hovering
  "zoomLevel": 1.8,
  "description": "Show tooltip on hover"
}
```

#### Type Interaction
```json
{
  "type": "type",
  "selector": "input[name='email']",
  "text": "user@example.com",
  "waitBeforeMove": 500,
  "waitAfter": 2000,  // Time to wait after typing completes
  "zoomLevel": 1.9,
  "description": "Enter email address"
}
```

**Note:** Text is typed character-by-character with 80-200ms random delays between keystrokes for realistic typing animation.

#### Scroll Interaction
```json
{
  "type": "scroll",
  "selector": "#bottom-section",
  "waitBeforeMove": 800,
  "waitAfter": 1500,  // Time to wait after scroll completes
  "description": "Scroll to bottom section"
}
```

#### Wait Interaction
```json
{
  "type": "wait",
  "waitTime": 3000,
  "description": "Wait for animation to complete"
}
```

#### Navigate Interaction
```json
{
  "type": "navigate",
  "url": "/settings",
  "waitBeforeMove": 1000,
  "waitAfterClick": 2500,
  "description": "Navigate to settings page"
}
```

### 🎨 Visual Effects Configuration

Control the cinematic visual effects and camera behavior.

```json
{
  "effects": {
    "cameraFollow": true,           // Enable dynamic camera following
    "zoomLevel": 1.6,              // Default zoom level (1.0-5.0)
    "clickAnimations": true,       // Ripple effects on clicks
    "mouseMoveSpeed": 60,          // Mouse movement speed (10-200)
    "attentionPattern": true       // Figure-8 intro/outro animation (default: true)
  }
}
```

**Note:** The `attentionPattern` creates a figure-8 mouse movement at the beginning and end of the demo, adding ~5 seconds to the total video duration.

| Property | Type | Default | Range | Description |
|----------|------|---------|-------|-------------|
| `cameraFollow` | boolean | `true` | - | Enable dynamic zoom and camera following with 150ms transitions |
| `zoomLevel` | number | `1.6` | `1.0-5.0` | Default zoom level for interactions |
| `clickAnimations` | boolean | `true` | - | Show click ripple animations |
| `mouseMoveSpeed` | number | `60` | `10-200` | Mouse movement speed (steps per second) |
| `attentionPattern` | boolean | `true` | - | Show figure-8 pattern at start/end (adds ~5s) |

**Zoom Behavior:**
- Zoom values are automatically clamped to a minimum of 1.0 to prevent viewport edges from showing
- When zoomed in, camera panning is bounded to keep content within the viewport
- The page background is set to dark (#0a0a0a) to blend with any edge cases

### ⏱️ Timing Configuration

Fine-tune the timing and pacing of interactions.

```json
{
  "timings": {
    "waitBeforeMove": 1000,        // Delay before moving mouse (ms)
    "waitAfterClick": 1500,        // Delay after clicking (ms)
    "waitBetweenSteps": 800,       // Delay between interaction steps (ms)
    "pageLoadWait": 2000,          // Wait time after navigation (ms)
    "typingSpeed": [80, 200]       // Min/max delay between keystrokes (ms)
  }
}
```

**Important Timing Notes:**
- The actual video duration may exceed the configured `duration` due to:
  - Attention pattern animations (~5s each at start/end)
  - Camera follow transitions (150ms per movement)
  - Accumulated wait times between interactions
  - Character-by-character typing animations
- To minimize video length, disable `attentionPattern` and reduce wait times

| Property | Type | Default | Range | Description |
|----------|------|---------|-------|-------------|
| `waitBeforeMove` | number | `1000` | `0-10000` | Milliseconds to wait before moving mouse |
| `waitAfterClick` | number | `1500` | `0-10000` | Milliseconds to wait after interaction |
| `waitBetweenSteps` | number | `800` | `0-5000` | Milliseconds between interaction steps |
| `pageLoadWait` | number | `2000` | `1000-30000` | Milliseconds to wait after page navigation |
| `typingSpeed` | array | `[80, 200]` | `[10, 1000]` | Min/max milliseconds between keystrokes |

### 🎥 Recording Configuration

Control video output and recording behavior.

```json
{
  "recording": {
    "duration": 45000,             // Maximum recording time (ms)
    "skipErrors": true,            // Continue recording on interaction errors
    "outputName": "custom-name",   // Custom filename (optional)
    "fps": 30                     // Frame rate (default: 30)
  }
}
```

**Duration Note:** The `duration` field sets the maximum recording time, but the actual video may be longer due to:
- Attention pattern animations (if enabled)
- Accumulated wait times and transitions
- The recording continues until all interactions complete or duration is reached

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `duration` | number | `30000` | Maximum recording duration in milliseconds (see note above) |
| `skipErrors` | boolean | `true` | Continue recording if interactions fail |
| `outputName` | string | `null` | Custom filename (auto-generated if not specified) |
| `fps` | number | `30` | Video frame rate (10-60 fps) |

### 🔒 Security & Validation

All configuration values are validated and sanitized:

- **Selectors**: Checked for XSS patterns (`<script>`, `javascript:`, etc.)
- **URLs**: Only relative paths or `http(s)://` URLs allowed
- **Text**: HTML tags and dangerous content removed
- **Timings**: Must be positive numbers within reasonable bounds
- **File paths**: Protected against directory traversal attacks

## 📂 Project Structure & Organization

### Recommended Directory Layout

```
your-project/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   └── demo.json          # Button component demo
│   │   └── Modal/
│   │       ├── Modal.jsx
│   │       └── demo.json          # Modal component demo
│   ├── pages/
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   └── demo.json          # Dashboard page demo
│   │   └── Settings/
│   │       ├── Settings.jsx
│   │       └── demo.json          # Settings page demo
│   └── features/
│       ├── UserManagement/
│       │   ├── UserTable.jsx
│       │   └── demo.json          # User management demo
│       └── Analytics/
│           ├── Charts.jsx
│           └── demo.json          # Analytics demo
├── demo.json                      # Root-level overview demo
└── package.json
```

### Multiple Demo Strategy

Create focused demos for different audiences:

- **`/demo.json`** - Complete application overview
- **`/src/pages/*/demo.json`** - Individual page demonstrations  
- **`/src/components/*/demo.json`** - Component-specific demos
- **`/src/features/*/demo.json`** - Feature-focused demonstrations

## 🎪 Example Configurations

### Complete E-commerce Demo

```json
{
  "name": "E-commerce Checkout Flow",
  "description": "Complete checkout process from cart to confirmation",
  "entry": {
    "url": "/cart",
    "selector": "[data-testid='cart-container']",
    "waitTime": 2500
  },
  "interactions": [
    {
      "type": "hover",
      "selector": "[data-testid='cart-item']",
      "waitBeforeMove": 1000,
      "waitAfterClick": 1200,
      "zoomLevel": 1.8,
      "description": "Review cart items"
    },
    {
      "type": "click",
      "selector": "[data-testid='proceed-checkout']",
      "waitBeforeMove": 1500,
      "waitAfterClick": 2000,
      "zoomLevel": 2.0,
      "description": "Proceed to checkout"
    },
    {
      "type": "type",
      "selector": "[name='email']",
      "text": "customer@example.com",
      "waitBeforeMove": 800,
      "waitAfterClick": 1000,
      "zoomLevel": 2.2,
      "description": "Enter email address"
    },
    {
      "type": "type",
      "selector": "[name='address']",
      "text": "123 Main St, City, State 12345",
      "waitBeforeMove": 600,
      "waitAfterClick": 1200,
      "description": "Enter shipping address"
    },
    {
      "type": "click",
      "selector": "[data-testid='payment-credit-card']",
      "waitBeforeMove": 1000,
      "waitAfterClick": 1500,
      "zoomLevel": 1.9,
      "description": "Select credit card payment"
    },
    {
      "type": "wait",
      "waitTime": 2000,
      "description": "Wait for payment form animation"
    },
    {
      "type": "click",
      "selector": "[data-testid='place-order']",
      "waitBeforeMove": 1500,
      "waitAfterClick": 3000,
      "zoomLevel": 2.1,
      "description": "Complete the purchase"
    }
  ],
  "effects": {
    "cameraFollow": true,
    "zoomLevel": 1.7,
    "clickAnimations": true,
    "mouseMoveSpeed": 55
  },
  "recording": {
    "duration": 60000,
    "skipErrors": false,
    "outputName": "ecommerce-checkout-flow"
  },
  "timings": {
    "waitBeforeMove": 1200,
    "waitAfterClick": 1600,
    "waitBetweenSteps": 900,
    "pageLoadWait": 2500
  }
}
```

### Dashboard Analytics Demo

```json
{
  "name": "Analytics Dashboard",
  "description": "Interactive analytics dashboard with charts and filters",
  "entry": {
    "url": "/analytics",
    "selector": "[data-testid='analytics-dashboard']",
    "waitTime": 3000
  },
  "interactions": [
    {
      "type": "hover",
      "selector": "[data-testid='revenue-chart']",
      "waitBeforeMove": 1200,
      "waitAfterClick": 1500,
      "zoomLevel": 1.9,
      "description": "Examine revenue trends"
    },
    {
      "type": "click",
      "selector": "[data-testid='time-filter']",
      "waitBeforeMove": 1000,
      "waitAfterClick": 1200,
      "zoomLevel": 1.8,
      "description": "Open time period filter"
    },
    {
      "type": "click",
      "selector": "[data-value='last-30-days']",
      "waitBeforeMove": 800,
      "waitAfterClick": 2000,
      "zoomLevel": 2.0,
      "description": "Select last 30 days"
    },
    {
      "type": "scroll",
      "selector": "[data-testid='detailed-metrics']",
      "waitBeforeMove": 1000,
      "waitAfterClick": 1500,
      "description": "Scroll to detailed metrics"
    },
    {
      "type": "hover",
      "selector": "[data-testid='conversion-rate']",
      "waitBeforeMove": 800,
      "waitAfterClick": 1200,
      "zoomLevel": 1.7,
      "description": "Review conversion metrics"
    }
  ],
  "effects": {
    "cameraFollow": true,
    "zoomLevel": 1.6,
    "clickAnimations": true,
    "mouseMoveSpeed": 65
  },
  "recording": {
    "duration": 40000,
    "skipErrors": true,
    "outputName": "analytics-dashboard"
  }
}
```

## 🔧 Command Line Interface

### Basic Usage

```bash
# Run all demos in current directory
demo-video-maker

# Run demos for specific directory
demo-video-maker ./src/features

# Specify custom base URL
demo-video-maker . http://localhost:8080

# Generate sample configuration
demo-video-maker --init

# Show help
demo-video-maker --help
```

### Command Line Options

```bash
# Specify custom port (default: 3003)
demo-video-maker --port 3000
demo-video-maker -p 8080

# Run for specific directory with custom port
demo-video-maker --port 3000 ./src/features

# Use custom base URL (when app runs on different port/host)
demo-video-maker . http://localhost:8080

# Full custom setup
demo-video-maker ./my-app http://localhost:4000
```

## 🛠️ Integration Examples

### Next.js Integration

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "demo": "concurrently \"next dev\" \"wait-on http://localhost:3000 && demo-video-maker\"",
    "demo:record": "next build && next start & wait-on http://localhost:3000 && demo-video-maker && kill %1"
  },
  "devDependencies": {
    "demo-video-maker": "^1.0.0",
    "concurrently": "^7.6.0",
    "wait-on": "^7.0.1"
  }
}
```

### React (Vite) Integration

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "demo": "concurrently \"vite\" \"wait-on http://localhost:5173 && demo-video-maker . http://localhost:5173\"",
    "demo:ci": "vite build && vite preview & wait-on http://localhost:4173 && demo-video-maker . http://localhost:4173"
  }
}
```

### Vue.js Integration

```json
// package.json
{
  "scripts": {
    "serve": "vue-cli-service serve",
    "demo": "concurrently \"vue-cli-service serve\" \"wait-on http://localhost:8080 && demo-video-maker . http://localhost:8080\""
  }
}
```

## 🎨 Customization

### Custom CSS Selectors

Use data attributes for reliable element targeting:

```html
<!-- Recommended: Use data-testid -->
<button data-testid="submit-form">Submit</button>

<!-- Alternative: Use semantic selectors -->
<button className="btn-primary" aria-label="Submit form">Submit</button>

<!-- Avoid: Generic selectors -->
<button className="btn">Submit</button>
```

### Responsive Design Considerations

```json
{
  "interactions": [
    {
      "type": "click",
      "selector": "[data-testid='mobile-menu'], [data-testid='desktop-menu']",
      "skipIfNotFound": true,
      "description": "Open menu (responsive)"
    }
  ]
}
```

### Conditional Interactions

```json
{
  "interactions": [
    {
      "type": "click",
      "selector": "[data-testid='cookie-consent']",
      "skipIfNotFound": true,
      "description": "Accept cookies if banner is present"
    },
    {
      "type": "click",
      "selector": "[data-testid='main-action']",
      "skipIfNotFound": false,
      "description": "Required main action"
    }
  ]
}
```

## 🎬 Cinematic Effects Recipes

Create stunning visual effects by combining zoom levels, timing, and camera movements. Try these recipes with our [cinematic showcase page](/cinematic-showcase) or adapt them to your own content.

### Dynamic Zoom Scroll Effect

This recipe creates a cinematic journey from a top-left element to a bottom-right element with dramatic zoom transitions.

![Cinematic Scroll Demo](./demos/cinematic-scroll-demo.gif)

```json
{
  "name": "Cinematic Scroll Effect",
  "description": "Dynamic zoom scroll from top-left badge to bottom-right accent",
  "entry": {
    "url": "/cinematic-showcase",
    "waitTime": 1500
  },
  "effects": {
    "cameraFollow": true,
    "attentionPattern": false,
    "mouseMoveSpeed": 45,
    "zoomLevel": 1.6
  },
  "interactions": [
    {
      "type": "hover",
      "selector": "[data-testid='hero-badge']",
      "waitBeforeMove": 500,
      "waitAfterClick": 1200,
      "zoomLevel": 2.5,
      "description": "Start at top-left badge with zoom"
    },
    {
      "type": "wait",
      "waitTime": 800,
      "description": "Hold the initial zoom on badge"
    },
    {
      "type": "hover",
      "selector": ".hero-content",
      "waitBeforeMove": 200,
      "waitAfterClick": 600,
      "zoomLevel": 1.2,
      "description": "Pull back to show hero title"
    },
    {
      "type": "scroll",
      "selector": "[data-testid='cta']",
      "waitBeforeMove": 400,
      "waitAfterClick": 800,
      "zoomLevel": 1.0,
      "description": "Scroll to bottom while fully zoomed out"
    },
    {
      "type": "hover", 
      "selector": "[data-testid='bottom-accent']",
      "waitBeforeMove": 600,
      "waitAfterClick": 2000,
      "zoomLevel": 2.8,
      "description": "Zoom in on bottom-right accent"
    }
  ],
  "recording": {
    "duration": 15000,
    "outputName": "cinematic-scroll-effect"
  }
}
```

**Key Techniques:**
- **Zoom transitions**: Change `zoomLevel` between interactions (2.5 → 1.0 → 2.8)
- **Speed control**: Lower `mouseMoveSpeed` (45) for smoother camera movements
- **Timing choreography**: Carefully tuned wait times create rhythm
- **Fallback selectors**: Multiple selectors ensure compatibility

**Tips for Best Results:**
1. Use contrasting zoom levels (1.0 to 2.5+) for dramatic effect
2. Keep zoom-out sections brief to maintain viewer engagement
3. End on a high zoom level for impact
4. Adjust `mouseMoveSpeed` based on content complexity
5. Test with different viewport sizes

### Creating Your Own Cinematic Content

For the best cinematic effects, design your pages with strategic element placement:

**Key Design Principles:**
- **Corner Elements**: Place important badges or logos in corners for dramatic start/end points
- **Clear Sections**: Use distinct sections with ample spacing for smooth scrolling
- **Visual Hierarchy**: Create elements at different sizes for varied zoom levels
- **Focal Points**: Add data-testid attributes to key elements for precise targeting

**Example Page Structure:**
```html
<!-- Top-left starting point -->
<div class="top-left-badge" data-testid="start-badge">Featured</div>

<!-- Hero section for establishing shot -->
<section class="hero" data-testid="hero">
  <h1>Main Title</h1>
</section>

<!-- Middle sections for journey -->
<section data-testid="features">
  <!-- Feature cards for individual focus -->
</section>

<!-- Bottom-right ending point -->
<div class="bottom-right-cta" data-testid="end-cta">
  <button>Get Started</button>
</div>
```

### Feature Spotlight Sequence

Highlight individual features with smooth transitions between focused and overview shots.

```json
{
  "name": "Feature Showcase Flow",
  "description": "Highlight individual features with dramatic zoom transitions",
  "entry": {
    "url": "/cinematic-showcase",
    "selector": "[data-testid='journey']",
    "waitTime": 1000
  },
  "effects": {
    "cameraFollow": true,
    "attentionPattern": false,
    "mouseMoveSpeed": 55
  },
  "interactions": [
    {
      "type": "scroll",
      "selector": "[data-testid='journey']",
      "zoomLevel": 1.3,
      "description": "Scroll to features section"
    },
    {
      "type": "hover",
      "selector": "[data-testid='feature-1']",
      "zoomLevel": 2.2,
      "waitAfterClick": 1500,
      "description": "Focus on first feature"
    },
    {
      "type": "hover",
      "selector": ".feature-grid",
      "zoomLevel": 1.2,
      "waitAfterClick": 800,
      "description": "Pull back to show all features"
    },
    {
      "type": "hover",
      "selector": "[data-testid='feature-2']",
      "zoomLevel": 2.3,
      "waitAfterClick": 1500,
      "description": "Focus on second feature"
    }
  ]
}
```

### Story Progression Journey

Create a narrative flow through your content with carefully timed reveals.

```json
{
  "name": "Story Progression",
  "description": "Cinematic journey through the entire page story",
  "entry": {
    "url": "/cinematic-showcase",
    "waitTime": 1000
  },
  "effects": {
    "cameraFollow": true,
    "attentionPattern": true,
    "mouseMoveSpeed": 50
  },
  "interactions": [
    {
      "type": "hover",
      "selector": ".hero-title",
      "zoomLevel": 1.8,
      "waitAfterClick": 1500,
      "description": "Focus on main title"
    },
    {
      "type": "scroll",
      "selector": "[data-testid='story']",
      "zoomLevel": 1.4,
      "description": "Continue to story section"
    },
    {
      "type": "hover",
      "selector": ".floating-element.element-2",
      "zoomLevel": 2.1,
      "waitAfterClick": 1000,
      "description": "Focus on visual elements"
    },
    {
      "type": "hover",
      "selector": "[data-testid='main-cta']",
      "zoomLevel": 2.6,
      "waitAfterClick": 2500,
      "description": "Final call to action"
    }
  ]
}
```

### Quick Impact Demo

For short, punchy demos that get straight to the point.

```json
{
  "name": "Quick Impact",
  "effects": {
    "attentionPattern": false,
    "mouseMoveSpeed": 80,
    "cameraFollow": true
  },
  "timings": {
    "waitBeforeMove": 400,
    "waitAfterClick": 600,
    "waitBetweenSteps": 300
  },
  "interactions": [
    {
      "type": "hover",
      "selector": ".hero-title",
      "zoomLevel": 2.0,
      "waitAfterClick": 800
    },
    {
      "type": "scroll",
      "selector": "[data-testid='main-cta']",
      "zoomLevel": 1.5
    },
    {
      "type": "click",
      "selector": "[data-testid='main-cta']",
      "zoomLevel": 2.5,
      "waitAfterClick": 1500
    }
  ]
}
```

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/demo-videos.yml
name: Generate Demo Videos

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  demo-videos:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install demo video maker
        run: npm install -g demo-video-maker
        
      - name: Install Playwright browsers
        run: npx playwright install chromium
        
      - name: Build application
        run: npm run build
        
      - name: Start application
        run: npm start &
        env:
          PORT: 3000
        
      - name: Wait for application
        run: npx wait-on http://localhost:3000
        
      - name: Generate demo videos
        run: demo-video-maker --port 3000
        env:
          CI: true
          HEADLESS: true
        
      - name: Upload demo videos
        uses: actions/upload-artifact@v3
        with:
          name: demo-videos
          path: demo-output-cinematic-*/
```

### Docker Integration

```dockerfile
# Dockerfile.demo
FROM node:18-slim

# Install system dependencies for Playwright
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci

# Install demo video maker
RUN npm install -g demo-video-maker

COPY . .
RUN npm run build

EXPOSE 3000

# Start app and generate demos
CMD ["sh", "-c", "npm start & sleep 10 && demo-video-maker"]
```

## 🔍 Troubleshooting

### Common Issues

#### Demo videos show 404 pages
```bash
# Ensure your app is running
npm start

# Check if the URL is accessible
curl http://localhost:3000

# Verify the correct port in your command
demo-video-maker . http://localhost:3000  # Adjust port as needed
```

#### Elements not found during demo
```json
{
  "interactions": [
    {
      "type": "click",
      "selector": "[data-testid='button']",
      "skipIfNotFound": true,  // Add this to continue on missing elements
      "description": "Optional interaction"
    }
  ]
}
```

#### Slow or jerky mouse movements
```json
{
  "effects": {
    "mouseMoveSpeed": 80,  // Increase for faster movement (10-200)
    "cameraFollow": false  // Disable if causing performance issues
  }
}
```

#### Browser crashes or timeouts
```json
{
  "timings": {
    "waitBeforeMove": 2000,     // Increase wait times
    "waitAfterClick": 3000,
    "pageLoadWait": 5000
  },
  "recording": {
    "duration": 120000,         // Increase recording duration
    "skipErrors": true          // Continue on errors
  }
}
```

### Debug Mode

```bash
# Run in non-headless mode (see browser)
HEADLESS=false demo-video-maker

# Enable verbose logging
DEBUG=* demo-video-maker

# Test with specific directory
demo-video-maker ./src/components/Button

# Test with custom port
demo-video-maker --port 8080
```

### Performance Optimization

```json
{
  "effects": {
    "cameraFollow": false,      // Disable for better performance
    "mouseMoveSpeed": 100       // Faster movements
  },
  "timings": {
    "waitBetweenSteps": 500     // Reduce delays
  }
}
```

## 🖱️ Visible Cursor in Recordings

Demo Video Maker includes a custom cursor that's visible in video recordings, solving Playwright's limitation where the native cursor doesn't appear in videos.

### Cursor Features

- **Visual Design**: Blue circle with white border and subtle glow effect
- **Automatic Tracking**: Follows all mouse movements during the demo
- **Click Animation**: Briefly scales down on clicks for visual feedback
- **High Visibility**: Includes shadow for contrast on different backgrounds
- **Always On Top**: Proper z-index ensures cursor is never hidden

### How It Works

The cursor is implemented as a DOM element that:
1. Moves in sync with Playwright's mouse actions
2. Updates position via the `updateCameraFollow` function
3. Animates during click interactions
4. Remains visible throughout the entire recording

No configuration needed - the cursor automatically appears in all recordings.

## 📚 API Reference

### Configuration Schema

Complete TypeScript interface for configuration validation:

```typescript
interface DemoConfig {
  name: string;
  description?: string;
  entry: {
    url?: string;
    selector?: string;
    waitTime?: number;
  };
  interactions: Interaction[];
  effects?: EffectsConfig;
  recording?: RecordingConfig;
  timings?: TimingsConfig;
}

interface Interaction {
  type: 'click' | 'hover' | 'type' | 'scroll' | 'wait' | 'navigate';
  selector?: string;
  text?: string;              // For 'type' interactions
  url?: string;               // For 'navigate' interactions
  waitTime?: number;          // For 'wait' interactions
  waitBeforeMove?: number;
  waitAfterClick?: number;
  zoomLevel?: number;
  skipIfNotFound?: boolean;
  description?: string;
}

interface EffectsConfig {
  cameraFollow?: boolean;
  zoomLevel?: number;
  clickAnimations?: boolean;
  mouseMoveSpeed?: number;
}

interface RecordingConfig {
  duration?: number;
  skipErrors?: boolean;
  outputName?: string;
}

interface TimingsConfig {
  waitBeforeMove?: number;
  waitAfterClick?: number;
  waitBetweenSteps?: number;
  pageLoadWait?: number;
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/demovideomaker/demo-video-maker.git
cd demo-video-maker

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the project
npm run build
```

### Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests  
npm run test:integration

# Coverage report
npm run test:coverage

# Security audit
npm audit
```

## 🔧 Troubleshooting

### Common Issues

**Page Not Loading:**
- Ensure your app is running on the specified port
- Check for HTTPS/SSL certificate issues
- Verify no authentication is blocking access

**Selectors Not Found:**
- Use stable selectors (data-testid, aria-label)
- Add `waitTime` to interactions for dynamic content
- Enable `skipIfNotFound` for optional elements

**Video Output Issues:**
- Ensure write permissions in output directory
- Check available disk space
- Verify ffmpeg is available for video processing

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Playwright](https://playwright.dev/) for browser automation
- [Chromium](https://www.chromium.org/) for rendering engine
- Community contributors and testers

## 📞 Support

- 📖 [Documentation](https://github.com/demovideomaker/demo-video-maker/wiki)
- 🐛 [Issue Tracker](https://github.com/demovideomaker/demo-video-maker/issues)
- 💬 [Discussions](https://github.com/demovideomaker/demo-video-maker/discussions)
- 📧 [Email Support](mailto:support@demo-video-maker.com)

---

Made with ❤️ by the Demo Video Maker team