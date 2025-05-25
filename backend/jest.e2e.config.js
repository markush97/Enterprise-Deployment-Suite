const sharedConfig = require('./jest.config');

module.exports = {
  ...sharedConfig,
  moduleFileExtensions: ['js', 'json', 'ts'],
  testMatch: ['**/?(*.)+(e2e-spec|e2e-test).[tj]s?(x)'],
  collectCoverage: true,
  collectCoverageFrom: ['./src/**/*.controller.{ts,js}'],
  coverageThreshold: {
    './src/**/*.controller.ts': {
      functions: 100,
      branches: 100,
    },
  },
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  rootDir: '.',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};
