# Interactive Setup Guide

The Demo Video Automation tool includes an intelligent, interactive setup wizard powered by Claude Code Assistant.

## Features

### 🤖 AI-Powered Guidance
- Real-time narration explains each step
- Contextual help based on your environment
- Intelligent error analysis and solutions

### 🔍 Smart Permission Tracking
- Monitors permission changes in real-time
- Automatically detects when permissions are granted
- Provides specific instructions for each platform

### 🔧 Automatic Fixes
- Attempts to fix common issues automatically
- Provides manual instructions when automation isn't possible
- Remembers progress if setup is interrupted

## Running the Interactive Setup

### Basic Setup
```bash
npm run setup
```

This launches the interactive wizard that will:
1. Check your Node.js version
2. Verify npm installation
3. Test file system permissions
4. Install Playwright browsers
5. Configure screen recording (macOS)
6. Set up the demo application

### Permission Monitor
```bash
npm run setup:monitor
```

Runs a real-time permission monitor that:
- Tracks permission changes
- Notifies when permissions are granted/revoked
- Helpful for debugging permission issues

## Setup Flow

### 1. Welcome & Introduction
Claude introduces itself and explains what permissions are needed and why.

### 2. Environment Checks
The wizard checks each requirement:
- ✅ Pass: Moves to next step
- ❌ Fail: Offers automatic fix or manual instructions
- ⚠️ Warning: Non-critical issues are noted

### 3. Permission Configuration
For each required permission:
- Explains why it's needed
- Shows risk level
- Provides platform-specific instructions

### 4. Demo App Setup
Optionally sets up the included demo application:
- Installs dependencies
- Offers to start the app
- Provides next steps

## Platform-Specific Notes

### macOS
- Screen recording permission required
- System will prompt when first recording
- Go to System Preferences > Security & Privacy > Screen Recording

### Windows
- Run terminal as Administrator if permission errors occur
- Windows Defender may need to allow Playwright

### Linux
- May need to install additional dependencies for Playwright
- Use `sudo` if permission errors occur

## Troubleshooting

### Common Issues

**"Permission denied" errors**
- The wizard will suggest appropriate chmod commands
- May need to run with elevated privileges

**"Playwright browsers not found"**
- Wizard will automatically run `npx playwright install`
- Requires ~300MB download

**"Port already in use"**
- Check if demo app is already running
- Use a different port in the configuration

### Manual Recovery

If the setup fails, you can:
1. Check `.demo-setup-state.json` for progress
2. Run `npm run setup` again to continue
3. Skip non-critical steps if needed

## How It Works

### State Management
The setup wizard saves progress to `.demo-setup-state.json`:
- Completed steps are skipped on restart
- Warnings and errors are preserved
- Automatically cleaned up on successful completion

### Error Intelligence
Claude analyzes errors to provide specific solutions:
- EACCES → Permission fixes
- ENOENT → Missing file guidance
- Port conflicts → Process management
- Playwright issues → Installation help

### Real-Time Monitoring
The permission monitor uses:
- File system watchers
- Periodic permission checks
- Platform-specific APIs (where available)

## Advanced Usage

### Verbose Mode
Set `SETUP_VERBOSE=true` for detailed output:
```bash
SETUP_VERBOSE=true npm run setup
```

### Skip Confirmations
Set `SETUP_AUTO=true` to auto-confirm:
```bash
SETUP_AUTO=true npm run setup
```

### Custom Configuration
Create `.setup-config.json`:
```json
{
  "skipSteps": ["demo-app"],
  "autoFix": true,
  "verbose": true
}
```

## Integration with Claude Code

When running with Claude Code Assistant:
1. Claude provides contextual explanations
2. Suggests solutions based on your specific errors
3. Can help debug complex permission issues
4. Offers alternative approaches if standard fixes fail

## Security

The setup wizard:
- Only modifies files in the project directory
- Doesn't require root/admin unless you explicitly use sudo
- All network requests are to localhost or npm registry
- No telemetry or external data collection

---

For more help, run the setup wizard and Claude will guide you through each step!