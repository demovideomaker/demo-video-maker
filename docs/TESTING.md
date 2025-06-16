# Testing Guide

This document covers the comprehensive testing strategy for the Demo Video Automation tool.

## Test Structure

```
tests/
├── unit/                 # Unit tests for individual modules
│   ├── codebaseAnalyzer.test.ts
│   ├── hierarchyAnalyzer.test.ts
│   ├── storageManager.test.ts
│   ├── playwrightExecutor.test.ts
│   └── setupWizard.test.ts
├── integration/          # Integration tests for complete workflows
│   └── fullDemo.test.ts
├── fixtures/             # Test data and mock components
│   └── sample-components.ts
└── setup.ts             # Test environment setup
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Categories

### 1. Unit Tests

#### CodebaseAnalyzer Tests
- **File Discovery**: Tests component and feature detection
- **AST Parsing**: Validates TypeScript/JavaScript parsing
- **Selector Extraction**: Ensures interactive elements are found
- **Error Handling**: Tests malformed code and missing files
- **Classification**: Verifies component type detection

#### HierarchyAnalyzer Tests  
- **Execution Paths**: Tests demo flow generation
- **Route Inference**: Validates URL route detection
- **Dependency Analysis**: Tests feature relationship mapping
- **Path Optimization**: Ensures optimal execution order

#### StorageManager Tests
- **Directory Management**: Tests output organization
- **Path Generation**: Validates naming conventions
- **Video Conversion**: Tests format conversion logic
- **Cleanup**: Tests old file removal

#### PlaywrightExecutor Tests
- **Browser Automation**: Tests interaction execution
- **Screenshot Capture**: Validates image generation
- **Video Recording**: Tests recording functionality
- **Error Recovery**: Tests failure handling

#### SetupWizard Tests
- **Environment Checks**: Tests system validation
- **Permission Detection**: Tests access verification
- **User Interaction**: Tests CLI interaction flow
- **State Management**: Tests progress persistence

### 2. Integration Tests

#### Full Demo Generation
- **End-to-End Workflow**: Complete analysis → documentation → recording
- **Multi-Feature Projects**: Tests scalability with multiple features
- **Configuration Validation**: Tests various config combinations
- **Error Scenarios**: Tests failure recovery in complete workflows

## Test Data

### Mock Components
Located in `tests/fixtures/sample-components.ts`:

- **UserProfile**: Component with forms and state
- **Dashboard**: Page with statistics and actions  
- **DataTable**: Complex component with filtering
- **HomePage**: Simple navigation page

### Project Structure
Simulated project with:
- Feature-based organization
- Multiple component types
- Interactive elements with test IDs
- Realistic import/export patterns

## Mocking Strategy

### External Dependencies
- **Playwright**: Mocked to avoid browser automation in tests
- **File System**: Selective mocking for error scenarios
- **Child Process**: Mocked for system commands
- **Readline**: Mocked for user input simulation

### Why Mock?
- **Speed**: Tests run quickly without browser overhead
- **Reliability**: No external dependencies for consistent results
- **Isolation**: Each test is independent and deterministic

## Coverage Goals

| Component | Target Coverage |
|-----------|-----------------|
| Core Logic | 90%+ |
| Error Paths | 80%+ |
| Integration | 70%+ |
| Setup Utils | 60%+ |

## Writing New Tests

### Unit Test Template
```typescript
import { YourModule } from '../../src/path/to/module';

describe('YourModule', () => {
  let module: YourModule;

  beforeEach(() => {
    module = new YourModule();
  });

  describe('method name', () => {
    it('should do expected behavior', () => {
      // Arrange
      const input = 'test input';
      
      // Act
      const result = module.method(input);
      
      // Assert
      expect(result).toBe('expected output');
    });

    it('should handle error cases', () => {
      expect(() => module.method(null)).toThrow();
    });
  });
});
```

### Integration Test Template
```typescript
describe('Integration: Feature Name', () => {
  beforeAll(async () => {
    // Setup test environment
  });

  afterAll(async () => {
    // Cleanup
  });

  it('should complete full workflow', async () => {
    // Test complete scenario
  });
});
```

## Test Data Management

### Creating Test Projects
```typescript
async function createTestProject(
  basePath: string, 
  structure: Record<string, string>
): Promise<void> {
  // Helper function to create realistic project structures
}
```

### Cleanup Strategy
- Use `beforeEach`/`afterEach` for test isolation
- Create unique temporary directories
- Clean up in `afterAll` with error handling

## Debugging Tests

### Running Single Test
```bash
npm test -- --testNamePattern="specific test name"
```

### Debug Mode
```bash
npm test -- --detectOpenHandles --forceExit
```

### Verbose Output
```bash
npm test -- --verbose
```

## Continuous Integration

Tests run automatically on:
- Pull request creation
- Commits to main branch
- Release preparation

### CI Configuration
See `.github/workflows/ci.yml` for:
- Multi-Node.js version testing
- Coverage reporting
- Artifact preservation

## Performance Testing

### Benchmarks
- Large project analysis (100+ components)
- Memory usage during processing
- Video generation speed

### Profiling
```bash
# Memory profiling
node --inspect-brk node_modules/.bin/jest

# Performance profiling  
npm test -- --detectMemoryLeaks
```

## Known Limitations

1. **Browser Tests**: Real browser testing requires separate E2E setup
2. **Platform Specific**: Some tests may behave differently on different OS
3. **Timing**: Integration tests may be sensitive to system performance

## Best Practices

1. **Descriptive Names**: Test names should clearly state what they verify
2. **Single Responsibility**: Each test should verify one specific behavior  
3. **Arrange-Act-Assert**: Follow AAA pattern for clarity
4. **Error Testing**: Always test error conditions
5. **Mock Sparingly**: Only mock what's necessary for isolation
6. **Clean Up**: Always clean up test artifacts

## Troubleshooting

### Common Issues

**Tests timing out**
- Increase timeout in Jest config
- Check for unresolved promises
- Verify mock implementations

**File system errors**
- Ensure proper cleanup in `afterEach`
- Check file permissions
- Use unique test directories

**Mock not working**
- Verify mock placement before imports
- Check mock return values
- Ensure mocks are cleared between tests

### Getting Help

1. Check existing test patterns
2. Run tests with `--verbose` flag
3. Use debugger breakpoints
4. Consult Jest documentation

---

Remember: Good tests are documentation, regression prevention, and confidence builders all in one!