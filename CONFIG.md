# Demo Video Maker - Complete Configuration Reference

This document provides a comprehensive reference for all configuration options available in Demo Video Maker.

## Configuration File Structure

Demo configurations are defined in `demo.json` files. The system automatically discovers these files throughout your project directory.

```json
{
  "name": "Demo Name",
  "description": "Demo Description",
  "entry": { ... },
  "interactions": [ ... ],
  "effects": { ... },
  "timings": { ... },
  "recording": { ... }
}
```

## Complete Configuration Schema

### Root Level Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Name of the demo |
| `description` | string | No | Description of what the demo demonstrates |
| `entry` | object | Yes | Initial page setup configuration |
| `interactions` | array | Yes | List of user interactions to perform |
| `effects` | object | No | Visual effects and animations settings |
| `timings` | object | No | Timing configuration for interactions |
| `recording` | object | No | Recording output settings |

### Entry Configuration

Controls the initial setup and navigation.

```json
{
  "entry": {
    "url": "/dashboard",
    "selector": "[data-testid='main-content']",
    "waitTime": 2000
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `url` | string | `"/"` | Relative URL path to navigate to |
| `selector` | string | `null` | CSS selector for initial camera focus |
| `waitTime` | number | `2000` | Milliseconds to wait after page load |

### Interactions Array

Each interaction object in the array must have a `type` property and may include additional properties based on the type.

#### Common Interaction Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | string | Required | Type of interaction (click, hover, type, scroll, wait, navigate) |
| `waitBeforeMove` | number | `1000` | Milliseconds to wait before moving mouse |
| `waitAfter` | number | `1500` | Milliseconds to wait after interaction completes |
| `zoomLevel` | number | `null` | Zoom level for this interaction (1.0-5.0) |
| `skipIfNotFound` | boolean | `false` | Continue if selector not found |
| `description` | string | `null` | Description of the interaction |

#### Click Interaction

```json
{
  "type": "click",
  "selector": "[data-testid='button']",
  "waitBeforeMove": 1000,
  "waitAfterClick": 1500,
  "zoomLevel": 2.0,
  "skipIfNotFound": false,
  "description": "Click the submit button"
}
```

**Additional Properties:**
- `selector` (string, required): CSS selector for element to click

**Timing Notes:**
- Includes automatic 300-800ms pause before click for natural feel
- Click animation adds ~500ms visual effect time

#### Hover Interaction

```json
{
  "type": "hover",
  "selector": ".tooltip-trigger",
  "waitBeforeMove": 800,
  "waitAfterClick": 1200,
  "zoomLevel": 1.8,
  "description": "Show tooltip"
}
```

**Additional Properties:**
- `selector` (string, required): CSS selector for element to hover

#### Type Interaction

```json
{
  "type": "type",
  "selector": "input[type='email']",
  "text": "user@example.com",
  "waitBeforeMove": 500,
  "waitAfterClick": 2000,
  "zoomLevel": 1.9,
  "description": "Enter email address"
}
```

**Additional Properties:**
- `selector` (string, required): CSS selector for input element
- `text` (string, required): Text to type

**Timing Notes:**
- Each character typed with 80-200ms delay (configurable)
- Total typing time = text.length * average typing delay

#### Scroll Interaction

```json
{
  "type": "scroll",
  "selector": "#section-id",
  "waitBeforeMove": 800,
  "waitAfterClick": 1500,
  "description": "Scroll to section"
}
```

**Additional Properties:**
- `selector` (string, required): CSS selector for element to scroll to

#### Wait Interaction

```json
{
  "type": "wait",
  "waitTime": 3000,
  "description": "Wait for animation"
}
```

**Additional Properties:**
- `waitTime` (number, required): Milliseconds to wait

#### Navigate Interaction

```json
{
  "type": "navigate",
  "url": "/new-page",
  "waitBeforeMove": 1000,
  "waitAfterClick": 2500,
  "description": "Go to new page"
}
```

**Additional Properties:**
- `url` (string, required): Relative URL to navigate to

### Effects Configuration

Controls visual effects and animations.

```json
{
  "effects": {
    "cameraFollow": true,
    "zoomLevel": 1.6,
    "clickAnimations": true,
    "mouseMoveSpeed": 60,
    "attentionPattern": true
  }
}
```

| Property | Type | Default | Range | Description |
|----------|------|---------|-------|-------------|
| `cameraFollow` | boolean | `true` | - | Enable smooth camera following with 150ms transitions |
| `zoomLevel` | number | `1.6` | `1.0-5.0` | Default zoom level for all interactions |
| `clickAnimations` | boolean | `true` | - | Show ripple effect on clicks |
| `mouseMoveSpeed` | number | `60` | `10-200` | Mouse movement speed (movements per second) |
| `attentionPattern` | boolean | `true` | - | Show figure-8 pattern at start/end |

**Viewport Protection:**
- Zoom values below 1.0 are automatically adjusted to 1.0 to prevent showing viewport edges
- Camera panning is bounded when zoomed in to keep content within viewport boundaries
- Body background is set to #0a0a0a to blend with edge cases
- No configuration needed - viewport protection is always active

**Performance Impact:**
- `cameraFollow`: Adds 150ms transition per mouse movement
- `attentionPattern`: Adds ~5 seconds total to video (2.5s at start, 2.5s at end)
- Higher `mouseMoveSpeed`: Shorter video but less smooth movement

### Timings Configuration

Fine-tune interaction timing and pacing.

```json
{
  "timings": {
    "waitBeforeMove": 1000,
    "waitAfterClick": 1500,
    "waitBetweenSteps": 800,
    "pageLoadWait": 2000,
    "typingSpeed": [80, 200]
  }
}
```

| Property | Type | Default | Range | Description |
|----------|------|---------|-------|-------------|
| `waitBeforeMove` | number | `1000` | `0-10000` | Default milliseconds before mouse movement |
| `waitAfterClick` | number | `1500` | `0-10000` | Default milliseconds after interactions |
| `waitBetweenSteps` | number | `800` | `0-5000` | Milliseconds between interaction steps |
| `pageLoadWait` | number | `2000` | `1000-30000` | Milliseconds after page navigation |
| `typingSpeed` | array | `[80, 200]` | `[10, 1000]` | [min, max] milliseconds between keystrokes |

### Recording Configuration

Control video output settings.

```json
{
  "recording": {
    "duration": 45000,
    "skipErrors": true,
    "outputName": "my-demo",
    "fps": 30
  }
}
```

| Property | Type | Default | Range | Description |
|----------|------|---------|-------|-------------|
| `duration` | number | `30000` | `1000+` | Maximum recording time in milliseconds |
| `skipErrors` | boolean | `true` | - | Continue recording on interaction errors |
| `outputName` | string | `null` | - | Custom output filename (auto-generated if null) |
| `fps` | number | `30` | `10-60` | Video frame rate |

**Duration Notes:**
- Recording continues until all interactions complete OR duration is reached
- Actual video length may exceed duration due to:
  - Attention pattern animations (~5s if enabled)
  - Accumulated wait times
  - Camera transitions
  - Typing animations

## Duration Calculation

To estimate video duration:

```
Base Duration = 
  Entry Wait Time +
  (Attention Pattern Start: 3.5s if enabled) +
  Sum of all interaction times +
  (Attention Pattern End: 3.5s if enabled) +
  Exit wait time

