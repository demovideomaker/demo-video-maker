# Demo App - Video Generation Runner

This is the internal demo application that powers the Demo Video Maker's video generation capabilities.

## Architecture Overview

The demo app is a Next.js application that:
1. Serves as the browser context for Playwright
2. Executes demo scripts with cinematic effects
3. Handles mouse movements, camera tracking, and visual effects
4. Records the browser viewport during demo execution

## Key Components

### Demo Runner (`lib/demo-runner.ts`)

The core orchestration engine that:
- Initializes the custom cursor system
- Manages camera follow effects
- Executes interaction sequences from `demo.json` files
- Handles timing and animations

### Key Features

#### Attention Pattern Animation
- Creates a figure-8 pattern at start/end of demos
- Duration: ~2.5 seconds per pattern
- Adds total of ~5 seconds to video length
- Can be disabled via `effects.attentionPattern: false`

#### Camera Follow System
- Smoothly follows cursor movements
- 150ms transition duration per update
- Creates cinematic "trailing" effect
- Zoom level adjusts based on interaction type

#### Typing Animation
- Character-by-character typing simulation
- Random delays: 80-200ms between keystrokes
- Configurable via `timings.typingSpeed`

### Custom Cursor (`components/cursor.tsx`)

Implements a custom cursor that:
- Provides smooth, programmatic movement
- Shows click animations and ripple effects
- Supports zoom and camera transformations
- Hides the system cursor for cleaner recordings

### Recording Page (`pages/record.tsx`)

The main page that:
- Loads and validates demo configurations
- Provides the recording viewport
- Handles demo execution lifecycle
- Reports completion status to Playwright

## Timing Breakdown

Understanding why videos may be longer than expected:

1. **Entry Phase**
   - Page load and initialization
   - Entry wait time from config
   - Attention pattern animation (~2.5s)
   - Post-pattern wait (1s)

2. **Interaction Phase**
   - Wait before mouse movement
   - Mouse movement animation
   - Pre-click delay (300-800ms)
   - Click/interaction execution
   - Post-interaction wait
   - Camera follow transitions

3. **Exit Phase**
   - Final attention pattern (~2.5s)
   - Exit wait time (2.5s)
   - Recording finalization

## Configuration Impact on Duration

### Factors that extend video length:
- `effects.attentionPattern`: Adds ~5s total
- `effects.cameraFollow`: Adds 150ms per movement
- `timings.waitBeforeMove`: Accumulates per interaction
- `timings.waitAfterClick`: Accumulates per interaction
- `timings.typingSpeed`: Affects type interactions
- Number of interactions: More steps = longer video

### Optimizing for shorter videos:
```json
{
  "effects": {
    "attentionPattern": false,  // Save ~5s
    "mouseMoveSpeed": 100       // Faster movements
  },
  "timings": {
    "waitBeforeMove": 500,      // Reduce from default 1000ms
    "waitAfterClick": 800,      // Reduce from default 1500ms
    "waitBetweenSteps": 400,    // Reduce from default 800ms
    "typingSpeed": [40, 80]     // Faster typing
  }
}
```

## Development

### Running Locally
```bash
cd demo-app
npm install
npm run dev
```

### Testing Changes
1. Make changes to the demo runner or components
2. Run `npm run build` in the demo-app directory
3. Test with the main CLI: `demo-video-maker`

### Key Files
- `lib/demo-runner.ts` - Main demo execution logic
- `components/cursor.tsx` - Custom cursor implementation
- `pages/record.tsx` - Recording page setup
- `lib/config.ts` - Configuration constants
- `styles/globals.css` - Visual styling

## Debugging

### Enable debug mode:
```bash
HEADLESS=false demo-video-maker  # See browser during recording
DEBUG=* demo-video-maker         # Verbose logging
```

### Common Issues

1. **Cursor not moving smoothly**
   - Check `mouseMoveSpeed` setting
   - Verify element selectors are valid
   - Ensure page is fully loaded

2. **Timing feels off**
   - Review wait time configurations
   - Check for dynamic content loading
   - Adjust `pageLoadWait` if needed

3. **Camera zoom issues**
   - Verify `zoomLevel` is within 1.0-5.0 range
   - Check element visibility
   - Disable `cameraFollow` if problematic