# Demo Video Automation

Cinematic demo video creation tool with camera follow, zoom, and mouse highlight effects.

## Features

- 🎬 **Cinematic Effects**: Professional mouse cursor with glow and pulse animations
- 📷 **Camera Follow**: Dynamic zoom and camera tracking that follows mouse movement
- ✨ **Visual Effects**: Smooth transitions, element highlighting, and click animations
- 🎯 **Sharp Recording**: High-quality 1920x1080 video output with crisp rendering
- 🖱️ **Interactive Demos**: Realistic user interactions with your demo app

## Quick Start

### Global Installation
```bash
# Install globally 
npm install -g demo-video-automation

# Use from any project directory
cinematic-demo /path/to/your/project http://localhost:3000
```

### Local Usage
```bash
# Install dependencies
npm install

# Start the demo app (in a separate terminal)
npm run start-demo-app

# Run the cinematic demo (looks for demo.json files)
npm run demo

# Generate a sample configuration
npm run generate-sample
```

## Configuration System

The tool uses `demo.json` files to define interactive demos. Place these files in your feature directories to create targeted demonstrations.

### Basic demo.json Example

```json
{
  "name": "User Dashboard Demo",
  "description": "Shows main dashboard functionality",
  "entry": {
    "url": "/dashboard",
    "selector": "[data-testid='dashboard-container']",
    "waitTime": 2000
  },
  "interactions": [
    {
      "type": "click",
      "selector": "[data-testid='stats-card']",
      "waitBeforeMove": 1000,
      "waitAfterClick": 1500,
      "zoomLevel": 2.0,
      "description": "Click on stats card"
    },
    {
      "type": "hover",
      "selector": "[data-testid='chart']",
      "waitBeforeMove": 800,
      "waitAfterClick": 1200,
      "description": "Hover over chart"
    }
  ],
  "effects": {
    "cameraFollow": true,
    "zoomLevel": 1.6,
    "glowEffects": true,
    "clickAnimations": true
  }
}
```

### Interaction Types

- **`click`** - Click on an element with cinematic zoom
- **`hover`** - Hover over an element with highlight effects
- **`type`** - Type text into input fields with realistic timing
- **`scroll`** - Scroll to and highlight an element
- **`wait`** - Pause for a specified duration
- **`navigate`** - Navigate to a different URL

### Configuration Options

**Entry Point:**
- `url` - Relative URL to navigate to
- `selector` - Element to focus on entry
- `waitTime` - Time to wait after navigation

**Per-Interaction:**
- `waitBeforeMove` - Delay before moving cursor (ms)
- `waitAfterClick` - Delay after interaction (ms)
- `zoomLevel` - Zoom level for this interaction (1.0-5.0)
- `skipIfNotFound` - Continue if element not found

**Visual Effects:**
- `cameraFollow` - Enable dynamic camera following
- `glowEffects` - Mouse cursor glow effects
- `clickAnimations` - Ripple effects on clicks
- `mouseMoveSpeed` - Cursor movement speed (10-200)

**Recording:**
- `duration` - Maximum recording time (ms)
- `skipErrors` - Continue on errors
- `outputName` - Custom video filename

## Requirements

- Node.js 18+
- @playwright/test for browser automation
- Your web application running locally

## Output

Videos are saved to `demo-output-cinematic/videos/` in WebM format, perfect for:
- Product launch videos
- Feature demonstrations  
- Marketing materials
- Investor presentations
- Professional documentation

## Demo App

The included `demo-app/` directory contains a sample Next.js application that demonstrates the cinematic effects. The demo script will:

1. Navigate through different pages (Home, Dashboard, Analytics, Settings)
2. Interact with UI elements with cinematic mouse effects
3. Apply dynamic zoom and camera follow functionality
4. Record everything in broadcast-quality video

## Cinematic Effects

- **Glowing Cursor**: Multi-layer glow effects with animated pulse
- **Camera Follow**: Smooth zoom and pan following mouse movement  
- **Click Animations**: Expanding ring effects on interactions
- **Element Highlighting**: Blue glow effects on focused elements
- **Spotlight**: Dynamic radial gradient following cursor
- **Professional Timing**: Carefully choreographed interactions and transitions