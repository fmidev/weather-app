const { jest: baseConfig } = require('./package.json');

module.exports = {
  ...baseConfig,
  // Use the actual defaultConfig, and select Axios's real Node build rather
  // than the React Native build (which has no HTTP adapter in Jest).
  moduleNameMapper: { '^axios$': require.resolve('axios/dist/node/axios.cjs') },
  roots: ['<rootDir>/__tests__/integration/live'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  setupFiles: [...baseConfig.setupFiles, '<rootDir>/jest.live.setup.js'],
  testTimeout: 60000,
};
