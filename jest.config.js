// Jest runs only the TypeScript tests of the KB part; the Week 2 tickets tests use node:test.
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test/kb'],
  testMatch: ['**/*.test.ts'],
};
