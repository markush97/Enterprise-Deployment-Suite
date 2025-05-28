export const testConfig = {
  JWT_SECRET: 'test-secret',
  PROCESS_ENV: 'test',
  JWT_ALGORITHM: 'HS384',
  JWT_AUDIENCE: 'https://test.example.at',
  JWT_ISSUER: 'TestIssuer',
  FILE_UPLOAD_MAX_SIZE_MB: '0.001', // 1KB for tests
  FILE_UPLOAD_PATH: '/tmp/eds/testing/testupload'
};
