// Jest runs only the TypeScript tests of the KB part; the Week 2 tickets tests use node:test.
// ts-jest only transpiles (isolatedModules in tsconfig.json); type checking is `npm run typecheck`.
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test/kb'],
  testMatch: ['**/*.test.ts'],
};
