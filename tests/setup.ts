import * as fs from 'fs/promises';
import * as path from 'path';

// Global test setup
beforeAll(async () => {
  // Create test output directory
  const testOutputDir = path.join(__dirname, 'output');
  await fs.mkdir(testOutputDir, { recursive: true });
});

afterAll(async () => {
  // Cleanup test output directory
  const testOutputDir = path.join(__dirname, 'output');
  try {
    await fs.rmdir(testOutputDir, { recursive: true });
  } catch {
    // Ignore cleanup errors
  }
});

// Mock console.log for cleaner test output
const originalLog = console.log;
beforeEach(() => {
  console.log = jest.fn();
});

afterEach(() => {
  console.log = originalLog;
});