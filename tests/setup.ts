// Test setup file
import 'jest';

// Global test configuration
beforeAll(() => {
  // Setup any global test configuration
  console.log('🧪 Starting Cutline tests...');
});

afterAll(() => {
  // Cleanup after all tests
  console.log('✨ All tests completed!');
});

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
