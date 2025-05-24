// jest.backend.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './src',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  collectCoverage: false,
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.e2e-spec.ts',
    '!**/*.util-spec.ts',
    '!**/*.spec.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/main.ts',
    '!**/app.module.ts',
    '!**/index.ts',
  ],
  coverageDirectory: '../coverage',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
};
