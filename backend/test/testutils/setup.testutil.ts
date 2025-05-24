import { testConfig } from './config.testutil';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function setupTestConfig() {
  for (const [key, value] of Object.entries(testConfig)) {
    process.env[key] = value;
  }
}