Interaction Time =
  waitBeforeMove +
  Mouse movement time (distance / mouseMoveSpeed) +
  Pre-click delay (300-800ms for clicks) +
  Interaction execution time +
  waitAfterClick +
  waitBetweenSteps (if not last interaction)

Type Interaction Time = 
  Above + (text.length * average typing delay)
```

## Optimization Strategies

### For Shorter Videos

```json
{
  "effects": {
    "attentionPattern": false,
    "mouseMoveSpeed": 100
  },
  "timings": {
    "waitBeforeMove": 500,
    "waitAfterClick": 800,
    "waitBetweenSteps": 400,
    "typingSpeed": [40, 80]
  }
}
```

### For Smoother, More Cinematic Videos

```json
{
  "effects": {
    "attentionPattern": true,
    "cameraFollow": true,
    "mouseMoveSpeed": 50
  },
  "timings": {
    "waitBeforeMove": 1200,
    "waitAfterClick": 1800,
    "waitBetweenSteps": 1000,
    "typingSpeed": [100, 250]
  }
}
```

### For Fast Demos

```json
{
  "effects": {
    "attentionPattern": false,
    "cameraFollow": false,
    "mouseMoveSpeed": 150
  },
  "timings": {
    "waitBeforeMove": 200,
    "waitAfterClick": 300,
    "waitBetweenSteps": 200,
    "typingSpeed": [20, 40]
  }
}
```

## Validation Rules

All configuration values are validated:

1. **Selectors**: Must be valid CSS selectors, no XSS patterns
2. **URLs**: Only relative paths or http(s):// URLs
3. **Numbers**: Must be within specified ranges
4. **Strings**: HTML tags and scripts are sanitized
5. **Arrays**: Must contain valid values of expected types

## Visible Cursor

Demo Video Maker includes an automatic visible cursor that appears in all video recordings:

- **Appearance**: Blue circle (16px) with white border and glow effect
- **Behavior**: Follows mouse movements, scales on clicks
- **No Configuration**: Always enabled, no settings needed
- **Z-Index**: 2147483647 (ensures visibility above all content)

The cursor solves Playwright's limitation where the system cursor is not captured in video recordings.

## Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Test with shorter recordings first** to validate interactions
3. **Add descriptions** to all interactions for debugging
4. **Use skipIfNotFound** for optional UI elements
5. **Start with default timings** and adjust based on results
6. **Disable attentionPattern** for technical demos
7. **Enable attentionPattern** for marketing videos
8. **Higher zoom levels** for important interactions
9. **Lower mouseMoveSpeed** for smoother movement
10. **Validate JSON syntax** before running demos