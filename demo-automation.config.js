module.exports = {
  // Default configuration for demo automation
  defaultConfig: {
    viewport: { width: 1280, height: 720 },
    slowMo: 100,
    headless: false,
    outputFormats: ['webm', 'screenshots'],
  },
  
  // Patterns to identify features
  featurePatterns: {
    directories: ['features', 'pages', 'views', 'routes', 'screens'],
    fileSuffixes: ['Page', 'View', 'Screen', 'Feature'],
  },
  
  // Patterns to identify interactive elements
  selectors: {
    priority: [
      'data-testid',
      'data-test',
      'data-cy',
      'id',
      'aria-label',
      'role',
      'className'
    ],
    actions: {
      click: ['button', 'a', '[onClick]', '[role="button"]'],
      input: ['input', 'textarea', 'select'],
      hover: '[onMouseEnter]',
    }
  },
  
  // File patterns to analyze
  sourcePatterns: {
    include: ['**/*.{ts,tsx,js,jsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*']
  }
};