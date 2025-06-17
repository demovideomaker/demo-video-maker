# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-06-16

### Added
- 🎬 **Complete Rewrite** - Cinematic demo video maker tool
- 📋 **Configuration System** - JSON-based demo definitions with validation
- 🎯 **Interactive Elements** - Click, hover, type, scroll, wait, and navigate interactions
- 📷 **Camera Effects** - Dynamic zoom and pan following mouse movement
- ✨ **Visual Effects** - Click animations, element highlighting, and zoom effects
- 🔧 **CLI Interface** - Global installation support with `cinematic-demo` command
- 🛡️ **Security Features** - Input validation, path traversal prevention, and sanitization
- 🧪 **Test Suite** - Comprehensive tests for configuration loading and validation
- 📚 **Documentation** - Complete user guide with examples and troubleshooting
- 🎪 **Demo Examples** - Multiple demo.json configurations for different use cases

### Features
- **Professional Quality**: 1920x1080 HD video output with cinematic effects
- **Configuration-Driven**: Hierarchical demo.json files for organized demos
- **Security-First**: Comprehensive input validation and memory leak prevention
- **Developer-Friendly**: TypeScript interfaces and extensive documentation
- **Framework Agnostic**: Works with React, Vue, Angular, and any web application
- **CI/CD Ready**: GitHub Actions and Docker integration examples

### Security
- Path traversal attack prevention
- JSON size limits to prevent DoS attacks
- CSS selector validation to prevent XSS
- URL validation for safe navigation
- Prototype pollution protection
- Memory leak prevention with proper cleanup

### Performance
- Optimized browser automation with Playwright
- Smart memory management and resource cleanup
- Configurable timing and interaction speeds
- Efficient video processing and output

### Demo App Features
- Homepage with navigation
- Dashboard with statistics and charts
- Analytics with metrics and funnels
- User management with CRUD operations
- Settings with tabs and forms

### Technical Features
- TypeScript support with interfaces
- Modular architecture with security focus
- Extensible configuration system
- Professional video recording (1920x1080)
- Multiple output formats (.webm)

### Supported Platforms
- macOS, Linux, Windows 10+
- Node.js 18.0.0 or higher
- All major web frameworks

## [1.0.15] - 2025-06-17

### Added
- Comprehensive configuration validation for all demo.json options
- Security validations to prevent XSS and injection attacks
- Required field validation with helpful error messages
- Boolean type conversion for effects configuration
- Recording duration validation
- Entry configuration validation (selector, waitTime, URL)
- E2E tests that create actual demo videos
- Support for CI/CD with headless mode (CI=true or HEADLESS=true)

### Fixed
- Fixed MODULE_NOT_FOUND error by switching from @playwright/test to playwright
- Fixed selector validation to return empty string instead of undefined
- Fixed text sanitization to properly remove script tags and content
- Fixed boolean conversion to handle null/undefined values
- Fixed URL validation to return empty string for invalid URLs

### Changed
- **BREAKING**: Primary CLI command changed from `cinematic-demo` to `demo-video-maker`
- Improved documentation clarity and alignment with implementation
- Simplified Quick Start guide for better user experience
- Updated CLI help examples to match actual implementation
- Enhanced security validations for all user inputs
- Better error messages for invalid configurations
- Added `demo-video` as an alias for backwards compatibility

### Security
- Added comprehensive input validation for all configuration fields
- Enhanced XSS prevention in selector and text inputs
- Improved URL validation to only allow safe protocols
- Added bounds checking for all numeric values
- Strengthened sanitization of HTML content

## [1.0.14] - 2025-06-17 (Unreleased)

### Added
- Initial fixes for MODULE_NOT_FOUND error
- Comprehensive test suite foundation

## [1.0.16] - 2025-06-17

### Fixed
- Fixed navigation timeout errors for Single Page Applications (SPAs)
- Changed from 'networkidle' to 'domcontentloaded' wait strategy
- Added navigation detection after click interactions
- Removed redundant wait states that were causing timing issues

### Changed
- Improved navigation handling for apps with persistent connections (WebSockets, polling)
- Better error recovery with fallback navigation strategies
- Simplified page load detection for better compatibility

## [1.0.20] - 2025-06-17

### Changed
- Updated all documentation to reflect Playwright cursor as default
- Updated tests to match new simplified implementation
- Removed all references to deprecated features from README

### Fixed
- Cleaned up test suite to remove obsolete cursor persistence tests
- Fixed configuration examples in documentation

## [1.0.19] - 2025-06-17

### Changed
- **BREAKING**: Made lite mode (Playwright's native cursor) the default and only mode
- Removed custom cursor implementation in favor of native cursor for better reliability
- Simplified codebase by removing conditional logic between full and lite modes
- Removed deprecated configuration options (liteMode, glowEffects, spotlightEffect)

### Removed
- Removed cinematicEffects.js (full mode implementation)
- Removed custom cursor with glow effects
- Removed spotlight effect following cursor
- Removed liteMode configuration option
- Removed CINEMATIC_LITE environment variable

### Improved
- Better compatibility with React/Next.js applications
- More reliable cursor behavior across all frameworks
- Simplified effects system focusing on zoom, pan, and highlighting
- Cleaner and more maintainable codebase

## [Unreleased]

### Planned
- AI-powered narration
- Multiple browser support
- Cloud rendering options
- Additional video formats (MP4, AVI)